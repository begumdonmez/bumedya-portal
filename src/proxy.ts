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

    // getClaims, JWT'yi (asimetrik anahtarla) yerelde doğrular; her istekte
    // Supabase Auth'a ağ çağrısı yapmaz. Oturum yenilemesi de burada olur.
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims?.sub ? data.claims : null;

    const isProtected = PROTECTED_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
    );

    if (!user && isProtected) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
