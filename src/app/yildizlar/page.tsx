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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect("/login");

    const weekStart = getWeekStart();

    // getUser + profil + nominations + kullanıcının oyları + bu haftanın tüm oyları → tam paralel
    const [{ data: { user } }, { data: profile }, { data: nominations }, { data: myVotes }, { data: allVotes }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("username, badges").eq("id", session.user.id).single(),
        supabase.from("weekly_nominations")
            .select("id, category, title, description, submitted_by, created_at")
            .eq("week_start", weekStart)
            .eq("status", "approved")
            .order("created_at", { ascending: true }),
        supabase.from("weekly_votes").select("nomination_id").eq("user_id", session.user.id),
        // nomination ID'lerini beklemeden bu haftanın tüm oylarını çek
        supabase.from("weekly_votes")
            .select("nomination_id")
            .gte("created_at", weekStart),
    ]);

    if (!user || !profile) redirect("/login");

    const username = profile.username ?? "";
    const isAdmin = (profile.badges as string[] ?? []).includes("admin");

    const nominationIds = (nominations ?? []).map(n => n.id);
    const nominationIdSet = new Set(nominationIds);

    const voteCounts: Record<string, number> = {};
    for (const v of allVotes ?? []) {
        if (nominationIdSet.has(v.nomination_id)) {
            voteCounts[v.nomination_id] = (voteCounts[v.nomination_id] ?? 0) + 1;
        }
    }

    const myVoteIds = (myVotes ?? [])
        .map(v => v.nomination_id)
        .filter(id => nominationIdSet.has(id));

    return (
        <YildizlarClient
            userId={user.id}
            username={username}
            isAdmin={isAdmin}
            weekStart={weekStart}
            nominations={nominations ?? []}
            voteCounts={voteCounts}
            myVoteIds={myVoteIds}
        />
    );
}
