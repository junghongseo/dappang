import { fetchAiSummaries } from "@/app/actions/dashboard";
import { PublicHeader } from "@/components/public/PublicHeader";
import { BrandSection, BrandData } from "@/components/public/BrandSection";

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
      updated_at: new Date(target_accounts?.last_scraped_at || item.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }),
      excerpt,
      blocks,
    };
  });

  return (
    <>
      <PublicHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
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
