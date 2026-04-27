import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function PATCH(request: Request) {
    const cookieStore = await cookies();

    // Kullanıcının kim olduğunu anon key ile doğrula
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

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { data: me } = await userClient
        .from("profiles")
        .select("badges")
        .eq("id", user.id)
        .single();

    if (!me?.badges?.includes("admin")) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    // Admin doğrulandı — service role ile güncelle
    const { userId, badges, addedBadge, username } = await request.json() as {
        userId: string;
        badges: string[];
        addedBadge?: string;
        username?: string;
    };

    if (!userId || !Array.isArray(badges)) {
        return Response.json({ error: "Bad Request" }, { status: 400 });
    }

    const adminClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: { getAll: () => [], setAll: () => {} },
        }
    );

    const { error } = await adminClient
        .from("profiles")
        .update({ badges })
        .eq("id", userId);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Rozet eklendiyse aktivite kaydı (service role — RLS'i bypass eder)
    if (addedBadge && username) {
        await adminClient.from("activities").insert({
            user_id: userId,
            username,
            type: "badge_earned",
            payload: { badge: addedBadge },
        });
    }

    return Response.json({ ok: true });
}
