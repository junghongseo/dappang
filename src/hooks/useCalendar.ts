import { useState, useMemo, useRef, useEffect } from "react";
import { CalendarEvent, getCalendarDays, getEventsForDate } from "@/lib/calendarUtils";

export function useCalendar(events: CalendarEvent[]) {
    const now = new Date();
    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(now.getMonth());
    const [selectedDate, setSelectedDate] = useState<Date | null>(now);
    const monthScrollRef = useRef<HTMLDivElement>(null);

    const weeks = useMemo(() => getCalendarDays(currentYear, currentMonth), [currentYear, currentMonth]);
    const selectedDateEvents = useMemo(() => {
        if (!selectedDate) return [];
        return getEventsForDate(events, selectedDate);
    }, [selectedDate, events]);

    // 월 버튼 스크롤 → 현재 월 중앙으로
    useEffect(() => {
        if (monthScrollRef.current) {
            const activeBtn = monthScrollRef.current.querySelector('[data-active="true"]') as HTMLElement;
            if (activeBtn) {
                const container = monthScrollRef.current;
                const scrollLeft = activeBtn.offsetLeft - container.clientWidth / 2 + activeBtn.clientWidth / 2;
                container.scrollTo({ left: scrollLeft, behavior: "smooth" });
            }
        }
    }, [currentMonth]);

    const handleMonthSelect = (month: number) => {
        setCurrentMonth(month);
        setSelectedDate(null);
    };

    const handleYearNav = (delta: number) => {
        setCurrentYear(y => y + delta);
        setSelectedDate(null);
    };

    return {
        currentYear,
        currentMonth,
        selectedDate,
        setSelectedDate,
        monthScrollRef,
        weeks,
        selectedDateEvents,
        handleMonthSelect,
        handleYearNav
    };
}
