"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CalendarDays, MapPin, Plus, X, CheckCircle, ChevronLeft, ExternalLink, Trash2 } from "lucide-react";
import EventMapClient from "@/components/EventMapClient";
import type { EventItem } from "@/components/EventMap";

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=tr`,
            { headers: { "Accept-Language": "tr", "User-Agent": "bumedya-portal" } }
        );
        const data = await res.json();
        if (!data.length) return null;
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch {
        return null;
    }
}

function formatDate(date: string) {
    return new Date(date + "T00:00:00").toLocaleDateString("tr-TR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
}

export default function EtkinliklerClient({
    initialEvents,
    userId,
    username,
    isAdmin,
}: {
    initialEvents: EventItem[];
    userId: string;
    username: string;
    isAdmin: boolean;
}) {
    const [events, setEvents] = useState(initialEvents);
    const [selected, setSelected] = useState<EventItem | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: "", address: "", date: "", time: "", ref_url: "" });
    const [formLoading, setFormLoading] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [formError, setFormError] = useState("");

    const today      = new Date().toISOString().split("T")[0];
    const thisMonth  = today.slice(0, 7); // "YYYY-MM"
    const todayEvs   = events.filter(e => e.event_date === today);
    const upcoming   = events.filter(e => e.event_date > today && e.event_date.slice(0, 7) === thisMonth);
    const future     = events.filter(e => e.event_date.slice(0, 7) > thisMonth);
    const past       = events.filter(e => e.event_date < today);

    const handleMarkerClick = useCallback((ev: EventItem) => {
        setSelected(prev => prev?.id === ev.id ? null : ev);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        if (!form.title.trim()) { setFormError("Başlık zorunlu."); return; }
        if (!form.address.trim()) { setFormError("Adres zorunlu."); return; }
        if (!form.date) { setFormError("Tarih zorunlu."); return; }
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(form.date)) { setFormError("Tarih GG.AA.YYYY formatında olmalı, örn. 25.12.2025"); return; }
        if (!form.time) { setFormError("Saat zorunlu."); return; }
        if (!/^\d{2}:\d{2}$/.test(form.time)) { setFormError("Saat SS:DD formatında olmalı, örn. 14:30"); return; }

        const [dd, mm, yyyy] = form.date.split(".");
        const isoDate = `${yyyy}-${mm}-${dd}`;

        setGeocoding(true);
        const coords = await geocodeAddress(form.address);
        setGeocoding(false);

        if (!coords) {
            setFormError("Adres bulunamadı. Daha açık bir adres dene.");
            return;
        }

        setFormLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from("events")
            .insert({
                user_id: userId,
                username,
                title: form.title.trim(),
                address: form.address.trim(),
                lat: coords.lat,
                lng: coords.lng,
                event_date: isoDate,
                event_time: form.time,
                ref_url: form.ref_url.trim() || null,
                approved: false,
            })
            .select()
            .single();

        setFormLoading(false);

        if (error) {
            toast.error(`Etkinlik eklenemedi: ${error.message}`);
            return;
        }

        setEvents(prev => [...prev, data].sort((a, b) => a.event_date.localeCompare(b.event_date)));
        setShowForm(false);
        setForm({ title: "", address: "", date: "", time: "", ref_url: "" });
        toast.success("Etkinlik eklendi.");
    };

    const handleApprove = async (ev: EventItem) => {
        const newVal = !ev.approved;
        const res = await fetch("/api/events", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: ev.id, approved: newVal }),
        });
        if (!res.ok) { toast.error("Güncelleme başarısız."); return; }
        const updated = { ...ev, approved: newVal };
        setEvents(prev => prev.map(e => e.id === ev.id ? updated : e));
        if (selected?.id === ev.id) setSelected(updated);
        toast.success(newVal ? "Onaylı olarak işaretlendi." : "Onay kaldırıldı.");
    };

    const handleDelete = async (ev: EventItem) => {
        const res = await fetch(`/api/events?id=${ev.id}`, { method: "DELETE" });
        if (!res.ok) { toast.error("Silinemedi."); return; }
        setEvents(prev => prev.filter(e => e.id !== ev.id));
        if (selected?.id === ev.id) setSelected(null);
        toast.success("Etkinlik silindi.");
    };

    const canDelete = (ev: EventItem) => isAdmin || ev.user_id === userId;

    return (
        <div className="aurora-bg relative min-h-screen flex flex-col">
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 border-b nav-backdrop"
                 style={{ borderColor: "var(--border-3)" }}>
                <div className="flex items-center gap-3">
                    <Link href="/home" className="text-xs px-2 py-1 rounded-lg hover:opacity-70 transition-opacity"
                          style={{ color: "var(--text-4)" }}>
                        <ChevronLeft size={15} />
                    </Link>
                    <Link href="/home" className="flex items-baseline gap-0.5">
                        <span className="text-sm font-bold" style={{ color: "var(--text-3)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "var(--violet)" }}>.</span>
                    </Link>
                    <span style={{ color: "var(--border-1)" }}>/</span>
                    <span className="text-sm font-medium" style={{ color: "var(--text-3)" }}>Etkinlikler</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    {todayEvs.length > 0 && (
                        <span className="hidden sm:inline text-xs px-2 py-0.5 rounded-full"
                              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "rgba(52,211,153,0.85)" }}>
                            {todayEvs.length} bugün
                        </span>
                    )}
                    <span className="hidden sm:inline text-xs" style={{ color: "var(--text-4)" }}>
                        {upcoming.length + future.length} etkinlik
                    </span>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                        style={{ background: "var(--violet-bg-md)", border: "1px solid var(--violet-border)", color: "var(--violet-text)" }}>
                        <Plus size={13} />
                        <span className="hidden sm:inline">Etkinlik </span>Ekle
                    </button>
                </div>
            </nav>

            <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col gap-6">
                {/* Harita */}
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--violet-bg-md)" }}>
                    <EventMapClient
                        events={events}
                        height={260}
                        zoom={10}
                        onMarkerClick={handleMarkerClick}
                        selectedId={selected?.id}
                    />
                </div>

                {/* Seçili etkinlik detayı */}
                {selected && (
                    <div className="rounded-2xl p-5 flex flex-col gap-3 transition-all"
                         style={{ background: "var(--violet-bg)", border: "1px solid var(--violet-border)" }}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p className="text-base font-bold" style={{ color: "var(--text-1)" }}>{selected.title}</p>
                                    {selected.approved && (
                                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                                              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", color: "rgba(52,211,153,0.9)" }}>
                                            <CheckCircle size={10} /> Onaylı
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <MapPin size={12} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                                    <p className="text-sm" style={{ color: "var(--text-3)" }}>{selected.address}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CalendarDays size={12} style={{ color: "var(--violet-text)", flexShrink: 0 }} />
                                    <p className="text-sm" style={{ color: "var(--violet-text)" }}>
                                        {formatDate(selected.event_date)}
                                        {selected.event_time ? ` · ${selected.event_time.slice(0, 5)}` : ""}
                                    </p>
                                </div>
                                <p className="text-xs mt-2" style={{ color: "var(--text-4)" }}>@{selected.username}</p>
                            </div>
                            <button onClick={() => setSelected(null)}
                                    className="shrink-0 p-1 rounded-lg hover:opacity-70 transition-opacity"
                                    style={{ color: "var(--text-4)" }}>
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {selected.ref_url && (
                                <a href={selected.ref_url} target="_blank" rel="noopener noreferrer"
                                   className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all duration-200"
                                   style={{ background: "var(--violet-bg-md)", border: "1px solid var(--violet-border)", color: "var(--violet-text)" }}>
                                    <ExternalLink size={11} /> Detaylar
                                </a>
                            )}
                            {isAdmin && (
                                <button onClick={() => handleApprove(selected)}
                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all duration-200"
                                        style={{
                                            background: selected.approved ? "rgba(52,211,153,0.08)" : "rgba(52,211,153,0.12)",
                                            border: `1px solid ${selected.approved ? "rgba(52,211,153,0.2)" : "rgba(52,211,153,0.3)"}`,
                                            color: "rgba(52,211,153,0.85)",
                                        }}>
                                    <CheckCircle size={11} />
                                    {selected.approved ? "Onayı Kaldır" : "Onayla"}
                                </button>
                            )}
                            {canDelete(selected) && (
                                <button onClick={() => handleDelete(selected)}
                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all duration-200"
                                        style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.7)" }}>
                                    <Trash2 size={11} /> Sil
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Bugün */}
                {todayEvs.length > 0 && (
                    <section className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-medium tracking-[0.15em] uppercase"
                               style={{ color: "rgba(52,211,153,0.7)" }}>Bugün</p>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "rgba(52,211,153,0.8)" }} />
                        </div>
                        {todayEvs.map(ev => (
                            <EventCard key={ev.id} ev={ev} status="today" isAdmin={isAdmin} canDelete={canDelete(ev)}
                                       selected={selected?.id === ev.id}
                                       onSelect={() => setSelected(prev => prev?.id === ev.id ? null : ev)}
                                       onApprove={handleApprove} onDelete={handleDelete} />
                        ))}
                    </section>
                )}

                {/* Yaklaşan — bu ay */}
                {upcoming.length > 0 && (
                    <section className="flex flex-col gap-3">
                        <p className="text-[10px] font-medium tracking-[0.15em] uppercase"
                           style={{ color: "rgba(252,211,77,0.5)" }}>Yaklaşan Etkinlikler</p>
                        {upcoming.map(ev => (
                            <EventCard key={ev.id} ev={ev} status="upcoming" isAdmin={isAdmin} canDelete={canDelete(ev)}
                                       selected={selected?.id === ev.id}
                                       onSelect={() => setSelected(prev => prev?.id === ev.id ? null : ev)}
                                       onApprove={handleApprove} onDelete={handleDelete} />
                        ))}
                    </section>
                )}

                {/* Boş durum — bugün, yaklaşan ve ileride hepsi yoksa */}
                {todayEvs.length === 0 && upcoming.length === 0 && future.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <CalendarDays size={32} className="opacity-10" />
                        <p className="text-sm" style={{ color: "var(--text-4)" }}>Yaklaşan etkinlik yok.</p>
                    </div>
                )}

                {/* İleride — bu aydan sonra */}
                {future.length > 0 && (
                    <section className="flex flex-col gap-3">
                        <p className="text-[10px] font-medium tracking-[0.15em] uppercase"
                           style={{ color: "var(--text-4)" }}>İleride</p>
                        {future.map(ev => (
                            <EventCard key={ev.id} ev={ev} status="future" isAdmin={isAdmin} canDelete={canDelete(ev)}
                                       selected={selected?.id === ev.id}
                                       onSelect={() => setSelected(prev => prev?.id === ev.id ? null : ev)}
                                       onApprove={handleApprove} onDelete={handleDelete} />
                        ))}
                    </section>
                )}

                {/* Geçmiş */}
                {past.length > 0 && (
                    <section className="flex flex-col gap-3">
                        <p className="text-[10px] font-medium tracking-[0.15em] uppercase"
                           style={{ color: "var(--text-5)" }}>Geçmiş Etkinlikler</p>
                        {past.map(ev => (
                            <EventCard key={ev.id} ev={ev} status="past" isAdmin={isAdmin} canDelete={canDelete(ev)}
                                       selected={false} onSelect={() => {}}
                                       onApprove={handleApprove} onDelete={handleDelete} />
                        ))}
                    </section>
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                     style={{ background: "var(--overlay)", backdropFilter: "blur(8px)" }}
                     onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
                    <div className="relative w-full max-w-md rounded-3xl overflow-hidden"
                         style={{ background: "rgba(15,20,50,0.97)", border: "1px solid var(--violet-border)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
                        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6) 40%, rgba(167,139,250,0.4) 60%, transparent)" }} />
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>Etkinlik Ekle</h2>
                                <button onClick={() => setShowForm(false)}
                                        className="p-1 rounded-lg hover:opacity-70 transition-opacity"
                                        style={{ color: "var(--text-3)" }}>
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <FormField label="Başlık" required>
                                    <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                           placeholder="Etkinlik adı" className="form-input" />
                                </FormField>

                                <FormField label="Adres" required hint="Nominatim ile koordinata çevrilecek">
                                    <input type="text" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                           placeholder="Kadıköy, İstanbul" className="form-input" />
                                </FormField>

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Tarih" required hint="GG.AA.YYYY">
                                        <input
                                            type="text"
                                            value={form.date}
                                            onChange={e => {
                                                let v = e.target.value.replace(/[^0-9.]/g, "");
                                                if ((v.length === 2 || v.length === 5) && !v.endsWith(".") && form.date.length < v.length) v = v + ".";
                                                if (v.length > 10) v = v.slice(0, 10);
                                                setForm(f => ({ ...f, date: v }));
                                            }}
                                            placeholder="25.12.2025"
                                            maxLength={10}
                                            className="form-input"
                                        />
                                    </FormField>
                                    <FormField label="Saat" required hint="SS:DD formatında, örn. 14:30">
                                        <input
                                            type="text"
                                            value={form.time}
                                            onChange={e => {
                                                let v = e.target.value.replace(/[^0-9:]/g, "");
                                                if (v.length === 2 && !v.includes(":") && form.time.length < 2) v = v + ":";
                                                if (v.length > 5) v = v.slice(0, 5);
                                                setForm(f => ({ ...f, time: v }));
                                            }}
                                            placeholder="14:30"
                                            maxLength={5}
                                            className="form-input"
                                        />
                                    </FormField>
                                </div>

                                <FormField label="Link" hint="Opsiyonel">
                                    <input type="url" value={form.ref_url} onChange={e => setForm(f => ({ ...f, ref_url: e.target.value }))}
                                           placeholder="https://..." className="form-input" />
                                </FormField>

                                {formError && (
                                    <p className="text-xs flex items-center gap-1" style={{ color: "rgba(239,68,68,0.8)" }}>
                                        ⚠ {formError}
                                    </p>
                                )}

                                <button type="submit" disabled={formLoading || geocoding}
                                        className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                                        style={{ background: "var(--violet)", boxShadow: "0 8px 24px rgba(124,58,237,0.35)" }}>
                                    {geocoding ? "Adres aranıyor..." : formLoading ? "Ekleniyor..." : "Etkinlik Ekle"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FormField({ label, required, hint, children }: {
    label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium tracking-[0.15em] uppercase flex items-center gap-1"
                   style={{ color: "var(--text-3)" }}>
                {label}
                {required && <span style={{ color: "rgba(239,68,68,0.7)" }}>*</span>}
            </label>
            {children}
            {hint && <p className="text-[10px]" style={{ color: "var(--text-4)" }}>{hint}</p>}
        </div>
    );
}

const STATUS_THEME = {
    today: {
        cardBg:     "rgba(52,211,153,0.05)",
        cardBorder: "rgba(52,211,153,0.25)",
        badgeBg:    "rgba(52,211,153,0.12)",
        badgeBorder:"rgba(52,211,153,0.3)",
        dayColor:   "rgba(52,211,153,0.95)",
        monthColor: "rgba(52,211,153,0.55)",
        titleColor: "var(--text-1)",
        opacity:    1,
    },
    upcoming: {
        cardBg:     "rgba(252,211,77,0.03)",
        cardBorder: "rgba(252,211,77,0.15)",
        badgeBg:    "rgba(252,211,77,0.08)",
        badgeBorder:"rgba(252,211,77,0.2)",
        dayColor:   "rgba(252,211,77,0.9)",
        monthColor: "rgba(252,211,77,0.45)",
        titleColor: "var(--text-1)",
        opacity:    1,
    },
    future: {
        cardBg:     "rgba(255,255,255,0.03)",
        cardBorder: "rgba(255,255,255,0.07)",
        badgeBg:    "rgba(124,58,237,0.08)",
        badgeBorder:"rgba(124,58,237,0.18)",
        dayColor:   "rgba(167,139,250,0.7)",
        monthColor: "rgba(167,139,250,0.4)",
        titleColor: "var(--text-1)",
        opacity:    1,
    },
    past: {
        cardBg:     "rgba(255,255,255,0.02)",
        cardBorder: "rgba(255,255,255,0.05)",
        badgeBg:    "rgba(255,255,255,0.04)",
        badgeBorder:"rgba(255,255,255,0.08)",
        dayColor:   "rgba(224,242,254,0.25)",
        monthColor: "rgba(224,242,254,0.15)",
        titleColor: "rgba(224,242,254,0.35)",
        opacity:    0.55,
    },
} as const;

function EventCard({ ev, status, isAdmin, canDelete, selected, onSelect, onApprove, onDelete }: {
    ev: EventItem;
    status: "today" | "upcoming" | "future" | "past";
    isAdmin: boolean;
    canDelete: boolean;
    selected: boolean;
    onSelect: () => void;
    onApprove: (ev: EventItem) => void;
    onDelete: (ev: EventItem) => void;
}) {
    const t = STATUS_THEME[status];
    return (
        <div className="flex items-start gap-4 rounded-2xl p-4 cursor-pointer transition-all duration-200"
             onClick={onSelect}
             style={{
                 opacity: t.opacity,
                 background: selected ? "var(--violet-bg)" : t.cardBg,
                 border: `1px solid ${selected ? "var(--violet-border)" : t.cardBorder}`,
             }}>
            <div className="flex flex-col items-center justify-center rounded-xl px-3 py-2 shrink-0 min-w-[52px]"
                 style={{ background: t.badgeBg, border: `1px solid ${t.badgeBorder}` }}>
                {status === "today" ? (
                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: t.dayColor }}>bugün</span>
                ) : (
                    <>
                        <span className="text-lg font-bold leading-none" style={{ color: t.dayColor }}>
                            {new Date(ev.event_date + "T00:00:00").getDate()}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: t.monthColor }}>
                            {new Date(ev.event_date + "T00:00:00").toLocaleDateString("tr-TR", { month: "short" })}
                        </span>
                    </>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold" style={{ color: t.titleColor }}>{ev.title}</p>
                    {ev.approved && (
                        <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "rgba(52,211,153,0.85)" }}>
                            <CheckCircle size={9} /> Onaylı
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 mb-0.5">
                    <MapPin size={10} style={{ color: "var(--text-4)", flexShrink: 0 }} />
                    <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>{ev.address}</p>
                </div>
                <p className="text-[11px]" style={{ color: "var(--text-4)" }}>
                    @{ev.username}
                    {ev.event_time ? ` · ${ev.event_time.slice(0, 5)}` : ""}
                </p>
            </div>
            <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                {ev.ref_url && (
                    <a href={ev.ref_url} target="_blank" rel="noopener noreferrer"
                       className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
                       style={{ color: "var(--violet-text)" }}>
                        <ExternalLink size={13} />
                    </a>
                )}
                {isAdmin && (
                    <button onClick={() => onApprove(ev)}
                            className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
                            style={{ color: ev.approved ? "rgba(52,211,153,0.8)" : "var(--text-4)" }}
                            title={ev.approved ? "Onayı kaldır" : "Onayla"}>
                        <CheckCircle size={13} />
                    </button>
                )}
                {canDelete && (
                    <button onClick={() => onDelete(ev)}
                            className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
                            style={{ color: "rgba(239,68,68,0.5)" }}
                            title="Sil">
                        <Trash2 size={13} />
                    </button>
                )}
            </div>
        </div>
    );
}
