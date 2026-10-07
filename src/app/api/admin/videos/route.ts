import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/adminGuard";
import { createAdminClient } from "@/lib/supabase/admin";

/** Öneriyi onayla / reddet (yalnızca admin). */
export async function PATCH(req: Request) {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, status } = await req.json().catch(() => ({}));
    if (typeof id !== "string" || !["approved", "rejected"].includes(status)) {
        return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const { data, error } = await createAdminClient().from("gallery_videos")
        .update({ status, reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
        .eq("id", id)
        .select("id, youtube_id, title, description, username, status, created_at")
        .single();
    if (error) return NextResponse.json({ error: "Güncellenemedi." }, { status: 500 });
    return NextResponse.json({ video: data });
}

/** Videoyu kaldır (yalnızca admin). */
export async function DELETE(req: Request) {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json().catch(() => ({}));
    if (typeof id !== "string") return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });

    const { error } = await createAdminClient().from("gallery_videos").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Silinemedi." }, { status: 500 });
    return NextResponse.json({ ok: true });
}
