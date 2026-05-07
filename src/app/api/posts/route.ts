import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// DELETE /api/posts?id=<postId>
export async function DELETE(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("id");
    if (!postId) return NextResponse.json({ error: "Post ID gerekli." }, { status: 400 });

    const adminClient = createAdminClient();

    // Postu çek — sahibi mi yoksa admin mi kontrol et
    const { data: post } = await adminClient
        .from("posts")
        .select("id, user_id, storage_path")
        .eq("id", postId)
        .single();

    if (!post) return NextResponse.json({ error: "Post bulunamadı." }, { status: 404 });

    // Sahiplik veya admin badge kontrolü
    const { data: profile } = await supabase
        .from("profiles")
        .select("badges")
        .eq("id", user.id)
        .single();

    const isAdmin = (profile?.badges as string[] ?? []).includes("admin");
    if (post.user_id !== user.id && !isAdmin) {
        return NextResponse.json({ error: "Bu postu silemezsin." }, { status: 403 });
    }

    // Storage dosyasını sil (varsa)
    if (post.storage_path) {
        await adminClient.storage.from("posts").remove([post.storage_path]);
    }

    const { error } = await adminClient.from("posts").delete().eq("id", postId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
