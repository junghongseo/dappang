import { Sidebar } from "@/components/layout/Sidebar";
import { SummaryCard, SummaryData } from "@/components/dashboard/SummaryCard";
import { fetchAiSummaries } from "@/app/actions/dashboard";
import { RealtimeSubscriber } from "@/components/dashboard/RealtimeSubscriber";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const summariesData = await fetchAiSummaries();

    // Transform DB data to SummaryData format
    const parsedSummaries: SummaryData[] = summariesData.map((item: any) => {
        // If summary is a string, attempt to parse it (assuming it's JSON from python scraper)
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
            // Fallback format if python drops a raw string block
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
            updated_at: new Date(target_accounts?.last_scraped_at || item.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }),
            excerpt,
            blocks
        };
    });

    return (
        <main className="flex-grow max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
            <Sidebar />
            <section className="lg:col-span-8 space-y-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="font-display text-2xl font-bold text-primary dark:text-amber-500 flex items-center gap-2">
                        최신 AI 요약 정보
                        <RealtimeSubscriber />
                    </h2>

                </div>

                {parsedSummaries.map((summary) => (
                    <SummaryCard key={summary.id} data={summary} />
                ))}
                {parsedSummaries.length === 0 && (
                    <div className="text-center p-10 text-stone-500 bg-surface-light dark:bg-surface-dark rounded-xl border border-stone-200 dark:border-stone-700">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">data_alert</span>
                        <p>수집된 요약 정보가 없습니다.</p>
                    </div>
                )}
            </section>
        </main>
    );
}
