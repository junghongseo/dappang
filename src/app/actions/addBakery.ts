"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addBakeryAction(data: {
    bakeryName: string;
    instagramId: string;
    category: string;
}) {
    const supabase = await createClient();

    const { error } = await supabase.from("target_accounts").insert([
        {
            bakery_name: data.bakeryName,
            instagram_id: data.instagramId.replace("@", ""),
            category: data.category,
            status: "active",
        },
    ]);

    if (error) {
        if (error.code === "23505") { // unique violation error code in Postgres
            return { success: false, error: "이미 등록된 인스타그램 아이디입니다." };
        }
        return { success: false, error: "베이커리 등록에 실패했습니다." };
    }

    revalidatePath("/");
    return { success: true };
}
