"use client";

import { useState } from "react";
import { Film, Tv, BookOpen, Music, Star, Plus, X, ChevronUp, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import Link from "next/link";
import HomeNavLinks from "@/components/HomeNavLinks";
import NotificationBell from "@/components/NotificationBell";

type Category = "film" | "dizi" | "kitap" | "sarki";

const CATEGORIES: { id: Category; label: string; icon: React.ElementType; color: string; bg: string; border: string }[] = [
    { id: "film",  label: "Haftanın Filmi",  icon: Film,     color: "rgba(167,139,250,0.9)", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.25)"  },
    { id: "dizi",  label: "Haftanın Dizisi", icon: Tv,       color: "rgba(96,165,250,0.9)",  bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.25)"  },
    { id: "kitap", label: "Haftanın Kitabı", icon: BookOpen, color: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.25)"  },
    { id: "sarki", label: "Haftanın Şarkısı",icon: Music,    color: "rgba(244,114,182,0.9)", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.25)" },
];

interface Nomination {
    id: string;
    category: string;
    title: string;
    description: string | null;
    submitted_by: string;
    created_at: string;
}

interface Props {
    userId: string;
    username: string;
    isAdmin: boolean;
    weekStart: string;
    nominations: Nomination[];
    voteCounts: Record<string, number>;
    myVoteIds: string[];
}

function formatWeek(weekStart: string) {
    const d = new Date(weekStart);
    const end = new Date(d);
    end.setDate(d.getDate() + 6);
    const fmt = (dt: Date) => dt.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
    return `${fmt(d)} – ${fmt(end)}`;
}

export default function YildizlarClient({ userId, username, isAdmin: _isAdmin, weekStart, nominations: initialNominations, voteCounts: initialVoteCounts, myVoteIds: initialMyVoteIds }: Props) {
    const [activeTab, setActiveTab] = useState<Category>("film");
    const [nominations, setNominations] = useState<Nomination[]>(initialNominations);
    const [voteCounts, setVoteCounts] = useState<Record<string, number>>(initialVoteCounts);
    const [myVoteIds, setMyVoteIds] = useState<Set<string>>(new Set(initialMyVoteIds));
    const [voting, setVoting] = useState<string | null>(null);

    // Öneri formu
    const [showForm, setShowForm] = useState(false);
    const [formTitle, setFormTitle] = useState("");
    const [formDesc, setFormDesc] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const catNominations = nominations
        .filter(n => n.category === activeTab)
        .sort((a, b) => (voteCounts[b.id] ?? 0) - (voteCounts[a.id] ?? 0));

    const cat = CATEGORIES.find(c => c.id === activeTab)!;

    const handleVote = async (nominationId: string) => {
        if (voting) return;
        setVoting(nominationId);
        const supabase = createClient();
        const hasVoted = myVoteIds.has(nominationId);

        if (hasVoted) {
            const { error } = await supabase.from("weekly_votes").delete()
                .eq("nomination_id", nominationId).eq("user_id", userId);
            if (error) { toast.error("Oy kaldırılamadı."); }
            else {
                setMyVoteIds(prev => { const s = new Set(prev); s.delete(nominationId); return s; });
                setVoteCounts(prev => ({ ...prev, [nominationId]: Math.max((prev[nominationId] ?? 1) - 1, 0) }));
            }
        } else {
            const { error } = await supabase.from("weekly_votes").insert({ nomination_id: nominationId, user_id: userId });
            if (error) { toast.error("Oy kullanılamadı."); }
            else {
                setMyVoteIds(prev => new Set(prev).add(nominationId));
                setVoteCounts(prev => ({ ...prev, [nominationId]: (prev[nominationId] ?? 0) + 1 }));
            }
        }
        setVoting(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim()) return;
        setSubmitting(true);
        const supabase = createClient();
        const { error } = await supabase.from("weekly_nominations").insert({
            category: activeTab,
            title: formTitle.trim(),
            description: formDesc.trim() || null,
            submitted_by: username,
            user_id: userId,
            week_start: weekStart,
            status: "pending",
        });
        if (error) {
            toast.error("Öneri gönderilemedi.");
        } else {
            toast.success("Önerin gönderildi! Admin onayından sonra görünecek.");
            setFormTitle("");
            setFormDesc("");
            setShowForm(false);
        }
        setSubmitting(false);
    };

    return (
        <div className="aurora-bg relative min-h-screen w-full overflow-hidden">
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />
            <div aria-hidden className="fixed inset-0 dot-grid opacity-[0.3] pointer-events-none" style={{ zIndex: 0 }} />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4">
                <NavbarBackdrop />
                <Link href="/" className="group flex items-baseline gap-0.5 shrink-0 relative z-10">
                    <span className="text-sm font-bold" style={{ color: "var(--text-3)" }}>bumedya</span>
                    <span className="text-sm font-bold transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.9)]"
                          style={{ color: "var(--violet)" }}>.</span>
                </Link>
                <HomeNavLinks />
                <div className="relative z-10 flex items-center gap-2">
                    <NotificationBell userId={userId} />
                    <Link href="/profil"
                          className="text-xs px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 max-w-[80px] sm:max-w-none truncate"
                          style={{ color: "var(--violet-text)", border: "1px solid var(--violet-border)", background: "var(--violet-bg)" }}>
                        @{username}
                    </Link>
                </div>
            </nav>

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">

                {/* Başlık */}
                <div className="flex flex-col items-center text-center pt-4 pb-8 gap-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Star size={16} style={{ color: "rgba(252,211,77,0.8)" }} />
                        <span className="label-caps">Haftanın Yıldızları</span>
                        <Star size={16} style={{ color: "rgba(252,211,77,0.8)" }} />
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-4)" }}>{formatWeek(weekStart)}</p>
                </div>

                {/* Kategori tabları */}
                <div className="flex gap-2 overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: "none" }}>
                    {CATEGORIES.map(c => {
                        const Icon = c.icon;
                        const active = activeTab === c.id;
                        return (
                            <button key={c.id} onClick={() => { setActiveTab(c.id); setShowForm(false); }}
                                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
                                    style={{
                                        background: active ? c.bg : "var(--bg-2)",
                                        border: `1px solid ${active ? c.border : "var(--border-3)"}`,
                                        color: active ? c.color : "var(--text-3)",
                                    }}>
                                <Icon size={13} />
                                {c.label}
                            </button>
                        );
                    })}
                </div>

                {/* İçerik */}
                <div className="flex flex-col gap-3">

                    {/* Öneri butonu */}
                    <button onClick={() => setShowForm(v => !v)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium self-end transition-all duration-200"
                            style={{
                                background: showForm ? cat.bg : "var(--bg-2)",
                                border: `1px solid ${showForm ? cat.border : "var(--border-3)"}`,
                                color: showForm ? cat.color : "var(--text-3)",
                            }}>
                        {showForm ? <X size={13} /> : <Plus size={13} />}
                        {showForm ? "Vazgeç" : "Öneri sun"}
                    </button>

                    {/* Öneri formu */}
                    {showForm && (
                        <form onSubmit={handleSubmit} className="card p-5 flex flex-col gap-3">
                            <p className="text-xs font-semibold" style={{ color: cat.color }}>
                                {cat.label} önerisi
                            </p>
                            <input
                                value={formTitle}
                                onChange={e => setFormTitle(e.target.value)}
                                placeholder="Başlık (film/kitap/dizi/şarkı adı)"
                                maxLength={100}
                                className="w-full bg-transparent text-sm outline-none px-3 py-2.5 rounded-xl"
                                style={{ border: "1px solid var(--border-2)", color: "var(--text-2)" }}
                            />
                            <textarea
                                value={formDesc}
                                onChange={e => setFormDesc(e.target.value)}
                                placeholder="Kısa açıklama (isteğe bağlı)"
                                rows={2}
                                maxLength={200}
                                className="w-full bg-transparent text-sm outline-none px-3 py-2.5 rounded-xl resize-none"
                                style={{ border: "1px solid var(--border-2)", color: "var(--text-2)" }}
                            />
                            <button type="submit" disabled={submitting || !formTitle.trim()}
                                    className="self-end flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                                    style={{ background: cat.bg, border: `1px solid ${cat.border}`, color: cat.color, opacity: submitting || !formTitle.trim() ? 0.5 : 1 }}>
                                {submitting ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                Gönder
                            </button>
                        </form>
                    )}

                    {/* Nomination listesi */}
                    {catNominations.length === 0 ? (
                        <div className="card p-10 flex flex-col items-center gap-3">
                            <cat.icon size={28} style={{ color: cat.color, opacity: 0.3 }} />
                            <p className="text-sm" style={{ color: "var(--text-4)" }}>
                                Bu hafta henüz onaylanan öneri yok.
                            </p>
                            <p className="text-xs" style={{ color: "var(--text-5)" }}>
                                İlk öneriyi sen sun!
                            </p>
                        </div>
                    ) : (
                        catNominations.map((n, i) => {
                            const votes = voteCounts[n.id] ?? 0;
                            const voted = myVoteIds.has(n.id);
                            const isFirst = i === 0 && votes > 0;
                            return (
                                <div key={n.id} className="card p-4 flex items-center gap-4 transition-all duration-200"
                                     style={{ border: isFirst ? `1px solid ${cat.border}` : undefined }}>
                                    {/* Sıra */}
                                    <span className="text-lg font-bold w-6 text-center shrink-0"
                                          style={{ color: isFirst ? cat.color : "var(--text-5)" }}>
                                        {i + 1}
                                    </span>

                                    {/* İçerik */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-2)" }}>
                                                {n.title}
                                            </p>
                                            {isFirst && (
                                                <Star size={12} fill="currentColor" style={{ color: "rgba(252,211,77,0.8)", flexShrink: 0 }} />
                                            )}
                                        </div>
                                        {n.description && (
                                            <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-4)" }}>
                                                {n.description}
                                            </p>
                                        )}
                                        <p className="text-[10px] mt-1" style={{ color: "var(--text-5)" }}>
                                            @{n.submitted_by} tarafından önerildi
                                        </p>
                                    </div>

                                    {/* Oy butonu */}
                                    <button onClick={() => handleVote(n.id)}
                                            disabled={voting === n.id}
                                            className="shrink-0 flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200"
                                            style={{
                                                background: voted ? cat.bg : "var(--bg-2)",
                                                border: `1px solid ${voted ? cat.border : "var(--border-3)"}`,
                                                color: voted ? cat.color : "var(--text-4)",
                                            }}>
                                        {voting === n.id
                                            ? <Loader2 size={14} className="animate-spin" />
                                            : <ChevronUp size={14} />
                                        }
                                        <span className="text-xs font-bold">{votes}</span>
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
