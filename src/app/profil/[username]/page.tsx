import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

/* ─── Tip ───────────────────────────────────────────────────── */
interface Profile {
    id: string;
    username: string;
    role: "member" | "creator";
    badges: string[];
    bio: string | null;
    created_at: string;
}

/* ─── Dinamik metadata ──────────────────────────────────────── */
export async function generateMetadata(
    { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
    const { username } = await params;
    return {
        title: `@${username} | bumedya.`,
        description: `bumedya topluluğunda @${username} profili.`,
    };
}

/* ─── Rozet konfigürasyonu ──────────────────────────────────── */
const BADGE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
    admin:    { label: "Admin",   icon: "⚡", color: "rgba(239,68,68,0.9)",   bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)"   },
    editor:   { label: "Editör",  icon: "🛡", color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.25)"  },
    artist:   { label: "Sanatçı", icon: "🎨", color: "rgba(244,114,182,0.9)", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.25)" },
    writer:   { label: "Yazar",   icon: "📝", color: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)"   },
    verified: { label: "Onaylı",  icon: "✓",  color: "rgba(147,197,253,0.9)", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)"   },
    founder:  { label: "Kurucu",  icon: "✦",  color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.06)",  border: "rgba(251,191,36,0.2)"   },
};

const ROLE_CONFIG = {
    member:  { label: "İzleyici", sublabel: "Member",  color: "rgba(147,197,253,0.9)", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)"  },
    creator: { label: "Üretici",  sublabel: "Creator", color: "rgba(167,139,250,0.9)", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.25)" },
};

/* ─── Sayfa ─────────────────────────────────────────────────── */
export default async function PublicProfilePage(
    { params }: { params: Promise<{ username: string }> }
) {
    const { username } = await params;
    const supabase = await createClient();

    // Profili çek
    const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, role, badges, bio, created_at")
        .eq("username", username)
        .single();

    if (!profile) notFound();

    // Mevcut kullanıcıyı çek — kendi profili mi, admin mi?
    const { data: { user } } = await supabase.auth.getUser();
    const isOwnProfile = user?.id === profile.id;

    let isAdmin = false;
    if (user) {
        const { data: me } = await supabase
            .from("profiles")
            .select("badges")
            .eq("id", user.id)
            .single();
        isAdmin = me?.badges?.includes("admin") ?? false;
    }

    const roleConf = ROLE_CONFIG[profile.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.member;
    const joinDate = new Date(profile.created_at).toLocaleDateString("tr-TR", {
        year: "numeric", month: "long", day: "numeric",
    });

    return (
        <div className="relative min-h-screen flex flex-col" style={{ background: "#0A0F1E" }}>
            {/* Atmosfer */}
            <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
                 style={{ background: "rgba(124,58,237,0.07)", filter: "blur(120px)" }} />
            <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.02]"
                 style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b gap-3"
                 style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <Link href="/" className="flex items-baseline gap-0.5 shrink-0">
                    <span className="text-sm font-bold" style={{ color: "rgba(224,242,254,0.5)" }}>bumedya</span>
                    <span className="text-sm font-bold" style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                </Link>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {isAdmin && (
                        <Link href="/admin"
                              className="text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-300 whitespace-nowrap"
                              style={{ color: "rgba(239,68,68,0.75)", border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.06)" }}>
                            ⚡ Admin
                        </Link>
                    )}
                    {isOwnProfile && (
                        <Link href="/profil"
                              className="text-xs px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 whitespace-nowrap"
                              style={{ color: "rgba(167,139,250,0.8)", border: "1px solid rgba(124,58,237,0.25)", background: "rgba(124,58,237,0.08)" }}>
                            <span className="hidden sm:inline">Profilimi </span>Düzenle
                        </Link>
                    )}
                </div>
            </nav>

            {/* İçerik */}
            <div className="relative z-10 max-w-2xl mx-auto w-full px-6 py-12 flex flex-col gap-4">

                {/* Ana kart */}
                <div className="rounded-3xl p-8"
                     style={{
                         background: "rgba(255,255,255,0.04)",
                         backdropFilter: "blur(40px)",
                         border: "1px solid rgba(255,255,255,0.08)",
                         boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
                     }}>
                    <div className="h-[1px] -mt-8 mb-8"
                         style={{ marginLeft: "-2rem", width: "calc(100% + 4rem)", background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5) 40%, rgba(167,139,250,0.3) 60%, transparent)" }} />

                    {/* Avatar + bilgiler */}
                    <div className="flex items-start gap-5 mb-6">
                        {/* Avatar */}
                        <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center font-bold text-2xl select-none shrink-0"
                             style={{
                                 background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(59,130,246,0.3))",
                                 border: "1px solid rgba(124,58,237,0.3)",
                                 boxShadow: "0 0 24px rgba(124,58,237,0.15)",
                                 color: "#E0F2FE",
                             }}>
                            {profile.username[0].toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold tracking-tight mb-2" style={{ color: "#E0F2FE" }}>
                                @{profile.username}
                            </h1>

                            {/* Rol rozeti */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                                 style={{ background: roleConf.bg, border: `1px solid ${roleConf.border}` }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: roleConf.color }} />
                                <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: roleConf.color }}>
                                    {roleConf.label}
                                </span>
                                <span className="text-[10px]" style={{ color: "rgba(224,242,254,0.2)" }}>·</span>
                                <span className="text-[10px]" style={{ color: "rgba(224,242,254,0.3)" }}>{roleConf.sublabel}</span>
                            </div>

                            {/* Kazanılmış rozetler */}
                            {profile.badges.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {profile.badges.map((b: string) => {
                                        const conf = BADGE_CONFIG[b];
                                        if (!conf) return null;
                                        return (
                                            <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium"
                                                  style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}>
                                                {conf.icon} {conf.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="mb-6">
                        <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "rgba(224,242,254,0.3)" }}>Bio</p>
                        <p className="text-sm leading-relaxed" style={{ color: profile.bio ? "rgba(224,242,254,0.6)" : "rgba(224,242,254,0.2)" }}>
                            {profile.bio || "Henüz bir bio eklenmedi."}
                        </p>
                    </div>

                    {/* Katılım */}
                    <div className="pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "rgba(224,242,254,0.3)" }}>Katılım</p>
                        <p className="text-sm" style={{ color: "rgba(224,242,254,0.6)" }}>{joinDate}</p>
                    </div>
                </div>

                {/* Kendi profili ise düzenleme butonu */}
                {isOwnProfile && (
                    <Link href="/profil"
                          className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all duration-300"
                          style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "rgba(167,139,250,0.8)" }}>
                        Profilimi Düzenle →
                    </Link>
                )}
            </div>
        </div>
    );
}