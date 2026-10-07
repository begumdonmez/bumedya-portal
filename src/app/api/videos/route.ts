import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseYoutubeId } from "@/lib/youtube";

/**
 * Video ekle / öner.
 * Admin → hemen yayında (approved). Üye → onay bekler (pending).
 */
export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const youtubeId = parseYoutubeId(String(body.url ?? ""));
    const title = String(body.title ?? "").trim();
    const description = String(body.description ?? "").trim() || null;

    if (!youtubeId) return NextResponse.json({ error: "Geçerli bir YouTube bağlantısı gir." }, { status: 400 });
    if (!title || title.length > 120) return NextResponse.json({ error: "Başlık 1–120 karakter olmalı." }, { status: 400 });
    if (description && description.length > 500) return NextResponse.json({ error: "Açıklama en fazla 500 karakter." }, { status: 400 });

    const { data: profile } = await supabase.from("profiles").select("username, badges").eq("id", user.id).single();
    if (!profile) return NextResponse.json({ error: "Profil bulunamadı." }, { status: 400 });
    const isAdmin = (profile.badges as string[] ?? []).includes("admin");

    const admin = createAdminClient();

    // Üyelerin bekleyen öneri sayısını sınırla (spam'e karşı)
    if (!isAdmin) {
        const { count } = await admin.from("gallery_videos")
            .select("id", { count: "exact", head: true })
            .eq("submitted_by", user.id).eq("status", "pending");
        if ((count ?? 0) >= 5) {
            return NextResponse.json({ error: "Onay bekleyen 5 önerin var; önce onlar değerlendirilsin." }, { status: 429 });
        }
    }

    const { data, error } = await admin.from("gallery_videos").insert({
        youtube_id: youtubeId,
        title,
        description,
        submitted_by: user.id,
        username: profile.username,
        status: isAdmin ? "approved" : "pending",
        reviewed_by: isAdmin ? user.id : null,
        reviewed_at: isAdmin ? new Date().toISOString() : null,
    }).select("id, youtube_id, title, description, username, status, created_at").single();

    if (error) return NextResponse.json({ error: "Kaydedilemedi." }, { status: 500 });
    return NextResponse.json({ video: data });
}
