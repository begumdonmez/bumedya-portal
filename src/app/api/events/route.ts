import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/adminGuard";

export async function PATCH(req: Request) {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, approved } = await req.json();
    if (!id || typeof approved !== "boolean") {
        return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const { error } = await createAdminClient().from("events").update({ approved }).eq("id", id);
    if (error) return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });

    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID gerekli." }, { status: 400 });

    const { error } = await createAdminClient().from("events").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });

    return NextResponse.json({ ok: true });
}
