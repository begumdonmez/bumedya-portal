"use client";

import { useState } from "react";
import { Film, Tv, BookOpen, Music, Star, Send, Loader2, Trash2, Pencil, X, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";

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
    film:  { label: "Film",   icon: Film,     color: "color-mix(in srgb, var(--accent) 90%, transparent)", bg: "color-mix(in srgb, var(--accent) 8%, transparent)",  border: "color-mix(in srgb, var(--accent) 30%, transparent)"  },
    dizi:  { label: "Dizi",   icon: Tv,       color: "color-mix(in srgb, var(--info) 90%, transparent)",  bg: "color-mix(in srgb, var(--info) 8%, transparent)",  border: "color-mix(in srgb, var(--info) 30%, transparent)"  },
    kitap: { label: "Kitap",  icon: BookOpen, color: "color-mix(in srgb, var(--success) 90%, transparent)",  bg: "color-mix(in srgb, var(--success) 8%, transparent)",  border: "color-mix(in srgb, var(--success) 30%, transparent)"  },
    sarki: { label: "Şarkı",  icon: Music,    color: "color-mix(in srgb, var(--pink) 90%, transparent)", bg: "color-mix(in srgb, var(--pink) 8%, transparent)", border: "color-mix(in srgb, var(--pink) 30%, transparent)" },
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
                                color: display != null && n <= display ? "color-mix(in srgb, var(--warn) 90%, transparent)" : "color-mix(in srgb, var(--fg) 12%, transparent)",
                                fill: display != null && n <= display ? "color-mix(in srgb, var(--warn) 90%, transparent)" : "none",
                                transition: "all 0.1s",
                                transform: hovered === n ? "scale(1.2)" : "scale(1)",
                            }}
                        />
                    </button>
                ))}
                {display != null && (
                    <span className="ml-2 text-sm font-bold" style={{ color: "color-mix(in srgb, var(--warn) 90%, transparent)" }}>
                        {display}<span className="text-xs font-normal" style={{ color: "color-mix(in srgb, var(--fg) 30%, transparent)" }}>/10</span>
                    </span>
                )}
            </div>
            {current != null && (
                <p className="text-[11px]" style={{ color: "color-mix(in srgb, var(--fg) 35%, transparent)" }}>
                    Yıldıza tekrar tıklayarak puanını güncelleyebilirsin.
                </p>
            )}
        </div>
    );
}

/* ── Medya hero görseli ──────────────────────────────────────── */
/** Arşiv kaydının büyük bilet görünümü — liste sayfasındaki koçan kartın dikey hali. */
function MediaHero({ item, cat }: { item: ArchiveItem; cat: typeof CAT_CONFIG[Category] }) {
    const Icon = cat.icon;
    return (
        <div className="card relative flex flex-col w-[150px] h-[210px] shrink-0 overflow-hidden -rotate-2">
            <div className="flex items-center justify-between px-3 py-2" style={{ background: cat.bg, borderBottom: "2px dashed var(--border-1)" }}>
                <Icon size={14} style={{ color: cat.color }} />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: cat.color }}>{cat.label}</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
                <span className="font-display text-7xl leading-none" style={{ color: "var(--text-1)" }}>
                    {item.title.trim().charAt(0).toLocaleUpperCase("tr-TR")}
                </span>
            </div>
            <div className="px-3 pb-2.5 flex items-center justify-between font-mono text-[10px]" style={{ color: "var(--text-4)" }}>
                <span>BUMEDYA ARŞİVİ</span>
                <span>{item.year ?? "—"}</span>
            </div>
            <span aria-hidden className="absolute -left-[7px] top-[34px] w-3 h-3 rounded-full" style={{ background: "var(--paper)", border: "1px solid var(--border-1)" }} />
            <span aria-hidden className="absolute -right-[7px] top-[34px] w-3 h-3 rounded-full" style={{ background: "var(--paper)", border: "1px solid var(--border-1)" }} />
        </div>
    );
}

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

    // Düzenleme formu (admin)
    const [editing, setEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: item.title,
        creator: item.creator ?? "",
        year: item.year ? String(item.year) : "",
        description: item.description ?? "",
    });
    const [currentItem, setCurrentItem] = useState(item);
    const [saving, setSaving] = useState(false);

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

    /* Item düzenle (sadece admin) */
    const handleSaveEdit = async () => {
        if (!editData.title.trim()) return;
        setSaving(true);
        const supabase = createClient();
        const { error } = await supabase.from("archive_items").update({
            title: editData.title.trim(),
            creator: editData.creator.trim() || null,
            year: editData.year ? parseInt(editData.year) : null,
            description: editData.description.trim() || null,
        }).eq("id", currentItem.id);
        if (error) { toast.error("Kaydedilemedi: " + error.message); setSaving(false); return; }
        setCurrentItem(prev => ({
            ...prev,
            title: editData.title.trim(),
            creator: editData.creator.trim() || null,
            year: editData.year ? parseInt(editData.year) : null,
            description: editData.description.trim() || null,
        }));
        toast.success("Güncellendi ✓");
        setEditing(false);
        setSaving(false);
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
        <div className="relative min-h-screen w-full overflow-hidden">

            {/* Navbar */}
            <SiteHeader userId={userId} username={username} back={{ href: "/arsiv", label: "Arşiv" }} />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-8 pt-24 sm:pt-28 pb-20">

                {/* Hero */}
                <div className="flex gap-6 sm:gap-8 items-end mb-8 flex-wrap sm:flex-nowrap">
                    <MediaHero item={currentItem} cat={cat} />

                    <div className="flex flex-col gap-3 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                                     style={{ background: cat.bg, border: `1px solid ${cat.border}` }}>
                                    <Icon size={12} style={{ color: cat.color }} />
                                </div>
                                <span className="text-xs font-semibold" style={{ color: cat.color }}>{cat.label}</span>
                            </div>
                            {isAdmin && !editing && (
                                <button onClick={() => setEditing(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                                        style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-3)" }}>
                                    <Pencil size={11} /> Düzenle
                                </button>
                            )}
                        </div>

                        {editing ? (
                            /* ── Düzenleme formu ── */
                            <div className="flex flex-col gap-2.5">
                                <input
                                    value={editData.title}
                                    onChange={e => setEditData(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Başlık *" maxLength={120}
                                    className="w-full bg-transparent text-sm outline-none px-3 py-2 rounded-xl"
                                    style={{ border: "1px solid var(--border-2)", color: "var(--text-1)" }}
                                />
                                <div className="flex gap-2">
                                    <input
                                        value={editData.creator}
                                        onChange={e => setEditData(p => ({ ...p, creator: e.target.value }))}
                                        placeholder={CREATOR_LABEL[currentItem.category]} maxLength={80}
                                        className="flex-1 bg-transparent text-sm outline-none px-3 py-2 rounded-xl"
                                        style={{ border: "1px solid var(--border-2)", color: "var(--text-2)" }}
                                    />
                                    <input
                                        value={editData.year}
                                        onChange={e => setEditData(p => ({ ...p, year: e.target.value }))}
                                        placeholder="Yıl" maxLength={4}
                                        className="bg-transparent text-sm outline-none px-3 py-2 rounded-xl"
                                        style={{ width: 70, border: "1px solid var(--border-2)", color: "var(--text-2)" }}
                                    />
                                </div>
                                <textarea
                                    value={editData.description}
                                    onChange={e => setEditData(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Açıklama" rows={2} maxLength={400}
                                    className="w-full bg-transparent text-sm outline-none px-3 py-2 rounded-xl resize-none"
                                    style={{ border: "1px solid var(--border-2)", color: "var(--text-2)" }}
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleSaveEdit} disabled={saving || !editData.title.trim()}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50"
                                            style={{ background: "color-mix(in srgb, var(--success) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--success) 30%, transparent)", color: "color-mix(in srgb, var(--success) 90%, transparent)" }}>
                                        {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                                        Kaydet
                                    </button>
                                    <button onClick={() => { setEditing(false); setEditData({ title: currentItem.title, creator: currentItem.creator ?? "", year: currentItem.year ? String(currentItem.year) : "", description: currentItem.description ?? "" }); }}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                                            style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-4)" }}>
                                        <X size={11} /> Vazgeç
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ── Normal görünüm ── */
                            <>
                                <h1 className="text-xl sm:text-2xl font-bold leading-tight" style={{ color: "var(--text-1)" }}>
                                    {currentItem.title}
                                </h1>

                                {(currentItem.creator || currentItem.year) && (
                                    <div className="flex items-center gap-3 text-sm flex-wrap">
                                        {currentItem.creator && (
                                            <span style={{ color: "var(--text-3)" }}>
                                                <span style={{ color: "var(--text-5)", fontSize: 11 }}>{CREATOR_LABEL[currentItem.category]} </span>
                                                {currentItem.creator}
                                            </span>
                                        )}
                                        {currentItem.year && (
                                            <span className="text-xs px-2 py-0.5 rounded-lg"
                                                  style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-4)" }}>
                                                {currentItem.year}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center gap-3">
                                    {avg != null ? (
                                        <>
                                            <div className="flex items-center gap-1.5">
                                                <Star size={16} fill="color-mix(in srgb, var(--warn) 90%, transparent)" style={{ color: "color-mix(in srgb, var(--warn) 90%, transparent)" }} />
                                                <span className="text-lg font-bold" style={{ color: "color-mix(in srgb, var(--warn) 90%, transparent)" }}>{avg}</span>
                                                <span className="text-xs" style={{ color: "var(--text-5)" }}>/ 10</span>
                                            </div>
                                            <span className="text-xs" style={{ color: "var(--text-5)" }}>{total} puan</span>
                                        </>
                                    ) : (
                                        <span className="text-xs" style={{ color: "var(--text-5)" }}>Henüz puanlanmamış</span>
                                    )}
                                </div>

                                {currentItem.description && (
                                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
                                        {currentItem.description}
                                    </p>
                                )}

                                <p className="text-[11px]" style={{ color: "var(--text-5)" }}>
                                    @{currentItem.created_by} tarafından eklendi
                                </p>
                            </>
                        )}
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
                                                <span className="text-[11px]" style={{ color: "var(--text-5)" }}>
                                                    {new Date(c.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long" })}
                                                </span>
                                            </div>
                                            {(isAdmin || c.user_id === userId) && (
                                                <button onClick={() => handleDeleteComment(c.id)}
                                                        className="opacity-30 hover:opacity-70 transition-opacity"
                                                        style={{ color: "color-mix(in srgb, var(--danger) 80%, transparent)" }}>
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
                                style={{ background: "color-mix(in srgb, var(--danger) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--danger) 20%, transparent)", color: "color-mix(in srgb, var(--danger) 60%, transparent)" }}>
                            <Trash2 size={12} /> Arşivden Kaldır
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
