"use client";

import { useState, useRef, useMemo, memo } from "react";
import Link from "next/link";
import { Film, Tv, BookOpen, Music, Star, Plus, X, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import PageHeader from "@/components/PageHeader";

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
    film:  { label: "Film",   icon: Film,     color: "color-mix(in srgb, var(--accent) 90%, transparent)", bg: "color-mix(in srgb, var(--accent) 8%, transparent)",  border: "color-mix(in srgb, var(--accent) 30%, transparent)"  },
    dizi:  { label: "Dizi",   icon: Tv,       color: "color-mix(in srgb, var(--info) 90%, transparent)",  bg: "color-mix(in srgb, var(--info) 8%, transparent)",  border: "color-mix(in srgb, var(--info) 30%, transparent)"  },
    kitap: { label: "Kitap",  icon: BookOpen, color: "color-mix(in srgb, var(--success) 90%, transparent)",  bg: "color-mix(in srgb, var(--success) 8%, transparent)",  border: "color-mix(in srgb, var(--success) 30%, transparent)"  },
    sarki: { label: "Şarkı",  icon: Music,    color: "color-mix(in srgb, var(--pink) 90%, transparent)", bg: "color-mix(in srgb, var(--pink) 8%, transparent)", border: "color-mix(in srgb, var(--pink) 30%, transparent)" },
} satisfies Record<Category, { label: string; icon: React.ElementType; color: string; bg: string; border: string }>;

const CREATOR_LABEL: Record<Category, string> = {
    film:  "Yönetmen",
    dizi:  "Yapım",
    kitap: "Yazar",
    sarki: "Sanatçı",
};

/* ── Bilet koçanı kartı ──────────────────────────────────────
 * Her kategori aynı fiş biçimini kullanır; fark sol koçandaki renk ve etiket.
 * Renkler tema tokenlarından geldiği için Kâğıt/Gece/Fanzin'de kendiliğinden uyar.
 */
const TicketCard = memo(function TicketCard({ item, avg }: { item: ArchiveItem; avg?: number }) {
    const c = CAT_CONFIG[item.category];
    const Icon = c.icon;
    return (
        <Link href={`/arsiv/${item.id}`}
              className="card group flex w-[232px] shrink-0 overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:-rotate-1">
            {/* Koçan */}
            <div className="relative flex flex-col items-center justify-between py-3 w-11 shrink-0"
                 style={{ background: c.bg, borderRight: "2px dashed var(--border-1)" }}>
                <Icon size={15} style={{ color: c.color }} />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] [writing-mode:vertical-rl] rotate-180"
                      style={{ color: c.color }}>
                    {c.label}
                </span>
                <span className="font-mono text-[10px]" style={{ color: "var(--text-4)" }}>
                    {item.year ? `'${String(item.year).slice(-2)}` : "—"}
                </span>
                {/* Delik izleri */}
                <span aria-hidden className="absolute -right-[7px] -top-[7px] w-3 h-3 rounded-full" style={{ background: "var(--paper)", border: "1px solid var(--border-1)" }} />
                <span aria-hidden className="absolute -right-[7px] -bottom-[7px] w-3 h-3 rounded-full" style={{ background: "var(--paper)", border: "1px solid var(--border-1)" }} />
            </div>

            {/* Gövde */}
            <div className="flex-1 min-w-0 p-3.5 flex flex-col gap-1 min-h-[150px]">
                <p className="label-caps !text-[10px]">Arşiv · {CREATOR_LABEL[item.category]}</p>
                <h3 className="font-display text-lg font-medium leading-snug line-clamp-3 group-hover:underline underline-offset-4 decoration-1"
                    style={{ color: "var(--text-1)", textDecorationColor: c.color }}>
                    {item.title}
                </h3>
                {item.creator && (
                    <p className="text-[13px] truncate" style={{ color: "var(--text-3)" }}>{item.creator}</p>
                )}
                <div className="mt-auto pt-2 flex items-center justify-between">
                    {avg ? (
                        <span className="flex items-center gap-1 text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>
                            <Star size={13} fill="var(--accent-2)" stroke="var(--fg)" strokeWidth={1.2} /> {avg.toFixed(1)}
                        </span>
                    ) : (
                        <span className="text-[12px]" style={{ color: "var(--text-4)" }}>Puan yok</span>
                    )}
                    <span className="text-[12px] font-medium transition-transform group-hover:translate-x-0.5" style={{ color: c.color }}>Oku →</span>
                </div>
            </div>
        </Link>
    );
});

function ShelfRow({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 480, behavior: "smooth" });
    return (
        <div className="relative group/shelf">
            <div ref={ref} className="flex gap-4 overflow-x-auto pt-2 pb-5 pl-1 pr-6 snap-x" style={{ scrollbarWidth: "thin" }}>
                {children}
            </div>
            <div className="hidden sm:flex absolute -top-11 right-0 gap-1.5">
                <button type="button" onClick={() => scroll(-1)} aria-label="Sola kaydır" className="btn-ghost !p-1.5"><ChevronLeft size={15} /></button>
                <button type="button" onClick={() => scroll(1)} aria-label="Sağa kaydır" className="btn-ghost !p-1.5"><ChevronRight size={15} /></button>
            </div>
        </div>
    );
}

function ShelfLabel({ category, count }: { category: Category; count: number }) {
    const c = CAT_CONFIG[category];
    return (
        <div className="flex items-baseline gap-3 mb-3 pb-2 pr-24" style={{ borderBottom: "2px solid var(--text-1)" }}>
            <h2 className="font-display text-2xl font-medium" style={{ color: "var(--text-1)" }}>{c.label}</h2>
            <span className="font-mono text-xs" style={{ color: c.color }}>{count} kayıt</span>
        </div>
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

    const filtered = useMemo(
        () => activeFilter === "tumü" ? items : items.filter(i => i.category === activeFilter),
        [items, activeFilter]
    );

    const showAll = activeFilter === "tumü";

    // Kategoriye göre önceden grupla — filtered değişince bir kez hesapla
    const byCat = useMemo(() => {
        const map: Record<string, ArchiveItem[]> = { film: [], dizi: [], kitap: [], sarki: [] };
        for (const item of filtered) map[item.category]?.push(item);
        return map;
    }, [filtered]);

    const categories: Category[] = useMemo(() => ["film", "dizi", "kitap", "sarki"] as Category[], []);

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <div aria-hidden className="fixed inset-0 dot-grid opacity-[0.3] pointer-events-none" style={{ zIndex: 0 }} />

            {/* Navbar */}
            <SiteHeader userId={userId} username={username} />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-24 sm:pt-28 pb-20">

                <PageHeader eyebrow="Raf raf" title="Arşiv"
                            description="Topluluğun önerdiği filmler, diziler, kitaplar ve şarkılar."
                            actions={isAdmin ? <AddItemForm onAdd={item => setItems(prev => [item, ...prev])} /> : undefined} />

                {/* Filtre + Admin butonu */}
                <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setActiveFilter("tumü")} className="pill" aria-pressed={activeFilter === "tumü"}>
                            Tümü
                        </button>
                        {categories.map(cat => {
                            const c = CAT_CONFIG[cat];
                            const Icon = c.icon;
                            return (
                                <button key={cat} onClick={() => setActiveFilter(cat)} className="pill" aria-pressed={activeFilter === cat}>
                                    <Icon size={13} /> {c.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* İçerik */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <p className="text-sm" style={{ color: "var(--text-4)" }}>Henüz bu kategoride eser yok.</p>
                        {isAdmin && <p className="text-xs" style={{ color: "var(--text-5)" }}>Arşive Ekle butonunu kullan.</p>}
                    </div>
                ) : showAll ? (
                    /* Tümü görünümü: kategoriye göre raflar */
                    <div className="flex flex-col gap-12">
                        {categories.map(cat => {
                            const catItems = byCat[cat] ?? [];
                            if (catItems.length === 0) return null;
                            return (
                                <div key={cat}>
                                    <ShelfLabel category={cat} count={catItems.length} />
                                    <ShelfRow>
                                        {catItems.map(item => (
                                            <TicketCard key={item.id} item={item} avg={avgRatings[item.id]} />
                                        ))}
                                    </ShelfRow>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Tek kategori görünümü */
                    <div>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(232px,1fr))] gap-4 [&>a]:w-auto">
                            {filtered.map(item => (
                                <TicketCard key={item.id} item={item} avg={avgRatings[item.id]} />
                            ))}
                        </div>
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
