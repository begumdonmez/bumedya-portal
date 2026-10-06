"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Zap, Shield, Palette, PenLine, BadgeCheck, Sparkles, Award, ChevronLeft, ChevronRight, Eye, Tv, BookOpen, Headphones, MessageCircle } from "lucide-react";
import type { ElementType } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import ProfilPosts from "@/components/ProfilPosts";
import type { Post } from "@/app/akis/AkisClient";
import { SocialLinksDisplay, SOCIAL_PLATFORMS, type SocialLinksData } from "@/components/SocialLinks";

/* ─── Tipler ────────────────────────────────────────────────── */
export interface Profile {
    id: string;
    username: string;
    role: "member" | "creator";
    badges: string[];
    bio: string | null;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string;
    social_links: SocialLinksData | null;
}

/* ─── Topluluk rolü (member / creator) ─────────────────────── */
const ROLE_CONFIG: Record<string, { label: string; sublabel: string; desc: string; icon: ElementType; color: string; bg: string; border: string; dot: string }> = {
    member: {
        label: "İzleyici",
        sublabel: "Member",
        desc: "Topluluğu keşfeder, beğenir ve yorum yapar.",
        icon: Eye,
        color: "color-mix(in srgb, var(--info) 90%, transparent)",
        bg: "color-mix(in srgb, var(--info) 8%, transparent)",
        border: "color-mix(in srgb, var(--info) 20%, transparent)",
        dot: "color-mix(in srgb, var(--info) 80%, transparent)",
    },
    creator: {
        label: "Üretici",
        sublabel: "Creator",
        desc: "Çizim ve yazı paylaşır, stüdyoya erişir.",
        icon: PenLine,
        color: "color-mix(in srgb, var(--accent) 90%, transparent)",
        bg: "color-mix(in srgb, var(--accent) 8%, transparent)",
        border: "color-mix(in srgb, var(--accent) 25%, transparent)",
        dot: "color-mix(in srgb, var(--accent) 80%, transparent)",
    },
};

/* ─── Rozet tanımları ───────────────────────────────────────── */
const BADGE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: ElementType }> = {
    // Admin tarafından verilir
    admin:           { label: "Admin",          icon: Zap,          color: "color-mix(in srgb, var(--danger) 90%, transparent)",   bg: "color-mix(in srgb, var(--danger) 8%, transparent)",   border: "color-mix(in srgb, var(--danger) 25%, transparent)"   },
    editor:          { label: "Editör",         icon: Shield,       color: "color-mix(in srgb, var(--warn) 90%, transparent)",  bg: "color-mix(in srgb, var(--warn) 8%, transparent)",  border: "color-mix(in srgb, var(--warn) 25%, transparent)"  },
    artist:          { label: "Sanatçı",        icon: Palette,      color: "color-mix(in srgb, var(--pink) 90%, transparent)", bg: "color-mix(in srgb, var(--pink) 8%, transparent)", border: "color-mix(in srgb, var(--pink) 25%, transparent)" },
    writer:          { label: "Yazar",          icon: PenLine,      color: "color-mix(in srgb, var(--success) 90%, transparent)",  bg: "color-mix(in srgb, var(--success) 8%, transparent)",  border: "color-mix(in srgb, var(--success) 20%, transparent)"   },
    verified:        { label: "Onaylı",         icon: BadgeCheck,   color: "color-mix(in srgb, var(--info) 90%, transparent)", bg: "color-mix(in srgb, var(--info) 8%, transparent)",  border: "color-mix(in srgb, var(--info) 20%, transparent)"   },
    founder:         { label: "Kurucu",         icon: Sparkles,     color: "color-mix(in srgb, var(--warn) 90%, transparent)",  bg: "color-mix(in srgb, var(--warn) 6%, transparent)",  border: "color-mix(in srgb, var(--warn) 20%, transparent)"   },
    sosyal_kelebek:  { label: "Sosyal Kelebek", icon: MessageCircle,color: "color-mix(in srgb, var(--accent-2) 90%, transparent)",  bg: "color-mix(in srgb, var(--accent-2) 8%, transparent)",  border: "color-mix(in srgb, var(--accent-2) 25%, transparent)"  },
    // Kullanıcı kendi alabilir
    seri_izleyici:   { label: "Seri İzleyici",  icon: Tv,           color: "color-mix(in srgb, var(--info) 90%, transparent)",  bg: "color-mix(in srgb, var(--info) 8%, transparent)",  border: "color-mix(in srgb, var(--info) 25%, transparent)"  },
    kitap_kurdu:     { label: "Kitap Kurdu",    icon: BookOpen,     color: "color-mix(in srgb, var(--success) 90%, transparent)",  bg: "color-mix(in srgb, var(--success) 8%, transparent)",  border: "color-mix(in srgb, var(--success) 25%, transparent)"  },
    plak_kafasi:     { label: "Plak Kafası",    icon: Headphones,   color: "color-mix(in srgb, var(--pink) 90%, transparent)", bg: "color-mix(in srgb, var(--pink) 8%, transparent)", border: "color-mix(in srgb, var(--pink) 25%, transparent)" },
};

/* ─── Kullanıcının kendi alabileceği rozetler ───────────────── */
const SELF_BADGES: { id: string; desc: string }[] = [
    { id: "seri_izleyici", desc: "Film & dizi tutkunları için" },
    { id: "kitap_kurdu",   desc: "Okumaktan yorulmayanlar için" },
    { id: "plak_kafasi",   desc: "Müziği yaşayıp nefes alanlar için" },
];

/* ─── Avatar ────────────────────────────────────────────────── */
function Avatar({ username, size = 72 }: { username: string; size?: number }) {
    return (
        <div className="rounded-2xl flex items-center justify-center font-bold select-none shrink-0"
             style={{
                 width: size, height: size, fontSize: size * 0.32,
                 background: "color-mix(in srgb, var(--accent) 20%, transparent)",
                 border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                 color: "var(--text-1)",
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
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wider"
             style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}>
            <conf.icon size={11} strokeWidth={2} />
            {conf.label}
        </div>
    );
}

/* ─── Ana bileşen ────────────────────────────────────────────── */
export default function ProfilClient({ initialProfile, initialPosts }: { initialProfile: Profile; initialPosts: Post[] }) {
    const router = useRouter();
    const [profile, setProfile]       = useState<Profile>(initialProfile);
    const [editing, setEditing]       = useState(false);
    const [saving,  setSaving]        = useState(false);
    const [signingOut, setSigningOut] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleting, setDeleting] = useState(false);
    const deleteInputRef = useRef<HTMLInputElement>(null);
    const [editUsername,    setEditUsername]    = useState(initialProfile.username);
    const [editBio,         setEditBio]         = useState(initialProfile.bio ?? "");
    const [editDisplayName, setEditDisplayName] = useState(initialProfile.display_name ?? "");
    const [editSocialLinks, setEditSocialLinks] = useState<SocialLinksData>(initialProfile.social_links ?? {});
    const [posts, setPosts] = useState<Post[]>(initialPosts);

    const handleSave = async () => {
        if (!profile) return;
        const trimmed = editUsername.trim().replace(/^@/, "");
        if (trimmed.length < 3) { toast.error("Kullanıcı adı en az 3 karakter olmalı."); return; }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { toast.error("Sadece harf, rakam ve alt çizgi kullanılabilir."); return; }
        setSaving(true);
        const toastId = toast.loading("Kaydediliyor...");
        const supabase = createClient();
        const cleanLinks = Object.fromEntries(
            Object.entries(editSocialLinks)
                .filter(([, v]) => v.trim() !== "")
                .filter(([, v]) => {
                    try { const p = new URL(v.trim()); return p.protocol === "https:" || p.protocol === "http:"; }
                    catch { return false; }
                })
        );
        const { error } = await supabase.from("profiles").update({
            username: trimmed,
            display_name: editDisplayName.trim() || null,
            bio: editBio.trim() || null,
            social_links: Object.keys(cleanLinks).length > 0 ? cleanLinks : null,
            updated_at: new Date().toISOString(),
        }).eq("id", profile.id);
        if (error) {
            toast.error(error.message.includes("duplicate") ? "Bu kullanıcı adı zaten alınmış." : "Kaydedilemedi: " + error.message, { id: toastId });
            setSaving(false); return;
        }
        setProfile({ ...profile, username: trimmed, display_name: editDisplayName.trim() || null, bio: editBio.trim() || null, social_links: Object.keys(cleanLinks).length > 0 ? cleanLinks : null });
        toast.success("Profil güncellendi.", { id: toastId });
        setSaving(false); setEditing(false);
    };

    const handleRoleSwitch = async (newRole: "member" | "creator") => {
        if (!profile) return;
        const supabase = createClient();
        const { error } = await supabase
            .from("profiles")
            .update({ role: newRole, updated_at: new Date().toISOString() })
            .eq("id", profile.id);
        if (error) { toast.error("Rol değiştirilemedi."); return; }
        setProfile({ ...profile, role: newRole });
        toast.success(newRole === "creator" ? "Üretici oldun!" : "İzleyiciye geçildi.");
    };

    const handleToggleSelfBadge = async (badgeId: string) => {
        if (!profile) return;
        const res = await fetch("/api/profile/self-badge", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ badgeId }),
        });
        const json = await res.json();
        if (!res.ok) { toast.error(json.error ?? "Rozet güncellenemedi."); return; }
        setProfile({ ...profile, badges: json.badges });
        toast.success(json.added ? "Rozet eklendi!" : "Rozet kaldırıldı.");
    };

    const handleDeleteAccount = async () => {
        if (!profile || deleteConfirm !== profile.username) return;
        setDeleting(true);
        const res = await fetch("/api/profile/delete", { method: "DELETE" });
        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            toast.error(json.error ?? "Hesap silinemedi.");
            setDeleting(false);
            return;
        }
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success("Hesabın silindi.");
        router.push("/");
        router.refresh();
    };

    const handleSignOut = async () => {
        setSigningOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success("Çıkış yapıldı.");
        router.push("/");
        router.refresh();
    };

    const roleConf = ROLE_CONFIG[profile.role] ?? ROLE_CONFIG.member;
    const joinDate = new Date(profile.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" });

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
                    {profile?.badges?.includes("admin") && (
                        <button onClick={() => router.push("/admin")}
                                className="flex items-center gap-1 text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-300 whitespace-nowrap"
                                style={{ color: "color-mix(in srgb, var(--danger) 75%, transparent)", border: "1px solid color-mix(in srgb, var(--danger) 15%, transparent)", background: "color-mix(in srgb, var(--danger) 6%, transparent)" }}>
                            <Zap size={11} strokeWidth={2} /> Admin
                        </button>
                    )}
                    <button onClick={handleSignOut} disabled={signingOut}
                            className="flex items-center gap-1.5 text-xs px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-300 disabled:opacity-50 whitespace-nowrap"
                            style={{ color: "color-mix(in srgb, var(--danger) 75%, transparent)", border: "1px solid color-mix(in srgb, var(--danger) 20%, transparent)", background: "color-mix(in srgb, var(--danger) 6%, transparent)" }}>
                        {signingOut
                            ? <span className="w-3 h-3 rounded-full border border-[color-mix(in_srgb,var(--danger)_30%,transparent)] border-t-red-400 animate-spin" />
                            : <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h3M9 9l3-3-3-3M12 6.5H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>}
                        <span className="hidden sm:inline">Çıkış Yap</span>
                    </button>
                </div>
            </nav>

            <div className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-4">

                {/* ── ANA PROFİL KARTI ── */}
                <div className="card rounded-2xl p-4 sm:p-8" style={{ }}>
                    <div className="h-[1px] -mt-4 sm:-mt-8 mb-4 sm:mb-8"
                         style={{ marginLeft: "-1rem", width: "calc(100% + 2rem)", background: "color-mix(in srgb, var(--accent) 35%, transparent)" }} />

                    {/* Avatar + bilgiler */}
                    <div className="flex items-start gap-5 mb-6">
                        <Avatar username={profile.username} size={72} />
                        <div className="flex-1 min-w-0">
                            {editing ? (
                                <div className="flex flex-col gap-2">
                                    <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)}
                                           placeholder="kullaniciadi" className="rounded-xl px-3 py-2 text-sm outline-none w-full"
                                           style={{ background: "var(--bg-2)", border: "1px solid color-mix(in srgb, var(--accent) 50%, transparent)", color: "var(--text-1)" }} />
                                    <input value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)}
                                           placeholder="Adın Soyadın (opsiyonel)" maxLength={60}
                                           className="rounded-xl px-3 py-2 text-sm outline-none w-full"
                                           style={{ background: "var(--bg-2)", border: "1px solid var(--accent-border)", color: "var(--text-1)" }} />
                                </div>
                            ) : (
                                <div className="mb-2">
                                    <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>
                                        @{profile.username}
                                    </h1>
                                    {profile.display_name && (
                                        <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                                            {profile.display_name}
                                        </p>
                                    )}
                                </div>
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
                                    style={{ color: "var(--accent-text)", border: "1px solid var(--accent-border)", background: "var(--accent-bg)" }}>
                                Düzenle
                            </button>
                        )}
                    </div>

                    {/* Bio */}
                    <div className="mb-6">
                        <p className="label-caps mb-2" style={{ color: "var(--text-4)" }}>Bio</p>
                        {editing ? (
                            <>
                                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)}
                                          placeholder="Kendinden bahset..." rows={3} maxLength={160}
                                          className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                                          style={{ background: "var(--bg-2)", border: "1px solid color-mix(in srgb, var(--accent) 50%, transparent)", color: "var(--text-1)" }} />
                                <p className="text-[11px] mt-1 text-right" style={{ color: "var(--text-4)" }}>{editBio.length}/160</p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm leading-relaxed" style={{ color: profile.bio ? "var(--text-2)" : "var(--text-4)" }}>
                                    {profile.bio || "Henüz bir bio eklenmedi."}
                                </p>
                                <SocialLinksDisplay links={profile.social_links ?? {}} />
                            </>
                        )}
                    </div>

                    {/* Sosyal Linkler — sadece düzenleme modunda */}
                    {editing && (
                        <div className="mb-6">
                            <p className="label-caps mb-3" style={{ color: "var(--text-4)" }}>Sosyal Linkler</p>
                            <div className="flex flex-col gap-2">
                                {SOCIAL_PLATFORMS.map(platform => (
                                    <div key={platform.id} className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                             style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)" }}>
                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ color: platform.color }}>
                                                <path d={platform.path} />
                                            </svg>
                                        </div>
                                        <input
                                            type="url"
                                            value={editSocialLinks[platform.id] ?? ""}
                                            onChange={e => setEditSocialLinks(prev => ({ ...prev, [platform.id]: e.target.value }))}
                                            placeholder={platform.placeholder}
                                            className="flex-1 rounded-xl px-3 py-2 text-xs outline-none"
                                            style={{ background: "var(--bg-2)", border: "1px solid var(--accent-border)", color: "var(--text-1)" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Katılım tarihi */}
                    <div className="pt-5" style={{ borderTop: "1px solid var(--border-3)" }}>
                        <p className="label-caps mb-1" style={{ color: "var(--text-4)" }}>Katılım</p>
                        <p className="text-sm" style={{ color: "var(--text-2)" }}>{joinDate}</p>
                    </div>

                    {/* Düzenleme butonları */}
                    {editing && (
                        <div className="flex gap-3 mt-6 pt-5" style={{ borderTop: "1px solid var(--border-3)" }}>
                            <button onClick={handleSave} disabled={saving}
                                    className="btn-primary flex-1">
                                {saving
                                    ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-[color-mix(in_srgb,var(--fg)_30%,transparent)] border-t-[var(--on-accent)] animate-spin" />Kaydediliyor...</span>
                                    : "Kaydet"}
                            </button>
                            <button onClick={() => { setEditing(false); setEditUsername(profile.username); setEditDisplayName(profile.display_name ?? ""); setEditBio(profile.bio ?? ""); setEditSocialLinks(profile.social_links ?? {}); }}
                                    className="px-6 py-3 rounded-xl text-sm transition-all duration-300"
                                    style={{ color: "var(--text-3)", border: "1px solid var(--border-2)", background: "var(--bg-3)" }}>
                                İptal
                            </button>
                        </div>
                    )}
                </div>

                {/* ── TOPLULUK TÜRÜ — member / creator ── */}
                <div className="card rounded-2xl p-6"
                     style={{ borderColor: roleConf.border }}>
                    <p className="label-caps mb-4" style={{ color: "var(--text-4)" }}>
                        Topluluk Türü
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                             style={{ background: "var(--bg-2)", border: `1px solid ${roleConf.border}`, color: roleConf.color }}>
                            <roleConf.icon size={20} strokeWidth={1.8} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-0.5">
                                <p className="text-base font-bold" style={{ color: roleConf.color }}>{roleConf.label}</p>
                                <span className="label-caps" style={{ color: "var(--text-4)" }}>{roleConf.sublabel}</span>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>{roleConf.desc}</p>
                        </div>

                        {profile.role === "member" ? (
                            <button onClick={() => handleRoleSwitch("creator")}
                                    className="shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 whitespace-nowrap"
                                    style={{ background: "var(--accent-bg-md)", border: "1px solid var(--accent-border)", color: "var(--accent-text)" }}>
                                Üretici Ol <ChevronRight size={13} className="inline" />
                            </button>
                        ) : (
                            <button onClick={() => handleRoleSwitch("member")}
                                    className="shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 whitespace-nowrap"
                                    style={{ background: "color-mix(in srgb, var(--info) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--info) 20%, transparent)", color: "color-mix(in srgb, var(--info) 90%, transparent)" }}>
                                İzleyiciye Dön
                            </button>
                        )}
                    </div>
                </div>

                {/* ── KAZANILAN ROZETLER ── */}
                <div className="card rounded-2xl p-6">
                    <p className="label-caps mb-4" style={{ color: "var(--text-4)" }}>
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
                                        <conf.icon size={16} strokeWidth={1.8} />
                                        <div>
                                            <p className="text-xs font-medium" style={{ color: conf.color }}>{conf.label}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-4 text-center">
                            <Award size={28} className="opacity-30" />
                            <p className="text-xs" style={{ color: "var(--text-4)" }}>
                                Henüz rozet kazanılmadı.
                            </p>
                            <p className="text-[11px]" style={{ color: "var(--text-5)" }}>
                                Rozetler toplulukta aktifleşerek kazanılır.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── İLGİ ROZETLERİ ── */}
                <div className="card rounded-2xl p-6">
                    <p className="label-caps mb-1" style={{ color: "var(--text-4)" }}>
                        İlgi Rozetleri
                    </p>
                    <p className="text-xs mb-4" style={{ color: "var(--text-5)" }}>
                        İlgi alanlarına uyan rozetleri kendine ekleyebilirsin.
                    </p>
                    <div className="flex flex-col gap-3">
                        {SELF_BADGES.map(({ id, desc }) => {
                            const conf = BADGE_CONFIG[id];
                            if (!conf) return null;
                            const active = profile.badges.includes(id);
                            return (
                                <div key={id} className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl transition-all duration-200"
                                     style={{ background: active ? conf.bg : "var(--bg-3)", border: `1px solid ${active ? conf.border : "var(--border-3)"}` }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                             style={{ background: active ? conf.bg : "var(--bg-2)", border: `1px solid ${active ? conf.border : "var(--border-2)"}`, color: active ? conf.color : "var(--text-4)" }}>
                                            <conf.icon size={17} strokeWidth={1.8} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold" style={{ color: active ? conf.color : "var(--text-2)" }}>{conf.label}</p>
                                            <p className="text-[11px]" style={{ color: "var(--text-5)" }}>{desc}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleToggleSelfBadge(id)}
                                            className="shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-200"
                                            style={active
                                                ? { background: "color-mix(in srgb, var(--danger) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--danger) 20%, transparent)", color: "color-mix(in srgb, var(--danger) 75%, transparent)" }
                                                : { background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}>
                                        {active ? "Kaldır" : "Al"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Postlar */}
                <ProfilPosts
                    posts={posts}
                    supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
                />

                {/* ── TEHLİKE BÖLGESİ ── */}
                <div className="card rounded-2xl p-6" style={{ borderColor: "color-mix(in srgb, var(--danger) 20%, transparent)" }}>
                    <p className="label-caps mb-1" style={{ color: "color-mix(in srgb, var(--danger) 50%, transparent)" }}>
                        Tehlike Bölgesi
                    </p>
                    <p className="text-xs mb-4" style={{ color: "var(--text-5)" }}>
                        Bu işlemler geri alınamaz.
                    </p>
                    <button
                        onClick={() => { setShowDeleteModal(true); setDeleteConfirm(""); setTimeout(() => deleteInputRef.current?.focus(), 80); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-300"
                        style={{ color: "color-mix(in srgb, var(--danger) 80%, transparent)", border: "1px solid color-mix(in srgb, var(--danger) 20%, transparent)", background: "color-mix(in srgb, var(--danger) 6%, transparent)" }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M2 3h9M5 3V2h3v1M3.5 3l.5 8h5l.5-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Hesabı Sil
                    </button>
                </div>

            </div>

            {/* ── SİLME ONAY MODALI ── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                     style={{ background: "color-mix(in srgb, var(--shade) 70%, transparent)" }}
                     onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}>
                    <div className="relative w-full max-w-sm rounded-2xl overflow-hidden"
                         style={{ background: "color-mix(in srgb, var(--surface-solid) 95%, transparent)", border: "1px solid color-mix(in srgb, var(--danger) 25%, transparent)", boxShadow: "0 12px 32px color-mix(in srgb, var(--shade) 18%, transparent)" }}>
                        <div className="h-[1px] w-full" style={{ background: "color-mix(in srgb, var(--danger) 35%, transparent)" }} />
                        <div className="p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                                     style={{ background: "color-mix(in srgb, var(--danger) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--danger) 25%, transparent)" }}>
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                        <path d="M9 2L16.5 15H1.5L9 2Z" stroke="color-mix(in srgb, var(--danger) 90%, transparent)" strokeWidth="1.4" strokeLinejoin="round"/>
                                        <path d="M9 7v4" stroke="color-mix(in srgb, var(--danger) 90%, transparent)" strokeWidth="1.4" strokeLinecap="round"/>
                                        <circle cx="9" cy="13" r="0.8" fill="color-mix(in srgb, var(--danger) 90%, transparent)"/>
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>Hesabı Sil</h2>
                                    <p className="text-xs" style={{ color: "var(--text-4)" }}>Bu işlem geri alınamaz.</p>
                                </div>
                            </div>

                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                                Profilin, postların ve tüm veriler kalıcı olarak silinecek.
                                Devam etmek için kullanıcı adını yaz:
                            </p>

                            <div className="flex flex-col gap-1.5">
                                <p className="text-[11px] font-medium tracking-wider" style={{ color: "color-mix(in srgb, var(--danger) 70%, transparent)" }}>
                                    @{profile.username}
                                </p>
                                <input
                                    ref={deleteInputRef}
                                    type="text"
                                    value={deleteConfirm}
                                    onChange={e => setDeleteConfirm(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter" && deleteConfirm === profile.username) handleDeleteAccount(); }}
                                    placeholder={profile.username}
                                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                                    style={{
                                        background: "color-mix(in srgb, var(--danger) 5%, transparent)",
                                        border: `1px solid ${deleteConfirm === profile.username ? "color-mix(in srgb, var(--danger) 50%, transparent)" : "color-mix(in srgb, var(--danger) 15%, transparent)"}`,
                                        color: "var(--text-1)",
                                    }}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirm !== profile.username || deleting}
                                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 disabled:cursor-not-allowed"
                                    style={{
                                        background: deleteConfirm === profile.username && !deleting ? "color-mix(in srgb, var(--danger) 85%, transparent)" : "color-mix(in srgb, var(--danger) 20%, transparent)",
                                        color: deleteConfirm === profile.username && !deleting ? "#fff" : "color-mix(in srgb, var(--danger) 40%, transparent)",
                                        boxShadow: deleteConfirm === profile.username && !deleting ? "0 4px 16px color-mix(in srgb, var(--danger) 30%, transparent)" : "none",
                                    }}>
                                    {deleting
                                        ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-[color-mix(in_srgb,var(--danger)_30%,transparent)] border-t-red-300 animate-spin" />Siliniyor...</span>
                                        : "Hesabı Kalıcı Olarak Sil"}
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleting}
                                    className="px-5 py-3 rounded-xl text-sm transition-all duration-300"
                                    style={{ color: "var(--text-3)", border: "1px solid var(--border-2)", background: "var(--bg-3)" }}>
                                    İptal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}