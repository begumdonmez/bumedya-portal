import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import GaleriClient from "./GaleriClient";

export const metadata: Metadata = { title: "Galeri" };

export default async function GaleriPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect("/login");

    const [{ data: { user } }, { data: profile }, { data: items }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("username, role, badges").eq("id", session.user.id).single(),
        supabase.from("gallery_items")
            .select("id, user_id, username, title, storage_path, created_at, ref_url")
            .order("created_at", { ascending: false }),
    ]);
    if (!user) redirect("/login");

    return (
        <GaleriClient
            userId={user.id}
            username={profile?.username ?? ""}
            role={profile?.role ?? "member"}
            badges={(profile?.badges as string[]) ?? []}
            items={items ?? []}
            supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
        />
    );
}
