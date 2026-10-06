"use client";

import React, { useState, useId, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/schemas";
import type { SchemaError as ZodError } from "@/lib/schemas";
import AuthShell from "@/components/AuthShell";

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
    "color-mix(in srgb, var(--danger) 80%, transparent)",
    "color-mix(in srgb, var(--accent) 80%, transparent)",
    "color-mix(in srgb, var(--warn) 80%, transparent)",
    "color-mix(in srgb, var(--success) 80%, transparent)",
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
                className="field-label"
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
                    className="w-full rounded-xl px-4 py-3 text-sm placeholder:text-[color-mix(in_srgb,var(--fg)_20%,transparent)] transition-all duration-300 outline-none"
                    style={{
                        background: "var(--bg-2)",
                        color: "var(--text-1)",
                        border: `1px solid ${
                            error
                                ? "color-mix(in srgb, var(--danger) 50%, transparent)"
                                : focused
                                    ? "color-mix(in srgb, var(--accent) 65%, transparent)"
                                    : "var(--border-2)"
                        }`,
                        boxShadow: focused && !error
                            ? "0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent), 0 0 20px color-mix(in srgb, var(--accent) 10%, transparent)"
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
                    <p className="text-[11px] text-[color-mix(in_srgb,var(--danger)_80%,transparent)] flex items-center gap-1">
                        <span>⚠</span> {error}
                    </p>
                ) : hint ? (
                    <p className="text-[11px] text-[color-mix(in_srgb,var(--fg)_25%,transparent)]">{hint}</p>
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
                    background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                }}
            >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ color: "var(--accent)" }}>
                    <path d="M6 16l7 7 13-13" stroke="currentColor" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="absolute inset-0 rounded-full animate-pulse"
                     style={{ background: "color-mix(in srgb, var(--accent) 8%, transparent)" }} />
            </div>

            <div>
                <h3 className="btn-primary">E-postanı kontrol et!</h3>
                <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--text-3)" }}>
                    <span style={{ color: "var(--accent-text)" }}>{email}</span> adresine
                    doğrulama linki gönderdik. Linke tıklayarak topluluğa katılabilirsin.
                </p>
            </div>

            <p className="text-xs" style={{ color: "var(--text-4)" }}>
                Gelmediyse spam klasörünü kontrol et.
            </p>

            <Link href="/"
                  className="text-sm transition-colors duration-300"
                  style={{ color: "var(--accent-text)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--accent-text)")}
            >
                Ana sayfaya dön →
            </Link>
        </div>
    );
}

/* ─── Ana bileşen ────────────────────────────────────────────── */
export default function RegisterPage() {
    return (
        <Suspense>
            <RegisterForm />
        </Suspense>
    );
}

function RegisterForm() {
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
                const msg = authError.message.toLowerCase();
                toast.error(
                    msg.includes("already registered") || msg.includes("already exists") || msg.includes("email") && msg.includes("taken")
                        ? "Bu e-posta adresi zaten kayıtlı."
                        : msg.includes("password")
                            ? "Şifre güvenlik gereksinimlerini karşılamıyor."
                            : "Bir hata oluştu. Tekrar dene.",
                    { id: toastId }
                );
                setFormState("idle");
                return;
            }

            // Mevcut email — success ekranı göster (email enumeration önlemi)
            // Supabase bu durumda da ilgili adrese bilgilendirme maili gönderir
            if (authData.user?.identities?.length === 0) {
                toast.dismiss(toastId);
                setFormState("success");
                return;
            }

            if (authData.user) {
                // 3. profiles tablosuna kayıt — admin client (RLS bypass) için server route
                const profileRes = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId: authData.user.id, username: parsed.data.username }),
                });
                if (!profileRes.ok) {
                    const json = await profileRes.json().catch(() => ({}));
                    toast.error(json.error ?? "Profil oluşturulamadı.", { id: toastId });
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
        <AuthShell title="Topluluğa katıl" description="Dijital fanzin dünyasında yerini al.">

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
                                    className="btn-primary relative mt-2 w-full"
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
                        <span className="w-4 h-4 rounded-full border-2 border-[color-mix(in_srgb,var(--fg)_30%,transparent)]
                          border-t-[var(--on-accent)] animate-spin" />
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
                                              style={{ color: "var(--accent-text)" }}
                                        >
                                            Giriş yap
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        )}
        </AuthShell>
    );
}