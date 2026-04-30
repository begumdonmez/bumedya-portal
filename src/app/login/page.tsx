"use client";

import React, { useState, useId, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { ZodError } from "zod";

interface FieldErrors { identifier?: string; password?: string }
function parseZodErrors(err: ZodError): FieldErrors {
    const out: FieldErrors = {};
    for (const issue of err.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!out[field]) out[field] = issue.message;
    }
    return out;
}

function isEmail(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function Field({ id, label, type = "text", value, onChange, placeholder, error, autoComplete, suffix }: {
    id: string; label: string; type?: string;
    value: string; onChange: (v: string) => void;
    placeholder?: string; error?: string;
    autoComplete?: string; suffix?: React.ReactNode;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="label-caps transition-colors duration-200"
                   style={{ color: focused ? "var(--violet-text)" : "var(--text-3)" }}>
                {label}
            </label>
            <div className="relative">
                <input
                    id={id} type={type} value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className="input-field"
                    style={{
                        borderColor: error ? "rgba(239,68,68,0.5)" : focused ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.08)",
                        boxShadow: focused && !error ? "0 0 0 3px rgba(124,58,237,0.1), 0 0 20px rgba(124,58,237,0.07)" : "none",
                        paddingRight: suffix ? "3rem" : undefined,
                    }}
                />
                {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
            </div>
            <div className="min-h-[18px]">
                {error && <p className="text-[11px] flex items-center gap-1" style={{ color: "rgba(239,68,68,0.8)" }}>⚠ {error}</p>}
            </div>
        </div>
    );
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") ?? "/";
    const formId = useId();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword]     = useState("");
    const [loading, setLoading]       = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [showPw, setShowPw]         = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        const raw = identifier.trim();
        if (!raw) { setFieldErrors({ identifier: "E-posta veya kullanıcı adı gerekli." }); return; }
        if (!password) { setFieldErrors({ password: "Şifre gerekli." }); return; }

        setLoading(true);
        const toastId = toast.loading("Giriş yapılıyor...");
        const supabase = createClient();

        try {
            let email = raw;

            if (!isEmail(raw)) {
                const { data, error: lookupError } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("username", raw)
                    .maybeSingle();

                if (lookupError || !data) {
                    toast.error("Kullanıcı bulunamadı.", { id: toastId });
                    setLoading(false); return;
                }

                const { data: userData, error: userError } = await supabase
                    .rpc("get_email_by_user_id", { uid: data.id });

                if (userError || !userData) {
                    toast.error("Hesap bilgisi alınamadı.", { id: toastId });
                    setLoading(false); return;
                }

                email = userData;
            }

            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                const msg = error.message.includes("Invalid login") ? "Kullanıcı adı/e-posta veya şifre hatalı."
                    : error.message.includes("Email not confirmed") ? "E-postanı henüz doğrulamadın."
                    : "Bir hata oluştu.";
                toast.error(msg, { id: toastId });
                setLoading(false); return;
            }
            toast.success("Hoş geldin!", { id: toastId });
            router.push(redirectTo);
            router.refresh();
        } catch {
            toast.error("Beklenmedik bir hata oluştu.", { id: toastId });
            setLoading(false);
        }
    };

    return (
        <form id={formId} onSubmit={handleLogin} className="flex flex-col gap-1" noValidate>
            <Field id={`${formId}-identifier`} label="E-Posta veya Kullanıcı Adı"
                   value={identifier} onChange={setIdentifier} placeholder="fanzinci@mail.com veya kullaniciadi"
                   error={fieldErrors.identifier} autoComplete="username" />
            <Field id={`${formId}-password`} label="Şifre"
                   type={showPw ? "text" : "password"}
                   value={password} onChange={setPassword} placeholder="••••••••"
                   error={fieldErrors.password} autoComplete="current-password"

                   suffix={
                       <button type="button" onClick={() => setShowPw(!showPw)}
                               className="p-1 transition-colors duration-200"
                               style={{ color: "var(--text-4)" }}>
                           {showPw ? (
                               <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                   <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4Z" stroke="currentColor" strokeWidth="1.2"/>
                                   <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                                   <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                               </svg>
                           ) : (
                               <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                   <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4Z" stroke="currentColor" strokeWidth="1.2"/>
                                   <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                               </svg>
                           )}
                       </button>
                   }
            />

            <div className="flex justify-end -mt-1 mb-3">
                <Link href="/reset-password" className="text-xs transition-colors duration-200"
                      style={{ color: "var(--violet-text)" }}>
                    Şifremi unuttum
                </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                    <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Giriş yapılıyor...</>
                ) : "Giriş Yap"}
            </button>

            <div className="mt-6 pt-5 text-center" style={{ borderTop: "1px solid var(--border-3)" }}>
                <p className="text-xs" style={{ color: "var(--text-4)" }}>
                    Hesabın yok mu?{" "}
                    <Link href="/register" className="transition-colors duration-200"
                          style={{ color: "var(--violet-text)" }}>
                        Kayıt ol
                    </Link>
                </p>
            </div>
        </form>
    );
}

export default function LoginPage() {
    return (
        <div className="aurora-bg relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />

            <div className="relative z-10 w-full max-w-md animate-float-up">
                {/* Glow ring behind card */}
                <div aria-hidden className="absolute -inset-px rounded-3xl pointer-events-none"
                     style={{
                         background: "linear-gradient(135deg, rgba(124,58,237,0.35) 0%, transparent 50%, rgba(37,99,235,0.15) 100%)",
                         filter: "blur(1px)", opacity: 0.7,
                     }} />

                <div className="relative card rounded-3xl overflow-hidden" style={{ backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}>
                    {/* Top stripe */}
                    <div className="h-px w-full" style={{
                        background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6) 35%, rgba(167,139,250,0.4) 65%, transparent)",
                    }} />

                    <div className="p-8">
                        <div className="mb-8">
                            <Link href="/" className="inline-flex items-baseline gap-0.5 mb-7 group">
                                <span className="text-sm font-bold" style={{ color: "var(--text-3)" }}>bumedya</span>
                                <span className="text-sm font-bold transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.9)]"
                                      style={{ color: "var(--violet)" }}>.</span>
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight mb-1.5" style={{ color: "var(--text-1)" }}>
                                Tekrar Hoş Geldin
                            </h1>
                            <p className="text-sm" style={{ color: "var(--text-3)" }}>
                                Dijital evrenine giriş yap.
                            </p>
                        </div>

                        <Suspense fallback={
                            <div className="flex items-center justify-center py-8">
                                <span className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                            </div>
                        }>
                            <LoginForm />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}
