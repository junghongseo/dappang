import { BlockContent, getBlockStyle } from "./sharedStyles";
import { stripHtml } from "@/lib/stringUtils";

export function GalleryCard({ block, onClick }: { block: BlockContent, onClick: () => void }) {
    const style = getBlockStyle(block.type);

    let previewText = "";
    if (block.items && block.items.length > 0) {
        previewText = stripHtml(block.items[0]);
    } else if (block.text) {
        previewText = stripHtml(block.text);
    }

    const hasMore = block.items && block.items.length > 1;

    return (
        <button
            onClick={onClick}
            className={`flex-shrink-0 w-[44vw] sm:w-48 min-h-[180px] sm:h-48 snap-center rounded-[20px] border ${style.border} ${style.bg} p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-1 transition-transform relative group shadow-sm`}
        >
            <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-2.5 flex items-center justify-center ${style.accent}`}>
                <span className={`material-symbols-outlined text-2xl sm:text-4xl ${style.text}`}>
                    {style.icon}
                </span>
            </div>

            <h4 className={`text-sm sm:text-lg font-bold ${style.text} line-clamp-2 mb-1.5 w-full text-center tracking-tight leading-tight`}>
                {stripHtml(block.title)}
            </h4>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-2 w-full leading-snug text-center">
                {previewText}
            </p>

            {hasMore ? (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 text-[11px] font-bold text-stone-500 dark:text-stone-400 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-full">
                    +{block.items.length - 1}
                </div>
            ) : null}
        </button>
    );
}
