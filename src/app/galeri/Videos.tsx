"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Trash2, X } from "lucide-react";
import { YoutubeLite } from "./media";
import { sfx } from "@/lib/sfx";

export interface GalleryVideo {
    id: string;
    youtube_id: string;
    title: string;
    description: string | null;
    username: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
}

const STATUS_LABEL = { pending: "Onay bekliyor", approved: "Yayında", rejected: "Reddedildi" } as const;

async function call(url: string, method: string, body: unknown) {
    const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Bir şeyler ters gitti.");
    return data;
}

export default function Videos({ isAdmin, initialApproved, initialPending }: {
    isAdmin: boolean;
    /** Yayındaki videolar */
    initialApproved: GalleryVideo[];
    /** Admin için tüm bekleyenler, üye için yalnızca kendi önerileri */
    initialPending: GalleryVideo[];
}) {
    const [approved, setApproved] = useState(initialApproved);
    const [pending, setPending] = useState(initialPending);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState({ url: "", title: "", description: "" });
    const [sending, setSending] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const { video } = await call("/api/videos", "POST", form);
            if (video.status === "approved") {
                setApproved(v => [video, ...v]);
                toast.success("Video yayında.");
            } else {
                setPending(v => [video, ...v]);
                toast.success("Önerin alındı — yöneticiler bakınca yayına alınacak.");
            }
            sfx.chime();
            setForm({ url: "", title: "", description: "" });
            setFormOpen(false);
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setSending(false);
        }
    };

    const review = async (v: GalleryVideo, status: "approved" | "rejected") => {
        try {
            const { video } = await call("/api/admin/videos", "PATCH", { id: v.id, status });
            setPending(p => p.filter(x => x.id !== v.id));
            if (status === "approved") { setApproved(a => [video, ...a]); sfx.chime(); }
            toast.success(status === "approved" ? "Onaylandı, yayında." : "Reddedildi.");
        } catch (err) {
            toast.error((err as Error).message);
        }
    };

    const remove = async (v: GalleryVideo) => {
        if (!window.confirm(`“${v.title}” videosu kaldırılacak. Emin misin?`)) return;
        try {
            await call("/api/admin/videos", "DELETE", { id: v.id });
            setApproved(a => a.filter(x => x.id !== v.id));
            toast.success("Kaldırıldı.");
        } catch (err) {
            toast.error((err as Error).message);
        }
    };

    return (
        <div className="flex flex-col gap-10">
            {/* Ekle / öner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm max-w-xl" style={{ color: "var(--text-3)" }}>
                    Çekimler, kamera arkası, röportajlar. Videolar YouTube&apos;dan gömülür —
                    {isAdmin ? " eklediğin video hemen yayına girer." : " önerdiğin video yöneticiler onaylayınca yayına girer."}
                </p>
                <button type="button" className="btn-primary shrink-0" onClick={() => setFormOpen(o => !o)}>
                    {formOpen ? "Vazgeç" : isAdmin ? "+ Video ekle" : "+ Video öner"}
                </button>
            </div>

            {formOpen && (
                <form onSubmit={submit} className="card p-5 sm:p-6 grid gap-4 animate-float-up">
                    <div className="grid gap-1.5">
                        <label htmlFor="v-url" className="field-label">YouTube bağlantısı *</label>
                        <input id="v-url" className="input-field" required placeholder="https://youtu.be/…"
                               value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
                        <p className="text-xs" style={{ color: "var(--text-4)" }}>
                            İpucu: kulüp kanalında &quot;liste dışı&quot; yüklersen video yalnızca burada görünür.
                        </p>
                    </div>
                    <div className="grid gap-1.5">
                        <label htmlFor="v-title" className="field-label">Başlık *</label>
                        <input id="v-title" className="input-field" required maxLength={120} placeholder="Kadraj çekimi — kamera arkası"
                               value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div className="grid gap-1.5">
                        <label htmlFor="v-desc" className="field-label">Açıklama</label>
                        <textarea id="v-desc" className="input-field resize-none" rows={3} maxLength={500}
                                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <button type="submit" disabled={sending} className="btn-primary justify-self-end">
                        {sending ? "Gönderiliyor…" : isAdmin ? "Yayınla" : "Öneriyi gönder"}
                    </button>
                </form>
            )}

            {/* Bekleyenler: admin için onay kuyruğu, üye için kendi önerileri */}
            {pending.length > 0 && (
                <section>
                    <h2 className="font-display text-xl font-medium pb-2 mb-4" style={{ color: "var(--text-1)", borderBottom: "2px solid var(--text-1)" }}>
                        {isAdmin ? `Onay bekleyen öneriler (${pending.length})` : "Önerilerin"}
                    </h2>
                    <ul className="grid sm:grid-cols-2 gap-4">
                        {pending.map(v => (
                            <li key={v.id} className="card overflow-hidden flex flex-col">
                                <YoutubeLite id={v.youtube_id} title={v.title} />
                                <div className="p-4 flex flex-col gap-1 flex-1">
                                    <p className="font-semibold" style={{ color: "var(--text-1)" }}>{v.title}</p>
                                    <p className="text-xs" style={{ color: "var(--text-4)" }}>@{v.username} · {STATUS_LABEL[v.status]}</p>
                                    {v.description && <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>{v.description}</p>}
                                    {isAdmin && (
                                        <div className="flex gap-2 mt-3">
                                            <button type="button" className="btn-primary !py-1.5 !px-3" onClick={() => review(v, "approved")}>
                                                <Check size={14} /> Onayla
                                            </button>
                                            <button type="button" className="btn-ghost !py-1.5 !px-3" onClick={() => review(v, "rejected")}>
                                                <X size={14} /> Reddet
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Yayındaki videolar */}
            {approved.length === 0 ? (
                <p className="font-display text-2xl italic py-16 text-center" style={{ color: "var(--text-3)" }}>
                    Henüz video yok. İlk kamera arkası seninkisi olsun.
                </p>
            ) : (
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {approved.map(v => (
                        <li key={v.id} className="card overflow-hidden flex flex-col">
                            <YoutubeLite id={v.youtube_id} title={v.title} />
                            <div className="p-4 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-semibold leading-snug" style={{ color: "var(--text-1)" }}>{v.title}</p>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--text-4)" }}>@{v.username}</p>
                                    {v.description && <p className="text-sm mt-2 line-clamp-3" style={{ color: "var(--text-3)" }}>{v.description}</p>}
                                </div>
                                {isAdmin && (
                                    <button type="button" aria-label={`${v.title} videosunu kaldır`} onClick={() => remove(v)}
                                            className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center" style={{ color: "var(--danger)" }}>
                                        <Trash2 size={15} />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
