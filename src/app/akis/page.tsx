import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AkisClient from "./AkisClient";

export const metadata: Metadata = { title: "Akış" };

export default async function AkisPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect("/login");

    // getUser + profile + posts + likes — hepsi tam paralel (waterfall yok)
    const [{ data: { user } }, { data: profile }, { data: posts }, { data: likesData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("username, badges").eq("id", session.user.id).single(),
        supabase.from("posts")
            .select("id, user_id, username, category, content, storage_path, description, created_at, ref_url")
            .order("created_at", { ascending: false })
            .limit(20),
        // post_id listesini beklemeden tüm son beğenileri al (son 20 post ile örtüşür)
        supabase.from("post_likes")
            .select("post_id, user_id")
            .order("created_at", { ascending: false })
            .limit(400),
    ]);
    if (!user) redirect("/login");

    return (
        <AkisClient
            userId={user.id}
            username={profile?.username ?? ""}
            badges={(profile?.badges as string[]) ?? []}
            initialPosts={posts ?? []}
            initialLikesData={likesData ?? []}
            supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
        />
    );
}
