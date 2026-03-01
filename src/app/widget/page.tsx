"use client";

import { useEffect, useState } from "react";

interface WidgetItem {
    id: string;
    bakery_name: string;
    excerpt: string;
    type: string;
    category: string;
    updated_at: string;
}

export const dynamic = 'force-dynamic';

export default function WidgetPage() {
    const [items, setItems] = useState<WidgetItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/widget?t=" + Date.now()); // 캐시 방지용 쿼리
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                setItems(data.slice(0, 3));
            }
        } catch (error) {
            console.error("Widget fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 300000); // 5분마다 갱신
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center text-[11px] text-stone-400 bg-white">
                최신 소식 불러오는 중...
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-[11px] text-stone-400 bg-white">
                새로운 소식이 없습니다.
            </div>
        );
    }

    const getBadgeStyle = (type: string) => {
        switch (type) {
            case "news": return "bg-orange-50 text-orange-600 border-orange-100";
            case "event": return "bg-purple-50 text-purple-600 border-purple-100";
            case "sale": return "bg-green-50 text-green-600 border-green-100";
            default: return "bg-blue-50 text-blue-600 border-blue-100";
        }
    };

    return (
        <div className="h-full w-full bg-white flex flex-col p-2 space-y-2.5 overflow-hidden">
            {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2.5 w-full border-b border-stone-100/50 pb-2 last:border-0 last:pb-0">
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border flex-shrink-0 leading-tight ${getBadgeStyle(item.type)}`}>
                        {item.category}
                    </span>

                    <div className="flex flex-col flex-1 gap-0.5 overflow-hidden">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <span className="text-[10px] font-extrabold text-stone-600 truncate">
                                {item.bakery_name}
                            </span>
                            <span className="w-0.5 h-0.5 bg-stone-300 rounded-full flex-shrink-0"></span>
                            <span className="text-[9px] text-stone-400 whitespace-nowrap">
                                실시간 소식
                            </span>
                        </div>
                        <span className="text-[11px] text-stone-800 truncate leading-snug">
                            {item.excerpt}
                        </span>
                    </div>

                    <a
                        href="https://dappang.junghong-seo.workers.dev"
                        target="_parent"
                        className="text-[9px] font-bold text-orange-500 hover:text-orange-600 whitespace-nowrap ml-1 flex items-center group flex-shrink-0 self-center"
                    >
                        보기<span className="ml-0.5 text-[8px] group-hover:translate-x-0.5 transition-transform">▶</span>
                    </a>
                </div>
            ))}

            <style jsx global>{`
        body { margin: 0; padding: 0; background: white; -webkit-font-smoothing: antialiased; }
      `}</style>
        </div>
    );
}
