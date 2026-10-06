"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";

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
        <AuthShell title="Şifreni sıfırla" description="E-postana sıfırlama linki gönderelim." back={{ href: "/login", label: "Girişe dön" }}>

                        {state === "success" ? (
                            <div className="flex flex-col items-center gap-6 py-4 text-center">
                                <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
                                     style={{
                                         background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                                         border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                                     }}>
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: "var(--accent)" }}>
                                        <path d="M4 16l8 8L28 8" stroke="currentColor" strokeWidth="2.5"
                                              strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-1)" }}>Link gönderildi!</h3>
                                    <p className="text-sm leading-relaxed max-w-xs" style={{ color: "color-mix(in srgb, var(--fg) 50%, transparent)" }}>
                                        <span style={{ color: "color-mix(in srgb, var(--accent) 80%, transparent)" }}>{email}</span> adresine
                                        şifre sıfırlama linki gönderdik.
                                    </p>
                                </div>
                                <p className="text-xs" style={{ color: "color-mix(in srgb, var(--fg) 25%, transparent)" }}>
                                    Gelmediyse spam klasörünü kontrol et.
                                </p>
                                <Link href="/login" className="text-sm transition-colors duration-300"
                                      style={{ color: "color-mix(in srgb, var(--accent) 70%, transparent)" }}>
                                    Girişe dön
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                                <div className="flex flex-col gap-1.5">
                                    <label className="field-label">
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
                                        className="w-full rounded-xl px-4 py-3 text-sm placeholder:text-[color-mix(in_srgb,var(--fg)_20%,transparent)] transition-all duration-300 outline-none"
                                        style={{
                                            background: "color-mix(in srgb, var(--fg) 5%, transparent)",
                                            color: "var(--text-1)",
                                            border: `1px solid ${focused ? "color-mix(in srgb, var(--accent) 65%, transparent)" : "color-mix(in srgb, var(--fg) 7%, transparent)"}`,
                                            boxShadow: focused ? "0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent), 0 0 20px color-mix(in srgb, var(--accent) 10%, transparent)" : "none",
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={state === "loading" || !email.trim()}
                                    className="btn-primary relative mt-2 w-full">
                                    {state === "loading" ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 rounded-full border-2 border-[color-mix(in_srgb,var(--fg)_30%,transparent)] border-t-[var(--on-accent)] animate-spin" />
                                            Gönderiliyor...
                                        </span>
                                    ) : "Link Gönder"}
                                </button>
                            </form>
                        )}
        </AuthShell>
    );
}
