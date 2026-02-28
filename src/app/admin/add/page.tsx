import { AddBakeryForm } from "@/components/add/AddBakeryForm";
import Link from "next/link";

export default function AddBakeryPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg overflow-hidden rounded-xl bg-surface-light dark:bg-surface-dark shadow-xl ring-1 ring-black/5 dark:ring-white/10 transition-all border border-stone-200 dark:border-stone-700">
                <div className="relative px-8 pt-8 pb-2 flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-text-main-light dark:text-amber-500">
                            새 베이커리 등록
                        </h3>
                        <p className="text-sm text-text-sub-light dark:text-stone-400">
                            새로운 베이커리의 정보를 입력하여 추적을 시작하세요.
                        </p>
                    </div>
                    <Link
                        href="/admin"
                        className="rounded-full p-2 text-text-sub-light dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-text-main-light dark:hover:text-amber-500 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </Link>
                </div>

                <div className="px-8 mt-4">
                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30 rounded-lg p-3 flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary dark:text-amber-500 text-xl mt-0.5">
                            info
                        </span>
                        <p className="text-sm text-text-main-light dark:text-stone-300">
                            크롤러가 자동으로 최신 게시물 3개를 수집합니다.
                        </p>
                    </div>
                </div>

                <div className="px-8 pt-6 pb-8">
                    <AddBakeryForm />
                </div>
            </div>
        </div>
    );
}
