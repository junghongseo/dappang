import Image from "next/image";
import Link from "next/link";

interface BlockContent {
    type: "news" | "event" | "sale" | "holiday" | "info";
    title: string;
    items: string[];
    text?: string;
}

export interface SummaryData {
    id: string;
    bakery_name: string;
    instagram_id: string;
    shopping_mall_url: string | null;
    avatar_url?: string;
    updated_at: string;
    blocks: BlockContent[];
    excerpt?: string;
}

export function SummaryCard({ data }: { data: SummaryData }) {
    const getBlockStyle = (type: string) => {
        switch (type) {
            case "news":
                return {
                    bg: "bg-orange-50 dark:bg-orange-900/10",
                    border: "border-orange-100 dark:border-orange-800/30",
                    text: "text-orange-800 dark:text-orange-300",
                    icon: "restaurant_menu",
                };
            case "event":
                return {
                    bg: "bg-purple-50 dark:bg-purple-900/10",
                    border: "border-purple-100 dark:border-purple-800/30",
                    text: "text-purple-800 dark:text-purple-300",
                    icon: "event",
                };
            case "sale":
                return {
                    bg: "bg-green-50 dark:bg-green-900/10",
                    border: "border-green-100 dark:border-green-800/30",
                    text: "text-green-800 dark:text-green-300",
                    icon: "local_offer",
                };
            case "holiday":
                return {
                    bg: "bg-red-50 dark:bg-red-900/10",
                    border: "border-red-100 dark:border-red-800/30",
                    text: "text-red-800 dark:text-red-300",
                    icon: "schedule",
                };
            default:
                return {
                    bg: "bg-blue-50 dark:bg-blue-900/10",
                    border: "border-blue-100 dark:border-blue-800/30",
                    text: "text-blue-800 dark:text-blue-300",
                    icon: "info",
                };
        }
    };

    return (
        <article className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 p-6 relative overflow-hidden group hover:shadow-md transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-50">
                <span className="material-symbols-outlined text-8xl text-stone-100 dark:text-stone-800 rotate-12 -mr-6 -mt-6 pointer-events-none">
                    auto_awesome
                </span>
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden border-2 border-primary/20 flex-shrink-0 relative">
                        {data.avatar_url ? (
                            <Image
                                src={data.avatar_url}
                                alt={`${data.bakery_name} Logo`}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-stone-800">
                                <span className="material-symbols-outlined text-stone-400">
                                    storefront
                                </span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-primary dark:text-amber-500">
                            {data.bakery_name}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                            새 게시물 내용 분석됨 • {data.updated_at}
                        </p>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        {/* 쇼핑몰 링크 */}
                        {data.shopping_mall_url && (
                            <Link
                                href={data.shopping_mall_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 flex items-center transition-colors bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 p-1.5 rounded-full border border-stone-200 dark:border-stone-700"
                                title="온라인 쇼핑몰 방문"
                            >
                                <span className="material-symbols-outlined text-[18px]">local_mall</span>
                            </Link>
                        )}

                        {/* 인스타그램 링크 (오리지널 컬러 SVG) */}
                        <Link
                            href={`https://instagram.com/${data.instagram_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center transition-transform hover:scale-110 p-1"
                            title="인스타그램 방문"
                        >
                            <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="ig-grad-admin" x1="0%" y1="100%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#f09433" />
                                        <stop offset="25%" stopColor="#e6683c" />
                                        <stop offset="50%" stopColor="#dc2743" />
                                        <stop offset="75%" stopColor="#cc2366" />
                                        <stop offset="100%" stopColor="#bc1888" />
                                    </linearGradient>
                                </defs>
                                <path fill="url(#ig-grad-admin)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.869a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {data.blocks.map((block, idx) => {
                        const style = getBlockStyle(block.type);

                        const formatLinksToIcons = (text: string) => {
                            if (!text) return "";
                            // Match existing <a> tags, or [http...], or raw http...
                            const regex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1[^>]*>.*?<\/a>|\[?(https?:\/\/[^\s<\]\)]+)\]?/gi;
                            return text.replace(regex, (match, quote, aHref, rawUrl) => {
                                const url = aHref || rawUrl;
                                if (!url) return match;
                                const cleanUrl = url.replace(/^[\[\(]/, '').replace(/[\]\)]$/, '');
                                return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 transition-colors mx-1 align-middle bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded px-1.5 py-0.5 border border-stone-200 dark:border-stone-700" title="해당 링크 열기" onclick="event.stopPropagation()">
                                    <span class="material-symbols-outlined text-[14px]">link</span>
                                    <span class="text-[11px] font-bold ml-0.5">링크</span>
                                </a>`;
                            });
                        };

                        return (
                            <div
                                key={idx}
                                className={`${style.bg} p-4 rounded-lg border ${style.border}`}
                            >
                                <h4
                                    className={`font-bold ${style.text} mb-2 flex items-center gap-2`}
                                >
                                    <span className="material-symbols-outlined text-sm">
                                        {style.icon}
                                    </span>{" "}
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
                    })}
                </div>

                {data.excerpt && (
                    <div className="mt-4 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-sm text-stone-600 dark:text-stone-400 italic border border-stone-100 dark:border-stone-800">
                        "{data.excerpt}"{" "}
                        <span className="text-stone-400 not-italic">— 게시물 발췌</span>
                    </div>
                )}
            </div>
        </article>
    );
}
