"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Zap, Shield, Palette, PenLine, BadgeCheck, Sparkles, Layers, X, ChevronLeft, Inbox, Trash2, FileText, Check, Clock } from "lucide-react";
import type { ElementType } from "react";

/* ─── Tipler ────────────────────────────────────────────────── */
interface Profile {
    id: string;
    username: string;
    role: "member" | "creator";
    badges: string[];
    created_at: string;
}

/* ─── Rozet konfigürasyonu ──────────────────────────────────── */
type BadgeId = "authorized" | "admin" | "editor" | "artist" | "writer" | "verified" | "founder";

const BADGES: { id: BadgeId; label: string; icon: ElementType; color: string; bg: string; border: string; authorizedOnly: boolean }[] = [
    { id: "authorized", label: "Authorized", icon: Layers,     color: "rgba(255,255,255,0.9)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.2)",  authorizedOnly: true  },
    { id: "admin",      label: "Admin",       icon: Zap,        color: "rgba(239,68,68,0.9)",   bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   authorizedOnly: true  },
    { id: "editor",     label: "Editör",      icon: Shield,     color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  authorizedOnly: false },
    { id: "artist",     label: "Sanatçı",     icon: Palette,    color: "rgba(244,114,182,0.9)", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.3)", authorizedOnly: false },
    { id: "writer",     label: "Yazar",       icon: PenLine,    color: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)",  authorizedOnly: false },
    { id: "verified",   label: "Onaylı",      icon: BadgeCheck, color: "rgba(147,197,253,0.9)", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.3)",  authorizedOnly: false },
    { id: "founder",    label: "Kurucu",      icon: Sparkles,   color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.2)",  authorizedOnly: false },
];

/* ─── Rozet pill bileşeni ───────────────────────────────────── */
function BadgePill({ id }: { id: string }) {
    const conf = BADGES.find((b) => b.id === id);
    if (!conf) return null;
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}>
            <conf.icon size={10} strokeWidth={2} /> {conf.label}
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
        <div className="card rounded-2xl overflow-hidden transition-all duration-300">

            {/* Satır başlığı */}
            <div className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                 onClick={() => setExpanded(!expanded)}>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                     style={{
                         background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
                         border: "1px solid var(--violet-border)",
                         color: "var(--text-1)",
                     }}>
                    {profile.username[0].toUpperCase()}
                </div>

                {/* Bilgiler */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
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
                        <path d="M3 5l4 4 4-4" stroke="var(--text-4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Rozet yönetimi — expand olunca açılır */}
            {expanded && (
                <div className="px-5 pb-5 pt-1" style={{ borderTop: "1px solid var(--bg-2)" }}>
                    <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--text-4)" }}>
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
                                        background: hasIt ? badge.bg : "var(--bg-3)",
                                        border: `1px solid ${hasIt ? badge.border : "var(--border-2)"}`,
                                        color: hasIt ? badge.color : "var(--text-3)",
                                    }}
                                >
                                    <badge.icon size={11} strokeWidth={2} />
                                    {badge.label}
                                    {hasIt && (
                                        <X size={10} className="ml-1 opacity-60" />
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

interface Message {
    id: string;
    name: string;
    email: string;
    message: string;
    read: boolean;
    created_at: string;
}

/* ─── Mesajlar sekmesi ──────────────────────────────────────── */
function MessagesTab({ messages, setMessages }: { messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>> }) {
    const markRead = async (id: string) => {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase.from("messages").update({ read: true }).eq("id", id);
        setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    };

    const handleDelete = async (id: string) => {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase.from("messages").delete().eq("id", id);
        setMessages(prev => prev.filter(m => m.id !== id));
    };

    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Inbox size={32} className="opacity-10" />
                <p className="text-sm" style={{ color: "var(--text-4)" }}>Henüz mesaj yok.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {messages.map(msg => (
                <div key={msg.id}
                     className="rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all duration-200"
                     style={{
                         background: msg.read ? "var(--bg-3)" : "var(--violet-bg)",
                         border: `1px solid ${msg.read ? "var(--border-2)" : "var(--violet-border)"}`,
                     }}
                     onClick={() => !msg.read && markRead(msg.id)}>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{msg.name}</p>
                                {!msg.read && (
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--violet)" }} />
                                )}
                            </div>
                            <p className="text-xs" style={{ color: "var(--text-3)" }}>{msg.email}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <p className="text-[10px]" style={{ color: "var(--text-4)" }}>
                                {new Date(msg.created_at).toLocaleDateString("tr-TR")}
                            </p>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                                    className="p-1 rounded-lg hover:opacity-70 transition-opacity"
                                    style={{ color: "rgba(239,68,68,0.5)" }}>
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>{msg.message}</p>
                </div>
            ))}
        </div>
    );
}

/* ─── Ana admin client bileşeni ─────────────────────────────── */
interface Application {
    id: string;
    user_id: string;
    username: string;
    type: string;
    answers: Record<string, string>;
    status: "pending" | "approved" | "rejected";
    admin_note: string | null;
    created_at: string;
}

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
    topluluk_yk:  { label: "Topluluk YK",   emoji: "🏛"  },
    kulup_yk:     { label: "Kulüp YK",       emoji: "🛡"  },
    admin:        { label: "Admin",           emoji: "⚡"  },
    rozet_editor: { label: "Editör Rozeti",   emoji: "✏️" },
    rozet_cizer:  { label: "Çizer Rozeti",    emoji: "🎨" },
    rozet_yazar:  { label: "Yazar Rozeti",    emoji: "🖊️" },
    kulup_ac:     { label: "Kulüp Aç",        emoji: "🏫" },
};

const QUESTION_LABELS: Record<string, Record<string, string>> = {
    topluluk_yk:  { motivation: "Neden başvuruyor?", role: "Hangi alanda katkı?", contribution: "Ne katkı sağlayabilir?", vision: "Vizyonu", time: "Müsaitlik" },
    kulup_yk:     { university: "Üniversite & kulüp", motivation: "Neden başvuruyor?", event_idea: "Etkinlik fikri", content: "İçerik katkısı", time: "Müsaitlik" },
    admin:        { admin_type: "DC mi Web mi?", motivation: "Neden başvuruyor?", moderation: "Moderasyon yaklaşımı", technical: "Teknik geçmiş", availability: "Müsaitlik" },
    rozet_editor: { portfolio: "Portföy / çalışmalar", experience: "Deneyim", contribution: "Katkı planı" },
    rozet_cizer:  { portfolio: "Portföy / çalışmalar", style: "Tarz & araçlar", contribution: "Katkı planı" },
    rozet_yazar:  { portfolio: "Portföy / çalışmalar", genre: "Yazı türü", contribution: "Katkı planı" },
    kulup_ac:     { university: "Üniversite & şehir", team: "Ekip durumu", plan: "Etkinlik planı", motivation: "Motivasyon" },
};

function ApplicationsTab({ applications: initialApps }: { applications: Application[] }) {
    const [apps, setApps] = useState<Application[]>(initialApps);
    const [selected, setSelected] = useState<Application | null>(null);
    const [note, setNote] = useState("");
    const [processing, setProcessing] = useState(false);
    const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");

    const filtered = apps.filter(a => filterStatus === "all" || a.status === filterStatus);
    const pendingCount = apps.filter(a => a.status === "pending").length;

    const handleDecision = async (status: "approved" | "rejected") => {
        if (!selected) return;
        setProcessing(true);
        const supabase = createClient();
        const { error } = await supabase
            .from("applications")
            .update({ status, admin_note: note.trim() || null })
            .eq("id", selected.id);
        if (error) { toast.error("Güncellenemedi: " + error.message); setProcessing(false); return; }
        setApps(prev => prev.map(a => a.id === selected.id ? { ...a, status, admin_note: note.trim() || null } : a));
        toast.success(status === "approved" ? "Başvuru onaylandı ✓" : "Başvuru reddedildi");
        setSelected(null);
        setNote("");
        setProcessing(false);
    };

    if (selected) {
        const labels = QUESTION_LABELS[selected.type] ?? {};
        const typeInfo = TYPE_LABELS[selected.type];
        return (
            <div className="flex flex-col gap-4">
                <button onClick={() => { setSelected(null); setNote(""); }}
                        className="self-start flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all duration-200"
                        style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-3)" }}>
                    <ChevronLeft size={13} /> Geri
                </button>

                <div className="card p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{typeInfo?.emoji}</span>
                            <div>
                                <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>@{selected.username}</p>
                                <p className="text-xs" style={{ color: "var(--text-4)" }}>{typeInfo?.label} · {new Date(selected.created_at).toLocaleDateString("tr-TR")}</p>
                            </div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full ${selected.status === "pending" ? "bg-amber-500/10 border-amber-500/25 text-amber-400" : selected.status === "approved" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-red-500/10 border-red-500/25 text-red-400"} border`}>
                            {selected.status === "pending" ? "Beklemede" : selected.status === "approved" ? "Onaylandı" : "Reddedildi"}
                        </span>
                    </div>

                    {Object.entries(selected.answers).map(([key, val]) => (
                        <div key={key} className="flex flex-col gap-1.5">
                            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "var(--text-4)" }}>{labels[key] ?? key}</p>
                            <p className="text-sm leading-relaxed px-3 py-2.5 rounded-xl" style={{ background: "var(--bg-2)", color: "var(--text-2)", border: "1px solid var(--border-3)" }}>{val}</p>
                        </div>
                    ))}

                    {selected.status === "pending" && (
                        <div className="flex flex-col gap-3 pt-2 border-t" style={{ borderColor: "var(--border-3)" }}>
                            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "var(--text-4)" }}>Admin Notu (opsiyonel)</p>
                            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                                      placeholder="Onay/red sebebi, geri bildirim..."
                                      className="w-full resize-none rounded-xl px-4 py-2.5 text-sm outline-none"
                                      style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-1)" }} />
                            <div className="flex gap-3">
                                <button onClick={() => handleDecision("approved")} disabled={processing}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                                        style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", color: "rgba(52,211,153,0.9)" }}>
                                    <Check size={14} /> Onayla
                                </button>
                                <button onClick={() => handleDecision("rejected")} disabled={processing}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "rgba(239,68,68,0.8)" }}>
                                    <X size={14} /> Reddet
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2 flex-wrap">
                {(["pending", "all", "approved", "rejected"] as const).map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                            style={{ background: filterStatus === s ? "rgba(124,58,237,0.2)" : "var(--bg-2)", border: `1px solid ${filterStatus === s ? "rgba(124,58,237,0.4)" : "var(--border-2)"}`, color: filterStatus === s ? "var(--violet-text)" : "var(--text-3)" }}>
                        {s === "all" ? "Tümü" : s === "pending" ? `Bekleyen${pendingCount > 0 ? ` (${pendingCount})` : ""}` : s === "approved" ? "Onaylı" : "Reddedilen"}
                    </button>
                ))}
            </div>
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <FileText size={28} className="opacity-10" />
                    <p className="text-sm" style={{ color: "var(--text-4)" }}>Başvuru bulunamadı.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filtered.map(app => {
                        const typeInfo = TYPE_LABELS[app.type];
                        return (
                            <button key={app.id} onClick={() => { setSelected(app); setNote(app.admin_note ?? ""); }}
                                    className="card p-4 flex items-center gap-4 text-left w-full transition-all duration-150 hover:border-violet-500/20">
                                <span className="text-xl shrink-0">{typeInfo?.emoji ?? "📋"}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>@{app.username}</p>
                                    <p className="text-xs" style={{ color: "var(--text-4)" }}>{typeInfo?.label} · {new Date(app.created_at).toLocaleDateString("tr-TR")}</p>
                                </div>
                                <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full border ${app.status === "pending" ? "bg-amber-500/10 border-amber-500/25 text-amber-400" : app.status === "approved" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-red-500/10 border-red-500/25 text-red-400"}`}>
                                    {app.status === "pending" ? <Clock size={11} className="inline mr-1" /> : app.status === "approved" ? <Check size={11} className="inline mr-1" /> : <X size={11} className="inline mr-1" />}
                                    {app.status === "pending" ? "Bekliyor" : app.status === "approved" ? "Onaylı" : "Reddedildi"}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function AdminClient({ profiles: initialProfiles, myBadges, messages: initialMessages, applications: initialApplications }: {
    profiles: Profile[];
    myBadges: string[];
    messages: Message[];
    applications: Application[];
}) {
    const router = useRouter();
    const isAuthorized = myBadges.includes("authorized");
    const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [tab, setTab] = useState<"users" | "messages" | "applications">("users");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "member" | "creator">("all");
    const unreadCount = messages.filter(m => !m.read).length;
    const pendingAppsCount = initialApplications.filter(a => a.status === "pending").length;

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
        <div className="aurora-bg relative min-h-screen flex flex-col">
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5 border-b"
                 style={{ borderColor: "var(--border-3)" }}>
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push("/home")} className="text-xs px-2 py-1 rounded-lg transition-all duration-200"
                            style={{ color: "var(--text-4)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-2)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-4)")}>
                        <ChevronLeft size={15} />
                    </button>
                    <button onClick={() => router.push("/home")} className="flex items-baseline gap-0.5">
                        <span className="text-sm font-bold" style={{ color: "var(--text-3)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                    </button>
                    <span style={{ color: "var(--border-1)" }}>/</span>
                    <span className="text-sm font-medium flex items-center gap-1.5"
                          style={{ color: "rgba(239,68,68,0.8)" }}>
                        <Zap size={14} strokeWidth={2} /> Admin
                    </span>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-xs flex-wrap" style={{ color: "var(--text-4)" }}>
                    <span>{profiles.length} üye</span>
                    <span style={{ color: "var(--border-1)" }}>·</span>
                    <span>{viewerCount} izleyici</span>
                    <span style={{ color: "var(--border-1)" }}>·</span>
                    <span>{creatorCount} üretici</span>
                    <span style={{ color: "var(--border-1)" }}>·</span>
                    <span style={{ color: "rgba(251,191,36,0.6)" }}>{editorCount} editör</span>
                    <span style={{ color: "var(--border-1)" }}>·</span>
                    <span style={{ color: "rgba(52,211,153,0.6)" }}>{writerCount} yazar</span>
                    <span style={{ color: "var(--border-1)" }}>·</span>
                    <span style={{ color: "rgba(244,114,182,0.6)" }}>{artistCount} sanatçı</span>
                </div>
                <span className="sm:hidden text-xs" style={{ color: "var(--text-4)" }}>{profiles.length} üye</span>
            </nav>

            {/* İçerik */}
            <div className="relative z-10 max-w-3xl mx-auto w-full px-6 py-10 flex flex-col gap-6">

                {/* Sekmeler */}
                <div className="flex gap-2 flex-wrap">
                    {([
                        { id: "users",        label: "Kullanıcılar", badge: undefined as number | undefined },
                        { id: "messages",     label: "Mesajlar",     badge: unreadCount as number | undefined },
                        { id: "applications", label: "Başvurular",   badge: pendingAppsCount as number | undefined },
                    ] as const).map(({ id, label, badge }) => (
                        <button key={id} onClick={() => setTab(id)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                                style={{
                                    background: tab === id ? "rgba(124,58,237,0.2)" : "var(--bg-2)",
                                    border: `1px solid ${tab === id ? "rgba(124,58,237,0.4)" : "var(--border-2)"}`,
                                    color: tab === id ? "var(--violet-text)" : "var(--text-3)",
                                }}>
                            {label}
                            {badge != null && badge > 0 && (
                                <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
                                      style={{ background: "rgba(239,68,68,0.8)", color: "#fff" }}>{badge}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Mesajlar sekmesi */}
                {tab === "messages" && (
                    <MessagesTab messages={messages} setMessages={setMessages} />
                )}

                {/* Başvurular sekmesi */}
                {tab === "applications" && (
                    <ApplicationsTab applications={initialApplications} />
                )}

                {/* Kullanıcılar sekmesi başlık */}
                {tab === "users" && <div>
                    <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: "var(--text-1)" }}>
                        Kullanıcı Yönetimi
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-3)" }}>
                        Rozet ekle veya kaldır. Değişiklikler anında kaydedilir.
                    </p>
                </div>}

                {tab === "users" && <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                             style={{ color: "var(--text-4)" }} viewBox="0 0 16 16" fill="none">
                            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Kullanıcı ara..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                            style={{
                                background: "var(--bg-2)",
                                border: "1px solid var(--border-2)",
                                color: "var(--text-1)",
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
                                        background: filter === f.id ? "var(--violet-bg-md)" : "var(--bg-3)",
                                        border: `1px solid ${filter === f.id ? "var(--violet-border)" : "var(--border-2)"}`,
                                        color: filter === f.id ? "var(--violet-text)" : "var(--text-3)",
                                    }}>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>}

                {/* Kullanıcı listesi */}
                {tab === "users" && <div className="flex flex-col gap-2">
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
                            <p className="text-sm" style={{ color: "var(--text-4)" }}>Kullanıcı bulunamadı.</p>
                        </div>
                    )}
                </div>}

            </div>
        </div>
    );
}