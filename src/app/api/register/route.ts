import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/schemas";

export async function POST(req: Request) {
    const body = await req.json();
    const { userId, username } = body as { userId?: string; username?: string };

    if (!userId || !username) {
        return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    // Username'i sunucu tarafında da doğrula — client bypass'ını engelle
    const parsed = registerSchema.shape.username.safeParse(username);
    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const safeUsername = parsed.data;

    const admin = createAdminClient();

    // Kullanıcı varlığı ve mevcut profil kontrolünü paralel çalıştır
    const [{ data: authUser, error: authErr }, { data: existing }] = await Promise.all([
        admin.auth.admin.getUserById(userId),
        admin.from("profiles").select("id").eq("id", userId).maybeSingle(),
    ]);

    if (authErr || !authUser.user) {
        return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    if (existing) {
        return NextResponse.json({ ok: true });
    }

    const { error } = await admin.from("profiles").insert({
        id: userId,
        username: safeUsername,
        role: "member",
    });

    if (error) {
        const msg = error.message.includes("duplicate")
            ? "Bu kullanıcı adı zaten alınmış."
            : "Profil oluşturulamadı: " + error.message;
        return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
}
