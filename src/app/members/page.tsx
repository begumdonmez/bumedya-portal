import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MembersClient from "./MembersClient";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Üyeler | bumedya." };

export default async function MembersPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, role, badges, bio, created_at")
        .order("created_at", { ascending: false });

    return (
        <div className="aurora-bg relative min-h-screen flex flex-col">
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />
            <div aria-hidden className="fixed inset-0 dot-grid opacity-[0.28] pointer-events-none" style={{ zIndex: 0 }} />

            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center px-4 sm:px-8 py-5">
                <NavbarBackdrop />
                <div className="flex items-center gap-2">
                    <Link href="/home" className="text-xs px-1.5 py-1 rounded-lg transition-colors duration-200"
                          style={{ color: "rgba(224,242,254,0.3)" }}>
                        <ChevronLeft size={15} />
                    </Link>
                    <Link href="/home" className="flex items-baseline gap-0.5">
                        <span className="text-sm font-bold" style={{ color: "rgba(224,242,254,0.5)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                    </Link>
                </div>
            </nav>

            <div className="pt-20">
                <MembersClient profiles={profiles ?? []} />
            </div>
        </div>
    );
}
