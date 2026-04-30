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

    return (
        <AkisClient
            userId={user.id}
            username={profile?.username ?? ""}
            badges={(profile?.badges as string[]) ?? []}
            initialPosts={posts ?? []}
            supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
        />
    );
}
