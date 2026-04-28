import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import SetWelcomeCookie from "@/components/SetWelcomeCookie";

export const metadata: Metadata = {
    title: "bumedya. | Yaratıcı Dijital Evren",
    description: "Fikirlerin forma dönüştüğü, sınırların bulanıklaştığı yeni nesil dijital fanzin ve topluluk portalı.",
};

const RULES = [
    { icon: "01", title: "Saygı zorunludur", desc: "Her fikre, her insana saygıyla yaklaş. Farklılıklar zenginliktir." },
    { icon: "02", title: "İçerik özgün olmalı", desc: "Başkasının emeğini sahiplenmek yasaktır. Kaynak göster, ilham al." },
    { icon: "03", title: "Üret ve paylaş", desc: "Bu platform tüketmek için değil, üretmek için var. Her katkı değerlidir." },
    { icon: "04", title: "Yapıcı ol", desc: "Eleştiri yıkmak için değil, büyütmek için yapılır. Katkısı olmayan yorum olmaz." },
    { icon: "05", title: "Topluluk kuralları", desc: "Nefret söylemi, taciz ve spam'e sıfır tolerans." },
];

const PILLARS = [
    { label: "Çiz", accent: "rgba(167,139,250,1)", desc: "Kağıt sınır koymaz, ekran da koymaz." },
    { label: "Yaz", accent: "rgba(96,165,250,1)",  desc: "Kelimeler en keskin araçtır." },
    { label: "Bağlan", accent: "rgba(244,114,182,1)", desc: "Yaratıcılar birbirini bulur burada." },
    { label: "Büyü", accent: "rgba(252,211,77,1)",  desc: "Her paylaşım seni biraz daha ileriye taşır." },
];

export default async function LandingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { count: totalCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

    let username: string | null = null;
    if (user) {
        const { data: profile } = await supabase
            .from("profiles").select("username").eq("id", user.id).single();
        username = profile?.username ?? user.email?.split("@")[0] ?? null;
    }

    return (
        <main className="relative w-full aurora-bg overflow-hidden">
            <SetWelcomeCookie />

            {/* Aurora layers */}
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />
            <div aria-hidden className="fixed inset-0 dot-grid opacity-[0.35] pointer-events-none" style={{ zIndex: 0 }} />
            <div aria-hidden className="fixed inset-0 pointer-events-none" style={{
                zIndex: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.018'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat", backgroundSize: "180px 180px"
            }} />

            {/* NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4">
                <NavbarBackdrop />
                <Link href="/" className="group flex items-center gap-0.5 select-none shrink-0 relative z-10">
                    <span className="text-lg font-bold tracking-tight" style={{ color: "rgba(240,249,255,0.75)" }}>bumedya</span>
                    <span className="text-lg font-bold transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(124,58,237,0.9)]" style={{ color: "#7C3AED" }}>.</span>
                </Link>
                <div className="hidden md:flex items-center gap-7 relative z-10">
                    {[
                        { href: "/home", label: "Ana Sayfa" },
                        { href: "/galeri", label: "Galeri" },
                        { href: "/members", label: "Üyeler" },
                        { href: "/chat", label: "Lounge" },
                    ].map(({ href, label }) => (
                        <Link key={href} href={href}
                              className="text-xs tracking-widest uppercase font-medium transition-colors duration-200"
                              style={{ color: "rgba(240,249,255,0.35)" }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(240,249,255,0.8)")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,249,255,0.35)")}>
                            {label}
                        </Link>
                    ))}
                </div>
                <div className="flex items-center gap-2 shrink-0 relative z-10">
                    {user ? (
                        <Link href="/home" className="glass flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:border-white/20"
                              style={{ color: "rgba(167,139,250,0.9)" }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#7C3AED" }} />
                            @{username}
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-xs font-medium transition-colors duration-200 px-3 py-2"
                                  style={{ color: "rgba(240,249,255,0.4)" }}>Giriş</Link>
                            <Link href="/register" className="btn-primary !py-2 !px-4 !text-xs">Katıl</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* HERO */}
            <section className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-20 px-4 sm:px-6 text-center">
                <div className="glass flex items-center gap-2.5 px-4 py-2 rounded-full mb-10 animate-float-up" style={{ animationFillMode: "backwards" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-[11px] tracking-widest uppercase font-medium" style={{ color: "rgba(240,249,255,0.5)" }}>
                        Topluluk aktif · {totalCount ?? 0} üye
                    </span>
                </div>

                <div className="animate-float-up delay-100 w-full" style={{ animationFillMode: "backwards" }}>
                    <h1 className="font-bold tracking-tighter leading-none select-none"
                        style={{ fontSize: "clamp(3rem,12vw,10rem)" }}>
                        <span className="text-gradient-white">bumedya</span>
                        <span style={{
                            color: "#8B5CF6",
                            textShadow: "0 0 50px rgba(124,58,237,0.7), 0 0 100px rgba(124,58,237,0.3)",
                        }}>.</span>
                    </h1>
                    <p className="mt-3 text-xs sm:text-sm font-medium tracking-[0.4em] uppercase"
                       style={{ color: "rgba(240,249,255,0.22)" }}>
                        Creative Digital Universe
                    </p>
                </div>

                <p className="animate-float-up delay-200 mt-8 text-base sm:text-lg font-light leading-relaxed max-w-lg"
                   style={{ color: "rgba(240,249,255,0.5)", animationFillMode: "backwards" }}>
                    Fikirlerin forma dönüştüğü, sınırların bulanıklaştığı yeni nesil dijital fanzin ve topluluk portalı.
                </p>

                <div className="animate-float-up delay-300 flex flex-col sm:flex-row gap-3 mt-10 w-full max-w-xs sm:max-w-none sm:w-auto"
                     style={{ animationFillMode: "backwards" }}>
                    {user ? (
                        <Link href="/home" className="btn-primary flex items-center justify-center gap-2">
                            Ana Sayfaya Git
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                                <path d="M3 7.5h9M8 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </Link>
                    ) : (
                        <Link href="/register" className="btn-primary flex items-center justify-center gap-2">
                            Topluluğa Katıl
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                                <path d="M3 7.5h9M8 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </Link>
                    )}
                    <a href="#kesfet" className="btn-ghost flex items-center justify-center">Keşfet</a>
                </div>

                <div className="absolute bottom-10 flex flex-col items-center gap-2 animate-float-up delay-500"
                     style={{ animationFillMode: "backwards" }}>
                    <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                </div>
            </section>

            {/* PILLARS */}
            <section id="kesfet" className="relative z-10 px-4 sm:px-6 py-20 sm:py-28 max-w-5xl mx-auto">
                <div className="text-center mb-14">
                    <p className="label-caps mb-4">Neden bumedya.</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gradient-white mb-5">
                        Yaratıcıların dijital evi.
                    </h2>
                    <p className="text-base font-light leading-relaxed max-w-lg mx-auto"
                       style={{ color: "rgba(240,249,255,0.45)" }}>
                        Çizen, yazan, üreten herkese açık. Burada fikirler form bulur, sanatçılar birbirini keşfeder.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PILLARS.map((p) => (
                        <div key={p.label} className="card group p-6 flex items-start gap-4">
                            <span className="text-2xl font-bold shrink-0 transition-all duration-300"
                                  style={{ color: p.accent, textShadow: `0 0 20px ${p.accent}40` }}>
                                {p.label}
                            </span>
                            <p className="text-sm leading-relaxed pt-0.5" style={{ color: "rgba(240,249,255,0.55)" }}>
                                {p.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* RULES */}
            <section className="relative z-10 px-4 sm:px-6 pb-24 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <p className="label-caps mb-4">Topluluk Sözleşmesi</p>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient-white">
                        Birlikte güzel kalır.
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {RULES.map((rule) => (
                        <div key={rule.icon} className="card p-6">
                            <p className="font-mono text-[10px] mb-3" style={{ color: "rgba(124,58,237,0.5)" }}>
                                {rule.icon}
                            </p>
                            <h3 className="text-sm font-semibold mb-2" style={{ color: "rgba(240,249,255,0.8)" }}>
                                {rule.title}
                            </h3>
                            <p className="text-xs leading-relaxed" style={{ color: "rgba(240,249,255,0.38)" }}>
                                {rule.desc}
                            </p>
                        </div>
                    ))}

                    <div className="card card-violet p-6 flex flex-col justify-between">
                        <div>
                            <p className="text-sm font-semibold mb-2" style={{ color: "rgba(240,249,255,0.85)" }}>
                                Hazır mısın?
                            </p>
                            <p className="text-xs leading-relaxed mb-6" style={{ color: "rgba(240,249,255,0.4)" }}>
                                Topluluğa katıl, üretmeye başla.
                            </p>
                        </div>
                        <Link href="/register" className="btn-primary !py-2.5 text-xs text-center block">
                            Katıl →
                        </Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="relative z-10 px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-3">
                    <span className="font-mono text-xs" style={{ color: "rgba(240,249,255,0.2)" }}>bumedya. v0.1</span>
                </div>
                <div className="flex items-center gap-6">
                    {["Gizlilik", "Kurallar", "İletişim"].map((item) => (
                        <Link key={item} href="#"
                              className="text-xs transition-colors duration-200"
                              style={{ color: "rgba(240,249,255,0.2)" }}>
                            {item}
                        </Link>
                    ))}
                </div>
            </footer>
        </main>
    );
}
