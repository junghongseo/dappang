import { useState, useEffect, useRef } from "react";

export function useGalleryScroll(totalCards: number) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

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

    return { scrollRef, activeIndex };
}
