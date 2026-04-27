import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import GaleriClient from "./GaleriClient";

export const metadata: Metadata = { title: "Galeri | bumedya." };

export default async function GaleriPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("username, role, badges")
        .eq("id", user.id)
        .single();

    const { data: items } = await supabase
        .from("gallery_items")
        .select("id, user_id, username, title, storage_path, created_at")
        .order("created_at", { ascending: false });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

    return (
        <GaleriClient
            userId={user.id}
            username={profile?.username ?? ""}
            role={profile?.role ?? "member"}
            items={items ?? []}
            supabaseUrl={supabaseUrl}
        />
    );
}
