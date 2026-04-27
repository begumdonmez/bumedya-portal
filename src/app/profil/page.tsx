"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/* ─── Tipler ────────────────────────────────────────────────── */
interface Profile {
    id: string;
    username: string;
    role: "member" | "creator";
    badges: string[];
    bio: string | null;
    avatar_url: string | null;
    created_at: string;
}

/* ─── Topluluk rolü (member / creator) ─────────────────────── */
const ROLE_CONFIG = {
    member: {
        label: "İzleyici",
        sublabel: "Member",
        desc: "Topluluğu keşfeder, beğenir ve yorum yapar.",
        icon: "👁",
        color: "rgba(147,197,253,0.9)",
        bg: "rgba(59,130,246,0.08)",
        border: "rgba(59,130,246,0.2)",
        dot: "rgba(59,130,246,0.8)",
    },
    creator: {
        label: "Üretici",
        sublabel: "Creator",
        desc: "Çizim ve yazı paylaşır, stüdyoya erişir.",
        icon: "✏️",
        color: "rgba(167,139,250,0.9)",
        bg: "rgba(124,58,237,0.08)",
        border: "rgba(124,58,237,0.25)",
        dot: "rgba(124,58,237,0.8)",
    },
};

/* ─── Rozet tanımları (admin atar) ─────────────────────────── */
const BADGE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: string }> = {
    admin:    { label: "Admin",    icon: "⚡", color: "rgba(239,68,68,0.9)",   bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)"   },
    editor:   { label: "Editör",   icon: "🛡", color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.25)"  },
    artist:   { label: "Sanatçı",  icon: "🎨", color: "rgba(244,114,182,0.9)", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.25)" },
    writer:   { label: "Yazar",    icon: "📝", color: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)"   },
    verified: { label: "Onaylı",   icon: "✓",  color: "rgba(147,197,253,0.9)", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)"   },
    founder:  { label: "Kurucu",   icon: "✦",  color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.06)",  border: "rgba(251,191,36,0.2)"   },
};

/* ─── Avatar ────────────────────────────────────────────────── */
function Avatar({ username, size = 72 }: { username: string; size?: number }) {
    return (
        <div className="rounded-2xl flex items-center justify-center font-bold select-none shrink-0"
             style={{
                 width: size, height: size, fontSize: size * 0.32,
                 background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(59,130,246,0.3))",
                 border: "1px solid rgba(124,58,237,0.3)",
                 boxShadow: "0 0 24px rgba(124,58,237,0.15)",
                 color: "#E0F2FE",
             }}>
            {username.slice(0, 2).toUpperCase()}
        </div>
    );
}

/* ─── Rozet bileşeni ────────────────────────────────────────── */
function Badge({ id }: { id: string }) {
    const conf = BADGE_CONFIG[id];
    if (!conf) return null;
    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider"
             style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}>
            <span>{conf.icon}</span>
            {conf.label}
        </div>
    );
}

/* ─── Ana bileşen ────────────────────────────────────────────── */
export default function ProfilPage() {
    const router = useRouter();
    const [profile, setProfile]       = useState<Profile | null>(null);
    const [loading, setLoading]       = useState(true);
    const [editing, setEditing]       = useState(false);
    const [saving,  setSaving]        = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const [editUsername, setEditUsername] = useState("");
    const [editBio,      setEditBio]      = useState("");

    useEffect(() => {
        const load = async () => {
            const supabase = createClient();
            const { data: { user }, error: userErr } = await supabase.auth.getUser();
            if (userErr || !user) { router.push("/login"); return; }
            const { data, error } = await supabase
                .from("profiles").select("*").eq("id", user.id).single();
            if (error || !data) { toast.error("Profil yüklenemedi."); setLoading(false); return; }
            setProfile(data as Profile);
            setEditUsername(data.username);
            setEditBio(data.bio ?? "");
            setLoading(false);
        };
        load();
    }, [router]);

    const handleSave = async () => {
        if (!profile) return;
        const trimmed = editUsername.trim().replace(/^@/, "");
        if (trimmed.length < 3) { toast.error("Kullanıcı adı en az 3 karakter olmalı."); return; }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { toast.error("Sadece harf, rakam ve alt çizgi kullanılabilir."); return; }
        setSaving(true);
        const toastId = toast.loading("Kaydediliyor...");
        const supabase = createClient();
        const { error } = await supabase.from("profiles").update({
            username: trimmed, bio: editBio.trim() || null, updated_at: new Date().toISOString(),
        }).eq("id", profile.id);
        if (error) {
            toast.error(error.message.includes("duplicate") ? "Bu kullanıcı adı zaten alınmış." : "Kaydedilemedi: " + error.message, { id: toastId });
            setSaving(false); return;
        }
        setProfile({ ...profile, username: trimmed, bio: editBio.trim() || null });
        toast.success("Profil güncellendi.", { id: toastId });
        setSaving(false); setEditing(false);
    };

    const handleSignOut = async () => {
        setSigningOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success("Çıkış yapıldı.");
        router.push("/");
        router.refresh();
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0F1E" }}>
            <div className="flex flex-col items-center gap-4">
                <span className="w-8 h-8 rounded-full border-2 border-white/10 border-t-purple-500 animate-spin" />
                <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(224,242,254,0.3)" }}>Yükleniyor</span>
            </div>
        </div>
    );

    if (!profile) return null;

    const roleConf = ROLE_CONFIG[profile.role] ?? ROLE_CONFIG.member;
    const joinDate = new Date(profile.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });

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
                <button onClick={() => router.push("/")} className="flex items-baseline gap-0.5 shrink-0">
                    <span className="text-sm font-bold" style={{ color: "rgba(224,242,254,0.5)" }}>bumedya</span>
                    <span className="text-sm font-bold" style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                </button>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {profile?.badges?.includes("admin") && (
                        <button onClick={() => router.push("/admin")}
                                className="flex items-center gap-1 text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-300 whitespace-nowrap"
                                style={{ color: "rgba(239,68,68,0.75)", border: "1px solid rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.06)" }}>
                            ⚡ Admin
                        </button>
                    )}
                    <button onClick={handleSignOut} disabled={signingOut}
                            className="flex items-center gap-1.5 text-xs px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
                            style={{ color: "rgba(239,68,68,0.75)", border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)" }}>
                        {signingOut
                            ? <span className="w-3 h-3 rounded-full border border-red-400/30 border-t-red-400 animate-spin" />
                            : <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h3M9 9l3-3-3-3M12 6.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>}
                        <span className="hidden sm:inline">Çıkış Yap</span>
                    </button>
                </div>
            </nav>

            <div className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-6 py-10 flex flex-col gap-4">

                {/* ── ANA PROFİL KARTI ── */}
                <div className="rounded-3xl p-8"
                     style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 60px rgba(0,0,0,0.4)" }}>
                    <div className="h-[1px] -mt-8 mb-8"
                         style={{ marginLeft: "-2rem", width: "calc(100% + 4rem)", background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5) 40%, rgba(167,139,250,0.3) 60%, transparent)" }} />

                    {/* Avatar + bilgiler */}
                    <div className="flex items-start gap-5 mb-6">
                        <Avatar username={profile.username} size={72} />
                        <div className="flex-1 min-w-0">
                            {editing ? (
                                <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)}
                                       placeholder="kullaniciadi" className="rounded-xl px-3 py-2 text-sm outline-none w-full"
                                       style={{ background: "rgba(10,15,30,0.6)", border: "1px solid rgba(124,58,237,0.5)", color: "#E0F2FE" }} />
                            ) : (
                                <h1 className="text-xl font-bold tracking-tight mb-2" style={{ color: "#E0F2FE" }}>
                                    @{profile.username}
                                </h1>
                            )}

                            {/* Kazanılmış rozetler */}
                            {profile.badges.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {profile.badges.map((b) => <Badge key={b} id={b} />)}
                                </div>
                            )}
                        </div>
                        {!editing && (
                            <button onClick={() => setEditing(true)}
                                    className="shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300"
                                    style={{ color: "rgba(167,139,250,0.8)", border: "1px solid rgba(124,58,237,0.25)", background: "rgba(124,58,237,0.08)" }}>
                                Düzenle
                            </button>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="mb-6">
                        <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "rgba(224,242,254,0.3)" }}>Bio</p>
                        {editing ? (
                            <>
                                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)}
                                          placeholder="Kendinden bahset..." rows={3} maxLength={160}
                                          className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                                          style={{ background: "rgba(10,15,30,0.6)", border: "1px solid rgba(124,58,237,0.5)", color: "#E0F2FE" }} />
                                <p className="text-[10px] mt-1 text-right" style={{ color: "rgba(224,242,254,0.2)" }}>{editBio.length}/160</p>
                            </>
                        ) : (
                            <p className="text-sm leading-relaxed" style={{ color: profile.bio ? "rgba(224,242,254,0.6)" : "rgba(224,242,254,0.2)" }}>
                                {profile.bio || "Henüz bir bio eklenmedi."}
                            </p>
                        )}
                    </div>

                    {/* Katılım tarihi */}
                    <div className="pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <p className="text-[10px] tracking-widest uppercase mb-1" style={{ color: "rgba(224,242,254,0.3)" }}>Katılım</p>
                        <p className="text-sm" style={{ color: "rgba(224,242,254,0.6)" }}>{joinDate}</p>
                    </div>

                    {/* Düzenleme butonları */}
                    {editing && (
                        <div className="flex gap-3 mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                            <button onClick={handleSave} disabled={saving}
                                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300"
                                    style={{ background: saving ? "rgba(124,58,237,0.5)" : "#7C3AED", boxShadow: saving ? "none" : "0 4px 16px rgba(124,58,237,0.3)" }}>
                                {saving
                                    ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Kaydediliyor...</span>
                                    : "Kaydet"}
                            </button>
                            <button onClick={() => { setEditing(false); setEditUsername(profile.username); setEditBio(profile.bio ?? ""); }}
                                    className="px-6 py-3 rounded-xl text-sm transition-all duration-300"
                                    style={{ color: "rgba(224,242,254,0.5)", border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)" }}>
                                İptal
                            </button>
                        </div>
                    )}
                </div>

                {/* ── TOPLULUK TÜRÜ — member / creator ── */}
                <div className="rounded-3xl p-6"
                     style={{ background: roleConf.bg, border: `1px solid ${roleConf.border}` }}>
                    <p className="text-[10px] tracking-widest uppercase mb-4" style={{ color: "rgba(224,242,254,0.3)" }}>
                        Topluluk Türü
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
                             style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${roleConf.border}` }}>
                            {roleConf.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-0.5">
                                <p className="text-base font-bold" style={{ color: roleConf.color }}>{roleConf.label}</p>
                                <span className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(224,242,254,0.25)" }}>{roleConf.sublabel}</span>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: "rgba(224,242,254,0.4)" }}>{roleConf.desc}</p>
                        </div>

                        {/* Sadece member ise geçiş butonu */}
                        {profile.role === "member" && (
                            <button onClick={() => router.push("/onboarding")}
                                    className="shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 whitespace-nowrap"
                                    style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "rgba(167,139,250,0.9)" }}>
                                Üretici Ol →
                            </button>
                        )}
                    </div>
                </div>

                {/* ── KAZANILAN ROZETLER ── */}
                <div className="rounded-3xl p-6"
                     style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] tracking-widest uppercase mb-4" style={{ color: "rgba(224,242,254,0.3)" }}>
                        Rozetler
                    </p>

                    {profile.badges.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {profile.badges.map((b) => {
                                const conf = BADGE_CONFIG[b];
                                if (!conf) return null;
                                return (
                                    <div key={b} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                                         style={{ background: conf.bg, border: `1px solid ${conf.border}` }}>
                                        <span style={{ fontSize: 16 }}>{conf.icon}</span>
                                        <div>
                                            <p className="text-xs font-medium" style={{ color: conf.color }}>{conf.label}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-4 text-center">
                            <span className="text-2xl opacity-30">🏅</span>
                            <p className="text-xs" style={{ color: "rgba(224,242,254,0.25)" }}>
                                Henüz rozet kazanılmadı.
                            </p>
                            <p className="text-[11px]" style={{ color: "rgba(224,242,254,0.15)" }}>
                                Rozetler toplulukta aktifleşerek kazanılır.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}