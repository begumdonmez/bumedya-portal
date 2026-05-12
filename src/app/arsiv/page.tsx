import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ArsivClient from "./ArsivClient";

export const metadata: Metadata = { title: "Arşiv" };

export default async function ArsivPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect("/login");

    const [{ data: { user } }, { data: profile }, { data: items }, { data: stats }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("username, badges").eq("id", session.user.id).single(),
        supabase
            .from("archive_items")
            .select("id, category, title, description, year, creator, created_by, created_at")
            .order("created_at", { ascending: false }),
        // archive_item_stats view'ı: her item için avg + count — SQL'de hesaplanır,
        // tüm rating satırları yerine sadece N eser kadar satır gelir
        supabase.from("archive_item_stats").select("item_id, avg_rating, total_ratings"),
    ]);

    if (!user) redirect("/login");
    const username = profile?.username ?? "";
    const isAdmin = (profile?.badges as string[] ?? []).includes("admin");

    const avgRatings: Record<string, number> = {};
    for (const s of stats ?? []) {
        avgRatings[s.item_id] = s.avg_rating;
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
