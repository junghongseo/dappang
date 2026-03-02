import { CalendarEvent } from "@/lib/calendarUtils";

export interface EventBarSegment {
    event: CalendarEvent;
    startCol: number;
    spanCols: number;
    row: number;
}

export function getEventBarsForWeek(weekDates: Date[], events: CalendarEvent[]): EventBarSegment[] {
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

export function EventBars({ week, events }: { week: Date[]; events: CalendarEvent[] }) {
    const eventBars = getEventBarsForWeek(week, events);

    if (eventBars.length === 0) return null;

    return (
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
    );
}
