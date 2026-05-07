import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DetailClient from "./DetailClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

// generateMetadata kaldırıldı — ayrı Supabase sorgusu açıyordu.
// Sayfa başlığı DetailClient içinde <title> olarak da DOM'a yansır;
// basit statik fallback yeterli.
export const metadata: Metadata = { title: "Arşiv" };

export default async function ArsivDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Tüm sorgular paralel; ratings yerine view kullanıyoruz (N satır → 1 satır)
    const [
        { data: profile },
        { data: item },
        { data: comments },
        { data: stats },
        { data: myRating },
    ] = await Promise.all([
        supabase.from("profiles").select("username, badges").eq("id", user.id).single(),
        supabase.from("archive_items").select("*").eq("id", id).single(),
        supabase.from("archive_comments")
            .select("id, user_id, username, content, created_at")
            .eq("item_id", id)
            .order("created_at", { ascending: true }),
        // SQL aggregate → sadece 1 satır
        supabase.from("archive_item_stats")
            .select("avg_rating, total_ratings")
            .eq("item_id", id)
            .single(),
        supabase.from("archive_ratings")
            .select("rating")
            .eq("item_id", id)
            .eq("user_id", user.id)
            .single(),
    ]);

    if (!item) notFound();

    const username = profile?.username ?? "";
    const isAdmin = (profile?.badges as string[] ?? []).includes("admin");

    return (
        <DetailClient
            userId={user.id}
            username={username}
            isAdmin={isAdmin}
            item={item}
            comments={comments ?? []}
            avgRating={stats?.avg_rating ?? null}
            totalRatings={stats?.total_ratings ?? 0}
            myRating={myRating?.rating ?? null}
        />
    );
}
