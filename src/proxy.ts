import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Yalnızca bu bölümler oturum ister. Listede olmayan adresler (bilinmeyenler dahil)
// serbestçe geçer; böylece olmayan sayfalar girişe değil 404'e düşer.
// Sayfalar ve API rotaları ayrıca kendi içinde de oturum/admin kontrolü yapar.
const PROTECTED_PATHS = [
    "/home",
    "/akis",
    "/yildizlar",
    "/arsiv",
    "/galeri",
    "/members",
    "/etkinlikler",
    "/chat",
    "/manifest",
    "/basvuru",
    "/profil",
    "/admin",
];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Not: getClaims denendi; bu projede JWT doğrulaması proxy'de başarısız olup
    // girişten sonra tekrar girişe yönlendirme döngüsüne yol açtı. getUser güvenilir.
    // Oturum yenilemesi (cookie güncelleme) de bu çağrıyla olur.
    const { data: { user } } = await supabase.auth.getUser();

    const isProtected = PROTECTED_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
    );

    if (!user && isProtected) {
        const redirect = NextResponse.redirect(new URL("/login", request.url));
        // Supabase'in bu istekte yazdığı/temizlediği oturum çerezlerini yönlendirmeye de taşı
        response.cookies.getAll().forEach(c => redirect.cookies.set(c));
        return redirect;
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
