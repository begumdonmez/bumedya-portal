import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

// Hiçbir admin bu endpoint üzerinden veremez/alamaz
const IMMUTABLE_BADGES = new Set(["admin"]);

// Sadece "authorized" rozeti olan adminler verebilir/alabilir
const ELEVATED_BADGES = new Set(["authorized"]);

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
        request.json() as Promise<{ userId: string; badges: string[]; addedBadge?: string; username?: string }>,
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

    const { userId, badges, addedBadge, username } = body;

    if (!userId || !Array.isArray(badges)) {
        return Response.json({ error: "Bad Request" }, { status: 400 });
    }

    // Kendi rozetlerini değiştirmeye çalışıyorsa engelle
    if (userId === user.id) {
        return Response.json({ error: "Kendi rozetlerini bu yolla değiştiremezsin." }, { status: 403 });
    }

    const adminClient = createAdminClient();

    // Hedef kullanıcının mevcut rozetlerini çek
    const { data: target } = await adminClient
        .from("profiles")
        .select("badges")
        .eq("id", userId)
        .single();

    if (!target) return Response.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });

    const currentBadges: string[] = target.badges ?? [];
    const isAuthorized = me.badges.includes("authorized");

    // Sunucu tarafında güvenli rozet listesi oluştur:
    // 1. IMMUTABLE rozetleri (admin) hiç dokunma — mevcut halini koru
    // 2. ELEVATED rozetleri (authorized) sadece "authorized" admin değiştirebilir
    const immutableKept    = currentBadges.filter(b => IMMUTABLE_BADGES.has(b));
    const elevatedFromReq  = badges.filter(b => ELEVATED_BADGES.has(b));
    const regularFromReq   = badges.filter(b => !IMMUTABLE_BADGES.has(b) && !ELEVATED_BADGES.has(b));

    let elevatedFinal: string[];
    if (isAuthorized) {
        // Authorized admin elevated rozetleri değiştirebilir
        elevatedFinal = elevatedFromReq;
    } else {
        // Normal admin elevated rozetlere dokunamaz — mevcut halini koru
        elevatedFinal = currentBadges.filter(b => ELEVATED_BADGES.has(b));
        // Eğer elevated rozet eklemeye çalışıyorsa hata ver
        const tryingToAddElevated = elevatedFromReq.some(b => !elevatedFinal.includes(b));
        if (tryingToAddElevated) {
            return Response.json({ error: "Bu rozeti verme yetkin yok." }, { status: 403 });
        }
    }

    const safeBadges = [...new Set([...immutableKept, ...elevatedFinal, ...regularFromReq])];

    const { error } = await adminClient
        .from("profiles")
        .update({ badges: safeBadges })
        .eq("id", userId);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Admin log'una yaz
    try {
        await adminClient.from("admin_logs").insert({
            admin_id: user.id,
            admin_username: me.username,
            action: "badge_updated",
            target_id: userId,
            target_type: "profile",
            details: {
                username,
                badges_before: currentBadges,
                badges_after: safeBadges,
                added_badge: addedBadge ?? null,
            },
        });
    } catch { /* log tablosu yoksa sessizce geç */ }

    // Aktivite kaydı — immutable ve elevated rozetler hariç
    if (addedBadge && !IMMUTABLE_BADGES.has(addedBadge) && !ELEVATED_BADGES.has(addedBadge) && username) {
        try {
            await adminClient.from("activities").insert({
                user_id: userId,
                username,
                type: "badge_earned",
                payload: { badge: addedBadge },
            });
        } catch { /* sessizce geç */ }
    }

    return Response.json({ ok: true, badges: safeBadges });
}
