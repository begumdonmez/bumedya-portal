import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect("/login");

    // getUser (güvenlik) + profil kontrolü paralel
    const [{ data: { user } }, { data: me }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("badges").eq("id", session.user.id).single(),
    ]);

    if (!user) redirect("/login");
    if (!me?.badges?.includes("admin")) redirect("/");

    const adminSupabase = createAdminClient();

    const [{ data: profiles }, { data: messages }, { data: applications }, { data: nominations }, { data: logs }] = await Promise.all([
        supabase.from("profiles").select("id, username, role, badges, created_at").order("created_at", { ascending: false }).limit(500),
        supabase.from("messages").select("id, name, email, message, read, created_at").order("created_at", { ascending: false }).limit(200),
        supabase.from("applications").select("id, user_id, username, type, answers, status, admin_note, created_at").order("created_at", { ascending: false }).limit(200),
        adminSupabase.from("weekly_nominations").select("id, category, title, description, submitted_by, status, admin_note, reviewed_by, reviewed_at, week_start, created_at").order("created_at", { ascending: false }),
        adminSupabase.from("admin_logs").select("id, admin_username, action, target_id, target_type, details, created_at").order("created_at", { ascending: false }).limit(200),
    ]);

    return <AdminClient profiles={profiles ?? []} myBadges={me?.badges ?? []} messages={messages ?? []} applications={applications ?? []} nominations={nominations ?? []} logs={logs ?? []} />;
}
