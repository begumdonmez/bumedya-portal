import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
    const { userId, username } = await req.json();

    if (!userId || !username) {
        return NextResponse.json({ error: "Eksik parametre." }, { status: 400 });
    }

    const admin = createAdminClient();

    // Kullanıcının gerçekten var olduğunu doğrula
    const { data: authUser, error: authErr } = await admin.auth.admin.getUserById(userId);
    if (authErr || !authUser.user) {
        return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    // Profil zaten varsa çift kayıt yapma
    const { data: existing } = await admin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

    if (existing) {
        return NextResponse.json({ ok: true });
    }

    const { error } = await admin.from("profiles").insert({
        id: userId,
        username,
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
