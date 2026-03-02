"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BlockContent, getBlockStyle } from "./sharedStyles";
import { stripHtml, formatLinksToIcons } from "@/lib/stringUtils";

export function DetailModal({ block, bakeryName, onClose }: { block: BlockContent | null, bakeryName: string, onClose: () => void }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (block) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [block]);

    if (!mounted || !block) return null;

    const style = getBlockStyle(block.type);

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className={`w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center ${style.bg}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${style.accent}`}>
                            <span className={`material-symbols-outlined text-2xl ${style.text}`}>{style.icon}</span>
                        </div>
                        <div>
                            <p className="text-sm text-stone-500 dark:text-stone-400 font-medium tracking-tight mb-0.5">{bakeryName}</p>
                            <h3 className={`font-bold text-xl leading-tight ${style.text}`}>{stripHtml(block.title)}</h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-stone-500 dark:text-stone-400"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {block.items && block.items.length > 0 ? (
                        <ul className="space-y-4 text-base leading-relaxed text-stone-700 dark:text-stone-300">
                            {block.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <span className="text-stone-400 dark:text-stone-500 mt-1 flex-shrink-0">•</span>
                                    <span dangerouslySetInnerHTML={{ __html: formatLinksToIcons(item) }} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p
                            className="text-base leading-relaxed text-stone-700 dark:text-stone-300"
                            dangerouslySetInnerHTML={{ __html: block.text ? formatLinksToIcons(block.text) : "" }}
                        />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
