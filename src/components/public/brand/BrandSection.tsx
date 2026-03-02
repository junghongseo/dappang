"use client";

import Link from "next/link";
import { useState } from "react";
import { useGalleryScroll } from "@/hooks/useGalleryScroll";
import { BrandData, BlockContent } from "./sharedStyles";
import { GalleryCard } from "./GalleryCard";
import { DesktopCard } from "./DesktopCard";
import { DetailModal } from "./DetailModal";

export function BrandSection({ data }: { data: BrandData }) {
    const { scrollRef, activeIndex } = useGalleryScroll(data.blocks.length);
    const [selectedBlock, setSelectedBlock] = useState<BlockContent | null>(null);

    const totalCards = data.blocks.length;

    if (totalCards === 0) return null;

    return (
        <section className="mb-10 sm:mb-14 overflow-hidden w-full max-w-full min-w-0">
            {/* 브랜드 헤더 */}
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

            {/* 발췌문 */}
            {data.excerpt && (
                <div className="mb-5 sm:mb-6 px-1 w-full max-w-full min-w-0 overflow-hidden">
                    <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl text-sm sm:text-[15px] text-stone-700 dark:text-stone-300 border border-stone-100 dark:border-stone-800 leading-relaxed break-words break-all whitespace-normal shadow-sm">
                        <span className="text-stone-400 mr-1.5 font-serif font-bold opacity-60">"</span>
                        {data.excerpt}
                        <span className="text-stone-400 ml-1.5 font-serif font-bold opacity-60">"</span>
                        <div className="block mt-2 text-xs text-stone-400 text-right">— AI 소식 요약 모음</div>
                    </div>
                </div>
            )}

            {/* 모바일: 가로 스크롤 갤러리 */}
            <div className="md:hidden overflow-hidden w-full max-w-full min-w-0">
                <div
                    ref={scrollRef}
                    className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 px-1 scrollbar-hide [-webkit-overflow-scrolling:touch] w-full max-w-full min-w-0"
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

            {/* 데스크톱: 펼쳐진 그리드 */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 px-1 items-start">
                {data.blocks.map((block, idx) => (
                    <DesktopCard key={idx} block={block} />
                ))}
            </div>

            {/* 상세 내용 모달 */}
            <DetailModal
                block={selectedBlock}
                bakeryName={data.bakery_name}
                onClose={() => setSelectedBlock(null)}
            />
        </section>
    );
}
