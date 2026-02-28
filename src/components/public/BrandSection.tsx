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
    shopping_mall_url: string | null;
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
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 transition-colors mx-1 align-middle bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded px-1.5 py-0.5 border border-stone-200 dark:border-stone-700" title="해당 링크 열기" onclick="event.stopPropagation()">
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
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${style.accent}`}>
                            <span className={`material-symbols-outlined text-2xl ${style.text}`}>{style.icon}</span>
                        </div>
                        <div>
                            <p className="text-sm text-stone-500 dark:text-stone-400 font-medium tracking-tight mb-0.5">{bakeryName}</p>
                            <h3 className={`font-bold text-xl leading-tight ${style.text}`}>{block.title}</h3>
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

/** 3차 개선: 모바일 가로 스크롤 갤러리 카드 (아주 큰 정사각형 썸네일형) */
function GalleryCard({ block, onClick }: { block: BlockContent, onClick: () => void }) {
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
            className={`flex-shrink-0 w-44 h-44 sm:w-48 sm:h-48 snap-start rounded-[20px] border ${style.border} ${style.bg} p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-1 transition-transform relative group text-left shadow-sm`}
        >
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full mb-3 flex items-center justify-center ${style.accent}`}>
                <span className={`material-symbols-outlined text-3xl sm:text-4xl ${style.text}`}>
                    {style.icon}
                </span>
            </div>

            <h4 className={`text-base sm:text-lg font-bold ${style.text} line-clamp-1 mb-2 w-full text-center tracking-tight`}>
                {block.title}
            </h4>

            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 line-clamp-2 w-full leading-snug">
                {previewText}
            </p>

            {hasMore ? (
                <div className="absolute top-3 right-3 flex items-center gap-0.5 text-xs font-bold text-stone-500 dark:text-stone-400 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full">
                    +{block.items.length - 1}
                </div>
            ) : null}

            <div className={`absolute inset-0 border-[3px] border-transparent group-hover:${style.border.replace('border-', 'border-')} rounded-[20px] opacity-0 hover:opacity-100 transition-opacity pointer-events-none`}></div>
        </button>
    );
}

/** 7차 개선: 데스크톱용 아코디언(하단 펼침) 카드 */
function DesktopCard({ block }: { block: BlockContent }) {
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
            className={`w-full ${style.bg} p-6 rounded-[20px] border ${style.border} shadow-sm flex flex-col text-left group hover:shadow-md transition-all cursor-pointer relative focus:outline-none`}
        >
            <div className="flex items-center gap-3 mb-4 shrink-0 w-full">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${style.accent}`}>
                    <span className={`material-symbols-outlined text-2xl ${style.text}`}>{style.icon}</span>
                </div>
                <h4 className={`font-bold text-[17px] ${style.text} line-clamp-1 flex-1 tracking-tight`}>
                    {block.title}
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
            // w-44 is 176px, gap-4 is 16px
            const cardWidth = 176 + 16;
            const index = Math.round(scrollLeft / cardWidth);
            setActiveIndex(Math.min(index, totalCards - 1));
        };

        container.addEventListener("scroll", handleScroll, { passive: true });
        return () => container.removeEventListener("scroll", handleScroll);
    }, [totalCards]);

    if (data.blocks.length === 0) return null;

    return (
        <section className="mb-10 sm:mb-14">
            {/* 브랜드 헤더 (3차+6차 개선: 인스타 커스텀 SVG 및 쇼핑몰 링크 적용) */}
            <div className="flex items-center mb-4 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center flex-shrink-0 border border-stone-300 dark:border-stone-600 shadow-sm">
                        <span className="material-symbols-outlined text-stone-500 dark:text-stone-400 text-2xl sm:text-3xl">
                            storefront
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <h3 className="font-display font-bold text-xl sm:text-2xl text-text-main-light dark:text-text-main-dark">
                                {data.bakery_name}
                            </h3>

                            {/* 인스타그램 링크 (커스텀 SVG 아이콘 적용) */}
                            <Link
                                href={`https://instagram.com/${data.instagram_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center transition-transform hover:scale-110 p-1"
                                title="인스타그램 방문"
                            >
                                <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#f09433" />
                                            <stop offset="25%" stopColor="#e6683c" />
                                            <stop offset="50%" stopColor="#dc2743" />
                                            <stop offset="75%" stopColor="#cc2366" />
                                            <stop offset="100%" stopColor="#bc1888" />
                                        </linearGradient>
                                    </defs>
                                    <path fill="url(#ig-grad)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.869a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                </svg>
                            </Link>

                            {/* 쇼핑몰 링크 (데이터가 존재할 때만 표시) */}
                            {data.shopping_mall_url && (
                                <Link
                                    href={data.shopping_mall_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 flex items-center transition-colors bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 p-[7px] sm:p-2 rounded-full shadow-sm border border-stone-200 dark:border-stone-700"
                                    title="온라인 쇼핑몰 방문"
                                >
                                    <span className="material-symbols-outlined text-[20px] sm:text-[22px]">local_mall</span>
                                </Link>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                            {data.updated_at} 업데이트
                        </p>
                    </div>
                </div>
            </div>

            {/* 발췌문 (3차 개선: 갤러리/그리드 상단으로 이동) */}
            {data.excerpt && (
                <div className="mb-5 sm:mb-6 px-1 w-full max-w-full overflow-hidden">
                    <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl text-sm sm:text-[15px] text-stone-700 dark:text-stone-300 border border-stone-100 dark:border-stone-800 leading-relaxed break-words break-all whitespace-normal shadow-sm">
                        <span className="text-stone-400 mr-1.5 font-serif font-bold opacity-60">"</span>
                        {data.excerpt}
                        <span className="text-stone-400 ml-1.5 font-serif font-bold opacity-60">"</span>
                        <div className="block mt-2 text-xs text-stone-400 text-right">— AI 소식 요약 모음</div>
                    </div>
                </div>
            )}

            {/* 모바일: 가로 스크롤 갤러리 */}
            <div className="md:hidden w-[100vw] relative left-1/2 -ml-[50vw]">
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-5 px-4 scrollbar-hide [-webkit-overflow-scrolling:touch]"
                >
                    {data.blocks.map((block, idx) => (
                        <GalleryCard key={idx} block={block} onClick={() => setSelectedBlock(block)} />
                    ))}
                </div>
                {/* 인디케이터 점 */}
                {totalCards > 1 && (
                    <div className="flex justify-center gap-1.5 mt-1 pb-2">
                        {data.blocks.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === activeIndex
                                    ? "bg-primary dark:bg-amber-500 w-5"
                                    : "bg-stone-300 dark:bg-stone-600"
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 데스크톱: 펼쳐진 그리드 (고정 폭 클릭형 카드로 변경) */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 px-1">
                {data.blocks.map((block, idx) => (
                    <DesktopCard key={idx} block={block} />
                ))}
            </div>

            {/* 상세 내용 모달 (모바일 공통 적용) */}
            <DetailModal
                block={selectedBlock}
                bakeryName={data.bakery_name}
                onClose={() => setSelectedBlock(null)}
            />
        </section>
    );
}
