import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import BasvuruClient from "./BasvuruClient";

export const metadata: Metadata = { title: "Başvuru | bumedya." };

export default async function BasvuruPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

    const username = profile?.username ?? user.email?.split("@")[0] ?? "";

    const { data: myApplications } = await supabase
        .from("applications")
        .select("id, type, status, created_at, admin_note")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <BasvuruClient
            userId={user.id}
            username={username}
            myApplications={myApplications ?? []}
        />
    );
}
