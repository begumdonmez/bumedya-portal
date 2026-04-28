"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/* ─── Tipler ────────────────────────────────────────────────── */
interface Profile {
    id: string;
    username: string;
    role: "member" | "creator";
    badges: string[];
    created_at: string;
}

/* ─── Rozet konfigürasyonu ──────────────────────────────────── */
const BADGES = [
    { id: "authorized", label: "Authorized", icon: "◈",  color: "rgba(255,255,255,0.9)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.2)",  authorizedOnly: true  },
    { id: "admin",      label: "Admin",       icon: "⚡", color: "rgba(239,68,68,0.9)",   bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   authorizedOnly: false },
    { id: "editor",     label: "Editör",      icon: "🛡", color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  authorizedOnly: false },
    { id: "artist",     label: "Sanatçı",     icon: "🎨", color: "rgba(244,114,182,0.9)", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.3)", authorizedOnly: false },
    { id: "writer",     label: "Yazar",       icon: "📝", color: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)",  authorizedOnly: false },
    { id: "verified",   label: "Onaylı",      icon: "✓",  color: "rgba(147,197,253,0.9)", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.3)",  authorizedOnly: false },
    { id: "founder",    label: "Kurucu",      icon: "✦",  color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.2)",  authorizedOnly: false },
] as const;

type BadgeId = typeof BADGES[number]["id"];

/* ─── Rozet pill bileşeni ───────────────────────────────────── */
function BadgePill({ id }: { id: string }) {
    const conf = BADGES.find((b) => b.id === id);
    if (!conf) return null;
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}>
            {conf.icon} {conf.label}
        </span>
    );
}

/* ─── Kullanıcı satırı ──────────────────────────────────────── */
function UserRow({ profile, onBadgeToggle, isAuthorized }: {
    profile: Profile;
    onBadgeToggle: (userId: string, badge: BadgeId, current: string[]) => void;
    isAuthorized: boolean;
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="rounded-2xl overflow-hidden transition-all duration-300"
             style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>

            {/* Satır başlığı */}
            <div className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                 onClick={() => setExpanded(!expanded)}>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                     style={{
                         background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
                         border: "1px solid rgba(124,58,237,0.2)",
                         color: "#E0F2FE",
                     }}>
                    {profile.username[0].toUpperCase()}
                </div>

                {/* Bilgiler */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium" style={{ color: "#E0F2FE" }}>
                            @{profile.username}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{
                                  background: profile.role === "creator" ? "rgba(124,58,237,0.1)" : "rgba(59,130,246,0.08)",
                                  border: `1px solid ${profile.role === "creator" ? "rgba(124,58,237,0.25)" : "rgba(59,130,246,0.2)"}`,
                                  color: profile.role === "creator" ? "rgba(167,139,250,0.9)" : "rgba(147,197,253,0.8)",
                              }}>
                            {profile.role === "creator" ? "Üretici" : "İzleyici"}
                        </span>
                    </div>

                    {/* Mevcut rozetler */}
                    {profile.badges.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-1.5">
                            {profile.badges.map((b) => <BadgePill key={b} id={b} />)}
                        </div>
                    )}
                </div>

                {/* Expand ikonu */}
                <div className="shrink-0 transition-transform duration-300" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 5l4 4 4-4" stroke="rgba(224,242,254,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Rozet yönetimi — expand olunca açılır */}
            {expanded && (
                <div className="px-5 pb-5 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "rgba(224,242,254,0.25)" }}>
                        Rozet Yönetimi
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {BADGES.filter((b) => !b.authorizedOnly || isAuthorized).map((badge) => {
                            const hasIt = profile.badges.includes(badge.id);
                            return (
                                <button
                                    key={badge.id}
                                    onClick={() => onBadgeToggle(profile.id, badge.id, profile.badges)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                                    style={{
                                        background: hasIt ? badge.bg : "rgba(255,255,255,0.03)",
                                        border: `1px solid ${hasIt ? badge.border : "rgba(255,255,255,0.07)"}`,
                                        color: hasIt ? badge.color : "rgba(224,242,254,0.35)",
                                    }}
                                >
                                    <span>{badge.icon}</span>
                                    {badge.label}
                                    {hasIt && (
                                        <span className="ml-1 text-[10px] opacity-60">✕</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Ana admin client bileşeni ─────────────────────────────── */
export default function AdminClient({ profiles: initialProfiles, myBadges }: { profiles: Profile[]; myBadges: string[] }) {
    const router = useRouter();
    const isAuthorized = myBadges.includes("authorized");
    const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "member" | "creator">("all");

    /* Filtrelenmiş liste */
    const filtered = useMemo(() => {
        return profiles.filter((p) => {
            const matchSearch = p.username.toLowerCase().includes(search.toLowerCase());
            const matchFilter = filter === "all" || p.role === filter;
            return matchSearch && matchFilter;
        });
    }, [profiles, search, filter]);

    /* Rozet ekle/çıkar */
    const handleBadgeToggle = async (userId: string, badge: BadgeId, currentBadges: string[]) => {
        const hasBadge = currentBadges.includes(badge);
        const newBadges = hasBadge
            ? currentBadges.filter((b) => b !== badge)
            : [...currentBadges, badge];

        // Optimistic update
        setProfiles((prev) =>
            prev.map((p) => p.id === userId ? { ...p, badges: newBadges } : p)
        );

        const profile = profiles.find((p) => p.id === userId);
        const res = await fetch("/api/admin/badges", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId,
                badges: newBadges,
                addedBadge: !hasBadge ? badge : undefined,
                username: profile?.username,
            }),
        });

        if (!res.ok) {
            const { error } = await res.json();
            setProfiles((prev) =>
                prev.map((p) => p.id === userId ? { ...p, badges: currentBadges } : p)
            );
            toast.error("Rozet güncellenemedi: " + (error ?? res.statusText));
            return;
        }

        toast.success(hasBadge ? "Rozet kaldırıldı" : "Rozet verildi ✦");
        router.refresh();
    };

    const viewerCount  = profiles.filter((p) => p.role === "member").length;
    const creatorCount = profiles.filter((p) => p.role === "creator").length;
    const editorCount  = profiles.filter((p) => p.badges.includes("editor")).length;
    const writerCount  = profiles.filter((p) => p.badges.includes("writer")).length;
    const artistCount  = profiles.filter((p) => p.badges.includes("artist")).length;

    return (
        <div className="relative min-h-screen flex flex-col" style={{ background: "#0A0F1E" }}>
            {/* Atmosfer */}
            <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
                 style={{ background: "rgba(124,58,237,0.06)", filter: "blur(100px)" }} />
            <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.02]"
                 style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5 border-b"
                 style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push("/home")} className="text-xs px-2 py-1 rounded-lg transition-all duration-200"
                            style={{ color: "rgba(224,242,254,0.3)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(224,242,254,0.7)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(224,242,254,0.3)")}>
                        ←
                    </button>
                    <button onClick={() => router.push("/home")} className="flex items-baseline gap-0.5">
                        <span className="text-sm font-bold" style={{ color: "rgba(224,242,254,0.5)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                    </button>
                    <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
                    <span className="text-sm font-medium flex items-center gap-1.5"
                          style={{ color: "rgba(239,68,68,0.8)" }}>
                        <span>⚡</span> Admin
                    </span>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-xs flex-wrap" style={{ color: "rgba(224,242,254,0.3)" }}>
                    <span>{profiles.length} üye</span>
                    <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
                    <span>{viewerCount} izleyici</span>
                    <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
                    <span>{creatorCount} üretici</span>
                    <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
                    <span style={{ color: "rgba(251,191,36,0.6)" }}>{editorCount} editör</span>
                    <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
                    <span style={{ color: "rgba(52,211,153,0.6)" }}>{writerCount} yazar</span>
                    <span style={{ color: "rgba(255,255,255,0.1)" }}>·</span>
                    <span style={{ color: "rgba(244,114,182,0.6)" }}>{artistCount} sanatçı</span>
                </div>
                <span className="sm:hidden text-xs" style={{ color: "rgba(224,242,254,0.3)" }}>{profiles.length} üye</span>
            </nav>

            {/* İçerik */}
            <div className="relative z-10 max-w-3xl mx-auto w-full px-6 py-10 flex flex-col gap-6">

                {/* Başlık */}
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: "#E0F2FE" }}>
                        Kullanıcı Yönetimi
                    </h1>
                    <p className="text-sm" style={{ color: "rgba(224,242,254,0.35)" }}>
                        Rozet ekle veya kaldır. Değişiklikler anında kaydedilir.
                    </p>
                </div>

                {/* Arama + Filtre */}
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                             style={{ color: "rgba(224,242,254,0.25)" }} viewBox="0 0 16 16" fill="none">
                            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Kullanıcı ara..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                            style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                color: "#E0F2FE",
                            }}
                        />
                    </div>

                    {/* Filtre butonları */}
                    <div className="flex gap-1.5">
                        {([
                            { id: "all",     label: "Tümü"    },
                            { id: "member",  label: "İzleyici" },
                            { id: "creator", label: "Üretici"  },
                        ] as const).map((f) => (
                            <button key={f.id} onClick={() => setFilter(f.id)}
                                    className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                                    style={{
                                        background: filter === f.id ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                                        border: `1px solid ${filter === f.id ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.07)"}`,
                                        color: filter === f.id ? "rgba(167,139,250,0.9)" : "rgba(224,242,254,0.35)",
                                    }}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Kullanıcı listesi */}
                <div className="flex flex-col gap-2">
                    {filtered.length > 0 ? (
                        filtered.map((profile) => (
                            <UserRow
                                key={profile.id}
                                profile={profile}
                                onBadgeToggle={handleBadgeToggle}
                                isAuthorized={isAuthorized}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 gap-2">
                            <span className="text-2xl opacity-20">🔍</span>
                            <p className="text-sm" style={{ color: "rgba(224,242,254,0.25)" }}>Kullanıcı bulunamadı.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}