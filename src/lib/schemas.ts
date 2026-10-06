// zod/mini: aynı API'nin ağaç-sallanabilir hali — istemci paketine ~10 KB ekler (tam zod ~270 KB).
import * as z from "zod/mini";

const username = z.pipe(
    z.string().check(
        z.minLength(3, "Kullanıcı adı en az 3 karakter olmalı."),
        z.maxLength(20, "Kullanıcı adı en fazla 20 karakter olabilir."),
        z.regex(/^[a-zA-Z0-9_]+$/, "Sadece harf, rakam ve alt çizgi (_) kullanılabilir."),
    ),
    z.transform((v: string) => v.replace(/^@/, "").toLowerCase().trim()),
);

const email = z.string().check(
    z.minLength(1, "E-posta zorunlu."),
    z.email("Geçerli bir e-posta adresi gir."),
);

/* ─── Kayıt Formu ───────────────────────────────────────────── */
export const registerSchema = z.object({
    username,
    email,
    password: z.string().check(
        z.minLength(8, "Şifre en az 8 karakter olmalı."),
        z.maxLength(72, "Şifre en fazla 72 karakter olabilir."),
    ),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/* ─── Giriş Formu ───────────────────────────────────────────── */
export const loginSchema = z.object({
    email,
    password: z.string().check(
        z.minLength(1, "Şifre boş bırakılamaz."),
        z.maxLength(72, "Geçersiz şifre."),
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type SchemaError = z.core.$ZodError;
