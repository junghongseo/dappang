"use client";

import { useState } from "react";
import { BlockContent, getBlockStyle } from "./sharedStyles";
import { stripHtml, formatLinksToIcons } from "@/lib/stringUtils";

export function DesktopCard({ block }: { block: BlockContent }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const style = getBlockStyle(block.type);

    let previewText = "";
    if (block.items && block.items.length > 0) {
        previewText = block.items.map(stripHtml).join(" • ");
    } else if (block.text) {
        previewText = stripHtml(block.text);
    }

    // AI 본문에 포함된 날것의 링크 지저분함 가리기 (미리보기 용)
    const cleanPreviewText = previewText
        .replace(/\[?https?:\/\/[^\s<\]\)]+\]?/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return (
        <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full min-h-[256px] ${style.bg} p-6 rounded-[20px] border ${style.border} shadow-sm flex flex-col text-left group hover:shadow-md transition-all cursor-pointer relative focus:outline-none`}
        >
            <div className="flex items-center gap-3 mb-4 shrink-0 w-full">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${style.accent}`}>
                    <span className={`material-symbols-outlined text-2xl ${style.text}`}>{style.icon}</span>
                </div>
                <h4 className={`font-bold text-[17px] ${style.text} line-clamp-1 flex-1 tracking-tight`}>
                    {stripHtml(block.title)}
                </h4>
            </div>

            <div className={`transition-all duration-300 ease-in-out w-full overflow-hidden ${isExpanded ? "max-h-[800px] mb-4 opacity-100" : "max-h-20 mb-2 opacity-90"}`}>
                {isExpanded ? (
                    block.items && block.items.length > 0 ? (
                        <ul className="space-y-3 text-[15px] sm:text-base leading-relaxed text-stone-700 dark:text-stone-300 relative z-10 w-full">
                            {block.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-stone-400 dark:text-stone-500 mt-1 flex-shrink-0">•</span>
                                    <span dangerouslySetInnerHTML={{ __html: formatLinksToIcons(item) }} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p
                            className="text-[15px] sm:text-base leading-relaxed text-stone-700 dark:text-stone-300 relative z-10 w-full"
                            dangerouslySetInnerHTML={{ __html: block.text ? formatLinksToIcons(block.text) : "" }}
                        />
                    )
                ) : (
                    <p className="text-stone-600 dark:text-stone-300 text-[15px] sm:text-base leading-relaxed line-clamp-3 relative z-10 w-full">
                        {cleanPreviewText}
                    </p>
                )}
            </div>

            <div className={`mt-auto w-full flex justify-center shrink-0 relative z-20 pt-3 border-t transition-colors ${isExpanded ? 'border-black/5 dark:border-white/5' : 'border-transparent'}`}>
                <div className={`flex items-center gap-1 text-sm font-bold ${style.text} ${isExpanded ? 'opacity-100' : 'opacity-50'} group-hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 px-3 py-1.5 rounded-full`}>
                    <span className="material-symbols-outlined text-[18px]">
                        {isExpanded ? "expand_less" : "expand_more"}
                    </span>
                    <span>{isExpanded ? "접기" : "펼쳐보기"}</span>
                </div>
            </div>

            <div className={`absolute inset-0 border-[3px] border-transparent group-hover:${style.border.replace('border-', 'border-')} rounded-[20px] opacity-0 hover:opacity-100 transition-opacity pointer-events-none`}></div>
        </button>
    );
}
