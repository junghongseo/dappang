import { createPortal } from "react-dom";
import { CalendarEvent } from "@/lib/calendarUtils";
import { formatLinksToIcons } from "@/lib/stringUtils";

interface EventDetailModalProps {
    event: CalendarEvent;
    onClose: () => void;
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
    const typeStyles: Record<string, { bg: string; text: string; icon: string }> = {
        news: { bg: "bg-orange-50 dark:bg-orange-900/15", text: "text-orange-800 dark:text-orange-300", icon: "restaurant_menu" },
        event: { bg: "bg-purple-50 dark:bg-purple-900/15", text: "text-purple-800 dark:text-purple-300", icon: "event" },
        sale: { bg: "bg-green-50 dark:bg-green-900/15", text: "text-green-800 dark:text-green-300", icon: "local_offer" },
        holiday: { bg: "bg-red-50 dark:bg-red-900/15", text: "text-red-800 dark:text-red-300", icon: "schedule" },
        info: { bg: "bg-blue-50 dark:bg-blue-900/15", text: "text-blue-800 dark:text-blue-300", icon: "info" },
    };
    const s = typeStyles[event.type] || typeStyles.info;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="w-full max-w-[340px] sm:max-w-md bg-surface-light dark:bg-surface-dark rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
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
                                    <span
                                        dangerouslySetInnerHTML={{ __html: formatLinksToIcons(item.replace(/<[^>]*>/g, "")) }}
                                    />
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
