"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { CalendarDays, MapPin, Plus, X, CheckCircle, ExternalLink, Trash2 } from "lucide-react";
import EventMapClient from "@/components/EventMapClient";
import type { EventItem } from "@/components/EventMap";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import HomeNavLinks from "@/components/HomeNavLinks";
import NotificationBell from "@/components/NotificationBell";
import SiteHeader from "@/components/SiteHeader";

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
        <div className="relative min-h-screen flex flex-col">

            {/* Navbar */}
            <SiteHeader userId={userId} username={username}
                actions={<>
                    <button onClick={() => setShowForm(true)}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                            style={{ background: "var(--accent-bg-md)", border: "1px solid var(--accent-border)", color: "var(--accent-text)" }}>
                        <Plus size={13} /> Etkinlik Ekle
                    </button>
                </>}
            />

            <div className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-24 pb-10 flex flex-col gap-6">
                {/* Harita */}
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--accent-bg-md)" }}>
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
                         style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p className="text-base font-bold" style={{ color: "var(--text-1)" }}>{selected.title}</p>
                                    {selected.approved && (
                                        <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full"
                                              style={{ background: "color-mix(in srgb, var(--success) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--success) 30%, transparent)", color: "color-mix(in srgb, var(--success) 90%, transparent)" }}>
                                            <CheckCircle size={10} /> Onaylı
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <MapPin size={12} style={{ color: "var(--text-3)", flexShrink: 0 }} />
                                    <p className="text-sm" style={{ color: "var(--text-3)" }}>{selected.address}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CalendarDays size={12} style={{ color: "var(--accent-text)", flexShrink: 0 }} />
                                    <p className="text-sm" style={{ color: "var(--accent-text)" }}>
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
                                   style={{ background: "var(--accent-bg-md)", border: "1px solid var(--accent-border)", color: "var(--accent-text)" }}>
                                    <ExternalLink size={11} /> Detaylar
                                </a>
                            )}
                            {isAdmin && (
                                <button onClick={() => handleApprove(selected)}
                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all duration-200"
                                        style={{
                                            background: selected.approved ? "color-mix(in srgb, var(--success) 8%, transparent)" : "color-mix(in srgb, var(--success) 12%, transparent)",
                                            border: `1px solid ${selected.approved ? "color-mix(in srgb, var(--success) 20%, transparent)" : "color-mix(in srgb, var(--success) 30%, transparent)"}`,
                                            color: "color-mix(in srgb, var(--success) 85%, transparent)",
                                        }}>
                                    <CheckCircle size={11} />
                                    {selected.approved ? "Onayı Kaldır" : "Onayla"}
                                </button>
                            )}
                            {canDelete(selected) && (
                                <button onClick={() => handleDelete(selected)}
                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all duration-200"
                                        style={{ background: "color-mix(in srgb, var(--danger) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--danger) 20%, transparent)", color: "color-mix(in srgb, var(--danger) 70%, transparent)" }}>
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
                            <p className="text-[11px] font-medium tracking-[0.15em] uppercase"
                               style={{ color: "color-mix(in srgb, var(--success) 70%, transparent)" }}>Bugün</p>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "color-mix(in srgb, var(--success) 80%, transparent)" }} />
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
                        <p className="text-[11px] font-medium tracking-[0.15em] uppercase"
                           style={{ color: "color-mix(in srgb, var(--warn) 50%, transparent)" }}>Yaklaşan Etkinlikler</p>
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
                        <p className="text-[11px] font-medium tracking-[0.15em] uppercase"
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
                        <p className="text-[11px] font-medium tracking-[0.15em] uppercase"
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
                     style={{ background: "var(--overlay)" }}
                     onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
                    <div className="relative w-full max-w-md rounded-2xl overflow-hidden"
                         style={{ background: "color-mix(in srgb, var(--surface-solid) 97%, transparent)", border: "1px solid var(--accent-border)", boxShadow: "0 12px 32px color-mix(in srgb, var(--shade) 18%, transparent)" }}>
                        <div className="h-px w-full" style={{ background: "color-mix(in srgb, var(--accent) 35%, transparent)" }} />
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
                                    <p className="text-xs flex items-center gap-1" style={{ color: "color-mix(in srgb, var(--danger) 80%, transparent)" }}>
                                        ⚠ {formError}
                                    </p>
                                )}

                                <button type="submit" disabled={formLoading || geocoding}
                                        className="btn-primary w-full mt-1">
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
            <label className="field-label">
                {label}
                {required && <span style={{ color: "color-mix(in srgb, var(--danger) 70%, transparent)" }}>*</span>}
            </label>
            {children}
            {hint && <p className="text-[11px]" style={{ color: "var(--text-4)" }}>{hint}</p>}
        </div>
    );
}

const STATUS_THEME = {
    today: {
        cardBg:     "color-mix(in srgb, var(--success) 5%, transparent)",
        cardBorder: "color-mix(in srgb, var(--success) 25%, transparent)",
        badgeBg:    "color-mix(in srgb, var(--success) 12%, transparent)",
        badgeBorder:"color-mix(in srgb, var(--success) 30%, transparent)",
        dayColor:   "color-mix(in srgb, var(--success) 95%, transparent)",
        monthColor: "color-mix(in srgb, var(--success) 55%, transparent)",
        titleColor: "var(--text-1)",
        opacity:    1,
    },
    upcoming: {
        cardBg:     "color-mix(in srgb, var(--warn) 3%, transparent)",
        cardBorder: "color-mix(in srgb, var(--warn) 15%, transparent)",
        badgeBg:    "color-mix(in srgb, var(--warn) 8%, transparent)",
        badgeBorder:"color-mix(in srgb, var(--warn) 20%, transparent)",
        dayColor:   "color-mix(in srgb, var(--warn) 90%, transparent)",
        monthColor: "color-mix(in srgb, var(--warn) 45%, transparent)",
        titleColor: "var(--text-1)",
        opacity:    1,
    },
    future: {
        cardBg:     "color-mix(in srgb, var(--fg) 3%, transparent)",
        cardBorder: "color-mix(in srgb, var(--fg) 7%, transparent)",
        badgeBg:    "color-mix(in srgb, var(--accent) 8%, transparent)",
        badgeBorder:"color-mix(in srgb, var(--accent) 18%, transparent)",
        dayColor:   "color-mix(in srgb, var(--accent) 70%, transparent)",
        monthColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
        titleColor: "var(--text-1)",
        opacity:    1,
    },
    past: {
        cardBg:     "color-mix(in srgb, var(--fg) 2%, transparent)",
        cardBorder: "color-mix(in srgb, var(--fg) 5%, transparent)",
        badgeBg:    "color-mix(in srgb, var(--fg) 4%, transparent)",
        badgeBorder:"color-mix(in srgb, var(--fg) 8%, transparent)",
        dayColor:   "color-mix(in srgb, var(--fg) 25%, transparent)",
        monthColor: "color-mix(in srgb, var(--fg) 15%, transparent)",
        titleColor: "color-mix(in srgb, var(--fg) 35%, transparent)",
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
                 background: selected ? "var(--accent-bg)" : t.cardBg,
                 border: `1px solid ${selected ? "var(--accent-border)" : t.cardBorder}`,
             }}>
            <div className="flex flex-col items-center justify-center rounded-xl px-3 py-2 shrink-0 min-w-[52px]"
                 style={{ background: t.badgeBg, border: `1px solid ${t.badgeBorder}` }}>
                {status === "today" ? (
                    <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: t.dayColor }}>bugün</span>
                ) : (
                    <>
                        <span className="text-lg font-bold leading-none" style={{ color: t.dayColor }}>
                            {new Date(ev.event_date + "T00:00:00").getDate()}
                        </span>
                        <span className="text-[11px] uppercase tracking-wider mt-0.5" style={{ color: t.monthColor }}>
                            {new Date(ev.event_date + "T00:00:00").toLocaleDateString("tr-TR", { month: "short" })}
                        </span>
                    </>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold" style={{ color: t.titleColor }}>{ev.title}</p>
                    {ev.approved && (
                        <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full"
                              style={{ background: "color-mix(in srgb, var(--success) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--success) 25%, transparent)", color: "color-mix(in srgb, var(--success) 85%, transparent)" }}>
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
                       style={{ color: "var(--accent-text)" }}>
                        <ExternalLink size={13} />
                    </a>
                )}
                {isAdmin && (
                    <button onClick={() => onApprove(ev)}
                            className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
                            style={{ color: ev.approved ? "color-mix(in srgb, var(--success) 80%, transparent)" : "var(--text-4)" }}
                            title={ev.approved ? "Onayı kaldır" : "Onayla"}>
                        <CheckCircle size={13} />
                    </button>
                )}
                {canDelete && (
                    <button onClick={() => onDelete(ev)}
                            className="p-1.5 rounded-lg transition-opacity hover:opacity-70"
                            style={{ color: "color-mix(in srgb, var(--danger) 50%, transparent)" }}
                            title="Sil">
                        <Trash2 size={13} />
                    </button>
                )}
            </div>
        </div>
    );
}
