import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase email doğrulama callback'i.
 * Kullanıcı emaildeki linke tıkladığında buraya gelir.
 * Token doğrulanır → session oluşur → /onboarding'e yönlendirilir.
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);

    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/onboarding";

    if (!code) {
        // Geçersiz link
        return NextResponse.redirect(`${origin}/login?error=invalid_link`);
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("[auth/callback] exchangeCodeForSession error:", error.message);
        return NextResponse.redirect(
            `${origin}/login?error=confirmation_failed`
        );
    }

    // Başarılı → onboarding (ilk kez) veya istenen sayfaya
    return NextResponse.redirect(`${origin}${next}`);
}