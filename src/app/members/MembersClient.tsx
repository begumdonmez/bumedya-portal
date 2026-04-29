"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Zap, Shield, Palette, PenLine, BadgeCheck, Sparkles } from "lucide-react";
import type { ElementType } from "react";

interface Profile {
    id: string;
    username: string;
    role: "member" | "creator";
    badges: string[];
    bio: string | null;
    created_at: string;
}

const BADGE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: ElementType }> = {
    admin:    { label: "Admin",   icon: Zap,        color: "rgba(239,68,68,0.9)",   bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.22)"   },
    editor:   { label: "Editör",  icon: Shield,     color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.22)"  },
    artist:   { label: "Çizer",   icon: Palette,    color: "rgba(244,114,182,0.9)", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.22)" },
    writer:   { label: "Yazar",   icon: PenLine,    color: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.18)"  },
    verified: { label: "Onaylı",  icon: BadgeCheck, color: "rgba(147,197,253,0.9)", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.18)"  },
    founder:  { label: "Kurucu",  icon: Sparkles,   color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.06)",  border: "rgba(251,191,36,0.18)"  },
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
        <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-6">

            <div>
                <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "#F0F9FF" }}>Üyeler</h1>
                <p className="text-sm" style={{ color: "rgba(240,249,255,0.35)" }}>{profiles.length} kişi bu topluluğa katıldı</p>
            </div>

            {/* Arama + Filtre */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                         style={{ color: "rgba(240,249,255,0.22)" }} viewBox="0 0 16 16" fill="none">
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
                                className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                                style={{
                                    background: filter === f.id ? "rgba(124,58,237,0.14)" : "rgba(255,255,255,0.03)",
                                    border: `1px solid ${filter === f.id ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.08)"}`,
                                    color: filter === f.id ? "rgba(167,139,250,0.95)" : "rgba(240,249,255,0.35)",
                                }}>
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
                                  className="card flex items-start gap-4 p-4 transition-all duration-200"
                                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.28)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}>

                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                                     style={{
                                         background: isCreator
                                             ? "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(167,139,250,0.18))"
                                             : "linear-gradient(135deg, rgba(37,99,235,0.2), rgba(147,197,253,0.12))",
                                         border: `1px solid ${isCreator ? "rgba(124,58,237,0.25)" : "rgba(59,130,246,0.2)"}`,
                                         color: "#F0F9FF",
                                     }}>
                                    {profile.username[0].toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-sm font-semibold" style={{ color: "#F0F9FF" }}>
                                            @{profile.username}
                                        </span>
                                        <span className="chip"
                                              style={{
                                                  background: isCreator ? "rgba(124,58,237,0.1)" : "rgba(37,99,235,0.08)",
                                                  border: `1px solid ${isCreator ? "rgba(124,58,237,0.25)" : "rgba(59,130,246,0.18)"}`,
                                                  color: isCreator ? "rgba(167,139,250,0.9)" : "rgba(147,197,253,0.8)",
                                              }}>
                                            {isCreator ? "Üretici" : "İzleyici"}
                                        </span>
                                    </div>

                                    {profile.bio && (
                                        <p className="text-xs truncate" style={{ color: "rgba(240,249,255,0.38)" }}>{profile.bio}</p>
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

                                    <p className="text-[10px] mt-2" style={{ color: "rgba(240,249,255,0.2)" }}>{joinDate}</p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <span className="text-3xl" style={{ opacity: 0.15 }}>🔍</span>
                    <p className="text-sm" style={{ color: "rgba(240,249,255,0.25)" }}>Üye bulunamadı.</p>
                </div>
            )}
        </div>
    );
}
