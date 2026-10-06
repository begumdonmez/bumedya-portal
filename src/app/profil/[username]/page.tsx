import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import ProfilPosts from "@/components/ProfilPosts";
import type { Post } from "@/app/akis/AkisClient";
import { SocialLinksDisplay, type SocialLinksData } from "@/components/SocialLinks";
import { Zap, Shield, Palette, PenLine, BadgeCheck, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import type { ElementType } from "react";

/* ─── Tip ───────────────────────────────────────────────────── */
interface Profile {
    id: string;
    username: string;
    role: "member" | "creator";
    badges: string[];
    bio: string | null;
    display_name: string | null;
    created_at: string;
    social_links: SocialLinksData | null;
}

/* ─── Dinamik metadata ──────────────────────────────────────── */
export async function generateMetadata(
    { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
    const { username } = await params;
    return {
        title: `@${username}`,
        description: `bumedya topluluğunda @${username} profili.`,
    };
}

/* ─── Rozet konfigürasyonu ──────────────────────────────────── */
const BADGE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: ElementType }> = {
    admin:    { label: "Admin",   icon: Zap,        color: "color-mix(in srgb, var(--danger) 90%, transparent)",   bg: "color-mix(in srgb, var(--danger) 8%, transparent)",   border: "color-mix(in srgb, var(--danger) 25%, transparent)"   },
    editor:   { label: "Editör",  icon: Shield,     color: "color-mix(in srgb, var(--warn) 90%, transparent)",  bg: "color-mix(in srgb, var(--warn) 8%, transparent)",  border: "color-mix(in srgb, var(--warn) 25%, transparent)"  },
    artist:   { label: "Sanatçı", icon: Palette,    color: "color-mix(in srgb, var(--pink) 90%, transparent)", bg: "color-mix(in srgb, var(--pink) 8%, transparent)", border: "color-mix(in srgb, var(--pink) 25%, transparent)" },
    writer:   { label: "Yazar",   icon: PenLine,    color: "color-mix(in srgb, var(--success) 90%, transparent)",  bg: "color-mix(in srgb, var(--success) 8%, transparent)",  border: "color-mix(in srgb, var(--success) 20%, transparent)"   },
    verified: { label: "Onaylı",  icon: BadgeCheck, color: "color-mix(in srgb, var(--info) 90%, transparent)", bg: "color-mix(in srgb, var(--info) 8%, transparent)",  border: "color-mix(in srgb, var(--info) 20%, transparent)"   },
    founder:  { label: "Kurucu",  icon: Sparkles,   color: "color-mix(in srgb, var(--warn) 90%, transparent)",  bg: "color-mix(in srgb, var(--warn) 6%, transparent)",  border: "color-mix(in srgb, var(--warn) 20%, transparent)"   },
};

const ROLE_CONFIG = {
    member:  { label: "İzleyici", sublabel: "Member",  color: "color-mix(in srgb, var(--info) 90%, transparent)", bg: "color-mix(in srgb, var(--info) 8%, transparent)",  border: "color-mix(in srgb, var(--info) 20%, transparent)"  },
    creator: { label: "Üretici",  sublabel: "Creator", color: "color-mix(in srgb, var(--accent) 90%, transparent)", bg: "color-mix(in srgb, var(--accent) 8%, transparent)",  border: "color-mix(in srgb, var(--accent) 25%, transparent)" },
};

/* ─── Sayfa ─────────────────────────────────────────────────── */
export default async function PublicProfilePage(
    { params }: { params: Promise<{ username: string }> }
) {
    const { username } = await params;
    const supabase = await createClient();

    // Profile + auth + posts → hepsini paralel çek
    const [{ data: profile }, { data: { user } }, { data: posts }] = await Promise.all([
        supabase
            .from("profiles")
            .select("id, username, role, badges, bio, display_name, created_at, social_links")
            .eq("username", username)
            .single(),
        supabase.auth.getUser(),
        supabase
            .from("posts")
            .select("id, user_id, username, category, content, storage_path, description, created_at, ref_url")
            .eq("username", username)
            .order("created_at", { ascending: false })
            .limit(20),
    ]);

    if (!profile) notFound();

    const isOwnProfile = user?.id === profile.id;

    // Admin kontrolü: kendi profiliyse zaten badge'lerimiz var, ekstra sorgu gerekmez
    let isAdmin = false;
    if (isOwnProfile) {
        isAdmin = (profile.badges as string[]).includes("admin");
    } else if (user) {
        const { data: me } = await supabase
            .from("profiles").select("badges").eq("id", user.id).single();
        isAdmin = me?.badges?.includes("admin") ?? false;
    }

    const roleConf = ROLE_CONFIG[profile.role as keyof typeof ROLE_CONFIG] ?? ROLE_CONFIG.member;
    const joinDate = new Date(profile.created_at).toLocaleDateString("tr-TR", {
        year: "numeric", month: "long", day: "numeric",
    });

    return (
        <div className="relative min-h-screen flex flex-col">

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b gap-3"
                 style={{ borderColor: "var(--border-3)" }}>
                <div className="flex items-center gap-3 shrink-0">
                    <Link href="/home" className="flex items-center px-2 py-1 rounded-lg transition-all duration-200"
                          style={{ color: "var(--text-4)" }}>
                        <ChevronLeft size={15} />
                    </Link>
                    <Link href="/home" className="flex items-baseline gap-0.5">
                        <span className="text-sm font-bold" style={{ color: "var(--text-3)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "color-mix(in srgb, var(--accent) 70%, transparent)" }}>.</span>
                    </Link>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {isAdmin && (
                        <Link href="/admin"
                              className="text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-300 whitespace-nowrap"
                              style={{ color: "color-mix(in srgb, var(--danger) 75%, transparent)", border: "1px solid color-mix(in srgb, var(--danger) 15%, transparent)", background: "color-mix(in srgb, var(--danger) 6%, transparent)" }}>
                            <Zap size={11} strokeWidth={2} /> Admin
                        </Link>
                    )}
                    {isOwnProfile && (
                        <Link href="/profil"
                              className="text-xs px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 whitespace-nowrap"
                              style={{ color: "var(--accent-text)", border: "1px solid var(--accent-border)", background: "var(--accent-bg)" }}>
                            <span className="hidden sm:inline">Profilimi </span>Düzenle
                        </Link>
                    )}
                </div>
            </nav>

            {/* İçerik */}
            <div className="relative z-10 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12 flex flex-col gap-4">

                {/* Ana kart */}
                <div className="card rounded-2xl p-4 sm:p-8" style={{ }}>
                    <div className="h-[1px] -mt-4 sm:-mt-8 mb-4 sm:mb-8"
                         style={{ marginLeft: "-1rem", width: "calc(100% + 2rem)", background: "color-mix(in srgb, var(--accent) 35%, transparent)" }} />

                    {/* Avatar + bilgiler */}
                    <div className="flex items-start gap-5 mb-6">
                        {/* Avatar */}
                        <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center font-bold text-2xl select-none shrink-0"
                             style={{
                                 background: "color-mix(in srgb, var(--accent) 20%, transparent)",
                                 border: "1px solid var(--accent-border)",
                                 color: "var(--text-1)",
                             }}>
                            {profile.username[0].toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>
                                @{profile.username}
                            </h1>
                            {profile.display_name && (
                                <p className="text-xs mt-0.5 mb-2" style={{ color: "var(--text-3)" }}>
                                    {profile.display_name}
                                </p>
                            )}

                            {/* Rol rozeti */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
                                 style={{ background: roleConf.bg, border: `1px solid ${roleConf.border}` }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: roleConf.color }} />
                                <span className="label-caps" style={{ color: roleConf.color }}>
                                    {roleConf.label}
                                </span>
                                <span className="text-[11px]" style={{ color: "var(--text-4)" }}>·</span>
                                <span className="text-[11px]" style={{ color: "var(--text-4)" }}>{roleConf.sublabel}</span>
                            </div>

                            {/* Kazanılmış rozetler */}
                            {profile.badges.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {profile.badges.map((b: string) => {
                                        if (b === "authorized") return null;
                                        const conf = BADGE_CONFIG[b];
                                        if (!conf) return null;
                                        return (
                                            <span key={b} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
                                                  style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}>
                                                <conf.icon size={10} strokeWidth={2} /> {conf.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="mb-6">
                        <p className="label-caps mb-2" style={{ color: "var(--text-4)" }}>Bio</p>
                        <p className="text-sm leading-relaxed" style={{ color: profile.bio ? "var(--text-2)" : "var(--text-4)" }}>
                            {profile.bio || "Henüz bir bio eklenmedi."}
                        </p>
                        <SocialLinksDisplay links={profile.social_links ?? {}} />
                    </div>

                    {/* Katılım */}
                    <div className="pt-5" style={{ borderTop: "1px solid var(--border-3)" }}>
                        <p className="label-caps mb-1" style={{ color: "var(--text-4)" }}>Katılım</p>
                        <p className="text-sm" style={{ color: "var(--text-2)" }}>{joinDate}</p>
                    </div>
                </div>

                {/* Kendi profili ise düzenleme butonu */}
                {isOwnProfile && (
                    <Link href="/profil"
                          className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium transition-all duration-300"
                          style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent-text)" }}>
                        Profilimi Düzenle <ChevronRight size={13} />
                    </Link>
                )}

                {/* Paylaşımlar */}
                <ProfilPosts
                    posts={(posts ?? []) as Post[]}
                    supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
                />
            </div>
        </div>
    );
}