import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Admin guard — kullanıcı + username döndürür
async function getAdminUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
        .from("profiles").select("badges, username").eq("id", user.id).single();
    if (!profile?.badges?.includes("admin")) return null;
    return { id: user.id, username: profile.username as string };
}

// Log yaz — başarısız olsa da ana işlemi engellemez
async function writeLog(
    adminSupabase: ReturnType<typeof createAdminClient>,
    admin: { id: string; username: string },
    action: string,
    targetId: string,
    details: Record<string, unknown>,
) {
    try {
        await adminSupabase.from("admin_logs").insert({
            admin_id: admin.id,
            admin_username: admin.username,
            action,
            target_id: targetId,
            target_type: "nomination",
            details,
        });
    } catch { /* log tablosu yoksa sessizce geç */ }
}

const VALID_CATEGORIES = new Set(["film", "dizi", "kitap", "sarki"]);

// PATCH /api/admin/nominations
// action: "approve" | "reject" | "edit"
export async function PATCH(req: Request) {
    const [admin, body] = await Promise.all([getAdminUser(), req.json()]);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, id, admin_note, title, description, category } = body;

    if (!id || !["approve", "reject", "edit"].includes(action)) {
        return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Nomination'ın gerçekten var olup olmadığını doğrula
    const { data: nomCheck } = await adminSupabase
        .from("weekly_nominations").select("id, title").eq("id", id).single();
    if (!nomCheck) return NextResponse.json({ error: "Öneri bulunamadı." }, { status: 404 });
    const now = new Date().toISOString();

    if (action === "edit") {
        if (!title?.trim()) return NextResponse.json({ error: "Başlık boş olamaz." }, { status: 400 });
        if (category && !VALID_CATEGORIES.has(category)) {
            return NextResponse.json({ error: "Geçersiz kategori." }, { status: 400 });
        }
        const { error } = await adminSupabase
            .from("weekly_nominations")
            .update({ title: title.trim(), description: description?.trim() || null, category })
            .eq("id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await writeLog(adminSupabase, admin, "nomination_edited", id, { title, description, category });
        return NextResponse.json({ ok: true });
    }

    if (action === "approve") {
        const { error } = await adminSupabase
            .from("weekly_nominations")
            .update({ status: "approved", reviewed_by: admin.username, reviewed_at: now })
            .eq("id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await writeLog(adminSupabase, admin, "nomination_approved", id, {});
        return NextResponse.json({ ok: true, status: "approved" });
    }

    if (action === "reject") {
        const { error } = await adminSupabase
            .from("weekly_nominations")
            .update({
                status: "rejected",
                admin_note: admin_note?.trim() || null,
                reviewed_by: admin.username,
                reviewed_at: now,
            })
            .eq("id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await writeLog(adminSupabase, admin, "nomination_rejected", id, { admin_note: admin_note?.trim() || null });
        return NextResponse.json({ ok: true, status: "rejected" });
    }
}
