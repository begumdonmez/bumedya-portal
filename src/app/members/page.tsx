import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MembersClient from "./MembersClient";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import HomeNavLinks from "@/components/HomeNavLinks";
import NotificationBell from "@/components/NotificationBell";
import SiteHeader from "@/components/SiteHeader";

export const metadata = { title: "Üyeler" };

export default async function MembersPage() {
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect("/login");

    const [{ data: { user } }, { data: profile }, { data: profiles }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("username").eq("id", session.user.id).single(),
        supabase.from("profiles").select("id, username, role, badges, bio, created_at").order("created_at", { ascending: false }).limit(200),
    ]);
    if (!user) redirect("/login");

    const username = profile?.username ?? user.email?.split("@")[0] ?? "";

    return (
        <div className="relative min-h-screen flex flex-col">
            <div aria-hidden className="fixed inset-0 dot-grid opacity-[0.28] pointer-events-none" style={{ zIndex: 0 }} />

            <SiteHeader userId={user.id} username={username} />

            <div className="pt-20">
                <MembersClient profiles={profiles ?? []} />
            </div>
        </div>
    );
}
