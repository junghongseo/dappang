"use client";

import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
    CalendarEvent,
    getCalendarDays,
    getEventsForDate,
    isToday,
    getEventTypeLabel,
    getEventTypeIcon,
} from "@/lib/calendarUtils";

const MONTH_NAMES = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
];

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarProps {
    events: CalendarEvent[];
}

// ============================================
// Multi-day event bar positioning logic
// ============================================

interface EventBarSegment {
    event: CalendarEvent;
    startCol: number;
    spanCols: number;
    row: number;
}

function getEventBarsForWeek(
    weekDates: Date[],
    events: CalendarEvent[],
    currentMonth: number,
): EventBarSegment[] {
    const bars: EventBarSegment[] = [];

    const weekStart = new Date(weekDates[0].getFullYear(), weekDates[0].getMonth(), weekDates[0].getDate()).getTime();
    const weekEnd = new Date(weekDates[6].getFullYear(), weekDates[6].getMonth(), weekDates[6].getDate()).getTime();

    const relevantEvents = events.filter(ev => {
        const evStart = new Date(ev.startDate.getFullYear(), ev.startDate.getMonth(), ev.startDate.getDate()).getTime();
        const evEnd = new Date(ev.endDate.getFullYear(), ev.endDate.getMonth(), ev.endDate.getDate()).getTime();
        return evEnd >= weekStart && evStart <= weekEnd;
    });

    relevantEvents.sort((a, b) => {
        const aDuration = a.endDate.getTime() - a.startDate.getTime();
        const bDuration = b.endDate.getTime() - b.startDate.getTime();
        if (bDuration !== aDuration) return bDuration - aDuration;
        return a.startDate.getTime() - b.startDate.getTime();
    });

    const usedSlots: boolean[][] = weekDates.map(() => []);

    for (const event of relevantEvents) {
        const evStart = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate()).getTime();
        const evEnd = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate()).getTime();

        const startCol = Math.max(
            0,
            weekDates.findIndex(d =>
                new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() >= evStart
            )
        );

        let endCol = 6;
        for (let i = 6; i >= 0; i--) {
            const dayTime = new Date(weekDates[i].getFullYear(), weekDates[i].getMonth(), weekDates[i].getDate()).getTime();
            if (dayTime <= evEnd) {
                endCol = i;
                break;
            }
        }

        if (startCol > endCol) continue;

        let slot = 0;
        while (true) {
            let available = true;
            for (let col = startCol; col <= endCol; col++) {
                if (usedSlots[col][slot]) {
                    available = false;
                    break;
                }
            }
            if (available) break;
            slot++;
            if (slot > 3) break;
        }

        if (slot > 3) continue;

        for (let col = startCol; col <= endCol; col++) {
            while (usedSlots[col].length <= slot) usedSlots[col].push(false);
            usedSlots[col][slot] = true;
        }

        bars.push({
            event,
            startCol,
            spanCols: endCol - startCol + 1,
            row: slot,
        });
    }

    return bars;
}

// ============================================
// Helper: strip HTML + URLs for clean preview
// ============================================
function stripForPreview(text: string): string {
    return text
        .replace(/<[^>]*>/g, "")
        .replace(/\[?https?:\/\/[^\s<\]\)]+\]?/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

// ============================================
// Event Detail Modal (shared between mobile calendar & brand cards)
// ============================================
function EventDetailModal({
    event, onClose
}: {
    event: CalendarEvent; onClose: () => void;
}) {
    const typeIcons: Record<string, { bg: string; text: string; icon: string }> = {
        news: { bg: "bg-orange-50 dark:bg-orange-900/15", text: "text-orange-800 dark:text-orange-300", icon: "restaurant_menu" },
        event: { bg: "bg-purple-50 dark:bg-purple-900/15", text: "text-purple-800 dark:text-purple-300", icon: "event" },
        sale: { bg: "bg-green-50 dark:bg-green-900/15", text: "text-green-800 dark:text-green-300", icon: "local_offer" },
        holiday: { bg: "bg-red-50 dark:bg-red-900/15", text: "text-red-800 dark:text-red-300", icon: "schedule" },
        info: { bg: "bg-blue-50 dark:bg-blue-900/15", text: "text-blue-800 dark:text-blue-300", icon: "info" },
    };
    const style = typeIcons[event.type] || typeIcons.info;

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

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center ${style.bg}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/50 dark:bg-black/10`}>
                            <span className={`material-symbols-outlined text-2xl ${style.text}`}>{style.icon}</span>
                        </div>
                        <div>
                            <p className="text-sm text-stone-500 dark:text-stone-400 font-medium tracking-tight mb-0.5">{event.brandName}</p>
                            <h3 className={`font-bold text-xl leading-tight ${style.text}`}>{event.title}</h3>
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
                    {event.items && event.items.length > 0 ? (
                        <ul className="space-y-4 text-base leading-relaxed text-stone-700 dark:text-stone-300">
                            {event.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5">
                                    <span className="text-stone-400 dark:text-stone-500 mt-1 flex-shrink-0">•</span>
                                    <span dangerouslySetInnerHTML={{ __html: formatLinksToIcons(item) }} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-stone-500 text-sm">상세 정보가 없습니다.</p>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}


// ============================================
// Day Detail Panel (shown when clicking a date)
// ============================================

function DayDetailPanel({
    date,
    events,
    onClose,
}: {
    date: Date;
    events: CalendarEvent[];
    onClose: () => void;
}) {
    const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
    const dateStr = `${date.getMonth() + 1}월 ${date.getDate()}일 (${DAY_NAMES[date.getDay()]})`;

    // Group events by brand
    const eventsByBrand = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
        if (!acc[ev.brandName]) acc[ev.brandName] = [];
        acc[ev.brandName].push(ev);
        return acc;
    }, {});

    return (
        <>
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary dark:text-amber-500 text-lg sm:text-xl">
                            calendar_today
                        </span>
                        <h3 className="font-bold text-base sm:text-lg text-text-main-light dark:text-text-main-dark">
                            {dateStr}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base sm:text-lg text-stone-500">close</span>
                    </button>
                </div>

                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-72 overflow-y-auto">
                    {events.length === 0 ? (
                        <p className="text-center text-sm text-stone-400 dark:text-stone-500 py-4">
                            이 날짜에 해당하는 일정이 없습니다
                        </p>
                    ) : (
                        Object.entries(eventsByBrand).map(([brandName, brandEvents]) => (
                            <div key={brandName} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: brandEvents[0].color }}
                                    />
                                    <span className="font-bold text-sm text-text-main-light dark:text-text-main-dark">
                                        {brandName}
                                    </span>
                                </div>
                                {brandEvents.map((ev) => {
                                    const previewText = ev.items.length > 0
                                        ? stripForPreview(ev.items[0])
                                        : "";

                                    return (
                                        <div
                                            key={ev.id}
                                            className="ml-4 sm:ml-5 p-2.5 sm:p-3 rounded-lg border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/30"
                                        >
                                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                                                <span className="material-symbols-outlined text-xs sm:text-sm text-stone-500">
                                                    {getEventTypeIcon(ev.type)}
                                                </span>
                                                <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: ev.color + "20", color: ev.color }}>
                                                    {getEventTypeLabel(ev.type)}
                                                </span>
                                                <span className="text-xs sm:text-sm font-bold text-text-main-light dark:text-text-main-dark truncate">
                                                    {ev.title}
                                                </span>
                                            </div>

                                            {/* 모바일: 한 줄 요약 + 더 보기 */}
                                            <div className="sm:hidden">
                                                {previewText && (
                                                    <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1 leading-relaxed mb-1.5">
                                                        {previewText}
                                                    </p>
                                                )}
                                                {ev.items.length > 0 && (
                                                    <button
                                                        onClick={() => setDetailEvent(ev)}
                                                        className="text-[11px] font-bold text-primary dark:text-amber-500 flex items-center gap-0.5 hover:underline"
                                                    >
                                                        더 보기
                                                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                                    </button>
                                                )}
                                            </div>

                                            {/* 데스크톱: 전체 items 표시 */}
                                            {ev.items.length > 0 && (
                                                <ul className="hidden sm:block space-y-1 mt-1.5">
                                                    {ev.items.map((item, i) => (
                                                        <li key={i} className="text-xs text-stone-600 dark:text-stone-400 flex items-start gap-1.5 leading-relaxed">
                                                            <span className="text-stone-400 mt-0.5">•</span>
                                                            <span>{stripForPreview(item)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 더 보기 상세 모달 */}
            {detailEvent && (
                <EventDetailModal event={detailEvent} onClose={() => setDetailEvent(null)} />
            )}
        </>
    );
}


// ============================================
// Main Calendar Component
// ============================================

export function Calendar({ events }: CalendarProps) {
    const now = new Date();
    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(now.getMonth());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const weeks = useMemo(
        () => getCalendarDays(currentYear, currentMonth),
        [currentYear, currentMonth]
    );

    const selectedDateEvents = useMemo(() => {
        if (!selectedDate) return [];
        return getEventsForDate(events, selectedDate);
    }, [selectedDate, events]);

    const handleMonthChange = (month: number) => {
        setCurrentMonth(month);
        setSelectedDate(null);
    };

    const handleYearNav = (delta: number) => {
        setCurrentYear((y) => y + delta);
        setSelectedDate(null);
    };

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden w-full max-w-full">
            {/* Year navigation */}
            <div className="flex items-center justify-center gap-3 pt-3 sm:pt-4 pb-1.5 sm:pb-2 px-3 sm:px-4">
                <button
                    onClick={() => handleYearNav(-1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-stone-500 text-base sm:text-lg">chevron_left</span>
                </button>
                <h2 className="font-display text-base sm:text-lg font-bold text-text-main-light dark:text-text-main-dark tracking-tight">
                    {currentYear}년
                </h2>
                <button
                    onClick={() => handleYearNav(1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                    <span className="material-symbols-outlined text-stone-500 text-base sm:text-lg">chevron_right</span>
                </button>
            </div>

            {/* Month tabs */}
            <div className="px-2 sm:px-3 pb-2 sm:pb-3">
                <div className="grid grid-cols-6 sm:flex sm:flex-nowrap gap-1 sm:gap-1.5 sm:overflow-x-auto sm:scrollbar-hide sm:min-w-max px-1">
                    {MONTH_NAMES.map((name, i) => {
                        const isActive = i === currentMonth;
                        return (
                            <button
                                key={i}
                                onClick={() => handleMonthChange(i)}
                                className={`px-1 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${isActive
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                                    }`}
                            >
                                {name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Day header */}
            <div className="grid grid-cols-7 border-t border-stone-200 dark:border-stone-700">
                {DAY_NAMES.map((day, i) => (
                    <div
                        key={day}
                        className={`text-center text-[10px] sm:text-xs font-bold py-1.5 sm:py-2 ${i === 0
                            ? "text-red-400"
                            : i === 6
                                ? "text-blue-400"
                                : "text-stone-400 dark:text-stone-500"
                            }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="border-t border-stone-200 dark:border-stone-700">
                {weeks.map((week, weekIdx) => {
                    const eventBars = getEventBarsForWeek(week, events, currentMonth);
                    const maxRow = eventBars.length > 0 ? Math.max(...eventBars.map(b => b.row)) + 1 : 0;

                    return (
                        <div key={weekIdx} className="relative">
                            {/* Date numbers row */}
                            <div className="grid grid-cols-7 border-b border-stone-100 dark:border-stone-800">
                                {week.map((date, dayIdx) => {
                                    const isThisMonth = date.getMonth() === currentMonth;
                                    const isTodayDate = isToday(date);
                                    const dayEvents = getEventsForDate(events, date);
                                    const isSelected =
                                        selectedDate &&
                                        date.getDate() === selectedDate.getDate() &&
                                        date.getMonth() === selectedDate.getMonth() &&
                                        date.getFullYear() === selectedDate.getFullYear();

                                    return (
                                        <button
                                            key={dayIdx}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedDate(null);
                                                } else {
                                                    setSelectedDate(date);
                                                }
                                            }}
                                            className={`relative text-left p-0.5 sm:p-1.5 transition-colors min-h-[44px] sm:min-h-[80px] ${dayIdx < 6 ? "border-r border-stone-100 dark:border-stone-800" : ""
                                                } ${isSelected
                                                    ? "bg-primary/5 dark:bg-primary/10"
                                                    : "hover:bg-stone-50 dark:hover:bg-stone-800/50"
                                                }`}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span
                                                    className={`text-[11px] sm:text-sm font-medium w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${isTodayDate
                                                        ? "bg-primary text-white font-bold"
                                                        : isThisMonth
                                                            ? dayIdx === 0
                                                                ? "text-red-400"
                                                                : dayIdx === 6
                                                                    ? "text-blue-400"
                                                                    : "text-text-main-light dark:text-text-main-dark"
                                                            : "text-stone-300 dark:text-stone-600"
                                                        }`}
                                                >
                                                    {date.getDate()}
                                                </span>
                                            </div>

                                            {/* Event dots for mobile */}
                                            {dayEvents.length > 0 && (
                                                <div className="flex gap-[2px] justify-center sm:hidden mt-0.5">
                                                    {dayEvents.slice(0, 3).map((ev, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-[5px] h-[5px] rounded-full"
                                                            style={{ backgroundColor: ev.color }}
                                                        />
                                                    ))}
                                                    {dayEvents.length > 3 && (
                                                        <span className="text-[8px] text-stone-400 leading-none">+</span>
                                                    )}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Event bars overlay (desktop only) */}
                            {eventBars.length > 0 && (
                                <div
                                    className="hidden sm:block absolute left-0 right-0 pointer-events-none"
                                    style={{ top: "32px" }}
                                >
                                    {eventBars.map((bar, idx) => {
                                        const leftPercent = (bar.startCol / 7) * 100;
                                        const widthPercent = (bar.spanCols / 7) * 100;
                                        const topOffset = bar.row * 20;

                                        return (
                                            <div
                                                key={idx}
                                                className="absolute text-[10px] font-bold text-white rounded-sm px-1.5 py-0.5 truncate leading-tight shadow-sm"
                                                style={{
                                                    left: `calc(${leftPercent}% + 2px)`,
                                                    width: `calc(${widthPercent}% - 4px)`,
                                                    top: `${topOffset}px`,
                                                    backgroundColor: bar.event.color,
                                                }}
                                                title={`${bar.event.brandName}: ${bar.event.title}`}
                                            >
                                                {bar.event.brandName} · {bar.event.title}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Brand legend */}
            {events.length > 0 && (
                <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/30">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {Array.from(new Set(events.map((e) => e.brandName))).map((brand) => {
                            const color = events.find((e) => e.brandName === brand)?.color || "#888";
                            return (
                                <div key={brand} className="flex items-center gap-1">
                                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                    <span className="text-[10px] sm:text-xs font-medium text-stone-600 dark:text-stone-400">{brand}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Selected date detail */}
            {selectedDate && (
                <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-700">
                    <DayDetailPanel
                        date={selectedDate}
                        events={selectedDateEvents}
                        onClose={() => setSelectedDate(null)}
                    />
                </div>
            )}
        </div>
    );
}
