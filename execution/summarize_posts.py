import os
import json
import re
import asyncio
from google import genai
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# ==========================================
# SUPABASE SETUP
# ==========================================
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").strip()
if supabase_url.startswith("NEXT_PUBLIC_SUPABASE_URL="):
    supabase_url = supabase_url.replace("NEXT_PUBLIC_SUPABASE_URL=", "")

supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY", "").strip()
if supabase_key.startswith("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="):
    supabase_key = supabase_key.replace("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=", "")

if not supabase_url or not supabase_key:
    print("ERROR: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY must be set.")
    exit(1)

supabase: Client = create_client(supabase_url, supabase_key)

# ============================================
# POST-PROCESS: Extract dates from text when AI omits them
# ============================================

def _strip_html(text):
    """HTML 태그 제거 (예: <strong>3/4</strong> → 3/4)"""
    return re.sub(r'<[^>]+>', '', text)

def postprocess_dates(summary_obj, posts):
    """AI가 start_date/end_date를 누락한 블록에 대해 items 텍스트에서 날짜를 추출하여 보완.
    하나의 블록에 여러 날짜 이벤트(오픈일, 출고일 등)가 섞여 있으면 별도 블록으로 분할.
    종료일만 있는 경우 해당 게시물의 published_at을 시작일로 사용."""
    blocks = summary_obj.get("blocks", [])
    
    # Get the earliest post date as fallback start_date
    fallback_start = None
    for p in posts:
        if p.get('published_at'):
            try:
                dt = datetime.fromisoformat(p['published_at'].replace('Z', '+00:00'))
                if fallback_start is None or dt < fallback_start:
                    fallback_start = dt
            except Exception:
                pass
    
    current_year = datetime.now().year
    
    def resolve_date(month, day, year=None):
        y = int(year) if year else current_year
        m = int(month)
        d = int(day)
        if m < 1 or m > 12 or d < 1 or d > 31:
            return None
        try:
            return f"{y:04d}-{m:02d}-{d:02d}"
        except Exception:
            return None
    
    # === Regex patterns ===
    _DOW = r'(?:\s*\([가-힣]\))?'
    _SEP = r'[~\-–—]'

    p_full_iso = re.compile(r'(\d{4})[-./](\d{1,2})[-./](\d{1,2})')
    p_full_korean = re.compile(r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일')
    p_range_slash = re.compile(r'(\d{1,2})[/.](\d{1,2})' + _DOW + r'\s*' + _SEP + r'\s*(\d{1,2})[/.](\d{1,2})' + _DOW)
    p_range_korean = re.compile(r'(\d{1,2})월\s*(\d{1,2})일?' + _DOW + r'\s*' + _SEP + r'\s*(?:(\d{1,2})월\s*)?(\d{1,2})일?' + _DOW)
    p_range_buteo = re.compile(r'(\d{1,2})[/.](\d{1,2})' + _DOW + r'?\s*부터\s*(\d{1,2})[/.](\d{1,2})' + _DOW + r'?\s*까지')
    p_end_only = re.compile(r'[~]\s*(\d{1,2})[/.](\d{1,2})')
    p_end_only_korean = re.compile(r'[~]\s*(\d{1,2})월\s*(\d{1,2})일?')
    p_single_slash = re.compile(r'(\d{1,2})[/.](\d{1,2})' + _DOW)
    p_single_korean = re.compile(r'(\d{1,2})월\s*(\d{1,2})일')
    
    def _extract_dates_from_text(text):
        """텍스트에서 모든 날짜/범위를 추출. (start, end) 리스트 반환."""
        clean = _strip_html(text)
        dates = []
        used = []  # (start_pos, end_pos) to avoid overlaps
        
        def overlaps(s, e):
            return any(s < ue and e > us for us, ue in used)
        
        # Most specific patterns first
        for m in p_full_iso.finditer(clean):
            if not overlaps(m.start(), m.end()):
                d = resolve_date(m.group(2), m.group(3), m.group(1))
                if d:
                    dates.append((d, d))
                    used.append((m.start(), m.end()))
        for m in p_full_korean.finditer(clean):
            if not overlaps(m.start(), m.end()):
                d = resolve_date(m.group(2), m.group(3), m.group(1))
                if d:
                    dates.append((d, d))
                    used.append((m.start(), m.end()))
        for m in p_range_buteo.finditer(clean):
            if not overlaps(m.start(), m.end()):
                sd, ed = resolve_date(m.group(1), m.group(2)), resolve_date(m.group(3), m.group(4))
                if sd and ed:
                    dates.append((sd, ed))
                    used.append((m.start(), m.end()))
        for m in p_range_slash.finditer(clean):
            if not overlaps(m.start(), m.end()):
                sd, ed = resolve_date(m.group(1), m.group(2)), resolve_date(m.group(3), m.group(4))
                if sd and ed:
                    dates.append((sd, ed))
                    used.append((m.start(), m.end()))
        for m in p_range_korean.finditer(clean):
            if not overlaps(m.start(), m.end()):
                sm, sd2 = m.group(1), m.group(2)
                em = m.group(3) if m.group(3) else sm
                ed2 = m.group(4)
                sd, ed = resolve_date(sm, sd2), resolve_date(em, ed2)
                if sd and ed:
                    dates.append((sd, ed))
                    used.append((m.start(), m.end()))
        for pat in [p_end_only, p_end_only_korean]:
            for m in pat.finditer(clean):
                if not overlaps(m.start(), m.end()):
                    ed = resolve_date(m.group(1), m.group(2))
                    if ed:
                        fb = fallback_start.strftime("%Y-%m-%d") if fallback_start else ed
                        dates.append((fb, ed))
                        used.append((m.start(), m.end()))
        for m in p_single_slash.finditer(clean):
            if not overlaps(m.start(), m.end()):
                d = resolve_date(m.group(1), m.group(2))
                if d:
                    dates.append((d, d))
                    used.append((m.start(), m.end()))
        for m in p_single_korean.finditer(clean):
            if not overlaps(m.start(), m.end()):
                d = resolve_date(m.group(1), m.group(2))
                if d:
                    dates.append((d, d))
                    used.append((m.start(), m.end()))
        return dates
    
    def _first_date(text):
        """첫 번째 날짜를 (start, end)로 반환. 없으면 None."""
        dates = _extract_dates_from_text(text)
        return dates[0] if dates else None
    
    # =============================================
    # Main: item별 날짜 추출 → calendar_dates 배열로 저장
    # 블록 자체는 분할하지 않음 (UI 카드 그룹핑 유지)
    # =============================================
    
    for block in blocks:
        if block.get('start_date') and block.get('end_date') and block.get('calendar_dates'):
            continue  # 이미 완전히 처리됨
        
        items = block.get('items', [])
        
        # 모든 item에서 날짜 추출
        all_dates = []  # [(start, end), ...]
        
        for item_text in items:
            item_dates = _extract_dates_from_text(item_text)
            all_dates.extend(item_dates)
        
        # title에서도 날짜 추출
        if block.get('title'):
            title_dates = _extract_dates_from_text(block['title'])
            all_dates.extend(title_dates)
        
        # 중복 제거
        unique_dates = list(dict.fromkeys(all_dates))
        
        if unique_dates:
            # start_date/end_date: 전체 범위의 min/max (기본 캘린더 표시용)
            if not block.get('start_date'):
                block['start_date'] = min(d[0] for d in unique_dates)
            if not block.get('end_date'):
                block['end_date'] = max(d[1] for d in unique_dates)
            
            # calendar_dates: 개별 날짜 범위 목록 (캘린더에서 각각을 별도 이벤트로 표시)
            if len(unique_dates) > 1:
                block['calendar_dates'] = [
                    {'start_date': sd, 'end_date': ed} for sd, ed in unique_dates
                ]
        elif block.get('start_date') and not block.get('end_date'):
            block['end_date'] = block['start_date']
    
    return summary_obj




async def process_target(target, client, current_date_str):
    target_id = target['id']
    instagram_id = target['instagram_id']
    
    # 3. Fetch latest 3 posts for this target
    posts_response = supabase.table("posts") \
        .select("post_content, post_url, published_at") \
        .eq("target_account_id", target_id) \
        .order("published_at", desc=True) \
        .limit(3) \
        .execute()
        
    posts = posts_response.data
    
    if not posts:
         print(f"INFO: No posts found for {instagram_id}. Updating timestamp and skipping summary.")
         supabase.table("target_accounts").update({"last_scraped_at": datetime.now(timezone.utc).isoformat()}).eq("id", target_id).execute()
         return

    # 4. Prepare Prompt for LLM
    posts_text = ""
    for i, p in enumerate(posts):
        published_date = "날짜 알 수 없음"
        if p.get('published_at'):
            try:
                dt = datetime.fromisoformat(p['published_at'].replace('Z', '+00:00'))
                published_date = dt.strftime("%Y년 %m월 %d일")
            except Exception:
                pass
        posts_text += f"\n[게시물 {i+1} 원문]\n작성일: {published_date}\n내용: {p.get('post_content', '내용 없음')}\n링크: {p.get('post_url', '링크 없음')}\n"

    prompt = f"""
오늘 날짜는 {current_date_str} 입니다.
다음은 베이커리 인스타그램 계정(@{instagram_id})의 최신 게시물 {len(posts)}개 내용입니다.

{posts_text}

[요청 사항]
1. 위 게시물들의 '작성일'을 기준 삼아, 오늘 날짜({current_date_str})로부터 1달(30일) 이상 지난 과거 게시물은 분석 대상에서 완전히 제외하고 철저히 무시하세요. (인스타그램 상단 고정된 옛날 게시물 필터링 목적)
2. 최근 1달 이내의 유효한 게시물에서만 다음 핵심 정보들을 찾아주세요:
- 판매 공지 (오픈 시간, 라인업, 품절 등)
- 신메뉴 출시
- 임시 휴무
- **행사 정보** (이벤트, 할인, 팝업 등 - 매우 중요)

[출력 형식 가이드 (반드시 유효한 JSON 형식으로 출력할 것)]
당신은 시스템 앱의 AI 파싱 엔진입니다. 반드시 아래의 JSON 포맷으로 렌더링 가능한 구조체만 답하세요. 
블록 타입은 "news", "event", "sale", "holiday", "info" 중 하나여야 합니다. 텍스트 내부의 강조 표시는 <strong> 태그를 사용해도 됩니다. 단, `excerpt` 필드의 문자열에는 <strong> 등 일체의 HTML 마크업을 허용하지 않으며 오직 순수 텍스트만 작성해야 합니다.
★가장 중요★: 각 항목(items)의 내용 끝에는 반드시 해당 원문의 실제 링크 주소를 [https://www.instagram.com/p/...] 형태로 붙여주세요. "게시물 링크"라는 글자 대신 실제 URL 주소를 넣어야 합니다.

★★★ 캘린더 날짜 추출 (절대 생략 금지) ★★★
이 시스템은 캘린더 앱과 연동되어 있습니다. 각 블록에서 날짜/기간이 언급된 경우 반드시 "start_date"와 "end_date"를 YYYY-MM-DD 형식으로 추가해야 합니다.
날짜 추출 규칙:
- 게시물에서 "3월 5일", "3/5", "2/28(토)~3/2(월)" 등 어떤 형태로든 날짜가 언급되면 반드시 추출하세요.
- 하루짜리 이벤트: start_date = end_date (동일값)
- 기간 이벤트: 시작일과 종료일을 각각 설정
- 종료일만 있는 경우 (예: "~3/4까지"): start_date는 해당 게시물의 작성일로 설정하세요.
- 시작일만 있는 경우: end_date = start_date
- type이 "info"인 일반 안내를 제외한 모든 블록(news, event, sale, holiday)에는 가능한 한 날짜를 추출하세요.
- 날짜가 전혀 언급되지 않은 경우에만 이 필드를 생략할 수 있습니다.
- ★매우 중요★: 같은 구분(예: "holiday", "sale")에 해당하는 소식들은 날짜가 달라도 절대 여러 개의 블록으로 쪼개지 말고, 반드시 하나의 블록 안의 `items` 배열에 합쳐서 작성하세요. (예: 3월의 모든 휴무일은 하나의 "holiday" 블록 안의 items에 각각의 줄로 추가)

```json
{{
  "excerpt": "전체 포스트 내용을 아우르는 가장 핵심적인 한 줄 발췌 문장 (HTML 금지)",
  "blocks": [
    {{
      "type": "news",
      "title": "신메뉴 소식",
      "items": [
        "시즌 한정 <strong>감 타르트</strong> 출시 [https://www.instagram.com/p/ABCDE12345/]"
      ],
      "start_date": "2026-03-05",
      "end_date": "2026-03-05"
    }},
    {{
      "type": "event",
      "title": "크루아상 축제",
      "items": [
        "3월 5일~7일 크루아상 20% 할인 [https://www.instagram.com/p/FGHIJ67890/]"
      ],
      "start_date": "2026-03-05",
      "end_date": "2026-03-07"
    }},
    {{
      "type": "holiday",
      "title": "임시 휴무",
      "items": [
        "택배 출고 2/28(토)~3/2(월) 휴무 [https://www.instagram.com/p/XXXXX00000/]"
      ],
      "start_date": "2026-02-28",
      "end_date": "2026-03-02"
    }},
    {{
      "type": "sale",
      "title": "댓글 이벤트",
      "items": [
        "최애 댓글 이벤트 ~3/4까지 진행 [https://www.instagram.com/p/YYYYY11111/]"
      ],
      "start_date": "2026-02-25",
      "end_date": "2026-03-04"
    }}
  ]
}}
```
만약 위 4가지 카테고리에 해당하는 내용이 아무것도 없다면, type을 info로 하고 `items`를 비운 채 `text` 속성에 "오늘자 중요 공지/행사 사항이 없습니다." 하나만 추가하세요.
자연어 인사말이나 주석을 절대 포함하지 마십시오. 오직 순수한 JSON만 출력하세요.
"""

    print(f"Sending async prompt to Gemini for {instagram_id}...")
    ai_summary_raw = ""
    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        ai_summary_raw = response.text.strip()
        
        # Remove markdown JSON code blocks if they exist
        if ai_summary_raw.startswith("```json"):
             ai_summary_raw = ai_summary_raw[7:]
             if ai_summary_raw.endswith("```"):
                 ai_summary_raw = ai_summary_raw[:-3]
                 
        ai_summary_raw = ai_summary_raw.strip()
        
        # Log the parsed summary
        summary_json_obj = json.loads(ai_summary_raw)
        
        # 4.5. Post-process: extract missing dates from text
        summary_json_obj = postprocess_dates(summary_json_obj, posts)
        
        # 5. Insert or Update AI Summary
        # Check if an existing summary exists for this target
        existing_summary_response = supabase.table("ai_summaries").select("id").eq("target_account_id", target_id).execute()
        
        summary_payload = {
             "target_account_id": target_id,
             "summary": summary_json_obj,
             "status": "success"
        }
        
        if existing_summary_response.data and len(existing_summary_response.data) > 0:
             # Update
             summary_id = existing_summary_response.data[0]['id']
             supabase.table("ai_summaries").update(summary_payload).eq("id", summary_id).execute()
        else:
             # Insert
             supabase.table("ai_summaries").insert(summary_payload).execute()
             
        # 6. Update Target Account scraped timestamp
        supabase.table("target_accounts").update({"last_scraped_at": datetime.now(timezone.utc).isoformat()}).eq("id", target_id).execute()
        
        print(f"SUCCESS: Generated and saved summary for {instagram_id}")
        
    except json.JSONDecodeError as de:
        print(f"ERROR: LLM returned invalid JSON for {instagram_id}. Result: {ai_summary_raw}")
        # 무한 재시도 및 상태 고착화 방지를 위해 에러 시에도 timestamp 강제 갱신
        supabase.table("target_accounts").update({"last_scraped_at": datetime.now(timezone.utc).isoformat()}).eq("id", target_id).execute()
    except Exception as e:
        print(f"ERROR: Failed to generate summary for {instagram_id}. {e}")
        supabase.table("target_accounts").update({"last_scraped_at": datetime.now(timezone.utc).isoformat()}).eq("id", target_id).execute()

async def summarize_posts_async():
    # 1. Load Gemini API Key
    api_key = os.environ.get('GEMINI_API_KEY', '').strip()
    if api_key.startswith('GEMINI_API_KEY='):
        api_key = api_key.replace('GEMINI_API_KEY=', '')
        
    if not api_key:
        print("ERROR: GEMINI_API_KEY environment variable is not set.")
        return False
        
    client = genai.Client(api_key=api_key)

    # 2. Fetch all active targets that haven't been scraped in the last hour
    from datetime import timedelta
    one_hour_ago = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    targets_response = supabase.table("target_accounts") \
        .select("id, instagram_id, bakery_name") \
        .eq("status", "active") \
        .or_(f"last_scraped_at.is.null,last_scraped_at.lt.{one_hour_ago}") \
        .execute()
        
    targets = targets_response.data
    
    if not targets:
         print("INFO: No active target accounts found.")
         return True

    current_date_str = datetime.now(timezone.utc).strftime("%Y년 %m월 %d일")
    
    # 3. Create concurrent tasks for all targets
    print(f"Starting concurrent summarization for {len(targets)} targets...")
    tasks = [process_target(t, client, current_date_str) for t in targets]
    await asyncio.gather(*tasks)
            
    print(f"All summaries generated successfully.")
    return True

def summarize_posts():
    asyncio.run(summarize_posts_async())

if __name__ == "__main__":
    summarize_posts()
