import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getAdminUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
        .from("profiles").select("badges").eq("id", user.id).single();
    if (!(profile?.badges as string[] ?? []).includes("admin")) return null;
    return user;
}

// PATCH /api/admin/applications
export async function PATCH(req: Request) {
    const [admin, body] = await Promise.all([getAdminUser(), req.json()]);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, status, admin_note } = body;
    if (!id || !["approved", "rejected"].includes(status)) {
        return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const adminClient = createAdminClient();

    const { data: app } = await adminClient
        .from("applications").select("id").eq("id", id).single();
    if (!app) return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });

    const { error } = await adminClient
        .from("applications")
        .update({ status, admin_note: admin_note?.trim() || null })
        .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
