import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AkisClient from "./AkisClient";

export const metadata: Metadata = { title: "Akış | bumedya." };

export default async function AkisPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("username, badges")
        .eq("id", user.id)
        .single();

    const { data: posts } = await supabase
        .from("posts")
        .select("id, user_id, username, category, content, storage_path, description, created_at, ref_url")
        .order("created_at", { ascending: false })
        .limit(40);

    const postIds = (posts ?? []).map((p) => p.id);
    let likesData: { post_id: string; user_id: string }[] = [];
    if (postIds.length > 0) {
        const { data: likes } = await supabase
            .from("post_likes")
            .select("post_id, user_id")
            .in("post_id", postIds);
        likesData = likes ?? [];
    }

    return (
        <AkisClient
            userId={user.id}
            username={profile?.username ?? ""}
            badges={(profile?.badges as string[]) ?? []}
            initialPosts={posts ?? []}
            initialLikesData={likesData}
            supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
        />
    );
}
