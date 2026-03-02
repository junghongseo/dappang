import { useState } from "react";
import { CalendarEvent, getEventTypeLabel, getEventTypeIcon } from "@/lib/calendarUtils";
import { stripHtml, formatLinksToIcons } from "@/lib/stringUtils";
import { EventDetailModal } from "./EventDetailModal";

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

interface DayDetailPanelProps {
    date: Date;
    events: CalendarEvent[];
    onClose: () => void;
}

export function DayDetailPanel({ date, events, onClose }: DayDetailPanelProps) {
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
                                    const preview = ev.items.length > 0 ? stripHtml(ev.items[0]) : "";
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
                                                            <span dangerouslySetInnerHTML={{ __html: formatLinksToIcons(item.replace(/<[^>]*>/g, "")) }} />
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
