import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/adminGuard";

export async function POST(req: Request) {
    const [admin, body] = await Promise.all([getAdminUser(), req.json()]);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, spotify_id, description } = body;
    if (!name?.trim() || !spotify_id?.trim()) {
        return NextResponse.json({ error: "Ad ve Spotify ID gerekli." }, { status: 400 });
    }

    const { data, error } = await createAdminClient()
        .from("spotify_playlists")
        .insert({ name: name.trim(), spotify_id: spotify_id.trim(), description: description?.trim() || null })
        .select()
        .single();

    if (error) return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
    return NextResponse.json({ ok: true, playlist: data });
}

export async function DELETE(req: Request) {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID gerekli." }, { status: 400 });

    const { error } = await createAdminClient()
        .from("spotify_playlists").delete().eq("id", id);
    if (error) return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
    return NextResponse.json({ ok: true });
}
