"use client";

import { useState, useTransition } from "react";
import { deleteBakeryAction } from "@/app/actions/manageBakery";
import { DeleteBakeryModal } from "./DeleteBakeryModal";
import { EditBakeryModal } from "./EditBakeryModal";

type TargetAccount = {
    id: string;
    bakery_name: string;
    instagram_id: string;
    status: string;
    last_scraped_at: string | null;
};

export function TargetItem({ target }: { target: TargetAccount }) {
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false); // To keep the visual overlay on the card while API request processes
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    return (
        <div
            className={`p-4 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors group border-l-4 ${target.status === "active" ? "border-primary" : "border-transparent hover:border-stone-300 dark:hover:border-stone-600"} ${isDeleting || isPending ? 'opacity-50 pointer-events-none' : ''}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className={`font-bold text-lg ${target.status === 'paused' ? 'opacity-60' : ''}`}>
                        {target.bakery_name}
                    </h3>
                    <p className={`text-sm text-text-sub-light dark:text-text-sub-dark flex items-center gap-1 mt-1 ${target.status === 'paused' ? 'opacity-60' : ''}`}>
                        <span className="material-symbols-outlined text-xs">alternate_email</span>
                        {target.instagram_id}
                    </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={handleEdit} className="text-stone-400 hover:text-primary dark:hover:text-amber-400">
                        <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={handleDeleteClick} className="text-stone-400 hover:text-red-500">
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </div>
            <div className="mt-3 flex gap-2 text-xs font-medium">
                {target.status === "active" && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                        활성
                    </span>
                )}
                {target.status === "syncing" && (
                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-2 py-0.5 rounded">
                        동기화 중...
                    </span>
                )}
                {target.status === "paused" && (
                    <span className="bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded">
                        일시 중지됨
                    </span>
                )}
                {target.last_scraped_at && (
                    <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded">
                        마지막 수집: {target.last_scraped_at ? new Date(target.last_scraped_at).toLocaleString("ko-KR", { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "수집 이력 없음"}
                    </span>
                )}
            </div>

            {/* Edit Modal Component */}
            <EditBakeryModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                target={target}
            />

            {/* Delete Modal Component */}
            <DeleteBakeryModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                target={target}
            />
        </div>
    );
}
