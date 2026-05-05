import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminClient from "./AdminClient";

/* ─── Server guard — sadece admin badge'li girer ────────────── */
export default async function AdminPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Mevcut kullanıcının profilini çek
    const { data: me } = await supabase
        .from("profiles")
        .select("badges")
        .eq("id", user.id)
        .single();

    // Admin değilse ana sayfaya at
    if (!me?.badges?.includes("admin")) redirect("/");

    const [{ data: profiles }, { data: messages }, { data: applications }] = await Promise.all([
        supabase.from("profiles").select("id, username, role, badges, created_at").order("created_at", { ascending: false }),
        supabase.from("messages").select("id, name, email, message, read, created_at").order("created_at", { ascending: false }),
        supabase.from("applications").select("id, user_id, username, type, answers, status, admin_note, created_at").order("created_at", { ascending: false }),
    ]);

    return <AdminClient profiles={profiles ?? []} myBadges={me?.badges ?? []} messages={messages ?? []} applications={applications ?? []} />;
}