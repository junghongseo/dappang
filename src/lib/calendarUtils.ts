// ============================================
// Calendar Utility Functions
// ============================================

export interface CalendarEvent {
    id: string;
    brandName: string;
    brandId: string;
    title: string;
    type: "news" | "event" | "sale" | "holiday" | "info";
    startDate: Date;
    endDate: Date;
    items: string[];
    color: string;
}

export interface DayCell {
    date: Date;
    isCurrentMonth: boolean;
    events: CalendarEvent[];
}

// ============================================
// Brand Color System
// ============================================

const BRAND_COLOR_PALETTE = [
    "#3B82F6", // blue
    "#8B5CF6", // purple
    "#10B981", // green
    "#EC4899", // pink
    "#06B6D4", // cyan
    "#EF4444", // red
    "#F59E0B", // amber
    "#6366F1", // indigo
];

const FIXED_BRAND_COLORS: Record<string, string> = {
    "머드스콘": "#F97316", // orange - user requirement
};

const brandColorCache: Record<string, string> = {};
let colorIndex = 0;

export function getBrandColor(brandName: string): string {
    // Check fixed colors first
    if (FIXED_BRAND_COLORS[brandName]) {
        return FIXED_BRAND_COLORS[brandName];
    }
    // Check cache
    if (brandColorCache[brandName]) {
        return brandColorCache[brandName];
    }
    // Assign from palette
    const color = BRAND_COLOR_PALETTE[colorIndex % BRAND_COLOR_PALETTE.length];
    brandColorCache[brandName] = color;
    colorIndex++;
    return color;
}

// ============================================
// Calendar Grid Generation
// ============================================

export function getCalendarDays(year: number, month: number): Date[][] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = firstDay.getDay(); // 0=Sun
    const totalDays = lastDay.getDate();

    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    // Fill leading days from previous month
    for (let i = 0; i < startDay; i++) {
        const prevDate = new Date(year, month, -(startDay - 1 - i));
        currentWeek.push(prevDate);
    }

    // Fill current month days
    for (let day = 1; day <= totalDays; day++) {
        currentWeek.push(new Date(year, month, day));
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    // Fill trailing days from next month
    if (currentWeek.length > 0) {
        let nextDay = 1;
        while (currentWeek.length < 7) {
            currentWeek.push(new Date(year, month + 1, nextDay++));
        }
        weeks.push(currentWeek);
    }

    return weeks;
}

// ============================================
// Extract Calendar Events from AI Summary Data
// ============================================

interface BlockContent {
    type: "news" | "event" | "sale" | "holiday" | "info";
    title: string;
    items: string[];
    text?: string;
    start_date?: string;
    end_date?: string;
    calendar_dates?: { start_date: string; end_date: string }[];
}

interface BrandSummary {
    id: string;
    bakery_name: string;
    instagram_id: string;
    blocks: BlockContent[];
}

export function extractCalendarEvents(brands: BrandSummary[]): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    for (const brand of brands) {
        const color = getBrandColor(brand.bakery_name);

        for (const block of brand.blocks) {
            if (!block.start_date) continue;

            const cleanTitle = block.title.replace(/<[^>]*>/g, "");
            const blockItems = block.items || [];

            // calendar_dates가 있으면 각각을 별도 캘린더 이벤트로 생성
            const datesToProcess = block.calendar_dates && block.calendar_dates.length > 0
                ? block.calendar_dates
                : [{ start_date: block.start_date, end_date: block.end_date || block.start_date }];

            for (const dateEntry of datesToProcess) {
                try {
                    const startDate = new Date(dateEntry.start_date + "T00:00:00");
                    const endDate = new Date(dateEntry.end_date + "T00:00:00");

                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) continue;

                    events.push({
                        id: `${brand.id}-${block.type}-${dateEntry.start_date}`,
                        brandName: brand.bakery_name,
                        brandId: brand.id,
                        title: cleanTitle,
                        type: block.type,
                        startDate,
                        endDate,
                        items: blockItems,
                        color,
                    });
                } catch {
                    continue;
                }
            }
        }
    }

    return events;
}

// ============================================
// Get events for a specific date
// ============================================

export function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    return events.filter((event) => {
        const start = new Date(event.startDate.getFullYear(), event.startDate.getMonth(), event.startDate.getDate()).getTime();
        const end = new Date(event.endDate.getFullYear(), event.endDate.getMonth(), event.endDate.getDate()).getTime();
        return target >= start && target <= end;
    });
}

// ============================================
// Check if a date is today
// ============================================

export function isToday(date: Date): boolean {
    const now = new Date();
    return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    );
}

// ============================================
// Get event type label in Korean
// ============================================

export function getEventTypeLabel(type: string): string {
    switch (type) {
        case "news": return "신메뉴";
        case "event": return "이벤트";
        case "sale": return "세일";
        case "holiday": return "휴무";
        case "info": return "안내";
        default: return "기타";
    }
}

export function getEventTypeIcon(type: string): string {
    switch (type) {
        case "news": return "restaurant_menu";
        case "event": return "celebration";
        case "sale": return "local_offer";
        case "holiday": return "schedule";
        case "info": return "info";
        default: return "event";
    }
}
