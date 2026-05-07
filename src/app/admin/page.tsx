import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

    // Nominations için service role client kullanıyoruz — RLS'i bypass eder,
    // yoksa admins kendi dışındaki kullanıcıların önerilerini göremez.
    const adminSupabase = createAdminClient();

    const [{ data: profiles }, { data: messages }, { data: applications }, { data: nominations }, { data: logs }] = await Promise.all([
        supabase.from("profiles").select("id, username, role, badges, created_at").order("created_at", { ascending: false }),
        supabase.from("messages").select("id, name, email, message, read, created_at").order("created_at", { ascending: false }),
        supabase.from("applications").select("id, user_id, username, type, answers, status, admin_note, created_at").order("created_at", { ascending: false }),
        adminSupabase.from("weekly_nominations").select("id, category, title, description, submitted_by, status, admin_note, reviewed_by, reviewed_at, week_start, created_at").order("created_at", { ascending: false }),
        adminSupabase.from("admin_logs").select("id, admin_username, action, target_id, target_type, details, created_at").order("created_at", { ascending: false }).limit(200),
    ]);

    return <AdminClient profiles={profiles ?? []} myBadges={me?.badges ?? []} messages={messages ?? []} applications={applications ?? []} nominations={nominations ?? []} logs={logs ?? []} />;
}