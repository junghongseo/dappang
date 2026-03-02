export interface BlockContent {
    type: "news" | "event" | "sale" | "holiday" | "info";
    title: string;
    items: string[];
    text?: string;
}

export interface BrandData {
    id: string;
    bakery_name: string;
    instagram_id: string;
    shopping_mall_url: string | null;
    updated_at: string;
    last_scraped_at?: string;
    blocks: BlockContent[];
    excerpt?: string;
}

export function getBlockStyle(type: string) {
    switch (type) {
        case "news":
            return {
                bg: "bg-orange-50 dark:bg-orange-900/15",
                border: "border-orange-200 dark:border-orange-800/40",
                text: "text-orange-800 dark:text-orange-300",
                icon: "restaurant_menu",
                accent: "bg-orange-100 dark:bg-orange-800/30",
            };
        case "event":
            return {
                bg: "bg-purple-50 dark:bg-purple-900/15",
                border: "border-purple-200 dark:border-purple-800/40",
                text: "text-purple-800 dark:text-purple-300",
                icon: "event",
                accent: "bg-purple-100 dark:bg-purple-800/30",
            };
        case "sale":
            return {
                bg: "bg-green-50 dark:bg-green-900/15",
                border: "border-green-200 dark:border-green-800/40",
                text: "text-green-800 dark:text-green-300",
                icon: "local_offer",
                accent: "bg-green-100 dark:bg-green-800/30",
            };
        case "holiday":
            return {
                bg: "bg-red-50 dark:bg-red-900/15",
                border: "border-red-200 dark:border-red-800/40",
                text: "text-red-800 dark:text-red-300",
                icon: "schedule",
                accent: "bg-red-100 dark:bg-red-800/30",
            };
        default:
            return {
                bg: "bg-blue-50 dark:bg-blue-900/15",
                border: "border-blue-200 dark:border-blue-800/40",
                text: "text-blue-800 dark:text-blue-300",
                icon: "info",
                accent: "bg-blue-100 dark:bg-blue-800/30",
            };
    }
}
