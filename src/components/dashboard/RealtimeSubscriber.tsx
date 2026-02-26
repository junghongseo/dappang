"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function RealtimeSubscriber() {
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel('ai-summaries-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'ai_summaries'
                },
                (payload) => {
                    console.log('Realtime update received:', payload);
                    // Auto-refresh the Server Components to reflect DB changes
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);

    return null;
}
