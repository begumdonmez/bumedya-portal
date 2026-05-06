"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/schemas";
import type { ZodError } from "zod";

/* ─── Tip ──────────────────────────────────────────────────── */
type FormState = "idle" | "loading" | "success";
interface FieldErrors { username?: string; email?: string; password?: string; confirmPassword?: string }

/* ─── Zod hatalarını field map'e çevir ──────────────────────── */
function parseZodErrors(err: ZodError): FieldErrors {
    const out: FieldErrors = {};
    for (const issue of err.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!out[field]) out[field] = issue.message;
    }
    return out;
}

/* ─── Şifre güç seviyesi (1-4) ─────────────────────────────── */
function passwordStrength(pw: string): number {
    if (pw.length < 8) return 1;
    const has = (re: RegExp) => re.test(pw);
    const score = [
        pw.length >= 12,
        has(/[A-Z]/),
        has(/[0-9]/),
        has(/[^A-Za-z0-9]/),
    ].filter(Boolean).length;
    return Math.max(1, score) as 1 | 2 | 3 | 4;
}

const strengthLabel = ["", "Zayıf", "Orta", "İyi", "Güçlü"];
const strengthColor = [
    "",
    "rgba(239,68,68,0.8)",
    "rgba(124,58,237,0.8)",
    "rgba(251,191,36,0.8)",
    "rgba(52,211,153,0.8)",
];

/* ─── Field bileşeni ─────────────────────────────────────────── */
function Field({
                   id, label, type = "text", value, onChange,
                   placeholder, error, hint, autoComplete, suffix, onBlur,
               }: {
    id: string; label: string; type?: string;
    value: string; onChange: (v: string) => void;
    placeholder?: string; error?: string; hint?: string;
    autoComplete?: string; suffix?: React.ReactNode; onBlur?: () => void;
}) {
    const [focused, setFocused] = useState(false);
    return (
        <div className="flex flex-col gap-1.5">
            <label
                htmlFor={id}
                className="text-[10px] font-medium tracking-[0.15em] uppercase transition-colors duration-200"
                style={{ color: focused ? "var(--violet-text)" : "var(--text-3)" }}
            >
                {label}
            </label>
            <div className="relative">
                <input
                    id={id} type={type} value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => { setFocused(false); onBlur?.(); }}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className="w-full rounded-xl px-4 py-3 text-sm placeholder:text-white/20 transition-all duration-300 outline-none"
                    style={{
                        background: "var(--bg-2)",
                        color: "var(--text-1)",
                        border: `1px solid ${
                            error
                                ? "rgba(239,68,68,0.5)"
                                : focused
                                    ? "rgba(124,58,237,0.65)"
                                    : "var(--border-2)"
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
                {error ? (
                    <p className="text-[11px] text-red-400/80 flex items-center gap-1">
                        <span>⚠</span> {error}
                    </p>
                ) : hint ? (
                    <p className="text-[11px] text-white/25">{hint}</p>
                ) : null}
            </div>
        </div>
    );
}

/* ─── Başarı ekranı ──────────────────────────────────────────── */
function SuccessScreen({ email }: { email: string }) {
    return (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
            <div
                className="w-20 h-20 rounded-full flex items-center justify-center relative"
                style={{
                    background: "rgba(124,58,237,0.12)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    boxShadow: "0 0 40px rgba(124,58,237,0.2)",
                }}
            >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: "#A78BFA" }}>
                    <path d="M6 16l7 7 13-13" stroke="currentColor" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="absolute inset-0 rounded-full animate-pulse"
                     style={{ background: "rgba(124,58,237,0.08)" }} />
            </div>

            <div>
                <h3 className="text-xl font-bold text-white mb-2">E-postanı kontrol et!</h3>
                <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--text-3)" }}>
                    <span style={{ color: "var(--violet-text)" }}>{email}</span> adresine
                    doğrulama linki gönderdik. Linke tıklayarak topluluğa katılabilirsin.
                </p>
            </div>

            <p className="text-xs" style={{ color: "var(--text-4)" }}>
                Gelmediyse spam klasörünü kontrol et.
            </p>

            <Link href="/"
                  className="text-sm transition-colors duration-300"
                  style={{ color: "var(--violet-text)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--violet)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--violet-text)")}
            >
                Ana sayfaya dön →
            </Link>
        </div>
    );
}

/* ─── Ana bileşen ────────────────────────────────────────────── */
export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const nextUrl = searchParams.get("next") ?? "/onboarding";
    const formId = useId();

    const [email, setEmail]             = useState("");
    const [password, setPassword]       = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername]       = useState("");
    const [formState, setFormState]     = useState<FormState>("idle");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [showPw, setShowPw]           = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [checkingUsername, setCheckingUsername] = useState(false);

    const isLoading = formState === "loading";

    const checkUsernameAvailable = async () => {
        if (!username || username.length < 3) return;
        setCheckingUsername(true);
        const supabase = createClient();
        const { data } = await supabase
            .from("profiles")
            .select("id")
            .eq("username", username)
            .maybeSingle();
        setCheckingUsername(false);
        if (data) {
            setFieldErrors(prev => ({ ...prev, username: "Bu kullanıcı adı alınmış." }));
        }
    };
    const isSuccess = formState === "success";
    const pwStrength = password.length > 0 ? passwordStrength(password) : 0;

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setFieldErrors({});

        // 1. Şifre eşleşme kontrolü
        if (password !== confirmPassword) {
            setFieldErrors({ confirmPassword: "Şifreler eşleşmiyor." });
            return;
        }

        // 2. Zod validasyon
        const parsed = registerSchema.safeParse({ username, email, password });
        if (!parsed.success) {
            setFieldErrors(parseZodErrors(parsed.error));
            return;
        }

        setFormState("loading");
        const toastId = toast.loading("Kayıt oluşturuluyor...");
        const supabase = createClient();

        try {
            // 2. Supabase Auth signUp
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: parsed.data.email,
                password: parsed.data.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
                    data: {
                        username: parsed.data.username,
                    },
                },
            });

            if (authError) {
                toast.error(
                    authError.message.includes("already registered")
                        ? "Bu e-posta adresi zaten kayıtlı."
                        : authError.message.includes("Password")
                            ? "Şifre güvenlik gereksinimlerini karşılamıyor."
                            : "Bir hata oluştu. Tekrar dene.",
                    { id: toastId }
                );
                setFormState("idle");
                return;
            }

            if (authData.user) {
                // 3. profiles tablosuna kayıt
                const { error: profileError } = await supabase
                    .from("profiles")
                    .insert([{
                        id: authData.user.id,
                        username: parsed.data.username,
                        role: "member",
                    }]);

                if (profileError) {
                    const msg = profileError.message.includes("duplicate")
                        ? "Bu kullanıcı adı zaten alınmış. Başka bir tane dene."
                        : "Profil oluşturulamadı: " + profileError.message;
                    toast.error(msg, { id: toastId });
                    setFormState("idle");
                    return;
                }
            }

            toast.success("Kayıt başarılı! E-postanı doğrula.", { id: toastId });
            setFormState("success");

        } catch {
            toast.error("Beklenmedik bir hata oluştu.", { id: toastId });
            setFormState("idle");
        }
    };

    return (
        <div
            className="aurora-bg relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
        >
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />
            <div aria-hidden className="absolute inset-0 pointer-events-none opacity-[0.025]"
                 style={{
                     backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                     backgroundSize: "28px 28px",
                 }} />

            {/* Kart */}
            <div className="relative z-10 w-full max-w-md" style={{ animation: "float-up 0.6s ease-out both" }}>
                {/* Dış glow */}
                <div aria-hidden className="absolute -inset-[1px] rounded-3xl pointer-events-none opacity-40"
                     style={{
                         background: "linear-gradient(135deg, rgba(124,58,237,0.3), transparent, rgba(59,130,246,0.1))",
                         filter: "blur(2px)",
                     }} />

                <div
                    className="relative rounded-3xl overflow-hidden"
                    style={{
                        background: "var(--bg-2)",
                        backdropFilter: "blur(40px) saturate(180%)",
                        WebkitBackdropFilter: "blur(40px) saturate(180%)",
                        border: "1px solid var(--border-2)",
                        boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
                    }}
                >
                    {/* Üst dekoratif şerit */}
                    <div className="h-[1px] w-full" style={{
                        background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6) 40%, rgba(167,139,250,0.4) 60%, transparent)",
                    }} />

                    <div className="p-8">
                        {/* Başlık */}
                        <div className="mb-8">
                            <Link href="/" className="inline-flex items-baseline gap-0.5 mb-6 group">
                <span className="text-sm font-bold tracking-tight transition-colors duration-300"
                      style={{ color: "var(--text-3)" }}>bumedya</span>
                                <span className="text-sm font-bold transition-colors duration-300"
                                      style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                            </Link>
                            <h1 className="text-2xl font-extrabold tracking-tight mb-1" style={{ color: "var(--text-1)" }}>
                                Topluluğa Katıl
                            </h1>
                            <p className="text-sm" style={{ color: "var(--text-3)" }}>
                                Dijital fanzin dünyasında yerini al.
                            </p>
                        </div>

                        {/* Başarı */}
                        {isSuccess ? (
                            <SuccessScreen email={email} />
                        ) : (
                            <form id={formId} onSubmit={handleRegister} className="flex flex-col gap-1" noValidate>
                                <Field
                                    id={`${formId}-username`} label="Kullanıcı Adı"
                                    value={username} onChange={(v) => { setUsername(v); setFieldErrors(prev => ({ ...prev, username: undefined })); }}
                                    placeholder="@kullaniciadi"
                                    error={fieldErrors.username}
                                    hint={checkingUsername ? "Kontrol ediliyor..." : "3-20 karakter · harf, rakam, alt çizgi"}
                                    autoComplete="username"
                                    onBlur={checkUsernameAvailable}
                                />

                                <Field
                                    id={`${formId}-email`} label="E-Posta" type="email"
                                    value={email} onChange={setEmail}
                                    placeholder="fanzinci@mail.com"
                                    error={fieldErrors.email}
                                    autoComplete="email"
                                />

                                {/* Şifre — özel suffix */}
                                <Field
                                    id={`${formId}-password`} label="Şifre"
                                    type={showPw ? "text" : "password"}
                                    value={password} onChange={setPassword}
                                    placeholder="••••••••"
                                    error={fieldErrors.password}
                                    autoComplete="new-password"
                                    suffix={
                                        <button type="button" onClick={() => setShowPw(!showPw)}
                                                className="p-1 transition-colors duration-200"
                                                style={{ color: "var(--text-4)" }}
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

                                {/* Şifre güç çubuğu */}
                                {password.length > 0 && (
                                    <div className="-mt-2 mb-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4].map((lvl) => (
                                                <div key={lvl} className="flex-1 h-[2px] rounded-full transition-all duration-300"
                                                     style={{
                                                         background: lvl <= pwStrength
                                                             ? strengthColor[pwStrength]
                                                             : "var(--border-2)",
                                                     }} />
                                            ))}
                                        </div>
                                        <p className="text-[11px]" style={{ color: strengthColor[pwStrength] }}>
                                            {strengthLabel[pwStrength]}
                                        </p>
                                    </div>
                                )}

                                {/* Şifre tekrar */}
                                <Field
                                    id={`${formId}-confirm-password`} label="Şifre Tekrar"
                                    type={showConfirmPw ? "text" : "password"}
                                    value={confirmPassword} onChange={setConfirmPassword}
                                    placeholder="••••••••"
                                    error={fieldErrors.confirmPassword}
                                    autoComplete="new-password"
                                    suffix={
                                        <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                                                className="p-1 transition-colors duration-200"
                                                style={{ color: "var(--text-4)" }}
                                                aria-label={showConfirmPw ? "Şifreyi gizle" : "Şifreyi göster"}
                                        >
                                            {showConfirmPw ? (
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
                                    }
                                />

                                {/* Submit */}
                                <button
                                    type="submit" disabled={isLoading}
                                    className="relative mt-2 w-full py-3.5 rounded-xl text-sm font-bold text-white
                    transition-all duration-300 overflow-hidden disabled:cursor-not-allowed"
                                    style={{
                                        background: isLoading ? "rgba(124,58,237,0.5)" : "var(--violet)",
                                        boxShadow: isLoading
                                            ? "none"
                                            : "0 8px 24px rgba(124,58,237,0.4), 0 0 0 1px rgba(124,58,237,0.3)",
                                    }}
                                >
                                    {/* Shimmer */}
                                    {!isLoading && (
                                        <span className="absolute inset-0 bg-gradient-to-r from-transparent
                      via-white/10 to-transparent -translate-x-full hover:translate-x-full
                      transition-transform duration-700" />
                                    )}
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                        <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/30
                          border-t-white animate-spin" />
                            Kayıt oluşturuluyor...
                        </>
                    ) : "Kayıt Ol"}
                  </span>
                                </button>

                                {/* Alt link */}
                                <div className="mt-6 pt-5 text-center"
                                     style={{ borderTop: "1px solid var(--border-3)" }}>
                                    <p className="text-xs" style={{ color: "var(--text-4)" }}>
                                        Zaten hesabın var mı?{" "}
                                        <Link href="/login"
                                              className="transition-colors duration-300"
                                              style={{ color: "var(--violet-text)" }}
                                        >
                                            Giriş yap
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}