import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MembersClient from "./MembersClient";
import NavbarBackdrop from "@/components/NavbarBackdrop";

export const metadata = { title: "Üyeler | bumedya." };

export default async function MembersPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    let username: string | null = null;
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();
        username = profile?.username ?? null;
    }

    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, role, badges, bio, created_at")
        .order("created_at", { ascending: false });

    return (
        <div className="relative min-h-screen flex flex-col" style={{ background: "#0A0F1E" }}>
            <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
                 style={{ background: "rgba(124,58,237,0.06)", filter: "blur(120px)" }} />
            <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.02]"
                 style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-5">
                <NavbarBackdrop />
                <div className="flex items-center gap-2">
                    <Link href="/home" className="text-xs px-1.5 py-1 rounded-lg transition-colors duration-200"
                          style={{ color: "rgba(224,242,254,0.3)" }}>
                        ←
                    </Link>
                    <Link href="/home" className="flex items-baseline gap-0.5">
                        <span className="text-sm font-bold" style={{ color: "rgba(224,242,254,0.5)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    {user ? (
                        <Link href="/profil"
                              className="text-xs px-4 py-2 rounded-xl transition-all duration-300"
                              style={{ color: "rgba(167,139,250,0.8)", border: "1px solid rgba(124,58,237,0.25)", background: "rgba(124,58,237,0.08)" }}>
                            @{username}
                        </Link>
                    ) : (
                        <Link href="/login"
                              className="text-xs px-4 py-2 rounded-xl transition-all duration-300"
                              style={{ color: "rgba(224,242,254,0.5)", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                            Giriş
                        </Link>
                    )}
                </div>
            </nav>

            <div className="pt-20">
                <MembersClient profiles={profiles ?? []} />
            </div>
        </div>
    );
}
