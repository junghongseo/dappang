"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";

interface BlockContent {
    type: "news" | "event" | "sale" | "holiday" | "info";
    title: string;
    items: string[];
    text?: string;
}

export interface BrandData {
    id: string;
    bakery_name: string;
    instagram_id: string;
    updated_at: string;
    blocks: BlockContent[];
    excerpt?: string;
}

function getBlockStyle(type: string) {
    switch (type) {
        case "news":
            return {
                bg: "bg-orange-50 dark:bg-orange-900/15",
                border: "border-orange-200 dark:border-orange-800/40",
                text: "text-orange-800 dark:text-orange-300",
                icon: "restaurant_menu",
                accent: "bg-orange-100 dark:bg-orange-800/30",
            };
        case "event":
            return {
                bg: "bg-purple-50 dark:bg-purple-900/15",
                border: "border-purple-200 dark:border-purple-800/40",
                text: "text-purple-800 dark:text-purple-300",
                icon: "event",
                accent: "bg-purple-100 dark:bg-purple-800/30",
            };
        case "sale":
            return {
                bg: "bg-green-50 dark:bg-green-900/15",
                border: "border-green-200 dark:border-green-800/40",
                text: "text-green-800 dark:text-green-300",
                icon: "local_offer",
                accent: "bg-green-100 dark:bg-green-800/30",
            };
        case "holiday":
            return {
                bg: "bg-red-50 dark:bg-red-900/15",
                border: "border-red-200 dark:border-red-800/40",
                text: "text-red-800 dark:text-red-300",
                icon: "schedule",
                accent: "bg-red-100 dark:bg-red-800/30",
            };
        default:
            return {
                bg: "bg-blue-50 dark:bg-blue-900/15",
                border: "border-blue-200 dark:border-blue-800/40",
                text: "text-blue-800 dark:text-blue-300",
                icon: "info",
                accent: "bg-blue-100 dark:bg-blue-800/30",
            };
    }
}

function formatLinksToIcons(text: string) {
    if (!text) return "";
    const regex = /<a\s+(?:[^>]*?\s+)?href=(['"])(.*?)\1[^>]*>.*?<\/a>|\[?(https?:\/\/[^\s<\]\)]+)\]?/gi;
    return text.replace(regex, (match, quote, aHref, rawUrl) => {
        const url = aHref || rawUrl;
        if (!url) return match;
        const cleanUrl = url.replace(/^[\[\(]/, '').replace(/[\]\)]$/, '');
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 transition-colors mx-1 align-middle bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded px-1.5 py-0.5 border border-stone-200 dark:border-stone-700" title="해당 링크 열기">
            <span class="material-symbols-outlined text-[14px]">link</span>
            <span class="text-[11px] font-bold ml-0.5">링크</span>
        </a>`;
    });
}

/** 모바일 가로 스크롤 갤러리 카드 */
function GalleryCard({ block }: { block: BlockContent }) {
    const style = getBlockStyle(block.type);

    return (
        <div
            className={`flex-shrink-0 w-[280px] snap-start rounded-xl border ${style.border} ${style.bg} p-4 flex flex-col`}
        >
            <div className={`inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full ${style.accent} w-fit`}>
                <span className={`material-symbols-outlined text-sm ${style.text}`}>
                    {style.icon}
                </span>
                <span className={`text-xs font-bold ${style.text}`}>
                    {block.title}
                </span>
            </div>
            <div className="flex-1">
                {block.items && block.items.length > 0 ? (
                    <ul className="space-y-1.5 text-sm text-stone-700 dark:text-stone-300">
                        {block.items.map((item, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-1.5"
                            >
                                <span className="text-stone-400 mt-0.5 flex-shrink-0">•</span>
                                <span dangerouslySetInnerHTML={{ __html: formatLinksToIcons(item) }} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p
                        className="text-sm text-stone-700 dark:text-stone-300"
                        dangerouslySetInnerHTML={{ __html: block.text ? formatLinksToIcons(block.text) : "" }}
                    />
                )}
            </div>
        </div>
    );
}

/** 데스크톱용 펼쳐진 블록 카드 */
function ExpandedBlock({ block }: { block: BlockContent }) {
    const style = getBlockStyle(block.type);

    return (
        <div className={`${style.bg} p-4 rounded-lg border ${style.border}`}>
            <h4 className={`font-bold ${style.text} mb-2 flex items-center gap-2`}>
                <span className="material-symbols-outlined text-sm">{style.icon}</span>
                {block.title}
            </h4>
            {block.items && block.items.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-stone-700 dark:text-stone-300 space-y-1">
                    {block.items.map((item, i) => (
                        <li
                            key={i}
                            dangerouslySetInnerHTML={{ __html: formatLinksToIcons(item) }}
                        />
                    ))}
                </ul>
            ) : (
                <p
                    className="text-sm text-stone-700 dark:text-stone-300"
                    dangerouslySetInnerHTML={{ __html: block.text ? formatLinksToIcons(block.text) : "" }}
                />
            )}
        </div>
    );
}

export function BrandSection({ data }: { data: BrandData }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const totalCards = data.blocks.length;

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft;
            const cardWidth = 280 + 12; // card width + gap
            const index = Math.round(scrollLeft / cardWidth);
            setActiveIndex(Math.min(index, totalCards - 1));
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, [totalCards]);

    if (data.blocks.length === 0) return null;

    return (
        <section className="mb-6 sm:mb-8">
            {/* 브랜드 헤더 */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center flex-shrink-0 border border-stone-300 dark:border-stone-600">
                        <span className="material-symbols-outlined text-stone-500 dark:text-stone-400 text-lg">
                            storefront
                        </span>
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-lg text-text-main-light dark:text-text-main-dark">
                            {data.bakery_name}
                        </h3>
                        <p className="text-xs text-stone-400 dark:text-stone-500">
                            {data.updated_at} 업데이트
                        </p>
                    </div>
                </div>
                <Link
                    href={`https://instagram.com/${data.instagram_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-500 dark:text-pink-400 hover:text-pink-600 flex items-center gap-1 text-xs font-medium"
                >
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                    <span className="hidden sm:inline">인스타그램</span>
                </Link>
            </div>

            {/* 모바일: 가로 스크롤 갤러리 */}
            <div className="md:hidden">
                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {data.blocks.map((block, idx) => (
                        <GalleryCard key={idx} block={block} />
                    ))}
                </div>
                {/* 인디케이터 점 */}
                {totalCards > 1 && (
                    <div className="flex justify-center gap-1.5 mt-2">
                        {data.blocks.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex
                                        ? "bg-primary dark:bg-amber-500 w-4"
                                        : "bg-stone-300 dark:bg-stone-600"
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 데스크톱: 펼쳐진 그리드 */}
            <div className="hidden md:grid md:grid-cols-2 gap-3">
                {data.blocks.map((block, idx) => (
                    <ExpandedBlock key={idx} block={block} />
                ))}
            </div>

            {/* 발췌문 */}
            {data.excerpt && (
                <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-sm text-stone-500 dark:text-stone-400 italic border border-stone-100 dark:border-stone-800">
                    &ldquo;{data.excerpt}&rdquo;{" "}
                    <span className="text-stone-400 not-italic">— 게시물 발췌</span>
                </div>
            )}
        </section>
    );
}
