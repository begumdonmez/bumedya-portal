import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import LiveFeed from "@/components/LiveFeed";

export const metadata: Metadata = { title: "Ana Sayfa | bumedya." };

function BentoCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div className={`card p-5 sm:p-6 relative overflow-hidden ${className}`} style={style}>
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
        .from("profiles").select("username").eq("id", user.id).single();
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

    const NAV_LINKS = [
        { href: "/home",    label: "Ana Sayfa",   active: true  },
        { href: "/akis",    label: "Akış",         active: false },
        { href: "/galeri",  label: "Galeri",       active: false },
        { href: "/members", label: "Üyeler",       active: false },
        { href: "/chat",    label: "Lounge",       active: false },
    ];

    return (
        <div className="aurora-bg relative min-h-screen w-full overflow-hidden">
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />
            <div aria-hidden className="fixed inset-0 dot-grid opacity-[0.3] pointer-events-none" style={{ zIndex: 0 }} />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4">
                <NavbarBackdrop />
                <Link href="/" className="group flex items-baseline gap-0.5 shrink-0 relative z-10">
                    <span className="text-sm font-bold" style={{ color: "rgba(240,249,255,0.5)" }}>bumedya</span>
                    <span className="text-sm font-bold transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.9)]"
                          style={{ color: "#7C3AED" }}>.</span>
                </Link>
                <div className="hidden md:flex items-center gap-6 lg:gap-8 relative z-10">
                    {NAV_LINKS.map(({ href, label, active }) => (
                        <Link key={href} href={href}
                              className="text-xs tracking-widest uppercase font-medium transition-colors duration-200"
                              style={{ color: active ? "rgba(240,249,255,0.9)" : "rgba(240,249,255,0.38)" }}>
                            {label}
                        </Link>
                    ))}
                </div>
                <Link href="/profil" className="relative z-10 text-xs px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 max-w-[120px] sm:max-w-none truncate"
                      style={{ color: "rgba(167,139,250,0.85)", border: "1px solid rgba(124,58,237,0.25)", background: "rgba(124,58,237,0.08)" }}>
                    @{username}
                </Link>
            </nav>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-24 pb-16 flex flex-col gap-6">

                {/* Greeting */}
                <div className="flex flex-col items-center text-center pt-4 pb-2 gap-4">
                    <div className="glass flex items-center gap-2.5 px-4 py-2 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-[11px] tracking-widest uppercase font-medium"
                              style={{ color: "rgba(240,249,255,0.45)" }}>
                            Topluluk aktif · {totalCount ?? 0} üye
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight break-words max-w-lg">
                        <span style={{ color: "rgba(240,249,255,0.88)" }}>@{username},</span>{" "}
                        <span className="font-light" style={{ color: "rgba(240,249,255,0.4)" }}>{greeting}</span>
                    </h1>
                </div>

                {/* Bento grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">

                    {/* Topluluk Durumu */}
                    <BentoCard className="sm:col-span-1 lg:col-span-7">
                        <div aria-hidden className="absolute -top-8 -left-8 w-48 h-48 rounded-full pointer-events-none"
                             style={{ background: "rgba(124,58,237,0.12)", filter: "blur(50px)" }} />
                        <div className="relative z-10">
                            <p className="label-caps mb-5">Topluluk Durumu</p>
                            <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-5">
                                <div className="flex flex-col gap-1">
                                    <span className="text-3xl font-bold tracking-tight" style={{ color: "rgba(240,249,255,0.55)" }}>
                                        {memberCount ?? 0}
                                    </span>
                                    <span className="label-caps">İzleyici</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-3xl font-bold tracking-tight text-gradient-violet">
                                        {creatorCount ?? 0}
                                    </span>
                                    <span className="label-caps">Üretici</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: "Editör", count: editorCount, color: "rgba(251,191,36,0.8)", bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.14)" },
                                    { label: "Yazar",  count: writerCount, color: "rgba(52,211,153,0.8)",  bg: "rgba(52,211,153,0.06)",  border: "rgba(52,211,153,0.14)"  },
                                    { label: "Çizer",  count: artistCount, color: "rgba(244,114,182,0.8)", bg: "rgba(244,114,182,0.06)", border: "rgba(244,114,182,0.14)" },
                                ].map(({ label, count, color, bg, border }) => (
                                    <div key={label} className="rounded-2xl px-3 py-3 flex flex-col gap-1"
                                         style={{ background: bg, border: `1px solid ${border}` }}>
                                        <span className="text-[10px] tracking-widest uppercase" style={{ color }}>
                                            {label}
                                        </span>
                                        <span className="text-xl font-bold" style={{ color }}>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BentoCard>

                    {/* Spotify Widget */}
                    <BentoCard className="sm:col-span-1 lg:col-span-5 flex flex-col justify-between min-h-[220px]">
                        <div className="flex items-center justify-between mb-4">
                            <p className="label-caps">Şu An Çalıyor</p>
                            <span className="text-[10px] tracking-wider flex items-center gap-1.5" style={{ color: "rgba(52,211,153,0.8)" }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Canlı
                            </span>
                        </div>
                        <div className="flex items-end gap-[3px] h-10 mb-4">
                            {[5,8,13,7,11,9,14,6,10,8,12,5,9,7,11].map((h, i) => (
                                <div key={i} className="flex-1 rounded-sm"
                                     style={{ height: `${h * 5}%`, background: "rgba(124,58,237,0.6)", animation: `typing-dot ${0.6 + i * 0.05}s ease-in-out infinite`, animationDelay: `${i * 40}ms` }} />
                            ))}
                        </div>
                        <div>
                            <p className="text-sm font-medium" style={{ color: "rgba(240,249,255,0.75)" }}>Spotify Widget</p>
                            <p className="text-xs mt-0.5" style={{ color: "rgba(240,249,255,0.3)" }}>Yakında entegre edilecek</p>
                        </div>
                        <div className="mt-4 glass rounded-xl px-4 py-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                                 style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.25)" }}>♪</div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium" style={{ color: "rgba(240,249,255,0.65)" }}>Spotify'ı Bağla</p>
                                <p className="text-[10px]" style={{ color: "rgba(240,249,255,0.28)" }}>Dinlediklerini paylaş</p>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Canlı Akış */}
                    <BentoCard className="sm:col-span-1 lg:col-span-4 min-h-[300px]">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                <p className="label-caps">Canlı Akış</p>
                            </div>
                            <Link href="/chat" className="text-[10px] tracking-widest uppercase transition-colors duration-200"
                                  style={{ color: "rgba(124,58,237,0.6)" }}>
                                Lounge <ChevronRight size={11} className="inline" />
                            </Link>
                        </div>
                        <LiveFeed initial={activities ?? []} />
                    </BentoCard>

                    {/* Etkinlik Haritası */}
                    <BentoCard className="sm:col-span-1 lg:col-span-5 min-h-[300px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <p className="label-caps">Etkinlik Haritası</p>
                            <span className="text-[10px] font-medium" style={{ color: "rgba(124,58,237,0.7)" }}>İstanbul</span>
                        </div>
                        <div className="flex-1 relative rounded-2xl overflow-hidden min-h-[180px]"
                             style={{ background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.1)" }}>
                            <div className="absolute inset-0"
                                 style={{ backgroundImage: `linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)`, backgroundSize: "28px 28px" }} />
                            <div className="absolute inset-0" style={{ maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)" }}>
                                <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 300 200">
                                    <path d="M0 100 Q75 80 150 100 Q225 120 300 100" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
                                    <path d="M150 0 Q130 60 150 100 Q170 140 150 200" stroke="#60A5FA" strokeWidth="1" fill="none" />
                                </svg>
                            </div>
                            {([{ x: "40%", y: "45%" }, { x: "65%", y: "35%" }, { x: "25%", y: "65%" }] as const).map((pos, i) => (
                                <div key={i} className="absolute" style={{ left: pos.x, top: pos.y, transform: "translate(-50%,-50%)" }}>
                                    <div className="absolute rounded-full" style={{ width: 24, height: 24, margin: -8, background: "rgba(124,58,237,0.25)", animation: `pulse-glow ${2 + i * 0.4}s ease-in-out infinite` }} />
                                    <div className="w-2 h-2 rounded-full relative z-10" style={{ background: "#8B5CF6" }} />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs mt-3" style={{ color: "rgba(240,249,255,0.25)" }}>3 aktif etkinlik · Leaflet entegrasyonu yakında</p>
                    </BentoCard>

                    {/* Manifesto */}
                    <BentoCard className="sm:col-span-2 lg:col-span-3 flex flex-col gap-4">
                        <p className="label-caps">Manifesto</p>
                        <div className="flex flex-col gap-3 flex-1">
                            {MANIFESTO_LINES.map((line, i) => (
                                <p key={i} className="text-xs leading-relaxed"
                                   style={{ color: `rgba(240,249,255,${0.62 - i * 0.08})` }}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </BentoCard>

                    {/* Bottom CTA */}
                    <div className="sm:col-span-2 lg:col-span-12 rounded-2xl p-8 flex flex-col items-center justify-center gap-3"
                         style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", minHeight: "120px" }}>
                        <Sparkles size={22} style={{ opacity: 0.08 }} />
                        <p className="text-xs" style={{ color: "rgba(240,249,255,0.18)" }}>Daha fazlası yakında.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
