import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NavbarBackdrop from "@/components/NavbarBackdrop";

export const metadata = { title: "Ana Sayfa | bumedya." };

export default async function HomePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

    const username = profile?.username ?? user.email?.split("@")[0] ?? "";

    return (
        <div className="relative min-h-screen flex flex-col" style={{ background: "#0A0F1E" }}>
            <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
                 style={{ background: "rgba(124,58,237,0.06)", filter: "blur(120px)" }} />

            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5">
                <NavbarBackdrop />
                <Link href="/" className="flex items-baseline gap-0.5">
                    <span className="text-sm font-bold" style={{ color: "rgba(224,242,254,0.5)" }}>bumedya</span>
                    <span className="text-sm font-bold" style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/home" className="text-sm tracking-widest uppercase font-light transition-colors duration-300"
                          style={{ color: "rgba(224,242,254,0.9)" }}>Ana Sayfa</Link>
                    <Link href="/galeri" className="text-sm tracking-widest uppercase font-light transition-colors duration-300"
                          style={{ color: "rgba(224,242,254,0.4)" }}>Galeri</Link>
                    <Link href="/etkinlikler" className="text-sm tracking-widest uppercase font-light transition-colors duration-300"
                          style={{ color: "rgba(224,242,254,0.4)" }}>Etkinlikler</Link>
                    <Link href="/members" className="text-sm tracking-widest uppercase font-light transition-colors duration-300"
                          style={{ color: "rgba(224,242,254,0.4)" }}>Üyeler</Link>
                    <Link href="/chat" className="text-sm tracking-widest uppercase font-light transition-colors duration-300"
                          style={{ color: "rgba(224,242,254,0.4)" }}>Lounge</Link>
                </div>
                <Link href="/profil"
                      className="text-xs px-4 py-2 rounded-xl transition-all duration-300"
                      style={{ color: "rgba(167,139,250,0.8)", border: "1px solid rgba(124,58,237,0.25)", background: "rgba(124,58,237,0.08)" }}>
                    @{username}
                </Link>
            </nav>

            <div className="relative z-10 max-w-4xl mx-auto w-full px-6 pt-32 pb-16 flex flex-col gap-8">
                <div>
                    <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "rgba(224,242,254,0.25)" }}>
                        Hoş geldin
                    </p>
                    <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#E0F2FE" }}>
                        @{username}
                    </h1>
                </div>

                {/* İçerik buraya gelecek */}
                <div className="rounded-3xl p-10 flex flex-col items-center justify-center gap-3"
                     style={{
                         background: "rgba(255,255,255,0.03)",
                         border: "1px solid rgba(255,255,255,0.07)",
                         minHeight: "300px",
                     }}>
                    <span className="text-3xl opacity-20">✦</span>
                    <p className="text-sm" style={{ color: "rgba(224,242,254,0.25)" }}>İçerik yakında eklenecek.</p>
                </div>
            </div>
        </div>
    );
}
