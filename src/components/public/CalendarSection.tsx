"use client";

import { Calendar } from "@/components/public/Calendar";
import { CalendarEvent } from "@/lib/calendarUtils";

interface CalendarSectionProps {
    events: CalendarEvent[];
}

// CalendarEvent contains Date objects that need to be serialized
// from server to client. We receive them as strings and convert.
export function CalendarSection({ events: rawEvents }: CalendarSectionProps) {
    // Hydrate Date objects from serialized data
    const events: CalendarEvent[] = rawEvents.map((ev) => ({
        ...ev,
        startDate: new Date(ev.startDate),
        endDate: new Date(ev.endDate),
    }));

    return <Calendar events={events} />;
}
