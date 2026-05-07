"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Zap, Shield, Palette, PenLine, BadgeCheck, Sparkles, Layers, X, ChevronLeft, Inbox, Trash2, FileText, Check, Clock, Music2, Plus, Star, Film, Tv, BookOpen, Music, MessageCircle, Headphones, Edit2, ScrollText } from "lucide-react";
import { POSITIONS } from "@/app/basvuru/positions";
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
type BadgeId = "authorized" | "admin" | "founder" | "verified" | "nakkas" | "kalemsor" | "muretti" | "katkici" | "cizer" | "yazar" | "editor" | "sosyal_kelebek";

const BADGES: { id: BadgeId; label: string; icon: ElementType; color: string; bg: string; border: string; authorizedOnly: boolean }[] = [
    /* ── Sistem ── */
    { id: "authorized", label: "Authorized", icon: Layers,     color: "rgba(255,255,255,0.9)", bg: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.2)",  authorizedOnly: true  },
    { id: "admin",      label: "Admin",       icon: Zap,        color: "rgba(239,68,68,0.9)",   bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.3)",   authorizedOnly: true  },
    { id: "founder",    label: "Kurucu",      icon: Sparkles,   color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.2)",  authorizedOnly: true  },
    { id: "verified",   label: "Onaylı",      icon: BadgeCheck, color: "rgba(147,197,253,0.9)", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.3)",  authorizedOnly: false },
    /* ── Kazanılan (form + onay) ── */
    { id: "nakkas",     label: "Nakkaş",      icon: Palette,    color: "rgba(244,114,182,0.9)", bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.3)", authorizedOnly: false },
    { id: "kalemsor",   label: "Kalemşor",    icon: PenLine,    color: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.3)",  authorizedOnly: false },
    { id: "muretti",    label: "Mürettip",    icon: Shield,     color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.3)",  authorizedOnly: false },
    { id: "katkici",    label: "Katkıcı",     icon: BadgeCheck, color: "rgba(147,197,253,0.9)", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", authorizedOnly: false },
    /* ── İlgi alanı (serbest) ── */
    { id: "cizer",          label: "Çizer",          icon: Palette,        color: "rgba(244,114,182,0.7)", bg: "rgba(244,114,182,0.06)", border: "rgba(244,114,182,0.2)", authorizedOnly: false },
    { id: "yazar",          label: "Yazar",          icon: PenLine,        color: "rgba(52,211,153,0.7)",  bg: "rgba(52,211,153,0.06)",  border: "rgba(52,211,153,0.2)",  authorizedOnly: false },
    { id: "editor",         label: "Editör",         icon: Shield,         color: "rgba(251,191,36,0.7)",  bg: "rgba(251,191,36,0.06)",  border: "rgba(251,191,36,0.2)",  authorizedOnly: false },
    /* ── Sosyal ── */
    { id: "sosyal_kelebek", label: "Sosyal Kelebek", icon: MessageCircle,  color: "rgba(251,146,60,0.9)",  bg: "rgba(251,146,60,0.08)",  border: "rgba(251,146,60,0.25)", authorizedOnly: false },
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
                        {BADGES.filter((b) => b.id !== "admin" && (!b.authorizedOnly || isAuthorized)).map((badge) => {
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
    rozet_editor: { label: "Mürettip",  emoji: "✏️" },
    rozet_cizer:  { label: "Nakkaş",    emoji: "🎨" },
    rozet_yazar:  { label: "Kalemşor", emoji: "🖊️" },
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
                            {(() => { const pos = POSITIONS.find(p => p.id === selected.type); const Icon = pos?.icon; return (
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                     style={{ background: pos?.bg ?? "var(--bg-2)", border: `1px solid ${pos?.border ?? "var(--border-2)"}` }}>
                                    {Icon ? <Icon size={17} style={{ color: pos?.color }} /> : <FileText size={17} style={{ color: "var(--text-3)" }} />}
                                </div>
                            ); })()}
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
                        const pos = POSITIONS.find(p => p.id === app.type);
                        const Icon = pos?.icon;
                        return (
                            <button key={app.id} onClick={() => { setSelected(app); setNote(app.admin_note ?? ""); }}
                                    className="card p-4 flex items-center gap-4 text-left w-full transition-all duration-150 hover:border-violet-500/20">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                     style={{ background: pos?.bg ?? "var(--bg-2)", border: `1px solid ${pos?.border ?? "var(--border-2)"}` }}>
                                    {Icon
                                        ? <Icon size={15} style={{ color: pos?.color }} />
                                        : <FileText size={15} style={{ color: "var(--text-3)" }} />}
                                </div>
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

/* ─── Playlist sekmesi ──────────────────────────────────────── */
interface SpotifyPlaylist { id: string; name: string; spotify_id: string; description: string | null; }

function PlaylistsTab() {
    const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [spotifyUrl, setSpotifyUrl] = useState("");
    const [description, setDescription] = useState("");
    const [adding, setAdding] = useState(false);

    /* İlk yükleme */
    useState(() => {
        (async () => {
            const { createClient } = await import("@/lib/supabase/client");
            const supabase = createClient();
            const { data } = await supabase.from("spotify_playlists").select("*").order("created_at", { ascending: true });
            setPlaylists(data ?? []);
            setLoading(false);
        })();
    });

    const extractId = (url: string) => {
        const match = url.match(/playlist\/([A-Za-z0-9]+)/);
        return match ? match[1] : url.trim();
    };

    const handleAdd = async () => {
        const spotify_id = extractId(spotifyUrl);
        if (!name.trim() || !spotify_id) { toast.error("Playlist adı ve Spotify linki gerekli."); return; }
        setAdding(true);
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase
            .from("spotify_playlists")
            .insert({ name: name.trim(), spotify_id, description: description.trim() || null })
            .select().single();
        if (error) { toast.error("Eklenemedi: " + error.message); setAdding(false); return; }
        setPlaylists(prev => [...prev, data]);
        setName(""); setSpotifyUrl(""); setDescription("");
        setAdding(false);
        toast.success("Playlist eklendi ✓");
    };

    const handleDelete = async (id: string) => {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { error } = await supabase.from("spotify_playlists").delete().eq("id", id);
        if (error) { toast.error("Silinemedi: " + error.message); return; }
        setPlaylists(prev => prev.filter(p => p.id !== id));
        toast.success("Playlist silindi");
    };

    return (
        <div className="flex flex-col gap-5">

            {/* Ekleme formu */}
            <div className="card p-5 flex flex-col gap-3">
                <p className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Yeni Playlist Ekle</p>
                <input
                    value={name} onChange={e => setName(e.target.value)}
                    placeholder="Playlist adı"
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-1)" }}
                />
                <input
                    value={spotifyUrl} onChange={e => setSpotifyUrl(e.target.value)}
                    placeholder="Spotify playlist linki veya ID"
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-1)" }}
                />
                <input
                    value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Açıklama (opsiyonel)"
                    className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-1)" }}
                />
                <button onClick={handleAdd} disabled={adding}
                        className="self-start flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50"
                        style={{ background: "rgba(29,185,84,0.12)", border: "1px solid rgba(29,185,84,0.3)", color: "rgba(29,185,84,0.9)" }}>
                    <Plus size={13} /> {adding ? "Ekleniyor..." : "Ekle"}
                </button>
            </div>

            {/* Mevcut listeler */}
            {loading ? (
                <p className="text-xs text-center py-8" style={{ color: "var(--text-4)" }}>Yükleniyor...</p>
            ) : playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Music2 size={28} className="opacity-10" />
                    <p className="text-sm" style={{ color: "var(--text-4)" }}>Henüz playlist eklenmemiş.</p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    {playlists.map((pl, i) => (
                        <div key={pl.id}
                             className="flex items-center gap-4 px-5 py-3.5"
                             style={{ borderBottom: i < playlists.length - 1 ? "1px solid var(--border-3)" : "none" }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                 style={{ background: "rgba(29,185,84,0.1)", border: "1px solid rgba(29,185,84,0.2)" }}>
                                <Music2 size={14} style={{ color: "rgba(29,185,84,0.8)" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>{pl.name}</p>
                                <p className="text-[10px] truncate" style={{ color: "var(--text-4)" }}>
                                    {pl.description ?? pl.spotify_id}
                                </p>
                            </div>
                            <button onClick={() => handleDelete(pl.id)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70 shrink-0"
                                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.7)" }}>
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Yıldızlar sekmesi ─────────────────────────────────────── */
interface WeeklyNomination {
    id: string;
    category: string;
    title: string;
    description: string | null;
    submitted_by: string;
    status: "pending" | "approved" | "rejected";
    admin_note: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    week_start: string;
    created_at: string;
}

interface AdminLog {
    id: string;
    admin_username: string;
    action: string;
    target_id: string;
    details: { title?: string; description?: string; category?: string; admin_note?: string; username?: string; added_badge?: string } | null;
    created_at: string;
}

const CAT_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
    film:  { label: "Film",   icon: Film,     color: "rgba(167,139,250,0.9)", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.25)"  },
    dizi:  { label: "Dizi",   icon: Tv,       color: "rgba(96,165,250,0.9)",  bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.25)"  },
    kitap: { label: "Kitap",  icon: BookOpen, color: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.25)"  },
    sarki: { label: "Şarkı",  icon: Music,    color: "rgba(244,114,182,0.9)", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.25)" },
};

function NominationsTab({ nominations: initialNoms }: { nominations: WeeklyNomination[] }) {
    const [noms, setNoms] = useState<WeeklyNomination[]>(initialNoms);
    const [filterStatus, setFilterStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending");
    const [processing, setProcessing] = useState<string | null>(null);

    // Düzenleme state
    const [editingId, setEditingId]     = useState<string | null>(null);
    const [editTitle, setEditTitle]     = useState("");
    const [editDesc, setEditDesc]       = useState("");
    const [editCat, setEditCat]         = useState("");

    // Reddetme state
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectNote, setRejectNote]   = useState("");

    const pendingCount = noms.filter(n => n.status === "pending").length;
    const filtered = noms.filter(n => filterStatus === "all" || n.status === filterStatus);

    const openEdit = (nom: WeeklyNomination) => {
        setRejectingId(null);
        setEditingId(nom.id);
        setEditTitle(nom.title);
        setEditDesc(nom.description ?? "");
        setEditCat(nom.category);
    };

    const openReject = (id: string) => {
        setEditingId(null);
        setRejectingId(id);
        setRejectNote("");
    };

    const apiCall = async (body: Record<string, unknown>) => {
        const res = await fetch("/api/admin/nominations", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            toast.error(json.error ?? "İşlem başarısız.");
            return false;
        }
        return true;
    };

    const handleEdit = async (id: string) => {
        if (!editTitle.trim()) { toast.error("Başlık boş olamaz."); return; }
        setProcessing(id);
        const ok = await apiCall({ action: "edit", id, title: editTitle, description: editDesc, category: editCat });
        if (ok) {
            setNoms(prev => prev.map(n => n.id === id
                ? { ...n, title: editTitle.trim(), description: editDesc.trim() || null, category: editCat }
                : n));
            toast.success("Öneri düzenlendi.");
            setEditingId(null);
        }
        setProcessing(null);
    };

    const handleApprove = async (id: string) => {
        setProcessing(id);
        const ok = await apiCall({ action: "approve", id });
        if (ok) {
            setNoms(prev => prev.map(n => n.id === id ? { ...n, status: "approved" } : n));
            toast.success("Öneri onaylandı ✓");
        }
        setProcessing(null);
    };

    const handleReject = async (id: string) => {
        setProcessing(id);
        const ok = await apiCall({ action: "reject", id, admin_note: rejectNote });
        if (ok) {
            setNoms(prev => prev.map(n => n.id === id
                ? { ...n, status: "rejected", admin_note: rejectNote.trim() || null }
                : n));
            toast.success("Öneri reddedildi.");
            setRejectingId(null);
        }
        setProcessing(null);
    };

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
                    <Star size={28} className="opacity-10" />
                    <p className="text-sm" style={{ color: "var(--text-4)" }}>Öneri bulunamadı.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filtered.map(nom => {
                        const cat = CAT_CONFIG[nom.category] ?? CAT_CONFIG.film;
                        const CatIcon = cat.icon;
                        const isEditing   = editingId === nom.id;
                        const isRejecting = rejectingId === nom.id;
                        const busy        = processing === nom.id;
                        return (
                            <div key={nom.id} className="card overflow-hidden">
                                {/* Ana satır */}
                                <div className="p-4 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                         style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                                        <CatIcon size={15} style={{ color: cat.color }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>{nom.title}</p>
                                        {nom.description && (
                                            <p className="text-xs truncate" style={{ color: "var(--text-4)" }}>{nom.description}</p>
                                        )}
                                        <p className="text-[10px] mt-0.5" style={{ color: "var(--text-5)" }}>
                                            @{nom.submitted_by} · {cat.label} · {nom.week_start}
                                        </p>
                                    </div>
                                    {nom.status === "pending" ? (
                                        <div className="flex gap-1.5 shrink-0">
                                            <button onClick={() => isEditing ? setEditingId(null) : openEdit(nom)} disabled={busy}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 disabled:opacity-50"
                                                    style={{ background: isEditing ? "rgba(251,191,36,0.15)" : "var(--bg-2)", border: `1px solid ${isEditing ? "rgba(251,191,36,0.4)" : "var(--border-2)"}`, color: isEditing ? "rgba(251,191,36,0.9)" : "var(--text-3)" }}>
                                                <Edit2 size={11} /> Düzenle
                                            </button>
                                            <button onClick={() => isRejecting ? setRejectingId(null) : openReject(nom.id)} disabled={busy}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50"
                                                    style={{ background: isRejecting ? "rgba(239,68,68,0.15)" : "rgba(239,68,68,0.06)", border: `1px solid ${isRejecting ? "rgba(239,68,68,0.4)" : "rgba(239,68,68,0.2)"}`, color: "rgba(239,68,68,0.8)" }}>
                                                <X size={11} /> Reddet
                                            </button>
                                            <button onClick={() => handleApprove(nom.id)} disabled={busy}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50"
                                                    style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "rgba(52,211,153,0.9)" }}>
                                                {busy ? <span className="w-3 h-3 rounded-full border border-emerald-400/30 border-t-emerald-400 animate-spin" /> : <Check size={11} />}
                                                Onayla
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <span className={`text-xs px-2.5 py-1 rounded-full border ${nom.status === "approved" ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" : "bg-red-500/10 border-red-500/25 text-red-400"}`}>
                                                {nom.status === "approved" ? <Check size={11} className="inline mr-1" /> : <X size={11} className="inline mr-1" />}
                                                {nom.status === "approved" ? "Onaylı" : "Reddedildi"}
                                            </span>
                                            {nom.reviewed_by && (
                                                <span className="text-[10px]" style={{ color: "var(--text-5)" }}>@{nom.reviewed_by}</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Reddet notu — rejected ise göster */}
                                {nom.status === "rejected" && nom.admin_note && (
                                    <div className="px-4 pb-3 pt-0">
                                        <p className="text-xs px-3 py-2 rounded-xl italic"
                                           style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", color: "rgba(239,68,68,0.7)" }}>
                                            "{nom.admin_note}"
                                        </p>
                                    </div>
                                )}

                                {/* Düzenleme formu */}
                                {isEditing && (
                                    <div className="px-4 pb-4 pt-1 flex flex-col gap-2 border-t" style={{ borderColor: "rgba(251,191,36,0.15)", background: "rgba(251,191,36,0.03)" }}>
                                        <p className="text-[10px] tracking-widest uppercase mt-1" style={{ color: "rgba(251,191,36,0.7)" }}>Düzenleme</p>
                                        <select value={editCat} onChange={e => setEditCat(e.target.value)}
                                                className="rounded-xl px-3 py-2 text-xs outline-none"
                                                style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-1)" }}>
                                            {Object.entries(CAT_CONFIG).map(([k, v]) => (
                                                <option key={k} value={k}>{v.label}</option>
                                            ))}
                                        </select>
                                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                               placeholder="Başlık" className="rounded-xl px-3 py-2 text-sm outline-none"
                                               style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-1)" }} />
                                        <input value={editDesc} onChange={e => setEditDesc(e.target.value)}
                                               placeholder="Açıklama (opsiyonel)" className="rounded-xl px-3 py-2 text-xs outline-none"
                                               style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-1)" }} />
                                        <div className="flex gap-2 mt-1">
                                            <button onClick={() => handleEdit(nom.id)} disabled={busy}
                                                    className="flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                                    style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.4)", color: "rgba(251,191,36,0.9)" }}>
                                                {busy ? <span className="w-3 h-3 rounded-full border border-yellow-400/30 border-t-yellow-400 animate-spin" /> : <Check size={11} />}
                                                Kaydet
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="px-4 py-1.5 rounded-xl text-xs transition-all"
                                                    style={{ color: "var(--text-4)", border: "1px solid var(--border-2)", background: "var(--bg-3)" }}>
                                                İptal
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Ret nedeni formu */}
                                {isRejecting && (
                                    <div className="px-4 pb-4 pt-1 flex flex-col gap-2 border-t" style={{ borderColor: "rgba(239,68,68,0.15)", background: "rgba(239,68,68,0.03)" }}>
                                        <p className="text-[10px] tracking-widest uppercase mt-1" style={{ color: "rgba(239,68,68,0.7)" }}>Ret Nedeni</p>
                                        <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)}
                                                  placeholder="Opsiyonel — örn. 'Bu içerik uygun değil.'"
                                                  rows={2} maxLength={300}
                                                  className="rounded-xl px-3 py-2 text-xs outline-none resize-none"
                                                  style={{ background: "var(--bg-2)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--text-1)" }} />
                                        <div className="flex gap-2 mt-1">
                                            <button onClick={() => handleReject(nom.id)} disabled={busy}
                                                    className="flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                                    style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "rgba(239,68,68,0.9)" }}>
                                                {busy ? <span className="w-3 h-3 rounded-full border border-red-400/30 border-t-red-400 animate-spin" /> : <X size={11} />}
                                                Reddi Onayla
                                            </button>
                                            <button onClick={() => setRejectingId(null)} className="px-4 py-1.5 rounded-xl text-xs transition-all"
                                                    style={{ color: "var(--text-4)", border: "1px solid var(--border-2)", background: "var(--bg-3)" }}>
                                                İptal
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ─── Log sekmesi ───────────────────────────────────────────── */
const ACTION_LABELS: Record<string, { label: string; color: string }> = {
    nomination_approved: { label: "Öneri Onaylandı",  color: "rgba(52,211,153,0.9)"  },
    nomination_rejected: { label: "Öneri Reddedildi", color: "rgba(239,68,68,0.85)"  },
    nomination_edited:   { label: "Öneri Düzenlendi", color: "rgba(251,191,36,0.9)"  },
    badge_updated:       { label: "Rozet Güncellendi", color: "rgba(167,139,250,0.9)" },
};

function LogsTab({ logs }: { logs: AdminLog[] }) {
    if (logs.length === 0) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ScrollText size={28} className="opacity-10" />
            <p className="text-sm" style={{ color: "var(--text-4)" }}>Henüz log kaydı yok.</p>
        </div>
    );
    return (
        <div className="flex flex-col gap-2">
            {logs.map(log => {
                const al = ACTION_LABELS[log.action] ?? { label: log.action, color: "var(--text-3)" };
                const d = log.details;
                return (
                    <div key={log.id} className="card p-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>
                                {d?.title ?? (d?.username ? `@${d.username}` : "—")}
                            </p>
                            {d?.added_badge && (
                                <p className="text-xs truncate" style={{ color: "rgba(167,139,250,0.7)" }}>
                                    +{d.added_badge}
                                </p>
                            )}
                            {d?.admin_note && (
                                <p className="text-xs italic truncate" style={{ color: "rgba(239,68,68,0.65)" }}>
                                    "{d.admin_note}"
                                </p>
                            )}
                            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-5)" }}>
                                @{log.admin_username} · {new Date(log.created_at).toLocaleString("tr-TR")}
                            </p>
                        </div>
                        <span className="shrink-0 text-xs px-2.5 py-1 rounded-full border whitespace-nowrap"
                              style={{ color: al.color, background: al.color.replace(/[\d.]+\)$/, "0.08)"), borderColor: al.color.replace(/[\d.]+\)$/, "0.25)") }}>
                            {al.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function AdminClient({ profiles: initialProfiles, myBadges, messages: initialMessages, applications: initialApplications, nominations: initialNominations, logs: initialLogs }: {
    profiles: Profile[];
    myBadges: string[];
    messages: Message[];
    applications: Application[];
    nominations: WeeklyNomination[];
    logs: AdminLog[];
}) {
    const router = useRouter();
    const isAuthorized = myBadges.includes("authorized");
    const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [tab, setTab] = useState<"users" | "messages" | "applications" | "playlists" | "nominations" | "logs">("users");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "member" | "creator">("all");
    const unreadCount = messages.filter(m => !m.read).length;
    const pendingAppsCount = initialApplications.filter(a => a.status === "pending").length;
    const pendingNomCount = initialNominations.filter(n => n.status === "pending").length;

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
        if (badge === "admin") return; // admin yetkisi buradan değiştirilemez
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
                        { id: "nominations",  label: "Yıldızlar",    badge: pendingNomCount as number | undefined },
                        { id: "playlists",    label: "Playlist",     badge: undefined as number | undefined },
                        { id: "logs",         label: "Loglar",       badge: undefined as number | undefined },
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

                {/* Yıldızlar sekmesi */}
                {tab === "nominations" && <NominationsTab nominations={initialNominations} />}

                {/* Loglar sekmesi */}
                {tab === "logs" && <LogsTab logs={initialLogs} />}

                {/* Playlist sekmesi */}
                {tab === "playlists" && <PlaylistsTab />}

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