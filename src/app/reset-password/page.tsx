"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft } from "lucide-react";

type State = "idle" | "loading" | "success";

export default function ResetPasswordPage() {
    const [email, setEmail]   = useState("");
    const [state, setState]   = useState<State>("idle");
    const [focused, setFocused] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setState("loading");
        const supabase = createClient();

        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password/confirm`,
        });

        if (error) {
            toast.error("Bir hata oluştu. Tekrar dene.");
            setState("idle");
            return;
        }

        setState("success");
    };

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
                            <Link href="/login" className="inline-flex items-center gap-1.5 mb-6 text-xs transition-colors duration-200"
                                  style={{ color: "rgba(224,242,254,0.3)" }}
                                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(224,242,254,0.6)")}
                                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(224,242,254,0.3)")}>
                                <ChevronLeft size={14} /> Girişe dön
                            </Link>

                            <Link href="/" className="inline-flex items-baseline gap-0.5 mb-6 group">
                                <span className="text-sm font-bold" style={{ color: "rgba(224,242,254,0.5)" }}>bumedya</span>
                                <span className="text-sm font-bold" style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                            </Link>

                            <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: "#E0F2FE" }}>
                                Şifreni Sıfırla
                            </h1>
                            <p className="text-sm" style={{ color: "rgba(224,242,254,0.4)" }}>
                                E-postana sıfırlama linki gönderelim.
                            </p>
                        </div>

                        {state === "success" ? (
                            <div className="flex flex-col items-center gap-6 py-4 text-center">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
                                     style={{
                                         background: "rgba(124,58,237,0.12)",
                                         border: "1px solid rgba(124,58,237,0.3)",
                                         boxShadow: "0 0 40px rgba(124,58,237,0.2)",
                                     }}>
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: "#A78BFA" }}>
                                        <path d="M4 16l8 8L28 8" stroke="currentColor" strokeWidth="2.5"
                                              strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2" style={{ color: "#E0F2FE" }}>Link gönderildi!</h3>
                                    <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(224,242,254,0.5)" }}>
                                        <span style={{ color: "rgba(167,139,250,0.8)" }}>{email}</span> adresine
                                        şifre sıfırlama linki gönderdik.
                                    </p>
                                </div>
                                <p className="text-xs" style={{ color: "rgba(224,242,254,0.25)" }}>
                                    Gelmediyse spam klasörünü kontrol et.
                                </p>
                                <Link href="/login" className="text-sm transition-colors duration-300"
                                      style={{ color: "rgba(124,58,237,0.7)" }}>
                                    Girişe dön
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-medium tracking-[0.15em] uppercase transition-colors duration-200"
                                           style={{ color: focused ? "rgba(167,139,250,0.8)" : "rgba(224,242,254,0.4)" }}>
                                        E-Posta
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        onFocus={() => setFocused(true)}
                                        onBlur={() => setFocused(false)}
                                        placeholder="fanzinci@mail.com"
                                        autoComplete="email"
                                        required
                                        className="w-full rounded-xl px-4 py-3 text-sm placeholder:text-white/20 transition-all duration-300 outline-none"
                                        style={{
                                            background: "rgba(255,255,255,0.05)",
                                            color: "#E0F2FE",
                                            border: `1px solid ${focused ? "rgba(124,58,237,0.65)" : "rgba(255,255,255,0.07)"}`,
                                            boxShadow: focused ? "0 0 0 1px rgba(124,58,237,0.2), 0 0 20px rgba(124,58,237,0.1)" : "none",
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={state === "loading" || !email.trim()}
                                    className="relative mt-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-300 overflow-hidden disabled:cursor-not-allowed"
                                    style={{
                                        background: state === "loading" || !email.trim() ? "rgba(124,58,237,0.5)" : "#7C3AED",
                                        boxShadow: state === "loading" || !email.trim() ? "none" : "0 8px 24px rgba(124,58,237,0.4)",
                                    }}>
                                    {state === "loading" ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                            Gönderiliyor...
                                        </span>
                                    ) : "Link Gönder"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
