"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Zap, Shield, Palette, PenLine, BadgeCheck, Sparkles } from "lucide-react";
import type { ElementType } from "react";
import PageHeader from "@/components/PageHeader";

interface Profile {
    id: string;
    username: string;
    role: "member" | "creator";
    badges: string[];
    bio: string | null;
    created_at: string;
}

const BADGE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: ElementType }> = {
    admin:    { label: "Admin",   icon: Zap,        color: "color-mix(in srgb, var(--danger) 90%, transparent)",   bg: "color-mix(in srgb, var(--danger) 8%, transparent)",   border: "color-mix(in srgb, var(--danger) 22%, transparent)"   },
    editor:   { label: "Editör",  icon: Shield,     color: "color-mix(in srgb, var(--warn) 90%, transparent)",  bg: "color-mix(in srgb, var(--warn) 8%, transparent)",  border: "color-mix(in srgb, var(--warn) 22%, transparent)"  },
    artist:   { label: "Çizer",   icon: Palette,    color: "color-mix(in srgb, var(--pink) 90%, transparent)", bg: "color-mix(in srgb, var(--pink) 8%, transparent)", border: "color-mix(in srgb, var(--pink) 22%, transparent)" },
    writer:   { label: "Yazar",   icon: PenLine,    color: "color-mix(in srgb, var(--success) 90%, transparent)",  bg: "color-mix(in srgb, var(--success) 8%, transparent)",  border: "color-mix(in srgb, var(--success) 18%, transparent)"  },
    verified: { label: "Onaylı",  icon: BadgeCheck, color: "color-mix(in srgb, var(--info) 90%, transparent)", bg: "color-mix(in srgb, var(--info) 8%, transparent)",  border: "color-mix(in srgb, var(--info) 18%, transparent)"  },
    founder:  { label: "Kurucu",  icon: Sparkles,   color: "color-mix(in srgb, var(--warn) 90%, transparent)",  bg: "color-mix(in srgb, var(--warn) 6%, transparent)",  border: "color-mix(in srgb, var(--warn) 18%, transparent)"  },
};

export default function UyelerClient({ profiles }: { profiles: Profile[] }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "member" | "creator">("all");

    const filtered = useMemo(() => profiles.filter((p) => {
        const matchSearch = p.username.toLowerCase().includes(search.toLowerCase()) ||
            (p.bio ?? "").toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === "all" || p.role === filter;
        return matchSearch && matchFilter;
    }), [profiles, search, filter]);

    return (
        <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-8 pt-8 pb-16 flex flex-col gap-6">
            <PageHeader eyebrow="Topluluk" title="Üyeler" description={`${profiles.length} kişi bu topluluğa katıldı.`} className="!mb-0" />

            {/* Arama + Filtre */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                         style={{ color: "color-mix(in srgb, var(--fg) 22%, transparent)" }} viewBox="0 0 16 16" fill="none">
                        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
                        <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    <input value={search} onChange={(e) => setSearch(e.target.value)}
                           placeholder="İsim veya bio ara..."
                           className="input-field pl-9" />
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {([
                        { id: "all",     label: "Tümü"     },
                        { id: "member",  label: "İzleyici" },
                        { id: "creator", label: "Üretici"  },
                    ] as const).map((f) => (
                        <button key={f.id} onClick={() => setFilter(f.id)}
                                className="pill" aria-pressed={filter === f.id}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Liste */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filtered.map((profile) => {
                        const isCreator = profile.role === "creator";
                        const joinDate = new Date(profile.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "short" });
                        return (
                            <Link key={profile.id} href={`/profil/${profile.username}`}
                                  className="card flex items-start gap-4 p-4 transition-colors hover:!border-[var(--accent-border)]">

                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                                     style={{
                                         background: isCreator
                                             ? "linear-gradient(135deg, color-mix(in srgb, var(--accent) 30%, transparent), color-mix(in srgb, var(--accent) 18%, transparent))"
                                             : "linear-gradient(135deg, color-mix(in srgb, var(--info) 20%, transparent), color-mix(in srgb, var(--info) 12%, transparent))",
                                         border: `1px solid ${isCreator ? "color-mix(in srgb, var(--accent) 25%, transparent)" : "color-mix(in srgb, var(--info) 20%, transparent)"}`,
                                         color: "var(--text-1)",
                                     }}>
                                    {profile.username[0].toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
                                            @{profile.username}
                                        </span>
                                        <span className="chip"
                                              style={{
                                                  background: isCreator ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "color-mix(in srgb, var(--info) 8%, transparent)",
                                                  border: `1px solid ${isCreator ? "color-mix(in srgb, var(--accent) 25%, transparent)" : "color-mix(in srgb, var(--info) 18%, transparent)"}`,
                                                  color: isCreator ? "color-mix(in srgb, var(--accent) 90%, transparent)" : "color-mix(in srgb, var(--info) 80%, transparent)",
                                              }}>
                                            {isCreator ? "Üretici" : "İzleyici"}
                                        </span>
                                    </div>

                                    {profile.bio && (
                                        <p className="text-xs truncate" style={{ color: "color-mix(in srgb, var(--fg) 38%, transparent)" }}>{profile.bio}</p>
                                    )}

                                    {profile.badges.filter(b => b !== "authorized").length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {profile.badges.map((b) => {
                                                if (b === "authorized") return null;
                                                const conf = BADGE_CONFIG[b];
                                                if (!conf) return null;
                                                return (
                                                    <span key={b} className="chip"
                                                          style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}>
                                                        <conf.icon size={10} strokeWidth={2} /> {conf.label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <p className="text-[11px] mt-2" style={{ color: "color-mix(in srgb, var(--fg) 20%, transparent)" }}>{joinDate}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <span className="text-3xl" style={{ opacity: 0.15 }}>🔍</span>
                    <p className="text-sm" style={{ color: "color-mix(in srgb, var(--fg) 25%, transparent)" }}>Üye bulunamadı.</p>
                </div>
            )}
        </div>
    );
}
