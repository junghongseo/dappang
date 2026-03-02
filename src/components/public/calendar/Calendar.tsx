"use client";

import { CalendarEvent, isToday, getEventsForDate } from "@/lib/calendarUtils";
import { useCalendar } from "@/hooks/useCalendar";
import { DayDetailPanel } from "./DayDetailPanel";
import { EventBars } from "./EventBars";

const MONTH_NAMES = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월",
];

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarProps {
    events: CalendarEvent[];
}

export function Calendar({ events }: CalendarProps) {
    const {
        currentYear,
        currentMonth,
        selectedDate,
        setSelectedDate,
        monthScrollRef,
        weeks,
        selectedDateEvents,
        handleMonthSelect,
        handleYearNav
    } = useCalendar(events);

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden w-full max-w-full mx-auto">
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
                className="flex overflow-x-auto scrollbar-hide px-3 pb-3 gap-2 w-full max-w-full min-w-0 [-webkit-overflow-scrolling:touch]"
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
            <div className="grid grid-cols-7 border-t border-stone-200 dark:border-stone-700 w-full min-w-0">
                {DAY_NAMES.map((day, i) => (
                    <div key={day} className={`text-center text-[11px] sm:text-xs font-bold py-2 w-full min-w-0
                        ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-stone-400 dark:text-stone-500"}`}>
                        {day}
                    </div>
                ))}
            </div>

            {/* ====== 달력 그리드 ====== */}
            <div className="border-t border-stone-200 dark:border-stone-700 w-full min-w-0">
                {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="relative">
                        {/* 날짜 셀 */}
                        <div className="grid grid-cols-7 border-b border-stone-100 dark:border-stone-800 w-full min-w-0">
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
                                        className={`relative px-0.5 py-1 transition-colors flex flex-col items-center w-full min-w-0 overflow-hidden
                                            min-h-[56px] sm:min-h-[100px]
                                            ${dayIdx < 6 ? "border-r border-stone-100 dark:border-stone-800" : ""}
                                            ${isSelected ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-stone-50 dark:hover:bg-stone-800/50"}`}
                                    >
                                        {/* 날짜 숫자 */}
                                        <div className="flex items-center justify-center w-full">
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
                                            <div className="flex flex-wrap gap-0.5 justify-center sm:hidden mt-1 w-full max-w-full px-0.5">
                                                {dayEvents.slice(0, 3).map((ev, i) => (
                                                    <div key={i} className="w-[5px] h-[5px] sm:w-[6px] sm:h-[6px] rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                                                ))}
                                                {dayEvents.length > 3 && <span className="text-[7px] text-stone-400 flex-shrink-0 leading-none">+</span>}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {/* 데스크톱: 이벤트 바 */}
                        <EventBars week={week} events={events} />
                    </div>
                ))}
            </div>

            {/* ====== 브랜드 범례 ====== */}
            {events.length > 0 && (
                <div className="px-3 py-2.5 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/30 overflow-hidden w-full min-w-0">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide [-webkit-overflow-scrolling:touch] pb-0.5 w-full max-w-full min-w-0">
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
