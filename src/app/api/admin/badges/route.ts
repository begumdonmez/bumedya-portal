import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const ELEVATED_BADGES = new Set(["admin", "authorized"]);

// Admin tarafından atanabilecek tüm geçerli rozetler
const VALID_BADGES = new Set([
    "admin", "authorized",
    "editor", "artist", "writer", "verified", "founder", "sosyal_kelebek",
    "seri_izleyici", "kitap_kurdu", "plak_kafasi",
]);

export async function PATCH(request: Request) {
    const cookieStore = await cookies();

    const userClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: () => {},
            },
        }
    );

    const [{ data: { user } }, body] = await Promise.all([
        userClient.auth.getUser(),
        request.json() as Promise<{ userId: string; badges: string[]; username?: string }>,
    ]);

    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: me } = await userClient
        .from("profiles")
        .select("badges, username")
        .eq("id", user.id)
        .single();

    if (!me?.badges?.includes("admin")) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, badges, username } = body;

    if (!userId || !Array.isArray(badges)) {
        return Response.json({ error: "Bad Request" }, { status: 400 });
    }

    // Gelen rozet listesini whitelist'e göre filtrele — geçersiz değerleri at
    const filteredBadges = badges.filter(b => VALID_BADGES.has(b));

    const isAuthorized = (me.badges as string[]).includes("authorized");

    if (userId === user.id && !isAuthorized) {
        return Response.json({ error: "Kendi rozetlerini bu yolla değiştiremezsin." }, { status: 403 });
    }

    const adminClient = createAdminClient();

    const { data: target } = await adminClient
        .from("profiles")
        .select("badges")
        .eq("id", userId)
        .single();

    if (!target) return Response.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });

    const currentBadges: string[] = target.badges ?? [];

    const elevatedFromReq = filteredBadges.filter(b => ELEVATED_BADGES.has(b));
    const regularFromReq  = filteredBadges.filter(b => !ELEVATED_BADGES.has(b));

    let elevatedFinal: string[];
    if (isAuthorized) {
        elevatedFinal = elevatedFromReq;
    } else {
        elevatedFinal = currentBadges.filter(b => ELEVATED_BADGES.has(b));
        const tryingToAddElevated = elevatedFromReq.some(b => !elevatedFinal.includes(b));
        if (tryingToAddElevated) {
            return Response.json({ error: "Bu rozeti verme yetkin yok." }, { status: 403 });
        }
    }

    const safeBadges = [...new Set([...elevatedFinal, ...regularFromReq])];

    const { error } = await adminClient
        .from("profiles")
        .update({ badges: safeBadges })
        .eq("id", userId);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Sunucu tarafında hangi rozet eklendi/kaldırıldı hesapla — client'a güvenme
    const added   = safeBadges.filter(b => !currentBadges.includes(b));
    const removed = currentBadges.filter(b => !safeBadges.includes(b));

    try {
        await adminClient.from("admin_logs").insert({
            admin_id: user.id,
            admin_username: me.username,
            action: "badge_updated",
            target_id: userId,
            target_type: "profile",
            details: {
                username: username ?? null,
                badges_before: currentBadges,
                badges_after: safeBadges,
                added,
                removed,
            },
        });
    } catch { /* log tablosu yoksa sessizce geç */ }

    // Aktivite kaydı — eklenen rozetler için (elevated hariç)
    const nonElevatedAdded = added.filter(b => !ELEVATED_BADGES.has(b));
    if (nonElevatedAdded.length > 0 && username) {
        try {
            await Promise.all(
                nonElevatedAdded.map(badge =>
                    adminClient.from("activities").insert({
                        user_id: userId,
                        username,
                        type: "badge_earned",
                        payload: { badge },
                    })
                )
            );
        } catch { /* sessizce geç */ }
    }

    return Response.json({ ok: true, badges: safeBadges });
}
