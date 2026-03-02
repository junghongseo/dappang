"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
// Helper
// ============================================
function stripForPreview(text: string): string {
    return text.replace(/<[^>]*>/g, "").replace(/\[?https?:\/\/[^\s<\]\)]+\]?/g, "").replace(/\s+/g, " ").trim();
}

// ============================================
// Event Detail Modal (모바일 더보기 클릭 시)
// ============================================
function EventDetailModal({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
    const typeStyles: Record<string, { bg: string; text: string; icon: string }> = {
        news: { bg: "bg-orange-50 dark:bg-orange-900/15", text: "text-orange-800 dark:text-orange-300", icon: "restaurant_menu" },
        event: { bg: "bg-purple-50 dark:bg-purple-900/15", text: "text-purple-800 dark:text-purple-300", icon: "event" },
        sale: { bg: "bg-green-50 dark:bg-green-900/15", text: "text-green-800 dark:text-green-300", icon: "local_offer" },
        holiday: { bg: "bg-red-50 dark:bg-red-900/15", text: "text-red-800 dark:text-red-300", icon: "schedule" },
        info: { bg: "bg-blue-50 dark:bg-blue-900/15", text: "text-blue-800 dark:text-blue-300", icon: "info" },
    };
    const s = typeStyles[event.type] || typeStyles.info;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full sm:max-w-md bg-surface-light dark:bg-surface-dark rounded-t-2xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className={`p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center ${s.bg}`}>
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 dark:bg-black/10 flex-shrink-0">
                            <span className={`material-symbols-outlined text-xl ${s.text}`}>{s.icon}</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">{event.brandName}</p>
                            <h3 className={`font-bold text-lg leading-tight truncate ${s.text}`}>{event.title}</h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-stone-500 flex-shrink-0">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-5 overflow-y-auto">
                    {event.items && event.items.length > 0 ? (
                        <ul className="space-y-3 text-[15px] leading-relaxed text-stone-700 dark:text-stone-300">
                            {event.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-stone-400 mt-0.5 flex-shrink-0">•</span>
                                    <span>{stripForPreview(item)}</span>
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
// Day Detail Panel (날짜 클릭 시 하단 표시)
// ============================================
function DayDetailPanel({ date, events, onClose }: { date: Date; events: CalendarEvent[]; onClose: () => void }) {
    const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);
    const dateStr = `${date.getMonth() + 1}월 ${date.getDate()}일 (${DAY_NAMES[date.getDay()]})`;

    const eventsByBrand = events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
        if (!acc[ev.brandName]) acc[ev.brandName] = [];
        acc[ev.brandName].push(ev);
        return acc;
    }, {});

    return (
        <>
            <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary dark:text-amber-500 text-lg">calendar_today</span>
                        <h3 className="font-bold text-base sm:text-lg text-text-main-light dark:text-text-main-dark">{dateStr}</h3>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-stone-200 dark:hover:bg-stone-700">
                        <span className="material-symbols-outlined text-base text-stone-500">close</span>
                    </button>
                </div>
                <div className="p-3 sm:p-4 space-y-3 max-h-72 overflow-y-auto">
                    {events.length === 0 ? (
                        <p className="text-center text-sm text-stone-400 py-4">이 날짜에 해당하는 일정이 없습니다</p>
                    ) : (
                        Object.entries(eventsByBrand).map(([brandName, brandEvents]) => (
                            <div key={brandName} className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: brandEvents[0].color }} />
                                    <span className="font-bold text-sm text-text-main-light dark:text-text-main-dark">{brandName}</span>
                                </div>
                                {brandEvents.map(ev => {
                                    const preview = ev.items.length > 0 ? stripForPreview(ev.items[0]) : "";
                                    return (
                                        <div key={ev.id} className="ml-4 p-2.5 rounded-lg border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/30">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="material-symbols-outlined text-xs text-stone-500">{getEventTypeIcon(ev.type)}</span>
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: ev.color + "20", color: ev.color }}>{getEventTypeLabel(ev.type)}</span>
                                                <span className="text-xs font-bold text-text-main-light dark:text-text-main-dark truncate">{ev.title}</span>
                                            </div>
                                            {/* 모바일: 한 줄 요약 + 더 보기 */}
                                            <div className="sm:hidden">
                                                {preview && <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-1 mb-1">{preview}</p>}
                                                {ev.items.length > 0 && (
                                                    <button onClick={() => setDetailEvent(ev)} className="text-[11px] font-bold text-primary dark:text-amber-500 flex items-center gap-0.5">
                                                        더 보기 <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                                    </button>
                                                )}
                                            </div>
                                            {/* 데스크톱: 전체 표시 */}
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
            {detailEvent && <EventDetailModal event={detailEvent} onClose={() => setDetailEvent(null)} />}
        </>
    );
}

// ============================================
// Desktop: Event bar positioning (PC 전용)
// ============================================
interface EventBarSegment {
    event: CalendarEvent;
    startCol: number;
    spanCols: number;
    row: number;
}

function getEventBarsForWeek(weekDates: Date[], events: CalendarEvent[]): EventBarSegment[] {
    const bars: EventBarSegment[] = [];
    const weekStart = new Date(weekDates[0].getFullYear(), weekDates[0].getMonth(), weekDates[0].getDate()).getTime();
    const weekEnd = new Date(weekDates[6].getFullYear(), weekDates[6].getMonth(), weekDates[6].getDate()).getTime();

    const relevantEvents = events.filter(ev => {
        const s = new Date(ev.startDate.getFullYear(), ev.startDate.getMonth(), ev.startDate.getDate()).getTime();
        const e = new Date(ev.endDate.getFullYear(), ev.endDate.getMonth(), ev.endDate.getDate()).getTime();
        return e >= weekStart && s <= weekEnd;
    });

    relevantEvents.sort((a, b) => {
        const ad = a.endDate.getTime() - a.startDate.getTime();
        const bd = b.endDate.getTime() - b.startDate.getTime();
        return bd !== ad ? bd - ad : a.startDate.getTime() - b.startDate.getTime();
    });

    const usedSlots: boolean[][] = weekDates.map(() => []);

    for (const event of relevantEvents) {
        const evS = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate()).getTime();
        const evE = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate()).getTime();

        const startCol = Math.max(0, weekDates.findIndex(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() >= evS));
        let endCol = 6;
        for (let i = 6; i >= 0; i--) {
            if (new Date(weekDates[i].getFullYear(), weekDates[i].getMonth(), weekDates[i].getDate()).getTime() <= evE) { endCol = i; break; }
        }
        if (startCol > endCol) continue;

        let slot = 0;
        while (slot <= 3) {
            let ok = true;
            for (let c = startCol; c <= endCol; c++) if (usedSlots[c][slot]) { ok = false; break; }
            if (ok) break;
            slot++;
        }
        if (slot > 3) continue;

        for (let c = startCol; c <= endCol; c++) {
            while (usedSlots[c].length <= slot) usedSlots[c].push(false);
            usedSlots[c][slot] = true;
        }
        bars.push({ event, startCol, spanCols: endCol - startCol + 1, row: slot });
    }
    return bars;
}


// ============================================
// Main Calendar Component
// ============================================
export function Calendar({ events }: CalendarProps) {
    const now = new Date();
    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(now.getMonth());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden w-full">

            {/* ====== 상단: 현재 월 크게 표시 + 연도 네비게이션 ====== */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-main-light dark:text-text-main-dark">
                    {currentYear}년 {currentMonth + 1}월
                </h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleYearNav(-1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-stone-500 text-lg">chevron_left</span>
                    </button>
                    <button
                        onClick={() => handleYearNav(1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-stone-500 text-lg">chevron_right</span>
                    </button>
                </div>
            </div>

            {/* ====== 월 선택 버튼 (가로 스크롤, 구글 캘린더 스타일) ====== */}
            <div
                ref={monthScrollRef}
                className="flex overflow-x-auto scrollbar-hide px-3 pb-3 gap-2 [-webkit-overflow-scrolling:touch]"
            >
                {MONTH_NAMES.map((name, i) => {
                    const isActive = i === currentMonth;
                    return (
                        <button
                            key={i}
                            data-active={isActive ? "true" : "false"}
                            onClick={() => handleMonthSelect(i)}
                            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all border
                                ${isActive
                                    ? "bg-primary text-white border-primary shadow-sm"
                                    : "bg-transparent text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800"
                                }`}
                        >
                            {name}
                        </button>
                    );
                })}
            </div>

            {/* ====== 요일 헤더 ====== */}
            <div className="grid grid-cols-7 border-t border-stone-200 dark:border-stone-700">
                {DAY_NAMES.map((day, i) => (
                    <div key={day} className={`text-center text-xs font-bold py-2
                        ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-stone-400 dark:text-stone-500"}`}>
                        {day}
                    </div>
                ))}
            </div>

            {/* ====== 달력 그리드 ====== */}
            <div className="border-t border-stone-200 dark:border-stone-700">
                {weeks.map((week, weekIdx) => {
                    const eventBars = getEventBarsForWeek(week, events);

                    return (
                        <div key={weekIdx} className="relative">
                            {/* 날짜 셀 */}
                            <div className="grid grid-cols-7 border-b border-stone-100 dark:border-stone-800">
                                {week.map((date, dayIdx) => {
                                    const isThisMonth = date.getMonth() === currentMonth;
                                    const isTodayDate = isToday(date);
                                    const dayEvents = getEventsForDate(events, date);
                                    const isSelected = selectedDate &&
                                        date.getDate() === selectedDate.getDate() &&
                                        date.getMonth() === selectedDate.getMonth() &&
                                        date.getFullYear() === selectedDate.getFullYear();

                                    return (
                                        <button
                                            key={dayIdx}
                                            onClick={() => setSelectedDate(isSelected ? null : date)}
                                            className={`relative p-1 transition-colors text-center
                                                min-h-[56px] sm:min-h-[100px]
                                                ${dayIdx < 6 ? "border-r border-stone-100 dark:border-stone-800" : ""}
                                                ${isSelected ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-stone-50 dark:hover:bg-stone-800/50"}`}
                                        >
                                            {/* 날짜 숫자 */}
                                            <div className="flex items-center justify-center">
                                                <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                                    ${isTodayDate
                                                        ? "bg-primary text-white font-bold"
                                                        : isThisMonth
                                                            ? dayIdx === 0 ? "text-red-400" : dayIdx === 6 ? "text-blue-400" : "text-text-main-light dark:text-text-main-dark"
                                                            : "text-stone-300 dark:text-stone-600"
                                                    }`}>
                                                    {date.getDate()}
                                                </span>
                                            </div>

                                            {/* 모바일: 이벤트 도트 */}
                                            {dayEvents.length > 0 && (
                                                <div className="flex gap-[3px] justify-center sm:hidden mt-1">
                                                    {dayEvents.slice(0, 3).map((ev, i) => (
                                                        <div key={i} className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: ev.color }} />
                                                    ))}
                                                    {dayEvents.length > 3 && <span className="text-[8px] text-stone-400">+</span>}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 데스크톱: 이벤트 바 (날짜 아래에 배치) */}
                            {eventBars.length > 0 && (
                                <div className="hidden sm:block absolute left-0 right-0 pointer-events-none" style={{ top: "32px" }}>
                                    {eventBars.map((bar, idx) => {
                                        const leftPct = (bar.startCol / 7) * 100;
                                        const widthPct = (bar.spanCols / 7) * 100;
                                        return (
                                            <div
                                                key={idx}
                                                className="absolute text-[10px] font-bold text-white rounded-sm px-1.5 py-0.5 truncate leading-tight shadow-sm"
                                                style={{
                                                    left: `calc(${leftPct}% + 2px)`,
                                                    width: `calc(${widthPct}% - 4px)`,
                                                    top: `${bar.row * 20}px`,
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

            {/* ====== 브랜드 범례 ====== */}
            {events.length > 0 && (
                <div className="px-3 py-2.5 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/30 overflow-hidden">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide [-webkit-overflow-scrolling:touch] pb-0.5">
                        {Array.from(new Set(events.map(e => e.brandName))).map(brand => {
                            const color = events.find(e => e.brandName === brand)?.color || "#888";
                            return (
                                <div key={brand} className="flex items-center gap-1.5 flex-shrink-0">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                    <span className="text-xs font-medium text-stone-600 dark:text-stone-400 whitespace-nowrap">{brand}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ====== 선택 날짜 상세 ====== */}
            {selectedDate && (
                <div className="p-3 sm:p-4 border-t border-stone-200 dark:border-stone-700">
                    <DayDetailPanel date={selectedDate} events={selectedDateEvents} onClose={() => setSelectedDate(null)} />
                </div>
            )}
        </div>
    );
}
