import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import LiveFeed from "@/components/LiveFeed";

export const metadata: Metadata = { title: "Ana Sayfa | bumedya." };

function BentoCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div className={`glass rounded-3xl p-4 sm:p-6 relative overflow-hidden group transition-all duration-500 hover:border-white/15 ${className}`} style={style}>
            {children}
        </div>
    );
}

const MANIFESTO_LINES = [
    "Bumedya bir platform değil, bir duruş.",
    "Üretmek tüketmekten daha değerlidir.",
    "Her çizgi, her kelime, her nota — bir varlık kanıtı.",
    "Sınırlar bulanıklaşır. Fikirler form bulur.",
    "Yaratıcılar birbirini burada bulur.",
];

export default async function HomePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

    const username = profile?.username ?? user.email?.split("@")[0] ?? "";

    const [
        { count: totalCount },
        { count: creatorCount },
        { count: memberCount },
        { data: activities },
        { data: allProfiles },
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "creator"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "member"),
        supabase.from("activities").select("id, username, type, payload, created_at").order("created_at", { ascending: false }).limit(8),
        supabase.from("profiles").select("badges"),
    ]);

    const editorCount = allProfiles?.filter((p) => (p.badges as string[])?.includes("editor")).length ?? 0;
    const writerCount = allProfiles?.filter((p) => (p.badges as string[])?.includes("writer")).length ?? 0;
    const artistCount = allProfiles?.filter((p) => (p.badges as string[])?.includes("artist")).length ?? 0;

    const hours = new Date().getHours();
    const greeting = hours < 6 ? "gece geç saatte ne arıyorsun?" : hours < 12 ? "günaydın!" : hours < 17 ? "iyi günler!" : hours < 21 ? "iyi akşamlar!" : "iyi geceler!";

    return (
        <div className="relative min-h-screen w-full bg-ana-lacivert overflow-hidden">
            {/* Arka plan */}
            <div className="dot-grid absolute inset-0 -z-30 opacity-100" aria-hidden />
            <div aria-hidden className="absolute rounded-full pointer-events-none"
                 style={{ width: 900, height: 900, top: "30%", left: "50%", transform: "translate(-50%, -50%)", background: "rgba(124,58,237,0.08)", filter: "blur(140px)", zIndex: -20 }} />
            <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.025]"
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "200px 200px" }} />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-5">
                <NavbarBackdrop />
                <Link href="/" className="flex items-baseline gap-0.5 shrink-0">
                    <span className="text-sm font-bold text-buz-mavisi/50">bumedya</span>
                    <span className="text-sm font-bold text-canli-mor/70">.</span>
                </Link>
                <div className="hidden md:flex items-center gap-6 lg:gap-8">
                    {[
                        { href: "/home",        label: "Ana Sayfa",   active: true  },
                        { href: "/galeri",      label: "Galeri",      active: false },
                        { href: "/etkinlikler", label: "Etkinlikler", active: false },
                        { href: "/members",     label: "Üyeler",      active: false },
                        { href: "/chat",        label: "Lounge",      active: false },
                    ].map(({ href, label, active }) => (
                        <Link key={href} href={href}
                              className="text-sm tracking-widest uppercase font-light transition-colors duration-300"
                              style={{ color: active ? "rgba(224,242,254,0.9)" : "rgba(224,242,254,0.4)" }}>
                            {label}
                        </Link>
                    ))}
                </div>
                <Link href="/profil" className="shrink-0 text-xs px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 max-w-[120px] sm:max-w-none truncate"
                      style={{ color: "rgba(167,139,250,0.8)", border: "1px solid rgba(124,58,237,0.25)", background: "rgba(124,58,237,0.08)" }}>
                    @{username}
                </Link>
            </nav>

            {/* İçerik */}
            <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-20 sm:pt-28 pb-12 sm:pb-16 flex flex-col gap-6 sm:gap-8">

                {/* Karşılama */}
                <div className="flex flex-col items-center text-center pt-6 sm:pt-10 pb-2 sm:pb-4 gap-4 sm:gap-5">
                    <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-xs text-buz-mavisi/60 tracking-widest uppercase font-light whitespace-nowrap">
                            Topluluk aktif · {totalCount ?? 0} üye
                        </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-buz-mavisi/90 break-words max-w-lg">
                        @{username},{" "}
                        <span className="font-light text-buz-mavisi/50">{greeting}</span>
                    </h1>
                </div>

                {/* Bento Grid — 1 col mobile, 2 col tablet, 12 col desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">

                    {/* ── Topluluk Durumu ── */}
                    <BentoCard className="sm:col-span-1 lg:col-span-7">
                        <div aria-hidden className="absolute -top-10 -left-10 w-48 h-48 bg-canli-mor/10 rounded-full blur-[60px] pointer-events-none" />
                        <div className="relative z-10">
                            <p className="text-[10px] tracking-widest uppercase text-buz-mavisi/35 mb-4 sm:mb-6">Topluluk Durumu</p>
                            <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-buz-mavisi/60">{memberCount ?? 0}</span>
                                    <span className="text-xs text-buz-mavisi/40 tracking-wider uppercase">İzleyici</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-mor-400">{creatorCount ?? 0}</span>
                                    <span className="text-xs text-buz-mavisi/40 tracking-wider uppercase">Üretici</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                <div className="rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col gap-1"
                                     style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)" }}>
                                    <span className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(251,191,36,0.45)" }}>Editör</span>
                                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: "rgba(251,191,36,0.85)" }}>{editorCount}</span>
                                </div>
                                <div className="rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col gap-1"
                                     style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.12)" }}>
                                    <span className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(52,211,153,0.45)" }}>Yazar</span>
                                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: "rgba(52,211,153,0.85)" }}>{writerCount}</span>
                                </div>
                                <div className="rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex flex-col gap-1"
                                     style={{ background: "rgba(244,114,182,0.05)", border: "1px solid rgba(244,114,182,0.12)" }}>
                                    <span className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(244,114,182,0.45)" }}>Çizer</span>
                                    <span className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: "rgba(244,114,182,0.85)" }}>{artistCount}</span>
                                </div>
                            </div>
                        </div>
                    </BentoCard>

                    {/* ── Spotify Widget ── */}
                    <BentoCard className="sm:col-span-1 lg:col-span-5 flex flex-col justify-between min-h-[200px] sm:min-h-[240px]">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] tracking-widest uppercase text-buz-mavisi/35">Şu An Çalıyor</p>
                            <span className="text-[10px] text-emerald-400 tracking-wider flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Canlı
                            </span>
                        </div>
                        <div className="flex items-end gap-[3px] h-10 sm:h-12 mb-4">
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
                            <div className="w-8 h-8 rounded-lg bg-canli-mor/20 flex items-center justify-center text-sm shrink-0">♪</div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-buz-mavisi/70 truncate">Spotify'ı Bağla</p>
                                <p className="text-[10px] text-buz-mavisi/30">Dinlediklerini paylaş</p>
                            </div>
                        </div>
                    </BentoCard>

                    {/* ── Canlı Akış ── */}
                    <BentoCard className="sm:col-span-1 lg:col-span-4 min-h-[280px] sm:min-h-[320px]">
                        <div className="flex items-center justify-between mb-4 sm:mb-5">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                <p className="text-[10px] tracking-widest uppercase text-buz-mavisi/35">Canlı Akış</p>
                            </div>
                            <Link href="/chat" className="text-[10px] tracking-widest uppercase text-canli-mor/60 hover:text-canli-mor transition-colors duration-200 whitespace-nowrap">
                                Lounge →
                            </Link>
                        </div>
                        <LiveFeed initial={activities ?? []} />
                    </BentoCard>

                    {/* ── Etkinlik Haritası ── */}
                    <BentoCard className="sm:col-span-1 lg:col-span-5 min-h-[280px] sm:min-h-[320px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] tracking-widest uppercase text-buz-mavisi/35">Etkinlik Haritası</p>
                            <span className="text-[10px] text-canli-mor tracking-wider">İstanbul</span>
                        </div>
                        <div className="flex-1 relative rounded-2xl overflow-hidden min-h-[160px] sm:min-h-[200px]">
                            <div className="absolute inset-0"
                                 style={{ backgroundImage: `linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
                            <div className="absolute inset-0" style={{ maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)" }}>
                                <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 300 200">
                                    <path d="M0 100 Q75 80 150 100 Q225 120 300 100" stroke="#7C3AED" strokeWidth="1.5" fill="none" />
                                    <path d="M150 0 Q130 60 150 100 Q170 140 150 200" stroke="#3B82F6" strokeWidth="1" fill="none" />
                                    <path d="M0 50 Q100 60 200 40 L300 50" stroke="#7C3AED" strokeWidth="0.5" fill="none" />
                                    <path d="M0 150 Q80 140 160 160 Q240 170 300 155" stroke="#3B82F6" strokeWidth="0.5" fill="none" />
                                </svg>
                            </div>
                            {([{ x: "40%", y: "45%" }, { x: "65%", y: "35%" }, { x: "25%", y: "65%" }] as const).map((pos, i) => (
                                <div key={i} className="absolute" style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}>
                                    <div className="absolute rounded-full bg-canli-mor/30"
                                         style={{ width: 24, height: 24, margin: -8, animation: `pulse-glow ${2 + i * 0.4}s ease-in-out infinite` }} />
                                    <div className="w-2 h-2 rounded-full bg-canli-mor relative z-10" />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-buz-mavisi/30 mt-3">3 aktif etkinlik · Leaflet entegrasyonu yakında</p>
                    </BentoCard>

                    {/* ── Manifesto ── */}
                    <BentoCard className="sm:col-span-2 lg:col-span-3 flex flex-col gap-4 sm:gap-5">
                        <p className="text-[10px] tracking-widest uppercase text-buz-mavisi/35">Manifesto</p>
                        <div className="flex flex-col gap-2.5 sm:gap-3 flex-1">
                            {MANIFESTO_LINES.map((line, i) => (
                                <p key={i} className="text-xs sm:text-sm font-light leading-relaxed"
                                   style={{ color: `rgba(224,242,254,${0.65 - i * 0.08})` }}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </BentoCard>

                    {/* ── Alt bölüm ── */}
                    <div className="sm:col-span-2 lg:col-span-12 rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center gap-3"
                         style={{
                             background: "rgba(255,255,255,0.02)",
                             border: "1px solid rgba(255,255,255,0.05)",
                             minHeight: "140px",
                         }}>
                        <span className="text-3xl opacity-10">✦</span>
                        <p className="text-sm text-buz-mavisi/20">Daha fazlası yakında.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
