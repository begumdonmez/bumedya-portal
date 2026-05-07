"use client";

import { useState } from "react";
import Link from "next/link";
import { Film, Tv, BookOpen, Music, Star, Plus, X, Loader2, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import HomeNavLinks from "@/components/HomeNavLinks";
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

interface Props {
    userId: string;
    username: string;
    isAdmin: boolean;
    items: ArchiveItem[];
    avgRatings: Record<string, number>;
}

/* ── Kategori konfigürasyonu ─────────────────────────────────── */
const CAT_CONFIG = {
    film:  { label: "Film",   icon: Film,     color: "rgba(167,139,250,0.9)", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.3)"  },
    dizi:  { label: "Dizi",   icon: Tv,       color: "rgba(96,165,250,0.9)",  bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.3)"  },
    kitap: { label: "Kitap",  icon: BookOpen, color: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.3)"  },
    sarki: { label: "Şarkı",  icon: Music,    color: "rgba(244,114,182,0.9)", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.3)" },
} satisfies Record<Category, { label: string; icon: React.ElementType; color: string; bg: string; border: string }>;

const CREATOR_LABEL: Record<Category, string> = {
    film:  "Yönetmen",
    dizi:  "Yapım",
    kitap: "Yazar",
    sarki: "Sanatçı",
};

/* ── DVD Kartı (Film) ────────────────────────────────────────── */
function DvdCard({ item, avg }: { item: ArchiveItem; avg?: number }) {
    return (
        <div style={{
            width: 130, height: 185, display: "flex", overflow: "hidden",
            borderRadius: "3px 6px 6px 3px",
            border: "1px solid rgba(124,58,237,0.35)",
            boxShadow: "4px 6px 22px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.03)",
            background: "linear-gradient(160deg, #0d0b22 0%, #160e38 100%)",
            flexShrink: 0, position: "relative", cursor: "pointer",
            transition: "transform 0.18s, box-shadow 0.18s",
        }}
            className="group hover:scale-[1.04] hover:shadow-2xl"
        >
            {/* Sol spine */}
            <div style={{
                width: 15, flexShrink: 0,
                background: "linear-gradient(180deg, rgba(124,58,237,0.6), rgba(124,58,237,0.3))",
                borderRight: "1px solid rgba(124,58,237,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 0",
            }}>
                <span style={{
                    writingMode: "vertical-rl", transform: "rotate(180deg)",
                    fontSize: 7, color: "rgba(255,255,255,0.75)", fontWeight: 700,
                    letterSpacing: 0.5, overflow: "hidden", maxHeight: 140,
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{item.title}</span>
            </div>

            {/* Cover alanı */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 8px 6px" }}>
                {/* Kapak görseli */}
                <div style={{
                    flex: 1, borderRadius: 4, marginBottom: 8,
                    background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.04) 100%)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative", overflow: "hidden",
                }}>
                    <Film size={30} style={{ color: "rgba(124,58,237,0.3)" }} />
                    {avg != null && (
                        <div style={{
                            position: "absolute", top: 5, right: 5,
                            background: "rgba(0,0,0,0.7)", borderRadius: 4,
                            padding: "2px 5px", display: "flex", alignItems: "center", gap: 2,
                        }}>
                            <Star size={7} fill="rgba(252,211,77,0.9)" style={{ color: "rgba(252,211,77,0.9)" }} />
                            <span style={{ fontSize: 8, color: "rgba(252,211,77,0.9)", fontWeight: 700 }}>{avg}</span>
                        </div>
                    )}
                </div>

                {/* Alt disc + başlık */}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    {/* Mini DVD disc */}
                    <div style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                        background: "conic-gradient(from 0deg, #555 0%, #bbb 15%, #777 30%, #ccc 45%, #666 60%, #bbb 75%, #555 90%, #aaa 100%)",
                        border: "2px solid #2a2a2a", position: "relative",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#111", border: "1px solid #444" }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.85)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{item.title}</p>
                        {item.year && <p style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", margin: "1px 0 0" }}>{item.year}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── VHS Kartı (Dizi) ────────────────────────────────────────── */
function VhsCard({ item, avg }: { item: ArchiveItem; avg?: number }) {
    return (
        <div style={{
            width: 185, height: 120, flexShrink: 0,
            borderRadius: 6, cursor: "pointer",
            border: "1px solid rgba(59,130,246,0.35)",
            boxShadow: "4px 6px 22px rgba(0,0,0,0.55)",
            background: "linear-gradient(160deg, #0a0a14 0%, #111622 100%)",
            padding: "8px 10px 8px",
            display: "flex", flexDirection: "column", gap: 6,
            transition: "transform 0.18s, box-shadow 0.18s",
        }}
            className="group hover:scale-[1.04] hover:shadow-2xl"
        >
            {/* Etiket */}
            <div style={{
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.3)",
                borderRadius: 3, padding: "4px 7px",
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            }}>
                <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(147,197,253,0.95)", margin: 0, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{item.title}</p>
                    {item.creator && <p style={{ fontSize: 7.5, color: "rgba(147,197,253,0.45)", margin: "1px 0 0" }}>{item.creator}</p>}
                </div>
                {avg != null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                        <Star size={7} fill="rgba(252,211,77,0.9)" style={{ color: "rgba(252,211,77,0.9)" }} />
                        <span style={{ fontSize: 8, color: "rgba(252,211,77,0.9)", fontWeight: 700 }}>{avg}</span>
                    </div>
                )}
            </div>

            {/* Makaralar */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: "auto" }}>
                {/* Sol makara */}
                <Reel />
                {/* Bant penceresi */}
                <div style={{
                    flex: 1, height: 14, margin: "0 4px",
                    background: "#080808", borderRadius: 2, border: "1px solid #222",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <div style={{ width: "50%", height: 2, background: "#1a1a1a", borderRadius: 1 }} />
                    {item.year && <span style={{ fontSize: 6.5, color: "rgba(255,255,255,0.15)", marginLeft: 4 }}>{item.year}</span>}
                </div>
                {/* Sağ makara */}
                <Reel />
            </div>
        </div>
    );
}

function Reel() {
    return (
        <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, #1c1c1c, #111)",
            border: "2px solid #2a2a2a", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
        }}>
            {/* Dış halka */}
            <div style={{ position: "absolute", inset: 2, borderRadius: "50%", border: "1px solid #333" }} />
            {/* Merkez göbek */}
            <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#222", border: "1px solid #3a3a3a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#444" }} />
            </div>
            {/* Kollar */}
            {[0, 60, 120].map(deg => (
                <div key={deg} style={{
                    position: "absolute", width: 1, height: 8,
                    background: "#333", top: "50%", left: "50%",
                    transformOrigin: "top center",
                    transform: `translateX(-50%) rotate(${deg}deg)`,
                }} />
            ))}
        </div>
    );
}

/* ── Kitap Kartı ─────────────────────────────────────────────── */
function BookCard({ item, avg }: { item: ArchiveItem; avg?: number }) {
    return (
        <div style={{
            width: 120, height: 185, display: "flex", overflow: "hidden",
            borderRadius: "3px 6px 6px 3px",
            border: "1px solid rgba(52,211,153,0.35)",
            boxShadow: "-2px 2px 8px rgba(0,0,0,0.4), 4px 6px 22px rgba(0,0,0,0.55)",
            background: "linear-gradient(160deg, #051a10 0%, #0a2218 100%)",
            flexShrink: 0, cursor: "pointer",
            transition: "transform 0.18s, box-shadow 0.18s",
        }}
            className="group hover:scale-[1.04] hover:shadow-2xl"
        >
            {/* Sol sırt */}
            <div style={{
                width: 16, flexShrink: 0,
                background: "linear-gradient(180deg, rgba(52,211,153,0.55), rgba(52,211,153,0.3))",
                borderRight: "1px solid rgba(52,211,153,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: "6px 0",
            }}>
                <span style={{
                    writingMode: "vertical-rl", transform: "rotate(180deg)",
                    fontSize: 7, color: "rgba(255,255,255,0.8)", fontWeight: 700,
                    letterSpacing: 0.5, maxHeight: 145, overflow: "hidden",
                    textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{item.title}</span>
            </div>

            {/* Kapak */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "8px 8px 7px" }}>
                <div style={{
                    flex: 1, borderRadius: 3, marginBottom: 7,
                    background: "linear-gradient(135deg, rgba(52,211,153,0.1) 0%, rgba(52,211,153,0.03) 100%)",
                    border: "1px solid rgba(52,211,153,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative", overflow: "hidden",
                }}>
                    <BookOpen size={26} style={{ color: "rgba(52,211,153,0.3)" }} />
                    {avg != null && (
                        <div style={{
                            position: "absolute", top: 5, right: 5,
                            background: "rgba(0,0,0,0.7)", borderRadius: 4,
                            padding: "2px 5px", display: "flex", alignItems: "center", gap: 2,
                        }}>
                            <Star size={7} fill="rgba(252,211,77,0.9)" style={{ color: "rgba(252,211,77,0.9)" }} />
                            <span style={{ fontSize: 8, color: "rgba(252,211,77,0.9)", fontWeight: 700 }}>{avg}</span>
                        </div>
                    )}
                </div>
                <p style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.25, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.title}</p>
                {item.creator && <p style={{ fontSize: 7.5, color: "rgba(52,211,153,0.6)", margin: "2px 0 0", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.creator}</p>}
            </div>
        </div>
    );
}

/* ── Plak Kartı (Şarkı) ──────────────────────────────────────── */
function VinylCard({ item, avg }: { item: ArchiveItem; avg?: number }) {
    return (
        <div style={{
            width: 150, height: 150, flexShrink: 0,
            borderRadius: "50%", cursor: "pointer",
            boxShadow: "0 6px 28px rgba(0,0,0,0.7), 0 0 0 1px rgba(244,114,182,0.2)",
            position: "relative",
            background: `conic-gradient(from 0deg,
                #111 0deg, #1a1a1a 3deg, #111 6deg, #181818 9deg, #111 12deg,
                #1a1a1a 15deg, #111 18deg, #191919 21deg, #111 24deg, #1a1a1a 27deg,
                #111 30deg, #181818 33deg, #111 36deg, #1a1a1a 39deg, #111 42deg,
                #191919 45deg, #111 48deg, #1a1a1a 51deg, #111 54deg, #181818 57deg,
                #111 60deg, #1a1a1a 63deg, #111 66deg, #191919 69deg, #111 72deg,
                #1a1a1a 75deg, #111 78deg, #181818 81deg, #111 84deg, #1a1a1a 87deg,
                #111 90deg, #191919 93deg, #111 96deg, #1a1a1a 99deg, #111 102deg,
                #181818 105deg, #111 108deg, #1a1a1a 111deg, #111 114deg, #191919 117deg,
                #111 120deg, #1a1a1a 123deg, #111 126deg, #181818 129deg, #111 132deg,
                #1a1a1a 135deg, #111 138deg, #191919 141deg, #111 144deg, #1a1a1a 147deg,
                #111 150deg, #181818 153deg, #111 156deg, #1a1a1a 159deg, #111 162deg,
                #191919 165deg, #111 168deg, #1a1a1a 171deg, #111 174deg, #181818 177deg,
                #111 180deg, #1a1a1a 183deg, #111 186deg, #191919 189deg, #111 192deg,
                #181818 195deg, #111 198deg, #1a1a1a 201deg, #111 204deg, #191919 207deg,
                #111 210deg, #1a1a1a 213deg, #111 216deg, #181818 219deg, #111 222deg,
                #1a1a1a 225deg, #111 228deg, #191919 231deg, #111 234deg, #1a1a1a 237deg,
                #111 240deg, #181818 243deg, #111 246deg, #1a1a1a 249deg, #111 252deg,
                #191919 255deg, #111 258deg, #1a1a1a 261deg, #111 264deg, #181818 267deg,
                #111 270deg, #1a1a1a 273deg, #111 276deg, #191919 279deg, #111 282deg,
                #181818 285deg, #111 288deg, #1a1a1a 291deg, #111 294deg, #191919 297deg,
                #111 300deg, #1a1a1a 303deg, #111 306deg, #181818 309deg, #111 312deg,
                #1a1a1a 315deg, #111 318deg, #191919 321deg, #111 324deg, #1a1a1a 327deg,
                #111 330deg, #181818 333deg, #111 336deg, #1a1a1a 339deg, #111 342deg,
                #191919 345deg, #111 348deg, #1a1a1a 351deg, #111 354deg, #181818 357deg, #111 360deg
            )`,
            transition: "transform 0.18s, box-shadow 0.18s",
            display: "flex", alignItems: "center", justifyContent: "center",
        }}
            className="group hover:scale-[1.06] hover:shadow-2xl"
        >
            {/* Merkez etiket */}
            <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(244,114,182,0.25), rgba(244,114,182,0.08))",
                border: "1px solid rgba(244,114,182,0.4)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 1, padding: 4, position: "relative",
            }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#111", border: "1px solid #444" }} />
                <p style={{ fontSize: 6.5, color: "rgba(255,255,255,0.85)", fontWeight: 700, textAlign: "center", lineHeight: 1.2, margin: 0, maxWidth: 38, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.title}</p>
                {avg != null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Star size={5} fill="rgba(252,211,77,0.9)" style={{ color: "rgba(252,211,77,0.9)" }} />
                        <span style={{ fontSize: 6, color: "rgba(252,211,77,0.9)", fontWeight: 700 }}>{avg}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Raf bölümü başlığı ──────────────────────────────────────── */
function ShelfLabel({ category }: { category: Category }) {
    const c = CAT_CONFIG[category];
    const Icon = c.icon;
    return (
        <div className="flex items-center gap-2 mb-3 mt-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                 style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                <Icon size={12} style={{ color: c.color }} />
            </div>
            <span className="text-xs font-semibold tracking-wide" style={{ color: c.color }}>{c.label}</span>
            <div className="flex-1 h-px" style={{ background: c.border }} />
        </div>
    );
}

/* ── Medya kartı wrapper ──────────────────────────────────────── */
function MediaCard({ item, avg }: { item: ArchiveItem; avg?: number }) {
    const isVinyl = item.category === "sarki";
    return (
        <Link
            href={`/arsiv/${item.id}`}
            className={`flex flex-col items-center gap-2 group ${isVinyl ? "pt-0" : ""}`}
            style={{ textDecoration: "none" }}
        >
            {item.category === "film"  && <DvdCard  item={item} avg={avg} />}
            {item.category === "dizi"  && <VhsCard  item={item} avg={avg} />}
            {item.category === "kitap" && <BookCard item={item} avg={avg} />}
            {item.category === "sarki" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <VinylCard item={item} avg={avg} />
                    <p style={{ fontSize: 8, fontWeight: 700, color: "rgba(244,114,182,0.8)", textAlign: "center", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                    {item.creator && <p style={{ fontSize: 7.5, color: "rgba(255,255,255,0.35)", margin: "-4px 0 0", textAlign: "center" }}>{item.creator}</p>}
                </div>
            )}
        </Link>
    );
}

/* ── Admin ekleme formu ──────────────────────────────────────── */
function AddItemForm({ onAdd }: { onAdd: (item: ArchiveItem) => void }) {
    const [show, setShow] = useState(false);
    const [cat, setCat] = useState<Category>("film");
    const [title, setTitle] = useState("");
    const [creator, setCreator] = useState("");
    const [year, setYear] = useState("");
    const [desc, setDesc] = useState("");
    const [loading, setLoading] = useState(false);

    const c = CAT_CONFIG[cat];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase.from("profiles").select("username").eq("id", user!.id).single();
        const { data, error } = await supabase.from("archive_items").insert({
            category: cat,
            title: title.trim(),
            creator: creator.trim() || null,
            year: year ? parseInt(year) : null,
            description: desc.trim() || null,
            created_by: profile?.username ?? "admin",
        }).select().single();
        if (error) { toast.error("Eklenemedi: " + error.message); setLoading(false); return; }
        toast.success("Arşive eklendi ✓");
        onAdd(data as ArchiveItem);
        setTitle(""); setCreator(""); setYear(""); setDesc(""); setShow(false);
        setLoading(false);
    };

    if (!show) {
        return (
            <button onClick={() => setShow(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium self-end transition-all duration-200"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border-3)", color: "var(--text-3)" }}>
                <Plus size={13} /> Arşive Ekle
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="card p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Yeni Eser Ekle</p>
                <button type="button" onClick={() => setShow(false)} style={{ color: "var(--text-4)" }}><X size={14} /></button>
            </div>

            {/* Kategori */}
            <div className="flex gap-2 flex-wrap">
                {(Object.entries(CAT_CONFIG) as [Category, typeof CAT_CONFIG[Category]][]).map(([id, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                        <button key={id} type="button" onClick={() => setCat(id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                                style={{ background: cat === id ? cfg.bg : "var(--bg-2)", border: `1px solid ${cat === id ? cfg.border : "var(--border-3)"}`, color: cat === id ? cfg.color : "var(--text-4)" }}>
                            <Icon size={11} /> {cfg.label}
                        </button>
                    );
                })}
            </div>

            <input value={title} onChange={e => setTitle(e.target.value)} required
                   placeholder="Başlık *" maxLength={120}
                   className="w-full bg-transparent text-sm outline-none px-3 py-2.5 rounded-xl"
                   style={{ border: "1px solid var(--border-2)", color: "var(--text-2)" }} />

            <div className="flex gap-2">
                <input value={creator} onChange={e => setCreator(e.target.value)}
                       placeholder={`${CREATOR_LABEL[cat]} (opsiyonel)`} maxLength={80}
                       className="flex-1 bg-transparent text-sm outline-none px-3 py-2.5 rounded-xl"
                       style={{ border: "1px solid var(--border-2)", color: "var(--text-2)" }} />
                <input value={year} onChange={e => setYear(e.target.value)}
                       placeholder="Yıl" maxLength={4} style={{ width: 72, border: "1px solid var(--border-2)", color: "var(--text-2)" }}
                       className="bg-transparent text-sm outline-none px-3 py-2.5 rounded-xl" />
            </div>

            <textarea value={desc} onChange={e => setDesc(e.target.value)}
                      placeholder="Açıklama (opsiyonel)" rows={2} maxLength={400}
                      className="w-full bg-transparent text-sm outline-none px-3 py-2.5 rounded-xl resize-none"
                      style={{ border: "1px solid var(--border-2)", color: "var(--text-2)" }} />

            <button type="submit" disabled={loading || !title.trim()}
                    className="self-end flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color, opacity: loading || !title.trim() ? 0.5 : 1 }}>
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                Ekle
            </button>
        </form>
    );
}

/* ── Ana bileşen ─────────────────────────────────────────────── */
export default function ArsivClient({ userId, username, isAdmin, items: initialItems, avgRatings }: Props) {
    const [items, setItems] = useState<ArchiveItem[]>(initialItems);
    const [activeFilter, setActiveFilter] = useState<Category | "tumü">("tumü");

    const filtered = activeFilter === "tumü" ? items : items.filter(i => i.category === activeFilter);

    // Kategoriye göre grupla
    const byCategory = (cat: Category) => filtered.filter(i => i.category === cat);
    const showAll = activeFilter === "tumü";

    const categories: Category[] = ["film", "dizi", "kitap", "sarki"];

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

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20">

                {/* Başlık */}
                <div className="flex flex-col items-center text-center pt-4 pb-8 gap-2">
                    <span className="label-caps">Bumedya Arşivi</span>
                    <p className="text-xs" style={{ color: "var(--text-4)" }}>
                        Topluluğun önerdiği filmler, diziler, kitaplar ve şarkılar
                    </p>
                </div>

                {/* Filtre + Admin butonu */}
                <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setActiveFilter("tumü")}
                                className="px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                                style={{ background: activeFilter === "tumü" ? "var(--violet-bg-md)" : "var(--bg-2)", border: `1px solid ${activeFilter === "tumü" ? "var(--violet-border)" : "var(--border-3)"}`, color: activeFilter === "tumü" ? "var(--violet-text)" : "var(--text-3)" }}>
                            Tümü
                        </button>
                        {categories.map(cat => {
                            const c = CAT_CONFIG[cat];
                            const Icon = c.icon;
                            return (
                                <button key={cat} onClick={() => setActiveFilter(cat)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                                        style={{ background: activeFilter === cat ? c.bg : "var(--bg-2)", border: `1px solid ${activeFilter === cat ? c.border : "var(--border-3)"}`, color: activeFilter === cat ? c.color : "var(--text-3)" }}>
                                    <Icon size={11} /> {c.label}
                                </button>
                            );
                        })}
                    </div>
                    {isAdmin && <AddItemForm onAdd={item => setItems(prev => [item, ...prev])} />}
                </div>

                {/* İçerik */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <p className="text-sm" style={{ color: "var(--text-4)" }}>Henüz bu kategoride eser yok.</p>
                        {isAdmin && <p className="text-xs" style={{ color: "var(--text-5)" }}>Arşive Ekle butonunu kullan.</p>}
                    </div>
                ) : showAll ? (
                    /* Tümü görünümü: kategoriye göre raflar */
                    <div className="flex flex-col gap-8">
                        {categories.map(cat => {
                            const catItems = byCategory(cat);
                            if (catItems.length === 0) return null;
                            return (
                                <div key={cat}>
                                    <ShelfLabel category={cat} />
                                    {/* Shelf */}
                                    <div style={{ position: "relative" }}>
                                        <div className="flex gap-4 overflow-x-auto pb-4"
                                             style={{ scrollbarWidth: "none", alignItems: "flex-end" }}>
                                            {catItems.map(item => (
                                                <MediaCard key={item.id} item={item} avg={avgRatings[item.id]} />
                                            ))}
                                        </div>
                                        {/* Raf tahtası */}
                                        <div style={{ height: 8, borderRadius: "0 0 4px 4px", background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid var(--border-3)", borderTop: "none", marginTop: -2 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Tek kategori görünümü */
                    <div>
                        <div className="flex gap-4 flex-wrap" style={{ alignItems: "flex-end" }}>
                            {filtered.map(item => (
                                <MediaCard key={item.id} item={item} avg={avgRatings[item.id]} />
                            ))}
                        </div>
                        <div style={{ height: 8, borderRadius: "0 0 4px 4px", background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid var(--border-3)", borderTop: "none", marginTop: 16 }} />
                    </div>
                )}

                {/* Alt not */}
                <p className="text-center text-xs mt-10" style={{ color: "var(--text-5)" }}>
                    Bir esere tıkla, yorumunu ve puanını bırak ↗
                </p>
            </div>
        </div>
    );
}
