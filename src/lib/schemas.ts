import { z } from "zod";

/* ─── Kayıt Formu ───────────────────────────────────────────── */
export const registerSchema = z.object({
    username: z
        .string()
        .min(3, "Kullanıcı adı en az 3 karakter olmalı.")
        .max(20, "Kullanıcı adı en fazla 20 karakter olabilir.")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Sadece harf, rakam ve alt çizgi (_) kullanılabilir."
        )
        .transform((v) => v.replace(/^@/, "").toLowerCase().trim()),

    email: z
        .string()
        .min(1, "E-posta zorunlu.")
        .email("Geçerli bir e-posta adresi gir."),

    password: z
        .string()
        .min(8, "Şifre en az 8 karakter olmalı.")
        .max(72, "Şifre en fazla 72 karakter olabilir."),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/* ─── Giriş Formu ───────────────────────────────────────────── */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "E-posta zorunlu.")
        .email("Geçerli bir e-posta adresi gir."),

    password: z
        .string()
        .min(1, "Şifre boş bırakılamaz.")
        .max(72, "Geçersiz şifre."),
});

export type LoginInput = z.infer<typeof loginSchema>;