import Link from "next/link";
import { fetchTargetAccounts } from "@/app/actions/dashboard";
import { TargetItem } from "@/components/dashboard/TargetItem";

export async function Sidebar() {
    const targets = await fetchTargetAccounts();

    return (
        <aside className="lg:col-span-4 space-y-6">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden">
                <div className="p-5 border-b border-stone-100 dark:border-stone-700 flex justify-between items-center bg-stone-50 dark:bg-stone-800/50">
                    <h2 className="font-display text-xl font-bold text-primary dark:text-amber-500">
                        관리 대상 베이커리
                    </h2>
                    <Link
                        href="/add"
                        className="bg-primary hover:bg-primary-hover text-white text-sm px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">add</span> 새 베이커리 추가
                    </Link>
                </div>
                <div className="divide-y divide-stone-100 dark:divide-stone-700">
                    {targets.map((target) => (
                        <TargetItem key={target.id} target={target} />
                    ))}

                    {targets.length === 0 && (
                        <div className="p-8 text-center text-stone-500">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                            <p>추적 중인 베이커리가 없습니다.</p>
                            <Link href="/add" className="text-primary hover:underline mt-2 inline-block text-sm">
                                새로 추가하기
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-5 border border-primary/10 dark:border-primary/20">
                <h3 className="font-display font-bold text-primary dark:text-amber-500 mb-3">
                    모니터링 통계
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-text-sub-light dark:text-text-sub-dark uppercase">
                            총 수집 대상
                        </p>
                        <p className="text-2xl font-bold">{targets.length}</p>
                    </div>
                    <div>
                        <p className="text-xs text-text-sub-light dark:text-text-sub-dark uppercase">
                            활성 계정
                        </p>
                        <p className="text-2xl font-bold">
                            {targets.filter(t => t.status === "active").length}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
