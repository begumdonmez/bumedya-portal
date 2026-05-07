import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Kullanıcının kendi alabileceği rozet ID'leri — bu liste dışındaki hiçbir rozet buradan atanmaz
const SELF_CLAIMABLE = new Set(["seri_izleyici", "kitap_kurdu", "plak_kafasi"]);

export async function PATCH(req: Request) {
    const supabase = await createClient();

    // getUser ve body parse birbirinden bağımsız — paralel çalıştır
    const [{ data: { user } }, { badgeId }] = await Promise.all([
        supabase.auth.getUser(),
        req.json(),
    ]);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!SELF_CLAIMABLE.has(badgeId)) {
        return NextResponse.json({ error: "Bu rozet bu yolla alınamaz." }, { status: 403 });
    }

    const { data: profile, error: fetchErr } = await supabase
        .from("profiles").select("badges").eq("id", user.id).single();
    if (fetchErr || !profile) return NextResponse.json({ error: "Profil bulunamadı." }, { status: 404 });

    const current: string[] = profile.badges ?? [];
    const hasBadge = current.includes(badgeId);
    const updated = hasBadge ? current.filter(b => b !== badgeId) : [...current, badgeId];

    const { error: updateErr } = await supabase
        .from("profiles").update({ badges: updated }).eq("id", user.id);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    return NextResponse.json({ badges: updated, added: !hasBadge });
}
