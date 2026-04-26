"use client";

import React, { useState, useId, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/schemas";
import type { ZodError } from "zod";

/* ─── Zod hata dönüştürücü ──────────────────────────────────── */
interface FieldErrors { email?: string; password?: string }
function parseZodErrors(err: ZodError): FieldErrors {
    const out: FieldErrors = {};
    for (const issue of err.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!out[field]) out[field] = issue.message;
    }
    return out;
}

/* ─── Field bileşeni ─────────────────────────────────────────── */
function Field({
                   id, label, type = "text", value, onChange,
                   placeholder, error, autoComplete, suffix,
               }: {
    id: string; label: string; type?: string;
    value: string; onChange: (v: string) => void;
    placeholder?: string; error?: string;
    autoComplete?: string; suffix?: React.ReactNode;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id}
                   className="text-[10px] font-medium tracking-[0.15em] uppercase transition-colors duration-200"
                   style={{ color: focused ? "rgba(167,139,250,0.8)" : "rgba(224,242,254,0.4)" }}
            >
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
                    className="w-full rounded-xl px-4 py-3 text-sm placeholder:text-white/20 transition-all duration-300 outline-none"
                    style={{
                        background: "rgba(10,15,30,0.6)",
                        color: "#E0F2FE",
                        border: `1px solid ${
                            error
                                ? "rgba(239,68,68,0.5)"
                                : focused
                                    ? "rgba(124,58,237,0.65)"
                                    : "rgba(255,255,255,0.07)"
                        }`,
                        boxShadow: focused && !error
                            ? "0 0 0 1px rgba(124,58,237,0.2), 0 0 20px rgba(124,58,237,0.1)"
                            : "none",
                        paddingRight: suffix ? "3rem" : undefined,
                    }}
                />
                {suffix && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
                )}
            </div>
            <div className="min-h-[16px]">
                {error && (
                    <p className="text-[11px] text-red-400/80 flex items-center gap-1">
                        <span>⚠</span> {error}
                    </p>
                )}
            </div>
        </div>
    );
}

/* ─── Login form içeriği (searchParams kullanıyor) ──────────── */
function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") ?? "/";
    const formId = useId();

    const [email, setEmail]       = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading]   = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [showPw, setShowPw]     = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        // 1. Zod validasyon
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
            setFieldErrors(parseZodErrors(parsed.error));
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Giriş yapılıyor...");
        const supabase = createClient();

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: parsed.data.email,
                password: parsed.data.password,
            });

            if (error) {
                const msg =
                    error.message.includes("Invalid login")
                        ? "E-posta veya şifre hatalı."
                        : error.message.includes("Email not confirmed")
                            ? "E-postanı henüz doğrulamadın. Gelen kutunu kontrol et."
                            : "Bir hata oluştu. Tekrar dene.";
                toast.error(msg, { id: toastId });
                setLoading(false);
                return;
            }

            toast.success("Hoş geldin!", { id: toastId });
            router.push(redirectTo);
            router.refresh(); // session'ı Server Components'a yansıt

        } catch {
            toast.error("Beklenmedik bir hata oluştu.", { id: toastId });
            setLoading(false);
        }
    };

    return (
        <form id={formId} onSubmit={handleLogin} className="flex flex-col gap-1" noValidate>
            <Field
                id={`${formId}-email`} label="E-Posta" type="email"
                value={email} onChange={setEmail}
                placeholder="fanzinci@mail.com"
                error={fieldErrors.email}
                autoComplete="email"
            />

            <Field
                id={`${formId}-password`} label="Şifre"
                type={showPw ? "text" : "password"}
                value={password} onChange={setPassword}
                placeholder="••••••••"
                error={fieldErrors.password}
                autoComplete="current-password"
                suffix={
                    <button type="button" onClick={() => setShowPw(!showPw)}
                            className="p-1 transition-colors duration-200"
                            style={{ color: "rgba(224,242,254,0.3)" }}
                            aria-label={showPw ? "Şifreyi gizle" : "Şifreyi göster"}
                    >
                        {showPw ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4Z"
                                      stroke="currentColor" strokeWidth="1.2" />
                                <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                                <path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4Z"
                                      stroke="currentColor" strokeWidth="1.2" />
                                <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2" />
                            </svg>
                        )}
                    </button>
                }
            />

            {/* Şifremi unuttum */}
            <div className="flex justify-end -mt-2 mb-2">
                <Link href="/reset-password"
                      className="text-xs transition-colors duration-300"
                      style={{ color: "rgba(167,139,250,0.5)" }}
                >
                    Şifremi unuttum
                </Link>
            </div>

            {/* Submit */}
            <button
                type="submit" disabled={loading}
                className="relative mt-2 w-full py-3.5 rounded-xl text-sm font-bold text-white
          transition-all duration-300 overflow-hidden disabled:cursor-not-allowed"
                style={{
                    background: loading ? "rgba(124,58,237,0.5)" : "#7C3AED",
                    boxShadow: loading
                        ? "none"
                        : "0 8px 24px rgba(124,58,237,0.4), 0 0 0 1px rgba(124,58,237,0.3)",
                }}
            >
                {!loading && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent
            via-white/10 to-transparent -translate-x-full hover:translate-x-full
            transition-transform duration-700" />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
              <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Giriş yapılıyor...
              </>
          ) : "Giriş Yap"}
        </span>
            </button>

            {/* Alt link */}
            <div className="mt-6 pt-5 text-center"
                 style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <p className="text-xs" style={{ color: "rgba(224,242,254,0.3)" }}>
                    Hesabın yok mu?{" "}
                    <Link href="/register"
                          className="transition-colors duration-300"
                          style={{ color: "rgba(167,139,250,0.7)" }}
                    >
                        Kayıt ol
                    </Link>
                </p>
            </div>
        </form>
    );
}

/* ─── Ana sayfa bileşeni ─────────────────────────────────────── */
export default function LoginPage() {
    return (
        <div
            className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
            style={{ background: "#0A0F1E" }}
        >
            {/* Atmosfer */}
            <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-[600px] h-[600px] rounded-full pointer-events-none"
                 style={{ background: "rgba(124,58,237,0.09)", filter: "blur(130px)" }} />
            <div aria-hidden className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
                 style={{ background: "rgba(59,130,246,0.05)", filter: "blur(100px)" }} />
            <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.025]"
                 style={{
                     backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                     backgroundSize: "28px 28px",
                 }} />

            {/* Kart */}
            <div className="relative w-full max-w-md" style={{ animation: "float-up 0.6s ease-out both" }}>
                <div aria-hidden className="absolute -inset-[1px] rounded-3xl pointer-events-none opacity-40"
                     style={{
                         background: "linear-gradient(135deg, rgba(124,58,237,0.3), transparent, rgba(59,130,246,0.1))",
                         filter: "blur(2px)",
                     }} />

                <div
                    className="relative rounded-3xl overflow-hidden"
                    style={{
                        background: "rgba(255,255,255,0.04)",
                        backdropFilter: "blur(40px) saturate(180%)",
                        WebkitBackdropFilter: "blur(40px) saturate(180%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
                    }}
                >
                    <div className="h-[1px] w-full" style={{
                        background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6) 40%, rgba(167,139,250,0.4) 60%, transparent)",
                    }} />

                    <div className="p-8">
                        <div className="mb-8">
                            <Link href="/" className="inline-flex items-baseline gap-0.5 mb-6">
                <span className="text-sm font-bold tracking-tight"
                      style={{ color: "rgba(224,242,254,0.5)" }}>bumedya</span>
                                <span className="text-sm font-bold"
                                      style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                            </Link>
                            <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: "#E0F2FE" }}>
                                Tekrar Hoş Geldin
                            </h1>
                            <p className="text-sm" style={{ color: "rgba(224,242,254,0.4)" }}>
                                Dijital evrenine giriş yap.
                            </p>
                        </div>

                        {/* searchParams için Suspense gerekli (Next.js 15) */}
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