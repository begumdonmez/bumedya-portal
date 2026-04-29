"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

function passwordStrength(pw: string): number {
    if (pw.length < 8) return 1;
    const score = [pw.length >= 12, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
    return Math.max(1, score) as 1 | 2 | 3 | 4;
}

const strengthLabel = ["", "Zayıf", "Orta", "İyi", "Güçlü"];
const strengthColor = ["", "rgba(239,68,68,0.8)", "rgba(124,58,237,0.8)", "rgba(251,191,36,0.8)", "rgba(52,211,153,0.8)"];

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

    const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
        <button type="button" onClick={onToggle}
                className="p-1 transition-colors duration-200"
                style={{ color: "rgba(224,242,254,0.3)" }}>
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

    return (
        <div className="aurora-bg relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />

            <div className="relative z-10 w-full max-w-md animate-float-up">
                <div aria-hidden className="absolute -inset-[1px] rounded-3xl pointer-events-none opacity-40"
                     style={{
                         background: "linear-gradient(135deg, rgba(124,58,237,0.3), transparent, rgba(59,130,246,0.1))",
                         filter: "blur(2px)",
                     }} />

                <div className="relative rounded-3xl overflow-hidden"
                     style={{
                         background: "rgba(255,255,255,0.04)",
                         backdropFilter: "blur(40px) saturate(180%)",
                         WebkitBackdropFilter: "blur(40px) saturate(180%)",
                         border: "1px solid rgba(255,255,255,0.08)",
                         boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
                     }}>
                    <div className="h-[1px] w-full" style={{
                        background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6) 40%, rgba(167,139,250,0.4) 60%, transparent)",
                    }} />

                    <div className="p-8">
                        <div className="mb-8">
                            <Link href="/" className="inline-flex items-baseline gap-0.5 mb-6 group">
                                <span className="text-sm font-bold" style={{ color: "rgba(224,242,254,0.5)" }}>bumedya</span>
                                <span className="text-sm font-bold" style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                            </Link>
                            <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: "#E0F2FE" }}>
                                Yeni Şifre
                            </h1>
                            <p className="text-sm" style={{ color: "rgba(224,242,254,0.4)" }}>
                                Hesabın için yeni bir şifre belirle.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-1" noValidate>
                            {/* Yeni şifre */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-medium tracking-[0.15em] uppercase transition-colors duration-200"
                                       style={{ color: focusedPw ? "rgba(167,139,250,0.8)" : "rgba(224,242,254,0.4)" }}>
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
                                        className="w-full rounded-xl px-4 py-3 pr-12 text-sm placeholder:text-white/20 transition-all duration-300 outline-none"
                                        style={{
                                            background: "rgba(255,255,255,0.05)",
                                            color: "#E0F2FE",
                                            border: `1px solid ${focusedPw ? "rgba(124,58,237,0.65)" : "rgba(255,255,255,0.07)"}`,
                                            boxShadow: focusedPw ? "0 0 0 1px rgba(124,58,237,0.2), 0 0 20px rgba(124,58,237,0.1)" : "none",
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
                                                 style={{ background: lvl <= pwStrength ? strengthColor[pwStrength] : "rgba(255,255,255,0.07)" }} />
                                        ))}
                                    </div>
                                    <p className="text-[11px]" style={{ color: strengthColor[pwStrength] }}>
                                        {strengthLabel[pwStrength]}
                                    </p>
                                </div>
                            )}

                            {/* Şifre tekrar */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-medium tracking-[0.15em] uppercase transition-colors duration-200"
                                       style={{ color: focusedConfirm ? "rgba(167,139,250,0.8)" : "rgba(224,242,254,0.4)" }}>
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
                                        className="w-full rounded-xl px-4 py-3 pr-12 text-sm placeholder:text-white/20 transition-all duration-300 outline-none"
                                        style={{
                                            background: "rgba(255,255,255,0.05)",
                                            color: "#E0F2FE",
                                            border: `1px solid ${confirmError ? "rgba(239,68,68,0.5)" : focusedConfirm ? "rgba(124,58,237,0.65)" : "rgba(255,255,255,0.07)"}`,
                                            boxShadow: focusedConfirm && !confirmError ? "0 0 0 1px rgba(124,58,237,0.2), 0 0 20px rgba(124,58,237,0.1)" : "none",
                                        }}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <EyeToggle show={showConfirmPw} onToggle={() => setShowConfirmPw(!showConfirmPw)} />
                                    </div>
                                </div>
                                <div className="min-h-[16px]">
                                    {confirmError && (
                                        <p className="text-[11px] flex items-center gap-1" style={{ color: "rgba(239,68,68,0.8)" }}>
                                            ⚠ {confirmError}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !password || !confirmPassword}
                                className="relative mt-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-300 overflow-hidden disabled:cursor-not-allowed"
                                style={{
                                    background: loading || !password || !confirmPassword ? "rgba(124,58,237,0.5)" : "#7C3AED",
                                    boxShadow: loading || !password || !confirmPassword ? "none" : "0 8px 24px rgba(124,58,237,0.4)",
                                }}>
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        Güncelleniyor...
                                    </span>
                                ) : "Şifreyi Güncelle"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
