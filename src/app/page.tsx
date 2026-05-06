import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import SetWelcomeCookie from "@/components/SetWelcomeCookie";
import SiteFooter from "@/components/SiteFooter";
import ContactSection from "@/components/ContactSection";

export const metadata: Metadata = {
    title: "bumedya.",
    description: "Fikirlerin forma dönüştüğü, sınırların bulanıklaştığı yeni nesil dijital fanzin ve topluluk portalı.",
};

const RULES = [
    { icon: "01", title: "Saygı zorunludur", desc: "Her fikre, her insana saygıyla yaklaş. Farklılıklar zenginliktir." },
    { icon: "02", title: "İçerik özgün olmalı", desc: "Başkasının emeğini sahiplenmek yasaktır. Kaynak göster, ilham al." },
    { icon: "03", title: "Üret ve paylaş", desc: "Bu platform tüketmek için değil, üretmek için var. Her katkı değerlidir." },
    { icon: "04", title: "Yapıcı ol", desc: "Eleştiri yıkmak için değil, büyütmek için yapılır. Katkısı olmayan yorum olmaz." },
    { icon: "05", title: "Topluluk kuralları", desc: "Nefret söylemi, taciz ve spam'e sıfır tolerans." },
];

const BADGES = [
    // — Sistem —
    { label: "Onaylı", color: "rgba(147,197,253,0.9)", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)",   desc: "Admin tarafından doğrulanmış üyelere verilir. Başvuruyla alınamaz." },
    { label: "Kurucu",           color: "rgba(251,191,36,0.9)",  bg: "rgba(251,191,36,0.06)",  border: "rgba(251,191,36,0.2)",   desc: "Topluluğun kurucu üyelerine özel rozettir. Başvuruyla alınamaz." },
    { label: "Katkıcı",          color: "rgba(167,139,250,0.9)", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.2)",   desc: "Topluluk projelerine aktif katkı sağlayan üyelere admin tarafından verilir." },
    // — Başvuruyla kazanılan —
    { label: "Nakkaş",   color: "rgba(244,114,182,0.95)", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.25)", desc: "Çizim, illüstrasyon veya görsel sanat alanında üretim yapan üyelere başvuru ile verilir." },
    { label: "Kalemşor", color: "rgba(52,211,153,0.95)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)",   desc: "Yazı, şiir veya özgün metin üreten üyelere başvuru ile verilir." },
    { label: "Mürettip", color: "rgba(251,191,36,0.95)",  bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.25)",  desc: "İçerikleri derleyip düzenleyen, editoryal katkı sağlayan üyelere başvuru ile verilir." },
    // — İlgi alanı —
    { label: "Çizer",  color: "rgba(244,114,182,0.7)", bg: "rgba(244,114,182,0.05)", border: "rgba(244,114,182,0.18)", desc: "Görsel sanat ve illüstrasyona ilgi duyan üyeleri gösterir." },
    { label: "Yazar",  color: "rgba(52,211,153,0.7)",  bg: "rgba(52,211,153,0.05)",  border: "rgba(52,211,153,0.15)",  desc: "Yazı ve edebiyata ilgi duyan üyeleri gösterir." },
    { label: "Editör", color: "rgba(251,191,36,0.7)",  bg: "rgba(251,191,36,0.05)",  border: "rgba(251,191,36,0.18)",  desc: "Editoryal alana ilgi duyan üyeleri gösterir." },
];

const PAGES = [
    {
        path: "/galeri",
        label: "Galeri",
        desc: "Etkinliklerden fotoğraflar, çizimler, tasarımlar — topluluğun görsel belleği burada birikir. Yalnızca adminler içerik yükleyebilir.",
        accent: "rgba(167,139,250,0.85)",
        bg: "rgba(124,58,237,0.06)",
        border: "rgba(124,58,237,0.18)",
    },
    {
        path: "/akis",
        label: "Akış",
        desc: "Topluluktan kısa paylaşımlar, fikirler ve günlük üretimler. Üyeler metin veya görsel paylaşabilir,un dev beğeni bırakabilir.",
        accent: "rgba(96,165,250,0.85)",
        bg: "rgba(59,130,246,0.06)",
        border: "rgba(59,130,246,0.18)",
    },
    {
        path: "/etkinlikler",
        label: "Etkinlikler",
        desc: "Yaklaşan buluşmalar, workshoplar ve topluluk etkinlikleri. Haritadan konuma bak, takvime ekle, detaylara ulaş.",
        accent: "rgba(52,211,153,0.85)",
        bg: "rgba(52,211,153,0.06)",
        border: "rgba(52,211,153,0.18)",
    },
    {
        path: "/chat",
        label: "Chat",
        desc: "Gerçek zamanlı topluluk sohbeti. Fikirlerini anlık paylaş, sorularını sor, diğer üyelerle tanış.",
        accent: "rgba(251,191,36,0.85)",
        bg: "rgba(251,191,36,0.06)",
        border: "rgba(251,191,36,0.18)",
    },
    {
        path: "/manifest",
        label: "Manifest",
        desc: "Ortak kara tahta. Hayalini, notunu veya bir söz bırak — renk seç, tahtaya tıkla. Topluluktan herkesin notu burada birikir.",
        accent: "rgba(52,211,153,0.85)",
        bg: "rgba(52,211,153,0.06)",
        border: "rgba(52,211,153,0.18)",
    },
    {
        path: "/basvuru",
        label: "Başvuru",
        desc: "Yönetim kuruluna katıl, rozet başvurusu yap veya okulunda bir Bumedya kulübü aç. Formlar yeteneklerini ölçmek için değil, seni tanımak için.",
        accent: "rgba(244,114,182,0.85)",
        bg: "rgba(244,114,182,0.06)",
        border: "rgba(244,114,182,0.18)",
    },
];

const CLUBS = [
    { uni: "Beykoz Üniversitesi", city: "İstanbul", active: true },
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
        <main className="relative w-full aurora-bg">
            <SetWelcomeCookie />

            {/* Aurora layers — animated orbs + texture */}
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />
            <div aria-hidden className="fixed inset-0 dot-grid opacity-[0.35] pointer-events-none" style={{ zIndex: 0 }} />

            {/* NAVBAR */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4">
                <NavbarBackdrop />
                <Link href="/" className="group flex items-center gap-0.5 select-none shrink-0 relative z-10">
                    <span className="text-lg font-bold tracking-tight" style={{ color: "var(--text-2)" }}>bumedya</span>
                    <span className="text-lg font-bold transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(124,58,237,0.9)]" style={{ color: "var(--violet)" }}>.</span>
                </Link>
                {user && (
                    <div className="hidden md:flex items-center gap-7 relative z-10">
                        {[
                            { href: "/home",        label: "Ana Sayfa"   },
                            { href: "/galeri",      label: "Galeri"      },
                            { href: "/members",     label: "Üyeler"      },
                            { href: "/etkinlikler", label: "Etkinlikler" },
                            { href: "/chat",        label: "Lounge"      },
                        ].map(({ href, label }) => (
                            <Link key={href} href={href}
                                  className="nav-link-dim text-xs tracking-widest uppercase font-medium transition-colors duration-200">
                                {label}
                            </Link>
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-2 shrink-0 relative z-10">
                    {user ? (
                        <Link href="/home" className="glass flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 hover:border-white/20"
                              style={{ color: "var(--violet-text)" }}>
                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--violet)" }} />
                            @{username}
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-xs font-medium transition-colors duration-200 px-3 py-2"
                                  style={{ color: "var(--text-3)" }}>Giriş</Link>
                            <Link href="/register" className="btn-primary !py-2 !px-4 !text-xs">Katıl</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* HERO */}
            <section className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-20 px-4 sm:px-6 text-center">
                <div className="glass flex items-center gap-2.5 px-4 py-2 rounded-full mb-10 animate-float-up" style={{ animationFillMode: "backwards" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="text-[11px] tracking-widest uppercase font-medium" style={{ color: "var(--text-3)" }}>
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
                       style={{ color: "var(--text-4)" }}>
                        Creative Digital Universe
                    </p>
                </div>

                <p className="animate-float-up delay-200 mt-8 text-base sm:text-lg font-light leading-relaxed max-w-lg"
                   style={{ color: "var(--text-3)", animationFillMode: "backwards" }}>
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
                
            </section>

            {/* PILLARS */}
            <section id="kesfet" className="relative z-10 px-4 sm:px-6 py-20 sm:py-28 max-w-5xl mx-auto">
                <div className="text-center mb-14">
                    <p className="label-caps mb-4">Neden mi bumedya?</p>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gradient-white mb-5">
                        Çünkü burası Yaratıcıların dijital evi.
                    </h2>
                    <p className="text-base font-light leading-relaxed max-w-lg mx-auto"
                       style={{ color: "var(--text-3)" }}>
                        Çizen, yazan, üreten herkese açık. Burada önemli olan mükemel olmak değil, hayal etmek.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PILLARS.map((p) => (
                        <div key={p.label} className="card group p-6 flex items-start gap-4">
                            <span className="text-2xl font-bold shrink-0 transition-all duration-300"
                                  style={{ color: p.accent, textShadow: `0 0 20px ${p.accent}40` }}>
                                {p.label}
                            </span>
                            <p className="text-sm leading-relaxed pt-0.5" style={{ color: "var(--text-3)" }}>
                                {p.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* RULES */}
            <section id="kurallar" className="relative z-10 px-4 sm:px-6 pb-24 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <p className="label-caps mb-4">Topluluk Sözleşmesi</p>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient-white">
                        Huzurlu ve Saygılı Bir Topluluk İçin
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {RULES.map((rule) => (
                        <div key={rule.icon} className="card p-6">
                            <p className="font-mono text-[10px] mb-3" style={{ color: "var(--violet-text)" }}>
                                {rule.icon}
                            </p>
                            <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>
                                {rule.title}
                            </h3>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
                                {rule.desc}
                            </p>
                        </div>
                    ))}

                    <div className="card card-violet p-6 flex flex-col justify-between">
                        <div>
                            <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-2)" }}>
                                Hazır mısın?
                            </p>
                            <p className="text-xs leading-relaxed mb-6" style={{ color: "var(--text-3)" }}>
                                Topluluğa katıl, üretmeye başla.
                            </p>
                        </div>
                        <Link href="/register" className="btn-primary !py-2.5 text-xs text-center flex items-center justify-center gap-1.5">
                            Katıl
                        </Link>
                    </div>
                </div>
            </section>

            {/* HOW TO JOIN */}
            <section className="relative z-10 px-4 sm:px-6 pb-24 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <p className="label-caps mb-4">Nasıl Katılırsın?</p>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient-white">
                        Üç Adımda Topluluğa Gir
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { step: "01", title: "Kayıt Ol", desc: "Kullanıcı adını seç, e-posta adresinle hesap oluştur. Ücretsiz ve hızlı." },
                        { step: "02", title: "Doğrula", desc: "Gelen kutuna düşen linke tıkla. Hesabın anında aktif olur." },
                        { step: "03", title: "Üretmeye Başla", desc: "Akışa paylaşım yap, galeriye eser yükle, etkinliklere katıl." },
                    ].map(({ step, title, desc }) => (
                        <div key={step} className="card p-6 flex flex-col gap-3">
                            <span className="font-mono text-xs" style={{ color: "rgba(167,139,250,0.8)" }}>{step}</span>
                            <h3 className="text-base font-semibold" style={{ color: "var(--text-2)" }}>{title}</h3>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CLUBS */}
            <section className="relative z-10 px-4 sm:px-6 pb-24 max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <p className="label-caps mb-4">Kulüpler</p>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient-white">
                        Nerelerde Varız?
                    </h2>
                    <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: "var(--text-3)" }}>
                        Topluluğun üniversitelerdeki uzantıları. Yakında daha fazlası.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                    {CLUBS.map((c) => (
                        <div key={c.uni} className="card px-5 py-4 flex items-center gap-4">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>{c.uni}</p>
                                <p className="text-xs" style={{ color: "var(--text-4)" }}>{c.city}</p>
                            </div>
                            <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-full"
                                  style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "rgba(52,211,153,0.8)" }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Aktif
                            </span>
                        </div>
                    ))}
                    <Link href={user ? "/basvuru#kulup-ac" : "/register?next=%2Fbasvuru%23kulup-ac"}
                          className="card px-5 py-4 flex items-center gap-3 transition-all duration-200 hover:border-violet-500/30"
                          style={{ opacity: 0.6 }}>
                        <div className="flex flex-col gap-0.5">
                            <p className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>Üniversiten burada olabilir</p>
                            <p className="text-xs" style={{ color: "var(--text-4)" }}>Kulüp açmak için başvur →</p>
                        </div>
                    </Link>
                </div>
            </section>

            {/* BADGES */}
            <section className="relative z-10 px-4 sm:px-6 pb-24 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <p className="label-caps mb-4">Rozetler</p>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient-white">
                        Hangi Rozet Ne Anlama Gelir?
                    </h2>
                    <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: "var(--text-3)" }}>
                        Bazı rozetler başvuruyla, bazıları admin tarafından, bazıları ise ilgi alanına göre verilir.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {BADGES.map((b) => (
                        <div key={b.label} className="card p-5 flex items-start gap-4">
                            <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wide mt-0.5"
                                  style={{ background: b.bg, border: `1px solid ${b.border}`, color: b.color }}>
                                {b.label}
                            </span>
                            <p className="text-xs leading-relaxed pt-1" style={{ color: "var(--text-3)" }}>
                                {b.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* PAGES */}
            <section className="relative z-10 px-4 sm:px-6 pb-24 max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <p className="label-caps mb-4">Sayfalar</p>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient-white">
                        Nerede Ne Var?
                    </h2>
                    <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: "var(--text-3)" }}>
                        Platforma ilk adım atıyorsan, hangi sayfanın ne işe yaradığını öğren.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PAGES.map((p) => (
                        <div key={p.path} className="card p-5 flex flex-col gap-3">
                            <div className="flex items-center gap-2.5">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                                      style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.accent }}>
                                    {p.path}
                                </span>
                                <span className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{p.label}</span>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>{p.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="relative z-10 px-4 sm:px-6 pb-24 max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <p className="label-caps mb-4">SSS</p>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient-white">
                        Sık Sorulan Sorular
                    </h2>
                </div>
                <div className="flex flex-col gap-3">
                    {[
                        { q: "Platforma katılmak ücretsiz mi?", a: "Evet, tamamen ücretsiz. Kayıt ol, doğrula, kullanmaya başla." },
                        { q: "İçerik yüklemek için üye olmam gerekiyor mu?", a: "Akışa ve galeriye içerik yükleyebilmek için platforma üye olman yeterli. Kayıt ol, doğrula ve paylaşmaya başla." },
                        { q: "Rozet başvurusu yapabilir miyim?", a: "Bazı rozetler başvuruyla alınabilir. Nakkaş, Kalemşor ve Mürettip rozetleri için /başvuru sayfasından form doldurabilirsin. Kurucu ve Yetkilendirilmiş gibi sistem rozetleri ise yalnızca admin tarafından verilir." },
                        { q: "Paylaştığım içerikler kime ait?", a: "Tüm içerikler sana aittir. Platforma yüklemen, içeriğin başkalarına devredildiği anlamına gelmez." },
                        { q: "Bir sorunum olursa kime ulaşabilirim?", a: "Discord sunucumuzdan veya bumedyailetisim@gmail.com adresinden bize ulaşabilirsin." },
                    ].map(({ q, a }) => (
                        <div key={q} className="card p-5">
                            <p className="text-sm font-medium mb-2" style={{ color: "var(--text-2)" }}>{q}</p>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>{a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FOOTER */}
            <ContactSection />
            <SiteFooter />
        </main>
    );
}
