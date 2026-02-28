"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

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
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 transition-colors mx-1 align-middle bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded px-1.5 py-0.5 border border-stone-200 dark:border-stone-700" title="해당 링크 열기" onClick="(e) => e.stopPropagation()">
            <span class="material-symbols-outlined text-[14px]">link</span>
            <span class="text-[11px] font-bold ml-0.5">링크</span>
        </a>`;
    });
}

/** 텍스트 클리닝 (요약용, 태그 제거) */
function stripHtml(text: string) {
    if (!text) return "";
    return text.replace(/<[^>]*>?/gm, '');
}

/** 상세 모달 컴포넌트 */
function DetailModal({ block, bakeryName, onClose }: { block: BlockContent | null, bakeryName: string, onClose: () => void }) {
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
                    <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.accent}`}>
                            <span className={`material-symbols-outlined ${style.text}`}>{style.icon}</span>
                        </div>
                        <div>
                            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium tracking-tight">{bakeryName}</p>
                            <h3 className={`font-bold text-lg leading-tight ${style.text}`}>{block.title}</h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-stone-500 dark:text-stone-400"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-5 overflow-y-auto max-h-[60vh]">
                    {block.items && block.items.length > 0 ? (
                        <ul className="space-y-3 text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
                            {block.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-stone-400 dark:text-stone-500 mt-1 flex-shrink-0">•</span>
                                    <span dangerouslySetInnerHTML={{ __html: formatLinksToIcons(item) }} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p
                            className="text-[15px] leading-relaxed text-stone-700 dark:text-stone-300"
                            dangerouslySetInnerHTML={{ __html: block.text ? formatLinksToIcons(block.text) : "" }}
                        />
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}

/** 모바일 가로 스크롤 갤러리 카드 (정사각형 썸네일형) */
function GalleryCard({ block, onClick }: { block: BlockContent, onClick: () => void }) {
    const style = getBlockStyle(block.type);

    // 썸네일에 노출할 프리뷰 텍스트 추출 (첫 번째 항목이나 텍스트의 앞부분)
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
            className={`flex-shrink-0 w-36 h-36 sm:w-40 sm:h-40 snap-start rounded-2xl border ${style.border} ${style.bg} p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-1 transition-transform relative group text-left`}
        >
            <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center ${style.accent}`}>
                <span className={`material-symbols-outlined text-2xl ${style.text}`}>
                    {style.icon}
                </span>
            </div>

            <h4 className={`text-sm font-bold ${style.text} line-clamp-1 mb-1.5 w-full text-center`}>
                {block.title}
            </h4>

            <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-400 line-clamp-2 w-full leading-snug">
                {previewText}
            </p>

            {hasMore ? (
                <div className="absolute top-2 right-2 flex items-center gap-0.5 text-[10px] font-bold text-stone-400 dark:text-stone-500 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded-full">
                    +{block.items.length - 1}
                </div>
            ) : null}

            <div className={`absolute inset-0 border-2 border-transparent group-hover:${style.border.replace('border-', 'border-')} rounded-2xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none`}></div>
        </button>
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
    const [selectedBlock, setSelectedBlock] = useState<BlockContent | null>(null);
    const totalCards = data.blocks.length;

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft;
            // w-36 is 144px, gap-3 is 12px
            const cardWidth = 144 + 12;
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
                    className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 scrollbar-hide overscroll-x-contain touch-pan-x"
                >
                    {data.blocks.map((block, idx) => (
                        <GalleryCard key={idx} block={block} onClick={() => setSelectedBlock(block)} />
                    ))}
                </div>
                {/* 인디케이터 점 */}
                {totalCards > 1 && (
                    <div className="flex justify-center gap-1.5 mt-1">
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
                <div className="mt-4 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-sm text-stone-500 dark:text-stone-400 italic border border-stone-100 dark:border-stone-800">
                    &ldquo;{data.excerpt}&rdquo;{" "}
                    <span className="text-stone-400 not-italic">— 게시물 발췌</span>
                </div>
            )}

            {/* 상세 내용 모달 (모바일 공통 적용) */}
            <DetailModal
                block={selectedBlock}
                bakeryName={data.bakery_name}
                onClose={() => setSelectedBlock(null)}
            />
        </section>
    );
}
