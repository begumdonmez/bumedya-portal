"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, Clock, X } from "lucide-react";
import { POSITIONS, type PositionId } from "./positions";

/* Lazy-load the heavy form modal — Supabase client code loads only when user clicks "Başvur" */
const BasvuruForm = dynamic(() => import("./BasvuruForm"), { ssr: false, loading: () => null });

/* ── Durum chip'i ─────────────────────────────────────────── */
function StatusChip({ status }: { status: string }) {
    if (status === "pending")
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", color: "rgba(251,191,36,0.9)" }}><Clock size={11} /> Beklemede</span>;
    if (status === "approved")
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", color: "rgba(52,211,153,0.9)" }}><Check size={11} /> Onaylandı</span>;
    return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "rgba(239,68,68,0.9)" }}><X size={11} /> Reddedildi</span>;
}

/* ── Ana bileşen ──────────────────────────────────────────── */
export default function BasvuruClient({
    userId,
    username,
    myApplications,
}: {
    userId: string;
    username: string;
    myApplications: { id: string; type: string; status: string; created_at: string; admin_note?: string }[];
}) {
    const [selectedId, setSelectedId] = useState<PositionId | null>(null);

    const pendingTypes = new Set(myApplications.filter(a => a.status === "pending").map(a => a.type));
    const selectedPosition = selectedId ? (POSITIONS.find(p => p.id === selectedId) ?? null) : null;

    /* Track new submission so we can refresh status without a full reload */
    const [freshSubmits, setFreshSubmits] = useState<Set<string>>(new Set());

    const handleSuccess = () => {
        if (selectedId) setFreshSubmits(prev => new Set(prev).add(selectedId));
        setSelectedId(null);
    };

    return (
        <>
            <div className="aurora-bg relative min-h-screen flex flex-col">
                <div aria-hidden className="aurora-layer" />
                <div aria-hidden className="aurora-orb-pink" />

                {/* Navbar */}
                <nav className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-4 border-b nav-backdrop"
                     style={{ borderColor: "var(--border-3)" }}>
                    <div className="flex items-center gap-3">
                        <Link href="/home" className="text-xs px-2 py-1 rounded-lg transition-colors duration-200"
                              style={{ color: "var(--text-3)" }}>
                            <ChevronLeft size={15} />
                        </Link>
                        <Link href="/home" className="flex items-baseline gap-0.5">
                            <span className="text-sm font-bold" style={{ color: "var(--text-2)" }}>bumedya</span>
                            <span className="text-sm font-bold" style={{ color: "var(--violet-text)" }}>.</span>
                        </Link>
                        <span style={{ color: "var(--border-1)" }}>/</span>
                        <span className="text-sm font-medium" style={{ color: "var(--text-2)" }}>Başvuru</span>
                    </div>
                </nav>

                <div className="relative z-10 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col gap-10">

                    {/* Hero */}
                    <div className="text-center flex flex-col items-center gap-4">
                        <div className="glass flex items-center gap-2 px-4 py-2 rounded-full">
                            <span className="text-sm">🏛</span>
                            <span className="text-[11px] tracking-widest uppercase font-medium" style={{ color: "var(--text-3)" }}>
                                Yönetim Başvuruları
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--text-1)" }}>
                            Topluluğu Birlikte<br />
                            <span className="text-gradient-violet">Şekillendirelim</span>
                        </h1>
                        <p className="text-sm leading-relaxed max-w-md" style={{ color: "var(--text-3)" }}>
                            Bumedya'nın büyümesine katkı sağlamak istiyorsan aşağıdaki pozisyonlardan birine başvurabilirsin.
                            Her başvuru admin ekibi tarafından değerlendirilir.
                        </p>
                    </div>

                    {/* Pozisyonlar */}
                    <div className="flex flex-col gap-4">
                        <p className="label-caps">Açık Pozisyonlar</p>
                        {POSITIONS.map((pos) => {
                            const myApp = myApplications.find(a => a.type === pos.id);
                            const justSubmitted = freshSubmits.has(pos.id);
                            return (
                                <div key={pos.id} className="card p-5 sm:p-6 flex flex-col gap-4">
                                    {/* Başlık */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
                                                 style={{ background: pos.bg, border: `1px solid ${pos.border}` }}>
                                                {pos.emoji}
                                            </div>
                                            <div>
                                                <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{pos.title}</h2>
                                                <p className="text-[11px]" style={{ color: pos.color }}>{pos.subtitle}</p>
                                            </div>
                                        </div>
                                        {(myApp || justSubmitted) && (
                                            <StatusChip status={justSubmitted ? "pending" : myApp!.status} />
                                        )}
                                    </div>

                                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>{pos.about}</p>

                                    {/* Gereksinimler özet */}
                                    <div className="flex flex-wrap gap-2">
                                        {pos.requirements.map((r, i) => (
                                            <span key={i} className="text-[10px] px-2.5 py-1 rounded-full"
                                                  style={{ background: pos.bg, border: `1px solid ${pos.border}`, color: pos.color }}>
                                                {r}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Admin notu */}
                                    {myApp?.admin_note && (
                                        <div className="px-3 py-2.5 rounded-xl text-xs leading-relaxed"
                                             style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-3)" }}>
                                            <span className="font-semibold" style={{ color: "var(--text-2)" }}>Admin notu: </span>
                                            {myApp.admin_note}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setSelectedId(pos.id)}
                                        className="self-start flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200"
                                        style={{ background: pos.bg, border: `1px solid ${pos.border}`, color: pos.color }}>
                                        {myApp?.status === "approved" || justSubmitted
                                            ? "Tekrar Başvur"
                                            : myApp?.status === "pending"
                                                ? "Yeni Başvuru Yap"
                                                : "Başvur"}
                                        <ChevronRight size={13} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Geçmiş başvurular */}
                    {myApplications.length > 0 && (
                        <div className="flex flex-col gap-4">
                            <p className="label-caps">Başvuru Geçmişim</p>
                            <div className="card overflow-hidden">
                                {myApplications.map((app, i) => {
                                    const pos = POSITIONS.find(p => p.id === app.type);
                                    return (
                                        <div key={app.id}
                                             className="flex items-center justify-between px-4 sm:px-5 py-3.5"
                                             style={{ borderBottom: i < myApplications.length - 1 ? "1px solid var(--border-3)" : "none" }}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-base">{pos?.emoji ?? "📋"}</span>
                                                <div>
                                                    <p className="text-xs font-medium" style={{ color: "var(--text-2)" }}>{pos?.title ?? app.type}</p>
                                                    <p className="text-[10px]" style={{ color: "var(--text-4)" }}>
                                                        {new Date(app.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusChip status={app.status} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Süreç bilgisi */}
                    <div className="card p-5 sm:p-6 flex flex-col gap-4">
                        <p className="label-caps">Başvuru Süreci</p>
                        <div className="flex flex-col gap-3">
                            {[
                                { step: "1", label: "Başvuru",       desc: "Formu eksiksiz doldurup gönderiyorsun" },
                                { step: "2", label: "Değerlendirme", desc: "Admin ekibi başvurunu inceler (1-2 hafta)" },
                                { step: "3", label: "Geri Bildirim", desc: "Platform üzerinden bildirim alıyorsun" },
                                { step: "4", label: "Tanışma",       desc: "Onaylandıysan ekibe dahil oluyorsun" },
                            ].map(({ step, label, desc }) => (
                                <div key={step} className="flex items-center gap-4">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                                         style={{ background: "var(--violet-bg-md)", border: "1px solid var(--violet-border)", color: "var(--violet-text)" }}>
                                        {step}
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>{label}</p>
                                        <p className="text-[11px]" style={{ color: "var(--text-4)" }}>{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Form modal — yalnızca "Başvur"a tıklandığında yüklenir */}
            {selectedPosition && (
                <BasvuruForm
                    position={selectedPosition}
                    userId={userId}
                    username={username}
                    hasPending={pendingTypes.has(selectedPosition.id)}
                    onClose={() => setSelectedId(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </>
    );
}
