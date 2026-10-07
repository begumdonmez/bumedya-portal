"use client";

import React, { useState, useId, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { SchemaError as ZodError } from "@/lib/schemas";
import AuthShell from "@/components/AuthShell";

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
            <label htmlFor={id} className="field-label">
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
                        borderColor: error ? "color-mix(in srgb, var(--danger) 50%, transparent)" : focused ? "color-mix(in srgb, var(--accent) 60%, transparent)" : "color-mix(in srgb, var(--fg) 8%, transparent)",
                        boxShadow: focused && !error ? "0 0 0 3px color-mix(in srgb, var(--accent) 10%, transparent), 0 0 20px color-mix(in srgb, var(--accent) 7%, transparent)" : "none",
                        paddingRight: suffix ? "3rem" : undefined,
                    }}
                />
                {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
            </div>
            <div className="min-h-[18px]">
                {error && <p className="text-[11px] flex items-center gap-1" style={{ color: "color-mix(in srgb, var(--danger) 80%, transparent)" }}>⚠ {error}</p>}
            </div>
        </div>
    );
}

const CALLBACK_ERROR_MESSAGES: Record<string, string> = {
    confirmation_failed: "Doğrulama linki geçersiz veya süresi dolmuş. Tekrar kayıt olup yeni bir link talep edebilirsin.",
    invalid_link:        "Doğrulama linki geçersiz. Lütfen e-postanı kontrol et.",
};

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") ?? "/home";
    const callbackError = searchParams.get("error");
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
                if (error.message.includes("Email not confirmed")) {
                    toast.dismiss(toastId);
                    toast.info("E-postanı henüz doğrulamadın. Gelen kutunu kontrol et.", {
                        description: "Doğrulama maili bulunamıyorsa spam klasörüne bakabilirsin.",
                        duration: 6000,
                    });
                    setLoading(false); return;
                }
                const msg = error.message.includes("Invalid login")
                    ? "Kullanıcı adı/e-posta veya şifre hatalı."
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
        <>
        {/* Auth callback hata banner'ı */}
        {callbackError && CALLBACK_ERROR_MESSAGES[callbackError] && (
            <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-2xl text-xs leading-relaxed"
                 style={{ background: "color-mix(in srgb, var(--accent-2) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--accent-2) 25%, transparent)", color: "color-mix(in srgb, var(--warn) 85%, transparent)" }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
                    <path d="M7 1.5L12.5 11H1.5L7 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                    <path d="M7 5.5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    <circle cx="7" cy="9.5" r="0.6" fill="currentColor"/>
                </svg>
                {CALLBACK_ERROR_MESSAGES[callbackError]}
            </div>
        )}
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
                      style={{ color: "var(--accent-text)" }}>
                    Şifremi unuttum
                </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                    <><span className="w-4 h-4 rounded-full border-2 border-[color-mix(in_srgb,var(--fg)_30%,transparent)] border-t-[var(--on-accent)] animate-spin" /> Giriş yapılıyor...</>
                ) : "Giriş Yap"}
            </button>

            <div className="mt-6 pt-5 text-center" style={{ borderTop: "1px solid var(--border-3)" }}>
                <p className="text-xs" style={{ color: "var(--text-4)" }}>
                    Hesabın yok mu?{" "}
                    <Link href="/register" className="transition-colors duration-200"
                          style={{ color: "var(--accent-text)" }}>
                        Kayıt ol
                    </Link>
                </p>
            </div>
        </form>
        </>
    );
}

export default function LoginPage() {
    return (
        <AuthShell title="Tekrar hoş geldin" description="Kaldığın yerden devam et.">


                        <Suspense fallback={
                            <div className="flex items-center justify-center py-8">
                                <span className="w-6 h-6 rounded-full border-2 border-[color-mix(in_srgb,var(--fg)_20%,transparent)] border-t-[var(--on-accent)] animate-spin" />
                            </div>
                        }>
                            <LoginForm />
                        </Suspense>
        </AuthShell>
    );
}
