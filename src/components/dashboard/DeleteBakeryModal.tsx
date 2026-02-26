"use client";

import { useTransition, useState } from "react";
import { deleteBakeryAction } from "@/app/actions/manageBakery";

interface DeleteBakeryModalProps {
    isOpen: boolean;
    onClose: () => void;
    target: {
        id: string;
        bakery_name: string;
    };
}

export function DeleteBakeryModal({ isOpen, onClose, target }: DeleteBakeryModalProps) {
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleDelete = () => {
        setErrorMsg(null);
        startTransition(async () => {
            const result = await deleteBakeryAction(target.id);
            if (result.success) {
                onClose();
            } else {
                setErrorMsg(result.error ?? "삭제에 실패했습니다.");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-light dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-red-100 dark:border-red-900/30 animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-red-50 dark:border-red-900/20 flex justify-between items-center bg-red-50/50 dark:bg-red-900/10">
                    <h2 className="font-display text-xl font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
                        <span className="material-symbols-outlined">warning</span>
                        베이커리 삭제 확인
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                        disabled={isPending}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-800 dark:text-red-200 text-sm">
                            <span className="material-symbols-outlined text-red-500 mt-0.5">error</span>
                            <div>
                                <p className="font-bold text-base mb-1">'{target.bakery_name}' 계정을 정말 삭제하시겠습니까?</p>
                                <p className="text-red-600 dark:text-red-400 text-xs">
                                    삭제된 계정 데이터와 기존에 수집된 요약 정보 연결이 해제될 수 있습니다. 이 작업은 되돌릴 수 없습니다.
                                </p>
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800/50">
                                {errorMsg}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-stone-200 dark:border-stone-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex w-full justify-center items-center rounded-lg bg-transparent px-5 py-3 text-sm font-semibold text-text-sub-light dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-text-main-light dark:hover:text-stone-200 sm:w-auto transition-colors border border-transparent hover:border-stone-200 dark:hover:border-stone-700"
                            disabled={isPending}
                        >
                            취소
                        </button>
                        <button
                            onClick={handleDelete}
                            className="inline-flex w-full justify-center items-center rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-red-700 sm:w-auto transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                            disabled={isPending}
                        >
                            <span className="material-symbols-outlined text-lg mr-2">
                                {isPending ? "hourglass_empty" : "delete_forever"}
                            </span>
                            {isPending ? "삭제 중..." : "위험성 확인 및 삭제"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
