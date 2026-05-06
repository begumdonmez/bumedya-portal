import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import YildizlarClient from "./YildizlarClient";

export const metadata: Metadata = { title: "Haftanın Yıldızları" };

function getWeekStart(): string {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    return monday.toISOString().split("T")[0];
}

export default async function YildizlarPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles").select("username, badges").eq("id", user.id).single();
    const username = profile?.username ?? "";
    const isAdmin = (profile?.badges as string[] ?? []).includes("admin");

    const weekStart = getWeekStart();

    const [{ data: nominations }, { data: myVotes }] = await Promise.all([
        supabase
            .from("weekly_nominations")
            .select("id, category, title, description, submitted_by, created_at")
            .eq("week_start", weekStart)
            .eq("status", "approved")
            .order("created_at", { ascending: true }),
        supabase
            .from("weekly_votes")
            .select("nomination_id")
            .eq("user_id", user.id),
    ]);

    // Her nomination için oy sayısını çek
    const nominationIds = (nominations ?? []).map(n => n.id);
    const { data: allVotes } = nominationIds.length > 0
        ? await supabase.from("weekly_votes").select("nomination_id").in("nomination_id", nominationIds)
        : { data: [] };

    const voteCounts: Record<string, number> = {};
    for (const v of allVotes ?? []) {
        voteCounts[v.nomination_id] = (voteCounts[v.nomination_id] ?? 0) + 1;
    }

    const myVoteIds = new Set((myVotes ?? []).map(v => v.nomination_id));

    return (
        <YildizlarClient
            userId={user.id}
            username={username}
            isAdmin={isAdmin}
            weekStart={weekStart}
            nominations={nominations ?? []}
            voteCounts={voteCounts}
            myVoteIds={[...myVoteIds]}
        />
    );
}
