"use client";

import { useState } from "react";
import { X, Check, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Position } from "./positions";

export default function BasvuruForm({
    position,
    userId,
    username,
    hasPending,
    onClose,
    onSuccess,
}: {
    position: Position;
    userId: string;
    username: string;
    hasPending: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const Icon = position.icon;

    const handleSubmit = async () => {
        const unanswered = position.questions.filter(q => !answers[q.key]?.trim());
        if (unanswered.length > 0) { toast.error("Lütfen tüm soruları yanıtla."); return; }
        setSubmitting(true);
        const supabase = createClient();
        const { error } = await supabase.from("applications").insert({
            user_id: userId, username, type: position.id, answers,
        });
        if (error) { toast.error("Gönderilemedi: " + error.message); setSubmitting(false); return; }
        toast.success("Başvurun alındı!");
        setSubmitted(true);
        setSubmitting(false);
        onSuccess();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
             style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
             onClick={(e) => e.target === e.currentTarget && onClose()}>

            <div className="w-full max-w-lg rounded-3xl overflow-hidden flex flex-col"
                 style={{ background: "rgba(12,18,42,0.97)", backdropFilter: "blur(32px)", border: "1px solid var(--border-1)", maxHeight: "90dvh" }}>

                {/* Header */}
                <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b"
                     style={{ borderColor: "var(--border-3)" }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                             style={{ background: position.bg, border: `1px solid ${position.border}` }}>
                            <Icon size={15} style={{ color: position.color }} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{position.title}</p>
                            <p className="text-[11px]" style={{ color: position.color }}>{position.subtitle}</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-opacity hover:opacity-60"
                            style={{ background: "var(--bg-2)", color: "var(--text-3)" }}>
                        <X size={14} />
                    </button>
                </div>

                {/* İçerik */}
                <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">

                    {submitted ? (
                        <div className="flex flex-col items-center text-center gap-4 py-8">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                 style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)" }}>
                                <CheckCircle2 size={26} style={{ color: "rgba(52,211,153,0.9)" }} />
                            </div>
                            <div>
                                <p className="text-base font-bold mb-1" style={{ color: "var(--text-1)" }}>Başvurun Alındı!</p>
                                <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
                                    Admin ekibi en kısa sürede değerlendirip geri dönecek.
                                </p>
                            </div>
                            <button onClick={onClose} className="px-5 py-2 rounded-xl text-sm font-medium"
                                    style={{ background: "var(--violet-bg-md)", border: "1px solid var(--violet-border)", color: "var(--violet-text)" }}>
                                Kapat
                            </button>
                        </div>
                    ) : (
                        <>
                            {hasPending && (
                                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                                     style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
                                    <AlertCircle size={13} className="shrink-0 mt-0.5" style={{ color: "rgba(251,191,36,0.8)" }} />
                                    <p className="text-xs" style={{ color: "rgba(251,191,36,0.8)" }}>
                                        Bu pozisyon için bekleyen bir başvurun var.
                                    </p>
                                </div>
                            )}

                            {position.questions.map((q, i) => (
                                <div key={q.key} className="flex flex-col gap-2">
                                    <label className="text-xs font-medium leading-relaxed" style={{ color: "var(--text-2)" }}>
                                        <span className="font-bold mr-1.5" style={{ color: position.color }}>{i + 1}.</span>
                                        {q.label}
                                    </label>
                                    <textarea
                                        value={answers[q.key] ?? ""}
                                        onChange={(e) => setAnswers(p => ({ ...p, [q.key]: e.target.value }))}
                                        placeholder={q.placeholder}
                                        rows={q.rows}
                                        maxLength={1000}
                                        className="w-full resize-none rounded-xl px-3.5 py-2.5 text-sm outline-none leading-relaxed"
                                        style={{
                                            background: "var(--bg-2)",
                                            border: `1px solid ${answers[q.key]?.trim() ? position.border : "var(--border-2)"}`,
                                            color: "var(--text-1)",
                                            transition: "border-color 200ms",
                                        }}
                                    />
                                </div>
                            ))}

                            <button onClick={handleSubmit} disabled={submitting}
                                    className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                    style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.8), rgba(109,40,217,0.7))", color: "#fff", border: "1px solid rgba(124,58,237,0.4)" }}>
                                {submitting
                                    ? <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Gönderiliyor...</>
                                    : <><Check size={15} /> Başvuruyu Gönder</>}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
