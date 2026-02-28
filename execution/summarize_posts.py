import os
import json
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

def summarize_posts():
    # 1. Load Gemini API Key
    api_key = os.environ.get('GEMINI_API_KEY', '').strip()
    if api_key.startswith('GEMINI_API_KEY='):
        api_key = api_key.replace('GEMINI_API_KEY=', '')
        
    if not api_key:
        print("ERROR: GEMINI_API_KEY environment variable is not set.")
        return False
        
    client = genai.Client(api_key=api_key)

    # 2. Fetch all active targets
    targets_response = supabase.table("target_accounts").select("id, instagram_id").eq("status", "active").execute()
    targets = targets_response.data
    
    if not targets:
         print("INFO: No active target accounts found.")
         return True

    for target in targets:
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
             continue

        # 4. Prepare Prompt for LLM
        current_date_str = datetime.now(timezone.utc).strftime("%Y년 %m월 %d일")
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
블록 타입은 "news", "event", "sale", "holiday", "info" 중 하나여야 합니다. 텍스트 내부의 강조 표시는 <strong> 태그를 사용해도 됩니다.
★가장 중요★: 각 항목(items)의 내용 끝에는 반드시 해당 원문의 실제 링크 주소를 [https://www.instagram.com/p/...] 형태로 붙여주세요. "게시물 링크"라는 글자 대신 실제 URL 주소를 넣어야 합니다.

```json
{{
  "excerpt": "전체 포스트 내용을 아우르는 가장 핵심적인 한 줄 발췌 문장",
  "blocks": [
    {{
      "type": "news",
      "title": "신메뉴 소식",
      "items": [
        "시즌 한정 <strong>감 타르트</strong> 출시 [https://www.instagram.com/p/ABCDE12345/]"
      ]
    }}
  ]
}}
```
만약 위 4가지 카테고리에 해당하는 내용이 아무것도 없다면, type을 info로 하고 `items`를 비운 채 `text` 속성에 "오늘자 중요 공지/행사 사항이 없습니다." 하나만 추가하세요.
자연어 인사말이나 주석을 절대 포함하지 마십시오. 오직 순수한 JSON만 출력하세요.
"""

        print(f"Sending prompt to Gemini for {instagram_id}...")
        try:
            response = client.models.generate_content(
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
        except Exception as e:
            print(f"ERROR: Failed to generate summary for {instagram_id}. {e}")
            
    print(f"All summaries generated successfully.")
    return True

if __name__ == "__main__":
    summarize_posts()
