import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/app/akis/AkisClient";
import ProfilClient, { type Profile } from "./ProfilClient";

export const metadata: Metadata = { title: "Profilim" };

export default async function ProfilPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [{ data: profile }, { data: posts }] = await Promise.all([
        supabase.from("profiles")
            .select("id, username, role, badges, bio, display_name, avatar_url, created_at, social_links")
            .eq("id", user.id).single(),
        supabase.from("posts")
            .select("id, user_id, username, category, content, storage_path, description, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
    ]);

    if (!profile) redirect("/onboarding");

    return <ProfilClient initialProfile={profile as Profile} initialPosts={(posts ?? []) as Post[]} />;
}
