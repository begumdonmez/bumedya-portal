import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ManifestClient from "./ManifestClient";

export const metadata: Metadata = { title: "Manifest" };

export default async function ManifestPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect("/login");

    const [{ data: { user } }, { data: profile }, { data: notes }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("username, badges").eq("id", session.user.id).single(),
        supabase.from("manifest_notes").select("*").order("created_at", { ascending: true }),
    ]);
    if (!user) redirect("/login");

    return (
        <ManifestClient
            userId={user.id}
            username={profile?.username ?? ""}
            badges={(profile?.badges as string[]) ?? []}
            initialNotes={notes ?? []}
        />
    );
}
