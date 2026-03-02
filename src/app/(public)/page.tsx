import { fetchAiSummaries } from "@/app/actions/dashboard";
import { PublicHeader } from "@/components/public/PublicHeader";
import { BrandSection, BrandData } from "@/components/public/BrandSection";
import { CalendarSection } from "@/components/public/CalendarSection";
import { extractCalendarEvents } from "@/lib/calendarUtils";

export const dynamic = 'force-dynamic';

export default async function PublicPage() {
  const summariesData = await fetchAiSummaries();

  // Transform DB data to BrandData format
  const brands: BrandData[] = summariesData.map((item: any) => {
    let blocks = [];
    let excerpt = "";
    try {
      if (typeof item.summary === 'string') {
        const parsed = JSON.parse(item.summary);
        blocks = parsed.blocks || [];
        excerpt = parsed.excerpt || "";
      } else if (item.summary && typeof item.summary === 'object') {
        blocks = item.summary.blocks || [];
        excerpt = item.summary.excerpt || "";
      }
    } catch (e) {
      console.error(e);
      blocks = [{
        type: "info",
        title: "AI 요약 내용",
        text: String(item.summary)
      }];
    }

    const { target_accounts } = item;

    return {
      id: item.id,
      bakery_name: target_accounts?.bakery_name || "Unknown Bakery",
      instagram_id: target_accounts?.instagram_id || "",
      shopping_mall_url: target_accounts?.shopping_mall_url || null,
      last_scraped_at: target_accounts?.last_scraped_at || item.created_at,
      updated_at: new Date(target_accounts?.last_scraped_at || item.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }),
      excerpt,
      blocks,
    };
  });

  // 가장 최근 게시물이 수집된 계정순으로 정렬
  brands.sort((a, b) => {
    const dateA = new Date(a.last_scraped_at || 0).getTime();
    const dateB = new Date(b.last_scraped_at || 0).getTime();
    return dateB - dateA;
  });

  // Extract calendar events from brand data
  const calendarBrands = brands.map((b) => ({
    id: b.id,
    bakery_name: b.bakery_name,
    instagram_id: b.instagram_id,
    blocks: b.blocks,
  }));
  const calendarEvents = extractCalendarEvents(calendarBrands);

  // 가장 최근 데이터 수집 시간 계산
  const lastUpdatedAt = (() => {
    let latest: Date | null = null;
    for (const item of summariesData as any[]) {
      const t = item.target_accounts?.last_scraped_at;
      if (t) {
        const d = new Date(t);
        if (!latest || d > latest) latest = d;
      }
    }
    if (!latest) return undefined;
    return latest.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  })();

  return (
    <>
      <PublicHeader lastUpdatedAt={lastUpdatedAt} />
      <main className="w-full min-w-0 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 overflow-x-hidden">
        {/* 📅 캘린더 섹션 */}
        <section className="mb-8 sm:mb-10">
          <div className="mb-4 sm:mb-6">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-text-main-light dark:text-text-main-dark mb-1">
              📅 다빵 캘린더
            </h2>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
              달력의 날짜를 선택해서 세부 이벤트를 확인하세요
            </p>
          </div>
          <CalendarSection events={calendarEvents} />
        </section>

        {/* 구분선 */}
        <div className="border-t border-stone-200 dark:border-stone-700 mb-8 sm:mb-10" />

        {/* 🍞 베이커리 소식 섹션 */}
        <div className="mb-6 sm:mb-8">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-text-main-light dark:text-text-main-dark mb-1">
            🍞 베이커리 소식
          </h2>
          <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
            AI가 분석한 최신 베이커리 소식을 확인하세요
          </p>
        </div>

        {brands.length > 0 ? (
          <div className="space-y-2">
            {brands.map((brand) => (
              <BrandSection key={brand.id} data={brand} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-stone-500">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-40">data_alert</span>
            <p className="text-lg font-medium">아직 수집된 소식이 없습니다</p>
            <p className="text-sm mt-1">관리자가 베이커리를 등록하면 AI가 자동으로 소식을 수집합니다</p>
          </div>
        )}
      </main>

      {/* 하단 푸터 */}
      <footer className="border-t border-stone-200 dark:border-stone-700 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-xs text-stone-400 dark:text-stone-500">
          <p>다빵 캘린더 • AI가 수집한 베이커리 소식</p>
        </div>
      </footer>
    </>
  );
}

