"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/utils/auth";

export async function deleteBakeryAction(id: string) {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
        return { success: false, error: "관리자 인증이 필요합니다." };
    }

    const supabase = await createClient();

    const { error } = await supabase.from("target_accounts").delete().eq("id", id);
    if (error) {
        return { success: false, error: "삭제에 실패했습니다." };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
}

export async function editBakeryAction(id: string, newName: string, newInstagramId: string) {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
        return { success: false, error: "관리자 인증이 필요합니다." };
    }

    const supabase = await createClient();

    const { error } = await supabase.from("target_accounts").update({
        bakery_name: newName,
        instagram_id: newInstagramId.replace("@", "")
    }).eq("id", id);

    if (error) {
        if (error.code === "23505") {
            return { success: false, error: "이미 존재하는 인스타그램 아이디입니다." };
        }
        return { success: false, error: "수정에 실패했습니다." };
    }

    revalidatePath("/");
    return { success: true };
}

