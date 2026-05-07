"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Film, Tv, BookOpen, Music, Star, Send, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import NotificationBell from "@/components/NotificationBell";

/* ── Tipler ──────────────────────────────────────────────────── */
type Category = "film" | "dizi" | "kitap" | "sarki";

interface ArchiveItem {
    id: string;
    category: Category;
    title: string;
    description: string | null;
    year: number | null;
    creator: string | null;
    created_by: string;
    created_at: string;
}

interface Comment {
    id: string;
    user_id: string;
    username: string;
    content: string;
    created_at: string;
}

interface Props {
    userId: string;
    username: string;
    isAdmin: boolean;
    item: ArchiveItem;
    comments: Comment[];
    avgRating: number | null;
    totalRatings: number;
    myRating: number | null;
}

/* ── Kategori konfigürasyonu ─────────────────────────────────── */
const CAT_CONFIG: Record<Category, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
    film:  { label: "Film",   icon: Film,     color: "rgba(167,139,250,0.9)", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.3)"  },
    dizi:  { label: "Dizi",   icon: Tv,       color: "rgba(96,165,250,0.9)",  bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.3)"  },
    kitap: { label: "Kitap",  icon: BookOpen, color: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.3)"  },
    sarki: { label: "Şarkı",  icon: Music,    color: "rgba(244,114,182,0.9)", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.3)" },
};

const CREATOR_LABEL: Record<Category, string> = {
    film:  "Yönetmen",
    dizi:  "Yapım",
    kitap: "Yazar",
    sarki: "Sanatçı",
};

/* ── Puan seçici ─────────────────────────────────────────────── */
function RatingPicker({ current, color, border, bg, onRate }: {
    current: number | null;
    color: string; border: string; bg: string;
    onRate: (r: number) => void;
}) {
    const [hovered, setHovered] = useState<number | null>(null);
    const display = hovered ?? current;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <button
                        key={n}
                        onMouseEnter={() => setHovered(n)}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => onRate(n)}
                        className="transition-all duration-100"
                        title={`${n} puan`}
                    >
                        <Star
                            size={18}
                            style={{
                                color: display != null && n <= display ? "rgba(252,211,77,0.9)" : "rgba(255,255,255,0.12)",
                                fill: display != null && n <= display ? "rgba(252,211,77,0.9)" : "none",
                                transition: "all 0.1s",
                                transform: hovered === n ? "scale(1.2)" : "scale(1)",
                            }}
                        />
                    </button>
                ))}
                {display != null && (
                    <span className="ml-2 text-sm font-bold" style={{ color: "rgba(252,211,77,0.9)" }}>
                        {display}<span className="text-xs font-normal" style={{ color: "rgba(255,255,255,0.3)" }}>/10</span>
                    </span>
                )}
            </div>
            {current != null && (
                <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Yıldıza tekrar tıklayarak puanını güncelleyebilirsin.
                </p>
            )}
        </div>
    );
}

/* ── Medya hero görseli ──────────────────────────────────────── */
function MediaHero({ item, cat }: { item: ArchiveItem; cat: typeof CAT_CONFIG[Category] }) {
    const Icon = cat.icon;
    const c = item.category;

    if (c === "film") return (
        <div style={{
            width: 140, height: 200, display: "flex", overflow: "hidden",
            borderRadius: "3px 8px 8px 3px",
            border: `1px solid ${cat.border}`,
            boxShadow: "6px 8px 32px rgba(0,0,0,0.7)",
            background: "linear-gradient(160deg, #0d0b22 0%, #160e38 100%)",
            flexShrink: 0,
        }}>
            <div style={{ width: 18, flexShrink: 0, background: "rgba(124,58,237,0.5)", borderRight: "1px solid rgba(124,58,237,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 8, color: "rgba(255,255,255,0.7)", fontWeight: 700, maxHeight: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "10px 10px 8px" }}>
                <div style={{ flex: 1, borderRadius: 4, background: cat.bg, border: `1px solid ${cat.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    <Icon size={40} style={{ color: cat.color, opacity: 0.5 }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "conic-gradient(from 0deg, #555, #bbb 15%, #777 30%, #ccc 45%, #666 60%, #bbb 75%, #555 90%, #aaa 100%)", border: "2px solid #2a2a2a", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#111" }} />
                    </div>
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>DVD</span>
                </div>
            </div>
        </div>
    );

    if (c === "dizi") return (
        <div style={{
            width: 200, height: 130, flexShrink: 0, borderRadius: 8,
            border: `1px solid ${cat.border}`,
            boxShadow: "6px 8px 32px rgba(0,0,0,0.7)",
            background: "linear-gradient(160deg, #0a0a14 0%, #111622 100%)",
            padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8,
        }}>
            <div style={{ background: cat.bg, border: `1px solid ${cat.border}`, borderRadius: 4, padding: "5px 8px" }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: cat.color, margin: 0 }}>{item.title}</p>
                {item.creator && <p style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>{item.creator}</p>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: "auto" }}>
                {/* Reels */}
                {[0, 1].map(i => (
                    <div key={i} style={{ width: 38, height: 38, borderRadius: "50%", background: "#1c1c1c", border: "2px solid #2a2a2a", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                        <div style={{ position: "absolute", inset: 3, borderRadius: "50%", border: "1px solid #333" }} />
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#222", border: "1px solid #3a3a3a" }} />
                        {[0, 60, 120].map(deg => (
                            <div key={deg} style={{ position: "absolute", width: 1, height: 9, background: "#333", top: "50%", left: "50%", transformOrigin: "top center", transform: `translateX(-50%) rotate(${deg}deg)` }} />
                        ))}
                    </div>
                )).reduce((acc, el, i) => i === 0 ? [el, <div key="tape" style={{ flex: 1, height: 16, background: "#080808", borderRadius: 2, border: "1px solid #222", margin: "0 4px" }} />] : [...acc, el], [] as React.ReactNode[])}
            </div>
        </div>
    );

    if (c === "kitap") return (
        <div style={{
            width: 130, height: 200, display: "flex", overflow: "hidden",
            borderRadius: "3px 8px 8px 3px",
            border: `1px solid ${cat.border}`,
            boxShadow: "-3px 3px 12px rgba(0,0,0,0.4), 6px 8px 32px rgba(0,0,0,0.7)",
            background: "linear-gradient(160deg, #051a10 0%, #0a2218 100%)",
            flexShrink: 0,
        }}>
            <div style={{ width: 20, flexShrink: 0, background: "rgba(52,211,153,0.45)", borderRight: "1px solid rgba(52,211,153,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: 8, color: "rgba(255,255,255,0.8)", fontWeight: 700, maxHeight: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</span>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "10px 10px 8px" }}>
                <div style={{ flex: 1, borderRadius: 4, background: cat.bg, border: `1px solid ${cat.border}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                    <Icon size={36} style={{ color: cat.color, opacity: 0.4 }} />
                </div>
                <p style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.3 }}>{item.title}</p>
                {item.creator && <p style={{ fontSize: 7.5, color: "rgba(52,211,153,0.6)", margin: "2px 0 0", fontStyle: "italic" }}>{item.creator}</p>}
            </div>
        </div>
    );

    // Plak
    return (
        <div style={{
            width: 160, height: 160, flexShrink: 0, borderRadius: "50%",
            boxShadow: "0 8px 36px rgba(0,0,0,0.8)",
            background: "conic-gradient(from 0deg, #111 0deg, #1a1a1a 3deg, #111 6deg, #181818 9deg, #111 12deg, #1a1a1a 15deg, #111 18deg, #191919 21deg, #111 24deg, #1a1a1a 27deg, #111 30deg, #181818 33deg, #111 36deg, #1a1a1a 39deg, #111 42deg, #191919 45deg, #111 48deg, #1a1a1a 51deg, #111 54deg, #181818 57deg, #111 60deg, #1a1a1a 180deg, #111 183deg, #1a1a1a 186deg, #111 360deg)",
            display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(244,114,182,0.3), rgba(244,114,182,0.08))",
                border: "1px solid rgba(244,114,182,0.4)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
            }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#111", border: "1px solid #444" }} />
                <p style={{ fontSize: 7, color: "rgba(255,255,255,0.85)", fontWeight: 700, textAlign: "center", lineHeight: 1.2, margin: 0, maxWidth: 42, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.title}</p>
            </div>
        </div>
    );
}

/* ── Ana bileşen ─────────────────────────────────────────────── */
export default function DetailClient({ userId, username, isAdmin, item, comments: initialComments, avgRating: initialAvg, totalRatings: initialTotal, myRating: initialMyRating }: Props) {
    const cat = CAT_CONFIG[item.category];
    const Icon = cat.icon;

    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [myRating, setMyRating] = useState<number | null>(initialMyRating);
    const [avg, setAvg] = useState<number | null>(initialAvg);
    const [total, setTotal] = useState(initialTotal);
    const [commentText, setCommentText] = useState("");
    const [sending, setSending] = useState(false);
    const [rating, setRating] = useState(false);

    /* Puan ver/güncelle */
    const handleRate = async (r: number) => {
        if (rating) return;
        if (r === myRating) return; // aynı puan
        setRating(true);
        const supabase = createClient();
        const { error } = await supabase.from("archive_ratings").upsert(
            { item_id: item.id, user_id: userId, rating: r },
            { onConflict: "item_id,user_id" }
        );
        if (error) { toast.error("Puan verilemedi."); setRating(false); return; }
        const prevRating = myRating;
        setMyRating(r);
        // Ortalamayı optimistik güncelle
        const newTotal = prevRating == null ? total + 1 : total;
        const prevSum = avg != null ? avg * total : 0;
        const newSum = prevRating != null ? prevSum - prevRating + r : prevSum + r;
        const newAvg = Math.round((newSum / newTotal) * 10) / 10;
        setAvg(newAvg);
        setTotal(newTotal);
        toast.success("Puanın kaydedildi ✦");
        setRating(false);
    };

    /* Yorum gönder */
    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setSending(true);
        const supabase = createClient();
        const { data, error } = await supabase.from("archive_comments").insert({
            item_id: item.id,
            user_id: userId,
            username,
            content: commentText.trim(),
        }).select().single();
        if (error) { toast.error("Yorum gönderilemedi."); setSending(false); return; }
        setComments(prev => [...prev, data as Comment]);
        setCommentText("");
        setSending(false);
    };

    /* Yorum sil (admin veya kendi yorumu) */
    const handleDeleteComment = async (commentId: string) => {
        const supabase = createClient();
        const { error } = await supabase.from("archive_comments").delete().eq("id", commentId);
        if (error) { toast.error("Silinemedi."); return; }
        setComments(prev => prev.filter(c => c.id !== commentId));
    };

    /* Item sil (sadece admin) */
    const handleDeleteItem = async () => {
        if (!confirm(`"${item.title}" arşivden silinsin mi?`)) return;
        const supabase = createClient();
        const { error } = await supabase.from("archive_items").delete().eq("id", item.id);
        if (error) { toast.error("Silinemedi."); return; }
        window.location.href = "/arsiv";
    };

    return (
        <div className="aurora-bg relative min-h-screen w-full overflow-hidden">
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />
            <div aria-hidden className="fixed inset-0 dot-grid opacity-[0.3] pointer-events-none" style={{ zIndex: 0 }} />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4">
                <NavbarBackdrop />
                <Link href="/arsiv" className="flex items-center gap-2 relative z-10"
                      style={{ color: "var(--text-4)", fontSize: 12 }}>
                    <ChevronLeft size={14} />
                    <span className="text-sm font-bold" style={{ color: "var(--text-3)" }}>bumedya</span>
                    <span className="text-sm font-bold" style={{ color: "var(--violet)" }}>.</span>
                    <span style={{ color: "var(--border-1)" }}>/</span>
                    <span style={{ color: "var(--text-3)" }}>Arşiv</span>
                </Link>
                <div className="relative z-10 flex items-center gap-2">
                    <NotificationBell userId={userId} />
                    <Link href="/profil"
                          className="text-xs px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 max-w-[80px] sm:max-w-none truncate"
                          style={{ color: "var(--violet-text)", border: "1px solid var(--violet-border)", background: "var(--violet-bg)" }}>
                        @{username}
                    </Link>
                </div>
            </nav>

            <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-20">

                {/* Hero */}
                <div className="flex gap-6 sm:gap-8 items-end mb-8 flex-wrap sm:flex-nowrap">
                    <MediaHero item={item} cat={cat} />

                    <div className="flex flex-col gap-3 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                 style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                                <Icon size={12} style={{ color: cat.color }} />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: cat.color }}>{cat.label}</span>
                        </div>

                        <h1 className="text-xl sm:text-2xl font-bold leading-tight" style={{ color: "var(--text-1)" }}>
                            {item.title}
                        </h1>

                        {(item.creator || item.year) && (
                            <div className="flex items-center gap-3 text-sm flex-wrap">
                                {item.creator && (
                                    <span style={{ color: "var(--text-3)" }}>
                                        <span style={{ color: "var(--text-5)", fontSize: 11 }}>{CREATOR_LABEL[item.category]} </span>
                                        {item.creator}
                                    </span>
                                )}
                                {item.year && (
                                    <span className="text-xs px-2 py-0.5 rounded-lg"
                                          style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-4)" }}>
                                        {item.year}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Rating gösterimi */}
                        <div className="flex items-center gap-3">
                            {avg != null ? (
                                <>
                                    <div className="flex items-center gap-1.5">
                                        <Star size={16} fill="rgba(252,211,77,0.9)" style={{ color: "rgba(252,211,77,0.9)" }} />
                                        <span className="text-lg font-bold" style={{ color: "rgba(252,211,77,0.9)" }}>{avg}</span>
                                        <span className="text-xs" style={{ color: "var(--text-5)" }}>/ 10</span>
                                    </div>
                                    <span className="text-xs" style={{ color: "var(--text-5)" }}>{total} puan</span>
                                </>
                            ) : (
                                <span className="text-xs" style={{ color: "var(--text-5)" }}>Henüz puanlanmamış</span>
                            )}
                        </div>

                        {item.description && (
                            <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                                {item.description}
                            </p>
                        )}

                        <p className="text-[10px]" style={{ color: "var(--text-5)" }}>
                            @{item.created_by} tarafından eklendi
                        </p>
                    </div>
                </div>

                {/* Puanlama bölümü */}
                <div className="card p-5 mb-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
                            {myRating != null ? "Puanın" : "Bumedya Puanı Ver"}
                        </p>
                        {rating && <Loader2 size={12} className="animate-spin" style={{ color: "var(--text-4)" }} />}
                    </div>
                    <RatingPicker
                        current={myRating}
                        color={cat.color}
                        border={cat.border}
                        bg={cat.bg}
                        onRate={handleRate}
                    />
                </div>

                {/* Yorumlar */}
                <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>
                        Yorumlar {comments.length > 0 && <span style={{ color: "var(--text-5)" }}>({comments.length})</span>}
                    </p>

                    {/* Yorum formu */}
                    <form onSubmit={handleComment} className="card p-4 flex gap-3 items-end">
                        <textarea
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Düşüncelerini yaz..."
                            rows={2}
                            maxLength={500}
                            className="flex-1 bg-transparent text-sm outline-none resize-none"
                            style={{ color: "var(--text-2)" }}
                        />
                        <button type="submit" disabled={sending || !commentText.trim()}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0"
                                style={{ background: cat.bg, border: `1px solid ${cat.border}`, color: cat.color, opacity: sending || !commentText.trim() ? 0.4 : 1 }}>
                            {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                            Gönder
                        </button>
                    </form>

                    {/* Yorum listesi */}
                    {comments.length === 0 ? (
                        <div className="card p-8 flex flex-col items-center gap-2">
                            <p className="text-sm" style={{ color: "var(--text-4)" }}>Henüz yorum yok.</p>
                            <p className="text-xs" style={{ color: "var(--text-5)" }}>İlk yorumu sen bırak!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {comments.map(c => (
                                <div key={c.id} className="card p-4 flex gap-3">
                                    <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                                         style={{ background: cat.bg, border: `1px solid ${cat.border}`, color: cat.color }}>
                                        {c.username[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>@{c.username}</span>
                                                <span className="text-[10px]" style={{ color: "var(--text-5)" }}>
                                                    {new Date(c.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                                                </span>
                                            </div>
                                            {(isAdmin || c.user_id === userId) && (
                                                <button onClick={() => handleDeleteComment(c.id)}
                                                        className="opacity-30 hover:opacity-70 transition-opacity"
                                                        style={{ color: "rgba(239,68,68,0.8)" }}>
                                                    <Trash2 size={11} />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>{c.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Admin silme */}
                {isAdmin && (
                    <div className="mt-8 pt-6 border-t flex justify-end" style={{ borderColor: "var(--border-3)" }}>
                        <button onClick={handleDeleteItem}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.6)" }}>
                            <Trash2 size={12} /> Arşivden Kaldır
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
