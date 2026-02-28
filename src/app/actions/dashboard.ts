"use server";

import { createClient } from "@/utils/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

export interface TargetAccountData {
    id: string;
    bakery_name: string;
    instagram_id: string;
    shopping_mall_url: string | null;
    status: "active" | "syncing" | "paused";
    last_scraped_at: string | null;
}

export async function fetchTargetAccounts(): Promise<TargetAccountData[]> {
    noStore();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("target_accounts")
        .select("id, bakery_name, instagram_id, shopping_mall_url, status, last_scraped_at")
        .order("created_at", { ascending: false });

    if (error || !data) {
        console.error("Error fetching target accounts:", error);
        return [];
    }

    return data as TargetAccountData[];
}

export async function fetchAiSummaries() {
    noStore();
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("ai_summaries")
        .select(`
      id,
      summary,
      status,
      created_at,
      target_accounts (
        id,
        bakery_name,
        instagram_id,
        shopping_mall_url,
        last_scraped_at
      )
    `)
        .order("created_at", { ascending: false });

    if (error || !data) {
        console.error("Error fetching AI summaries:", error);
        return [];
    }

    return data;
}

import { revalidatePath } from "next/cache";

export async function forceRefreshDashboard() {
    noStore();
    revalidatePath("/", "layout");
    revalidatePath("/admin", "layout");
}
