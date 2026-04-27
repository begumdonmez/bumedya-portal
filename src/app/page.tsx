import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import SetWelcomeCookie from "@/components/SetWelcomeCookie";

export const metadata: Metadata = {
    title: "bumedya. | Yaratıcı Dijital Evren",
    description: "Fikirlerin forma dönüştüğü, sınırların bulanıklaştığı yeni nesil dijital fanzin ve topluluk portalı.",
};

function GlowOrb({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return <div aria-hidden className={`absolute rounded-full pointer-events-none ${className}`} style={style} />;
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="text-buz-mavisi/40 hover:text-buz-mavisi/90 text-sm tracking-widest uppercase font-light transition-colors duration-300">
            {children}
        </Link>
    );
}

const RULES = [
    { icon: "✦", title: "Saygı zorunludur", desc: "Her fikre, her insana saygıyla yaklaş. Farklılıklar zenginliktir." },
    { icon: "✦", title: "İçerik özgün olmalı", desc: "Başkasının emeğini sahiplenmek yasaktır. Kaynak göster, ilham al." },
    { icon: "✦", title: "Üret ve paylaş", desc: "Bu platform tüketmek için değil, üretmek için var. Her katkı değerlidir." },
    { icon: "✦", title: "Yapıcı ol", desc: "Eleştiri yıkmak için değil, büyütmek için yapılır. Katkısı olmayan yorum olmaz." },
    { icon: "✦", title: "Topluluk kuralları geçerlidir", desc: "Nefret söylemi, taciz ve spam'e sıfır tolerans." },
];

const PILLARS = [
    { label: "Çiz", desc: "Kağıt sınır koymaz, ekran da koymaz." },
    { label: "Yaz", desc: "Kelimeler en keskin araçtır." },
    { label: "Bağlan", desc: "Yaratıcılar birbirini bulur burada." },
    { label: "Büyü", desc: "Her paylaşım seni biraz daha ileriye taşır." },
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
        <main className="relative w-full bg-ana-lacivert overflow-hidden">
            <SetWelcomeCookie />

            {/* ARKA PLAN */}
            <div className="dot-grid absolute inset-0 -z-30 opacity-100" aria-hidden />
            <GlowOrb className="w-[900px] h-[900px] bg-canli-mor/8 blur-[140px] animate-pulse-glow"
                     style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: -20 }} />
            <GlowOrb className="w-[500px] h-[500px] bg-blue-600/6 blur-[100px]"
                     style={{ top: "-10%", left: "-5%", zIndex: -20 }} />
            <GlowOrb className="w-[600px] h-[600px] bg-indigo-600/5 blur-[120px]"
                     style={{ bottom: "-15%", right: "-8%", zIndex: -20 }} />
            <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.025]"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "200px 200px" }} />

            {/* NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-5">
                <NavbarBackdrop />
                <Link href="/" className="group flex items-center gap-1 select-none shrink-0">
                    <span className="text-xl font-extrabold tracking-tighter text-gradient-white" style={{ fontVariantLigatures: "none" }}>bumedya</span>
                    <span className="text-xl font-extrabold text-canli-mor group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] transition-all duration-300">.</span>
                </Link>
                <div className="hidden md:flex items-center gap-6 lg:gap-8">
                    <NavLink href="/home">Ana Sayfa</NavLink>
                    <NavLink href="/galeri">Galeri</NavLink>
                    <NavLink href="/etkinlikler">Etkinlikler</NavLink>
                    <NavLink href="/members">Üyeler</NavLink>
                    <NavLink href="/chat">Lounge</NavLink>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {user ? (
                        <Link href="/home"
                              className="glass px-3 sm:px-5 py-2 rounded-xl text-sm font-medium text-buz-mavisi hover:bg-white/10 hover:border-canli-mor/40 transition-all duration-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-canli-mor/70 shrink-0" />
                            <span className="truncate max-w-[100px] sm:max-w-none">@{username}</span>
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="hidden sm:block text-buz-mavisi/50 hover:text-buz-mavisi text-sm transition-colors duration-300">Giriş</Link>
                            <Link href="/register" className="glass px-3 sm:px-5 py-2 rounded-xl text-sm font-medium text-buz-mavisi hover:bg-white/10 hover:border-canli-mor/40 transition-all duration-300">Katıl</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* HERO */}
            <section className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-20 px-4 sm:px-6 text-center">
                <div className="glass px-4 py-2 rounded-full mb-8 flex items-center gap-2 animate-float-up" style={{ animationFillMode: "backwards" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-xs text-buz-mavisi/60 tracking-widest uppercase font-light whitespace-nowrap">
                        Topluluk aktif · {totalCount ?? 0} üye
                    </span>
                </div>

                <div className="animate-float-up delay-100 w-full" style={{ animationFillMode: "backwards" }}>
                    <h1 className="text-[clamp(2.5rem,11vw,9rem)] font-extrabold tracking-tighter leading-none mb-0 select-none">
                        <span className="text-gradient-white">bumedya</span>
                        <span className="text-canli-mor" style={{ textShadow: "0 0 40px rgba(124,58,237,0.6), 0 0 80px rgba(124,58,237,0.3)" }}>.</span>
                    </h1>
                    <p className="text-buz-mavisi/30 text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.5em] uppercase font-light mt-3">Creative Digital Universe</p>
                </div>

                <p className="text-buz-mavisi/55 text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-xl mt-8 animate-float-up delay-200" style={{ animationFillMode: "backwards" }}>
                    Fikirlerin forma dönüştüğü, sınırların bulanıklaştığı yeni nesil dijital fanzin ve topluluk portalı.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-10 sm:mt-12 animate-float-up delay-300 w-full max-w-xs sm:max-w-none sm:w-auto" style={{ animationFillMode: "backwards" }}>
                    {user ? (
                        <Link href="/home"
                              className="group relative px-8 sm:px-10 py-3.5 sm:py-4 bg-canli-mor text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden text-center"
                              style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.45), 0 0 0 1px rgba(124,58,237,0.3)" }}>
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Ana Sayfaya Git
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform duration-300">
                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </Link>
                    ) : (
                        <Link href="/register"
                              className="group relative px-8 sm:px-10 py-3.5 sm:py-4 bg-canli-mor text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden text-center"
                              style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.45), 0 0 0 1px rgba(124,58,237,0.3)" }}>
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                Topluluğa Katıl
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform duration-300">
                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </Link>
                    )}
                    <a href="#kesfet" className="glass px-8 sm:px-10 py-3.5 sm:py-4 text-buz-mavisi font-medium rounded-2xl hover:bg-white/8 hover:border-white/20 transition-all duration-300 text-center">
                        Keşfet
                    </a>
                </div>

                <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-30 animate-float-up delay-500" style={{ animationFillMode: "backwards" }}>
                    <span className="text-[10px] tracking-widest uppercase text-buz-mavisi/50">Aşağı kaydır</span>
                    <div className="w-[1px] h-8 bg-gradient-to-b from-buz-mavisi/40 to-transparent" />
                </div>
            </section>

            {/* TOPLULUK AMACI */}
            <section id="kesfet" className="relative z-10 px-4 sm:px-6 py-16 sm:py-24 max-w-5xl mx-auto">
                <div className="text-center mb-12 sm:mb-16">
                    <p className="text-[10px] tracking-widest uppercase text-buz-mavisi/30 mb-4">Neden bumedya.</p>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gradient-white mb-5 sm:mb-6">
                        Yaratıcıların dijital evi.
                    </h2>
                    <p className="text-buz-mavisi/45 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
                        Çizen, yazan, üreten herkese açık. Burada fikirler form bulur,
                        sanatçılar birbirini keşfeder ve dijital kültür şekillenir.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-12 sm:mb-16">
                    {PILLARS.map((p) => (
                        <div key={p.label} className="glass rounded-2xl p-5 sm:p-6 flex items-start gap-4 group hover:border-canli-mor/20 transition-all duration-300">
                            <span className="text-canli-mor text-xl font-extrabold tracking-tighter shrink-0">{p.label}</span>
                            <p className="text-sm text-buz-mavisi/60 leading-relaxed">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* KURALLAR */}
            <section className="relative z-10 px-4 sm:px-6 pb-16 sm:pb-24 max-w-5xl mx-auto">
                <div className="text-center mb-10 sm:mb-12">
                    <p className="text-[10px] tracking-widest uppercase text-buz-mavisi/30 mb-4">Topluluk Sözleşmesi</p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gradient-white">
                        Birlikte güzel kalır.
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {RULES.map((rule, i) => (
                        <div key={i} className="glass rounded-2xl p-5 sm:p-6 hover:border-canli-mor/20 transition-all duration-300">
                            <span className="text-canli-mor/60 text-xs mb-3 block">{rule.icon}</span>
                            <h3 className="text-sm font-semibold text-buz-mavisi/80 mb-2">{rule.title}</h3>
                            <p className="text-xs text-buz-mavisi/40 leading-relaxed">{rule.desc}</p>
                        </div>
                    ))}

                    {/* CTA kartı */}
                    <div className="glass rounded-2xl p-5 sm:p-6 flex flex-col justify-between"
                         style={{ background: "rgba(124,58,237,0.08)", borderColor: "rgba(124,58,237,0.2)" }}>
                        <div>
                            <p className="text-sm font-semibold text-buz-mavisi/80 mb-2">Hazır mısın?</p>
                            <p className="text-xs text-buz-mavisi/40 leading-relaxed mb-6">
                                Topluluğa katıl, üretmeye başla.
                            </p>
                        </div>
                        <Link href="/register"
                              className="text-xs font-bold text-white px-4 py-2.5 rounded-xl text-center transition-all duration-300 hover:opacity-90"
                              style={{ background: "rgba(124,58,237,0.8)" }}>
                            Katıl →
                        </Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="relative z-10 border-t border-white/[0.04] px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-buz-mavisi/30 text-xs font-mono tracking-widest">bumedya. v0.1.0</span>
                    <span className="w-4 h-[1px] bg-white/10" />
                    <span className="text-buz-mavisi/20 text-xs">Bleeding Edge Stack</span>
                </div>
                <div className="flex items-center gap-6">
                    {["Gizlilik", "Kurallar", "İletişim"].map((item) => (
                        <Link key={item} href="#" className="text-buz-mavisi/25 hover:text-buz-mavisi/60 text-xs transition-colors duration-300">{item}</Link>
                    ))}
                </div>
            </footer>
        </main>
    );
}
