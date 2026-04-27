import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import LiveFeed from "@/components/LiveFeed";

export const metadata: Metadata = {
    title: "bumedya. | Yaratıcı Dijital Evren",
    description: "Fikirlerin forma dönüştüğü, sınırların bulanıklaştığı yeni nesil dijital fanzin ve topluluk portalı.",
    openGraph: {
        title: "bumedya. | Yaratıcı Dijital Evren",
        description: "Fikirlerin forma dönüştüğü dijital fanzin ekosistemi.",
        type: "website",
    },
};

function GlowOrb({ className, style }: { className?: string; style?: React.CSSProperties }) {
    return <div aria-hidden className={`absolute rounded-full pointer-events-none ${className}`} style={style} />;
}

function BentoCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div className={`glass rounded-3xl p-6 relative overflow-hidden group transition-all duration-500 hover:border-white/15 ${className}`} style={style}>
            {children}
        </div>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link href={href} className="text-buz-mavisi/40 hover:text-buz-mavisi/90 text-sm tracking-widest uppercase font-light transition-colors duration-300">
            {children}
        </Link>
    );
}

export default async function HomePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Giriş yapmışsa profiles'tan username çek
    let username: string | null = null;
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();
        username = profile?.username ?? user.email?.split("@")[0] ?? null;
    }

    const [
        { count: memberCount },
        { count: creatorCount },
        { data: activities },
        { data: badgeProfiles },
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "member"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "creator"),
        supabase.from("activities").select("id, username, type, payload, created_at").order("created_at", { ascending: false }).limit(8),
        supabase.from("profiles").select("badges"),
    ]);

    const totalCount = (memberCount ?? 0) + (creatorCount ?? 0);

    const editorCount = badgeProfiles?.filter((p) => (p.badges as string[])?.includes("editor")).length ?? 0;
    const writerCount = badgeProfiles?.filter((p) => (p.badges as string[])?.includes("writer")).length ?? 0;
    const artistCount = badgeProfiles?.filter((p) => (p.badges as string[])?.includes("artist")).length ?? 0;

    const roles = [
        { label: "İzleyici", count: String(memberCount ?? 0),  color: "text-sky-400"      },
        { label: "Üretici",  count: String(creatorCount ?? 0), color: "text-violet-400"   },
        { label: "Editör",   count: String(editorCount),       color: "text-amber-400"    },
        { label: "Yazar",    count: String(writerCount),        color: "text-emerald-400"  },
        { label: "Çizer",    count: String(artistCount),        color: "text-pink-400"     },
    ];


    return (
        <main className="relative min-h-screen w-full bg-ana-lacivert overflow-hidden">

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
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5">
                <NavbarBackdrop />
                <Link href="/" className="group flex items-center gap-1 select-none">
                    <span className="text-xl font-extrabold tracking-tighter text-gradient-white" style={{ fontVariantLigatures: "none" }}>bumedya</span>
                    <span className="text-xl font-extrabold text-canli-mor group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.8)] transition-all duration-300">.</span>
                </Link>
                <div className="hidden md:flex items-center gap-8">
                    <NavLink href="/galeri">Galeri</NavLink>
                    <NavLink href="/etkinlikler">Etkinlikler</NavLink>
                    <NavLink href="/uyeler">Üyeler</NavLink>
                </div>
                <div className="flex items-center gap-3">
                    {user ? (
                        <Link href="/profil"
                              className="glass px-5 py-2 rounded-xl text-sm font-medium text-buz-mavisi hover:bg-white/10 hover:border-canli-mor/40 transition-all duration-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-canli-mor/70" />
                            @{username}
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="hidden sm:block text-buz-mavisi/50 hover:text-buz-mavisi text-sm transition-colors duration-300">Giriş</Link>
                            <Link href="/register" className="glass px-5 py-2 rounded-xl text-sm font-medium text-buz-mavisi hover:bg-white/10 hover:border-canli-mor/40 transition-all duration-300">Katıl</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* HERO */}
            <section className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-20 px-6 text-center">
                <div className="glass px-4 py-2 rounded-full mb-8 flex items-center gap-2 animate-float-up" style={{ animationFillMode: "backwards" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-buz-mavisi/60 tracking-widest uppercase font-light">
                        Topluluk aktif · {totalCount} üye
                    </span>
                </div>

                <div className="animate-float-up delay-100" style={{ animationFillMode: "backwards" }}>
                    <h1 className="text-[clamp(4rem,14vw,9rem)] font-extrabold tracking-tighter leading-none mb-0 select-none">
                        <span className="text-gradient-white">bumedya</span>
                        <span className="text-canli-mor" style={{ textShadow: "0 0 40px rgba(124,58,237,0.6), 0 0 80px rgba(124,58,237,0.3)" }}>.</span>
                    </h1>
                    <p className="text-buz-mavisi/30 text-xs md:text-sm tracking-[0.5em] uppercase font-light mt-3">Creative Digital Universe</p>
                </div>

                <p className="text-buz-mavisi/55 text-lg md:text-xl font-light leading-relaxed max-w-xl mt-8 animate-float-up delay-200" style={{ animationFillMode: "backwards" }}>
                    Fikirlerin forma dönüştüğü, sınırların bulanıklaştığı yeni nesil dijital fanzin ve topluluk portalı.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-12 animate-float-up delay-300" style={{ animationFillMode: "backwards" }}>
                    {user ? (
                        <Link href="/profil"
                              className="group relative px-10 py-4 bg-canli-mor text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                              style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.45), 0 0 0 1px rgba(124,58,237,0.3)" }}>
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <span className="relative z-10 flex items-center gap-2">
                                Profilime Git
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform duration-300">
                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </Link>
                    ) : (
                        <Link href="/register"
                              className="group relative px-10 py-4 bg-canli-mor text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
                              style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.45), 0 0 0 1px rgba(124,58,237,0.3)" }}>
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <span className="relative z-10 flex items-center gap-2">
                                Topluluğa Katıl
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-1 transition-transform duration-300">
                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        </Link>
                    )}
                    <button className="glass px-10 py-4 text-buz-mavisi font-medium rounded-2xl hover:bg-white/8 hover:border-white/20 transition-all duration-300">Keşfet</button>
                </div>

                <div className="absolute bottom-10 flex flex-col items-center gap-2 opacity-30 animate-float-up delay-500" style={{ animationFillMode: "backwards" }}>
                    <span className="text-[10px] tracking-widest uppercase text-buz-mavisi/50">Keşfet</span>
                    <div className="w-[1px] h-8 bg-gradient-to-b from-buz-mavisi/40 to-transparent" />
                </div>
            </section>

            {/* BENTO GRID */}
            <section className="relative z-10 px-6 pb-24 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-auto">

                    <BentoCard className="md:col-span-7 min-h-[240px]">
                        <div aria-hidden className="absolute -top-10 -left-10 w-48 h-48 bg-canli-mor/10 rounded-full blur-[60px] pointer-events-none" />
                        <div className="relative z-10">
                            <p className="text-[10px] tracking-widest uppercase text-buz-mavisi/35 mb-6">Topluluk Durumu</p>
                            <div className="grid grid-cols-2 gap-6">
                                {roles.slice(0, 2).map((r) => (
                                    <div key={r.label} className="flex flex-col gap-1">
                                        <span className={`text-3xl font-extrabold tracking-tight ${r.color}`}>{r.count}</span>
                                        <span className="text-xs text-buz-mavisi/40 tracking-wider uppercase">{r.label}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-6 mt-6 pt-5 border-t border-white/5">
                                {roles.slice(2).map((r) => (
                                    <div key={r.label} className="flex flex-col gap-1 flex-1">
                                        <span className={`text-xl font-bold tracking-tight ${r.color}`}>{r.count}</span>
                                        <span className="text-[10px] text-buz-mavisi/35 tracking-wider uppercase">{r.label}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-buz-mavisi/20 mt-4">Toplam {totalCount} üye</p>
                        </div>
                    </BentoCard>

                    <BentoCard className="md:col-span-5 min-h-[240px] flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] tracking-widest uppercase text-buz-mavisi/35">Şu An Çalıyor</p>
                            <span className="text-[10px] text-emerald-400 tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Canlı
                            </span>
                        </div>
                        <div className="flex items-end gap-[3px] h-12 mb-4">
                            {[5, 8, 13, 7, 11, 9, 14, 6, 10, 8, 12, 5, 9, 7, 11].map((h, i) => (
                                <div key={i} className="flex-1 bg-canli-mor/70 rounded-sm"
                                     style={{ height: `${h * 5}%`, animation: `typing-dot ${0.6 + i * 0.05}s ease-in-out infinite`, animationDelay: `${i * 40}ms` }} />
                            ))}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-buz-mavisi/80 tracking-wider">Spotify Widget</p>
                            <p className="text-xs text-buz-mavisi/35 mt-1">Yakında entegre edilecek</p>
                        </div>
                        <div className="mt-4 glass-strong rounded-xl px-4 py-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-canli-mor/20 flex items-center justify-center text-sm">♪</div>
                            <div>
                                <p className="text-xs font-medium text-buz-mavisi/70">Spotify'ı Bağla</p>
                                <p className="text-[10px] text-buz-mavisi/30">Dinlediklerini paylaş</p>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard className="md:col-span-4 min-h-[320px]">
                        <p className="text-[10px] tracking-widest uppercase text-buz-mavisi/35 mb-5">
                            Canlı Akış
                            <span className="ml-2 inline-flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                            </span>
                        </p>
                        <LiveFeed initial={activities ?? []} />
                    </BentoCard>

                    <BentoCard className="md:col-span-5 min-h-[320px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] tracking-widest uppercase text-buz-mavisi/35">Etkinlik Haritası</p>
                            <span className="text-[10px] text-canli-mor tracking-wider">İstanbul</span>
                        </div>
                        <div className="flex-1 relative rounded-2xl overflow-hidden min-h-[200px]">
                            <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
                            <div className="absolute inset-0" style={{ maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)" }}>
                                <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 300 200">
                                    <path d="M0 100 Q75 80 150 100 Q225 120 300 100" stroke="#7C3AED" strokeWidth="1.5" fill="none" />
                                    <path d="M150 0 Q130 60 150 100 Q170 140 150 200" stroke="#3B82F6" strokeWidth="1" fill="none" />
                                    <path d="M0 50 Q100 60 200 40 L300 50" stroke="#7C3AED" strokeWidth="0.5" fill="none" />
                                    <path d="M0 150 Q80 140 160 160 Q240 170 300 155" stroke="#3B82F6" strokeWidth="0.5" fill="none" />
                                </svg>
                            </div>
                            {[{ x: "40%", y: "45%" }, { x: "65%", y: "35%" }, { x: "25%", y: "65%" }].map((pos, i) => (
                                <div key={i} className="absolute" style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}>
                                    <div className="absolute inset-0 rounded-full bg-canli-mor/30" style={{ width: "24px", height: "24px", margin: "-8px", animation: `pulse-glow ${2 + i * 0.4}s ease-in-out infinite` }} />
                                    <div className="w-2 h-2 rounded-full bg-canli-mor relative z-10" />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-buz-mavisi/30 mt-3">Leaflet entegrasyonu yakında</p>
                    </BentoCard>

                    <BentoCard className="md:col-span-3 min-h-[320px] flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] tracking-widest uppercase text-buz-mavisi/35 mb-6">Manifesto</p>
                            <p className="text-sm text-buz-mavisi/55 leading-relaxed font-light">
                                Üret. Paylaş. Dönüştür. Sanatın sınırı dijital de olsa gerçektir.
                            </p>
                            <div className="mt-6 space-y-2">
                                {["Çiz", "Yaz", "Bağlan", "Büyü"].map((word) => (
                                    <div key={word} className="flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-canli-mor/60" />
                                        <span className="text-xs text-buz-mavisi/40 tracking-wider">{word}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Link href="/hakkimizda" className="text-xs text-canli-mor/70 hover:text-canli-mor tracking-wider transition-colors duration-300 flex items-center gap-1 group mt-4">
                            Daha Fazla
                            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </Link>
                    </BentoCard>

                </div>
            </section>

            {/* FOOTER */}
            <footer className="relative z-10 border-t border-white/[0.04] px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
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