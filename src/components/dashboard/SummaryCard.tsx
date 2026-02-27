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
                    <Link
                        href={`https://instagram.com/${data.instagram_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-pink-600 dark:text-pink-400 hover:text-pink-700 flex items-center gap-1 text-sm font-medium z-20 relative"
                    >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        <span className="hidden sm:inline">인스타그램 방문</span>
                    </Link>
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
                                return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 transition-colors mx-1 align-middle bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 rounded px-1.5 py-0.5 border border-stone-200 dark:border-stone-700" title="해당 링크 열기">
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
