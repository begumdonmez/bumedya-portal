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

// PATCH /api/admin/messages — okundu işaretle
export async function PATCH(req: Request) {
    const [admin, body] = await Promise.all([getAdminUser(), req.json()]);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = body;
    if (!id) return NextResponse.json({ error: "ID gerekli." }, { status: 400 });

    const { error } = await createAdminClient()
        .from("messages").update({ read: true }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}

// DELETE /api/admin/messages?id=<id>
export async function DELETE(req: Request) {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID gerekli." }, { status: 400 });

    const { error } = await createAdminClient()
        .from("messages").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
}
