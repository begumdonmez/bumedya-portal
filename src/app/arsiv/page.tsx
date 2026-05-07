import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ArsivClient from "./ArsivClient";

export const metadata: Metadata = { title: "Arşiv" };

export default async function ArsivPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [{ data: profile }, { data: items }, { data: ratings }] = await Promise.all([
        supabase.from("profiles").select("username, badges").eq("id", user.id).single(),
        supabase
            .from("archive_items")
            .select("id, category, title, description, year, creator, created_by, created_at")
            .order("created_at", { ascending: false }),
        supabase.from("archive_ratings").select("item_id, rating"),
    ]);

    const username = profile?.username ?? "";
    const isAdmin = (profile?.badges as string[] ?? []).includes("admin");

    // Her item için ortalama puan hesapla
    const ratingMap: Record<string, { sum: number; count: number }> = {};
    for (const r of ratings ?? []) {
        if (!ratingMap[r.item_id]) ratingMap[r.item_id] = { sum: 0, count: 0 };
        ratingMap[r.item_id].sum += r.rating;
        ratingMap[r.item_id].count += 1;
    }
    const avgRatings: Record<string, number> = {};
    for (const [id, { sum, count }] of Object.entries(ratingMap)) {
        avgRatings[id] = Math.round((sum / count) * 10) / 10;
    }

    return (
        <ArsivClient
            userId={user.id}
            username={username}
            isAdmin={isAdmin}
            items={items ?? []}
            avgRatings={avgRatings}
        />
    );
}
