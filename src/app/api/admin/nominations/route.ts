import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Admin guard — sadece admin badge'li kullanıcılar
async function getAdminUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase.from("profiles").select("badges").eq("id", user.id).single();
    if (!profile?.badges?.includes("admin")) return null;
    return user;
}

// PATCH /api/admin/nominations — onayla veya reddet
export async function PATCH(req: Request) {
    // Admin kontrolü ve body parse birbirinden bağımsız — paralel çalıştır
    const [admin, { id, status }] = await Promise.all([
        getAdminUser(),
        req.json(),
    ]);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!id || !["approved", "rejected"].includes(status)) {
        return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const { error } = await adminSupabase
        .from("weekly_nominations")
        .update({ status })
        .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
