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
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/widget");
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                    setItems(data);
                }
            } catch (error) {
                console.error("Widget fetch error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (items.length <= 1) return;

        const interval = setInterval(() => {
            // Fade out
            setOpacity(0);

            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % items.length);
                // Fade in
                setOpacity(1);
            }, 500); // fade out duration
        }, 4000); // display duration

        return () => clearInterval(interval);
    }, [items]);

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

    const currentItem = items[currentIndex];

    const getBadgeStyle = (type: string) => {
        switch (type) {
            case "news": return "bg-orange-50 text-orange-600 border-orange-100";
            case "event": return "bg-purple-50 text-purple-600 border-purple-100";
            case "sale": return "bg-green-50 text-green-600 border-green-100";
            default: return "bg-blue-50 text-blue-600 border-blue-100";
        }
    };

    return (
        <div className="h-screen w-full bg-white flex items-center px-3 overflow-hidden border-y border-stone-100">
            <div
                className="flex items-center gap-2 w-full transition-opacity duration-500 ease-in-out"
                style={{ opacity }}
            >
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex-shrink-0 ${getBadgeStyle(currentItem.type)}`}>
                    {currentItem.category}
                </span>

                <div className="flex items-baseline gap-2 overflow-hidden flex-1">
                    <span className="text-[11px] font-bold text-stone-500 whitespace-nowrap">
                        {currentItem.bakery_name}
                    </span>
                    <span className="text-[12px] text-stone-800 truncate">
                        {currentItem.excerpt}
                    </span>
                </div>

                <a
                    href="/"
                    target="_parent"
                    className="text-[10px] text-stone-400 hover:text-stone-600 whitespace-nowrap ml-1 flex items-center"
                >
                    보기 <span className="ml-0.5 text-[8px]">▶</span>
                </a>
            </div>

            <style jsx global>{`
        body { margin: 0; padding: 0; overflow: hidden; }
      `}</style>
        </div>
    );
}
