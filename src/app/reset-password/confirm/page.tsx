"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";

function passwordStrength(pw: string): number {
    if (pw.length < 8) return 1;
    const score = [pw.length >= 12, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
    return Math.max(1, score) as 1 | 2 | 3 | 4;
}

const strengthLabel = ["", "Zayıf", "Orta", "İyi", "Güçlü"];
const strengthColor = ["", "color-mix(in srgb, var(--danger) 80%, transparent)", "color-mix(in srgb, var(--accent) 80%, transparent)", "color-mix(in srgb, var(--warn) 80%, transparent)", "color-mix(in srgb, var(--success) 80%, transparent)"];

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
    return (
    <button type="button" onClick={onToggle} aria-label={show ? "Şifreyi gizle" : "Şifreyi göster"}
            className="p-1 transition-colors duration-200"
            style={{ color: "color-mix(in srgb, var(--fg) 30%, transparent)" }}>
        {show ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4Z" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
        ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4Z" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
        )}
    </button>
    );
}

export default function ResetPasswordConfirmPage() {
    const router = useRouter();
    const [password, setPassword]             = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading]               = useState(false);
    const [showPw, setShowPw]                 = useState(false);
    const [showConfirmPw, setShowConfirmPw]   = useState(false);
    const [confirmError, setConfirmError]     = useState("");
    const [focusedPw, setFocusedPw]           = useState(false);
    const [focusedConfirm, setFocusedConfirm] = useState(false);

    const pwStrength = password.length > 0 ? passwordStrength(password) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setConfirmError("");

        if (password.length < 8) {
            toast.error("Şifre en az 8 karakter olmalı.");
            return;
        }
        if (password !== confirmPassword) {
            setConfirmError("Şifreler eşleşmiyor.");
            return;
        }

        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            toast.error("Şifre güncellenemedi. Link süresi dolmuş olabilir.");
            setLoading(false);
            return;
        }

        toast.success("Şifren güncellendi.");
        router.push("/home");
    };


    return (
        <AuthShell title="Yeni şifre" description="Hesabın için yeni bir şifre belirle.">

                        <form onSubmit={handleSubmit} className="flex flex-col gap-1" noValidate>
                            {/* Yeni şifre */}
                            <div className="flex flex-col gap-1.5">
                                <label className="field-label">
                                    Yeni Şifre
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPw ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        onFocus={() => setFocusedPw(true)}
                                        onBlur={() => setFocusedPw(false)}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        className="w-full rounded-xl px-4 py-3 pr-12 text-sm placeholder:text-[color-mix(in_srgb,var(--fg)_20%,transparent)] transition-all duration-300 outline-none"
                                        style={{
                                            background: "color-mix(in srgb, var(--fg) 5%, transparent)",
                                            color: "var(--text-1)",
                                            border: `1px solid ${focusedPw ? "color-mix(in srgb, var(--accent) 65%, transparent)" : "color-mix(in srgb, var(--fg) 7%, transparent)"}`,
                                            boxShadow: focusedPw ? "0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent), 0 0 20px color-mix(in srgb, var(--accent) 10%, transparent)" : "none",
                                        }}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <EyeToggle show={showPw} onToggle={() => setShowPw(!showPw)} />
                                    </div>
                                </div>
                                <div className="min-h-[16px]" />
                            </div>

                            {/* Güç çubuğu */}
                            {password.length > 0 && (
                                <div className="-mt-2 mb-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map((lvl) => (
                                            <div key={lvl} className="flex-1 h-[2px] rounded-full transition-all duration-300"
                                                 style={{ background: lvl <= pwStrength ? strengthColor[pwStrength] : "color-mix(in srgb, var(--fg) 7%, transparent)" }} />
                                        ))}
                                    </div>
                                    <p className="text-[11px]" style={{ color: strengthColor[pwStrength] }}>
                                        {strengthLabel[pwStrength]}
                                    </p>
                                </div>
                            )}

                            {/* Şifre tekrar */}
                            <div className="flex flex-col gap-1.5">
                                <label className="field-label">
                                    Şifre Tekrar
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPw ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={e => { setConfirmPassword(e.target.value); setConfirmError(""); }}
                                        onFocus={() => setFocusedConfirm(true)}
                                        onBlur={() => setFocusedConfirm(false)}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        className="w-full rounded-xl px-4 py-3 pr-12 text-sm placeholder:text-[color-mix(in_srgb,var(--fg)_20%,transparent)] transition-all duration-300 outline-none"
                                        style={{
                                            background: "color-mix(in srgb, var(--fg) 5%, transparent)",
                                            color: "var(--text-1)",
                                            border: `1px solid ${confirmError ? "color-mix(in srgb, var(--danger) 50%, transparent)" : focusedConfirm ? "color-mix(in srgb, var(--accent) 65%, transparent)" : "color-mix(in srgb, var(--fg) 7%, transparent)"}`,
                                            boxShadow: focusedConfirm && !confirmError ? "0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent), 0 0 20px color-mix(in srgb, var(--accent) 10%, transparent)" : "none",
                                        }}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <EyeToggle show={showConfirmPw} onToggle={() => setShowConfirmPw(!showConfirmPw)} />
                                    </div>
                                </div>
                                <div className="min-h-[16px]">
                                    {confirmError && (
                                        <p className="text-[11px] flex items-center gap-1" style={{ color: "color-mix(in srgb, var(--danger) 80%, transparent)" }}>
                                            ⚠ {confirmError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !password || !confirmPassword}
                                className="btn-primary relative mt-2 w-full">
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 rounded-full border-2 border-[color-mix(in_srgb,var(--fg)_30%,transparent)] border-t-[var(--on-accent)] animate-spin" />
                                        Güncelleniyor...
                                    </span>
                                ) : "Şifreyi Güncelle"}
                            </button>
                        </form>
        </AuthShell>
    );
}
