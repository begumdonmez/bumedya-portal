import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// PATCH /api/posts — sadece kendi postunu düzenleyebilirsin
export async function PATCH(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { id, content, description, ref_url } = body as {
        id: string;
        content?: string | null;
        description?: string | null;
        ref_url?: string | null;
    };

    if (!id) return NextResponse.json({ error: "Post ID gerekli." }, { status: 400 });

    const adminClient = createAdminClient();

    // Postu çek — sadece sahibi düzenleyebilir
    const { data: post } = await adminClient
        .from("posts")
        .select("id, user_id")
        .eq("id", id)
        .single();

    if (!post) return NextResponse.json({ error: "Post bulunamadı." }, { status: 404 });
    if (post.user_id !== user.id) return NextResponse.json({ error: "Bu postu düzenleyemezsin." }, { status: 403 });

    // ref_url güvenlik kontrolü
    let safeRefUrl: string | null = null;
    if (ref_url) {
        try {
            const parsed = new URL(ref_url);
            if (parsed.protocol === "http:" || parsed.protocol === "https:") {
                safeRefUrl = ref_url;
            } else {
                return NextResponse.json({ error: "Geçersiz link." }, { status: 400 });
            }
        } catch {
            return NextResponse.json({ error: "Geçersiz link formatı." }, { status: 400 });
        }
    }

    const { data: updated, error } = await adminClient
        .from("posts")
        .update({
            content: content?.trim() || null,
            description: description?.trim() || null,
            ref_url: safeRefUrl,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ post: updated });
}

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
