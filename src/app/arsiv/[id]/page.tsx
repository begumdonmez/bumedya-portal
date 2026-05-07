import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DetailClient from "./DetailClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();
    const { data } = await supabase.from("archive_items").select("title").eq("id", id).single();
    return { title: data?.title ?? "Arşiv" };
}

export default async function ArsivDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [
        { data: profile },
        { data: item },
        { data: comments },
        { data: ratings },
        { data: myRating },
    ] = await Promise.all([
        supabase.from("profiles").select("username, badges").eq("id", user.id).single(),
        supabase.from("archive_items").select("*").eq("id", id).single(),
        supabase.from("archive_comments")
            .select("id, user_id, username, content, created_at")
            .eq("item_id", id)
            .order("created_at", { ascending: true }),
        supabase.from("archive_ratings").select("rating").eq("item_id", id),
        supabase.from("archive_ratings").select("rating").eq("item_id", id).eq("user_id", user.id).single(),
    ]);

    if (!item) notFound();

    const username = profile?.username ?? "";
    const isAdmin = (profile?.badges as string[] ?? []).includes("admin");

    const totalRatings = ratings?.length ?? 0;
    const avgRating = totalRatings > 0
        ? Math.round((ratings!.reduce((s, r) => s + r.rating, 0) / totalRatings) * 10) / 10
        : null;

    return (
        <DetailClient
            userId={user.id}
            username={username}
            isAdmin={isAdmin}
            item={item}
            comments={comments ?? []}
            avgRating={avgRating}
            totalRatings={totalRatings}
            myRating={myRating?.rating ?? null}
        />
    );
}
