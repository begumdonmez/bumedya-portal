import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import HomeNavLinks from "@/components/HomeNavLinks";
import LiveFeed from "@/components/LiveFeed";
import EventMapClient from "@/components/EventMapClient";
import AnnouncementsWidget from "@/components/AnnouncementsWidget";
import LinksWidget from "@/components/LinksWidget";
import YoutubeWidget from "@/components/YoutubeWidget";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";
import NotificationBell from "@/components/NotificationBell";
import SpotifyWidget from "./SpotifyWidget";

export const metadata: Metadata = { title: "Ana Sayfa" };

function BentoCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div className={`card p-5 sm:p-6 relative overflow-hidden ${className}`} style={style}>
            {children}
        </div>
    );
}

const MANIFESTO_LINES = [
    "Bumedya sadece bir topluluk değil hayal gücünüzü ateşleyen bir fitil.",
    "Üretmek kadar düşünmek ve çabalamak da değerlidir.",
    "Her çizgi, her kelime, her nota mükemmel olmak zorunda olmadan muhteşem",
    "Burada sınır yok hayal gücü var.",
    "Kusursuzu aramayın, kusurlarımız bizi biz yapan şeylerdir.",
];

export default async function HomePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles").select("username, badges").eq("id", user.id).single();
    const username = profile?.username ?? user.email?.split("@")[0] ?? "";
    const isAdmin = (profile?.badges as string[] ?? []).includes("admin");

    const [
        { count: totalCount },
        { count: creatorCount },
        { count: memberCount },
        { data: activities },
        { count: editorCount },
        { count: writerCount },
        { count: artistCount },
        { count: murrettiCount },
        { count: kalemsorCount },
        { count: nakkasCount },
        { data: playlists },
        { data: events },
        { data: announcements },
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "creator"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "member"),
        supabase.from("activities").select("id, username, type, payload, created_at").order("created_at", { ascending: false }).limit(8),
        supabase.from("profiles").select("*", { count: "exact", head: true }).contains("badges", ["editor"]),
        supabase.from("profiles").select("*", { count: "exact", head: true }).contains("badges", ["yazar"]),
        supabase.from("profiles").select("*", { count: "exact", head: true }).contains("badges", ["cizer"]),
        supabase.from("profiles").select("*", { count: "exact", head: true }).contains("badges", ["muretti"]),
        supabase.from("profiles").select("*", { count: "exact", head: true }).contains("badges", ["kalemsor"]),
        supabase.from("profiles").select("*", { count: "exact", head: true }).contains("badges", ["nakkas"]),
        supabase.from("spotify_playlists").select("id, name, spotify_id, description").order("created_at", { ascending: true }),
        supabase.from("events").select("id, username, title, address, lat, lng, event_date, ref_url").order("event_date", { ascending: true }),
        supabase.from("announcements").select("id, user_id, username, content, created_at").order("created_at", { ascending: false }).limit(10),
    ]);

    const hours = parseInt(new Intl.DateTimeFormat("tr-TR", { hour: "numeric", hour12: false, timeZone: "Europe/Istanbul" }).format(new Date()), 10);
    const greeting = hours < 6 ? "gece geç saatte ne arıyorsun?" : hours < 12 ? "günaydın!" : hours < 17 ? "iyi günler!" : hours < 21 ? "iyi akşamlar!" : "iyi geceler!";


    return (
        <div className="aurora-bg relative min-h-screen w-full overflow-hidden">
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />
            <div aria-hidden className="fixed inset-0 dot-grid opacity-[0.3] pointer-events-none" style={{ zIndex: 0 }} />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4">
                <NavbarBackdrop />
                <Link href="/" className="group flex items-baseline gap-0.5 shrink-0 relative z-10">
                    <span className="text-sm font-bold" style={{ color: "var(--text-3)" }}>bumedya</span>
                    <span className="text-sm font-bold transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.9)]"
                          style={{ color: "var(--violet)" }}>.</span>
                </Link>
                <HomeNavLinks />
                <div className="relative z-10 flex items-center gap-2">
                    <NotificationBell userId={user.id} />
                    <Link href="/profil"
                          className="text-xs px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 max-w-[80px] sm:max-w-none truncate"
                          style={{ color: "var(--violet-text)", border: "1px solid var(--violet-border)", background: "var(--violet-bg)" }}>
                        @{username}
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-24 pb-16 flex flex-col gap-6">

                {/* Greeting */}
                <div className="flex flex-col items-center text-center pt-4 pb-2 gap-4">
                    <div className="glass flex items-center gap-2.5 px-4 py-2 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-[11px] tracking-widest uppercase font-medium"
                              style={{ color: "var(--text-3)" }}>
                            Topluluk aktif · {totalCount ?? 0} üye
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight break-words max-w-lg">
                        <span style={{ color: "var(--text-1)" }}>@{username},</span>{" "}
                        <span className="font-light" style={{ color: "var(--text-3)" }}>{greeting}</span>
                    </h1>
                </div>

                {/* Bento grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">

                    {/* Topluluk Durumu */}
                    <BentoCard className="sm:col-span-1 lg:col-span-5 self-start">
                        <div aria-hidden className="absolute -top-8 -left-8 w-48 h-48 rounded-full pointer-events-none"
                             style={{ background: "var(--violet-bg-md)", filter: "blur(50px)" }} />
                        <div className="relative z-10">
                            <p className="label-caps mb-5">Topluluk Durumu</p>
                            <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-5">
                                <div className="flex flex-col gap-1">
                                    <span className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-3)" }}>
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
                                {([
                                    {
                                        interest: { label: "Editör",   count: editorCount,  color: "rgba(251,191,36,0.7)"  },
                                        earned:   { label: "Mürettip", count: murrettiCount, color: "rgba(251,191,36,0.95)" },
                                        bg: "rgba(251,191,36,0.05)", border: "rgba(251,191,36,0.13)", divider: "rgba(251,191,36,0.1)",
                                    },
                                    {
                                        interest: { label: "Yazar",    count: writerCount,   color: "rgba(52,211,153,0.7)"  },
                                        earned:   { label: "Kalemşor", count: kalemsorCount, color: "rgba(52,211,153,0.95)" },
                                        bg: "rgba(52,211,153,0.05)",  border: "rgba(52,211,153,0.13)",  divider: "rgba(52,211,153,0.1)",
                                    },
                                    {
                                        interest: { label: "Çizer",  count: artistCount, color: "rgba(244,114,182,0.7)"  },
                                        earned:   { label: "Nakkaş", count: nakkasCount, color: "rgba(244,114,182,0.95)" },
                                        bg: "rgba(244,114,182,0.05)", border: "rgba(244,114,182,0.13)", divider: "rgba(244,114,182,0.1)",
                                    },
                                ] as const).map(({ interest, earned, bg, border, divider }) => (
                                    <div key={interest.label} className="rounded-2xl px-3 py-3 flex flex-col gap-2"
                                         style={{ background: bg, border: `1px solid ${border}` }}>
                                        {/* İlgi rozeti */}
                                        <div className="flex items-baseline justify-between gap-1">
                                            <span className="text-[9px] tracking-widest uppercase font-medium" style={{ color: interest.color }}>{interest.label}</span>
                                            <span className="text-base font-bold leading-none" style={{ color: interest.color }}>{interest.count ?? 0}</span>
                                        </div>
                                        {/* Ayraç */}
                                        <div className="h-px w-full" style={{ background: divider }} />
                                        {/* Kazanılan rozet */}
                                        <div className="flex items-baseline justify-between gap-1">
                                            <span className="text-[9px] tracking-widest uppercase font-semibold" style={{ color: earned.color }}>{earned.label}</span>
                                            <span className="text-base font-bold leading-none" style={{ color: earned.color }}>{earned.count ?? 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BentoCard>

                    {/* Spotify — Playlist */}
                    <BentoCard className="sm:col-span-1 lg:col-span-7 flex flex-col">
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <p className="label-caps">Playlist</p>
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" style={{ color: "rgba(29,185,84,0.7)" }}>
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                        </div>
                        <SpotifyWidget playlists={playlists ?? []} />
                    </BentoCard>

                    {/* Canlı Akış */}
                    <BentoCard className="sm:col-span-1 lg:col-span-4 min-h-[300px]">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                <p className="label-caps">Canlı Akış</p>
                            </div>
                            <Link href="/chat" className="text-[10px] tracking-widest uppercase transition-colors duration-200"
                                  style={{ color: "var(--violet-text)" }}>
                                Lounge <ChevronRight size={11} className="inline" />
                            </Link>
                        </div>
                        <LiveFeed initial={activities ?? []} />
                    </BentoCard>

                    {/* Etkinlik Haritası */}
                    <BentoCard className="sm:col-span-1 lg:col-span-5 min-h-[300px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <p className="label-caps">Etkinlik Haritası</p>
                            <Link href="/etkinlikler" className="text-[10px] font-medium transition-opacity hover:opacity-60"
                                  style={{ color: "var(--violet-text)" }}>
                                Tümü <ChevronRight size={10} className="inline" />
                            </Link>
                        </div>
                        <div className="relative rounded-2xl overflow-hidden" style={{ height: 160 }}>
                            <EventMapClient events={events ?? []} height={160} zoom={10} />
                        </div>
                        {/* Etkinlik listesi — tarihe göre yakından uzağa */}
                        <div className="flex flex-col gap-2 mt-3">
                            {(events ?? [])
                                .filter(e => e.event_date >= new Date().toISOString().split("T")[0])
                                .sort((a, b) => a.event_date.localeCompare(b.event_date))
                                .slice(0, 10)
                                .map(ev => {
                                    const today = new Date().toISOString().split("T")[0];
                                    const isToday = ev.event_date === today;
                                    const thisMonth = today.slice(0, 7);
                                    const isUpcoming = !isToday && ev.event_date.slice(0, 7) === thisMonth;
                                    const accentColor = isToday
                                        ? "rgba(52,211,153,0.9)"
                                        : isUpcoming
                                            ? "rgba(252,211,77,0.85)"
                                            : "rgba(167,139,250,0.7)";
                                    const d = new Date(ev.event_date + "T00:00:00");
                                    return (
                                        <div key={ev.id} className="flex items-center gap-3 rounded-xl px-3 py-2"
                                             style={{ background: "var(--bg-3)", border: "1px solid var(--border-3)" }}>
                                            <span className="text-xs font-bold shrink-0 w-6 text-center" style={{ color: accentColor }}>
                                                {d.getDate()}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-wider shrink-0 w-7" style={{ color: accentColor, opacity: 0.7 }}>
                                                {d.toLocaleDateString("tr-TR", { month: "short" })}
                                            </span>
                                            <span className="text-xs truncate flex-1" style={{ color: "var(--text-2)" }}>
                                                {ev.title}
                                            </span>
                                            {isToday && (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0"
                                                      style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "rgba(52,211,153,0.9)" }}>
                                                    bugün
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            {(events ?? []).filter(e => e.event_date >= new Date().toISOString().split("T")[0]).length === 0 && (
                                <p className="text-xs text-center py-2" style={{ color: "var(--text-4)" }}>Yaklaşan etkinlik yok</p>
                            )}
                        </div>
                    </BentoCard>

                    {/* Duyurular */}
                    <BentoCard className="sm:col-span-2 lg:col-span-3 flex flex-col min-h-[300px]">
                        <AnnouncementsWidget
                            initial={announcements ?? []}
                            isAdmin={isAdmin}
                            userId={user.id}
                            username={username}
                        />
                    </BentoCard>

                    {/* Spotify Podcast */}
                    <BentoCard className="sm:col-span-1 lg:col-span-5 flex flex-col min-h-[260px]">
                        <div className="flex items-center justify-between mb-4">
                            <p className="label-caps">Podcast</p>
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" style={{ color: "rgba(29,185,84,0.7)" }}>
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4">
                            <svg viewBox="0 0 24 24" className="w-8 h-8 opacity-20" fill="currentColor" style={{ color: "#1DB954" }}>
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            <p className="text-xs text-center" style={{ color: "var(--text-4)" }}>
                                Podcast yakında<br />burada olacak
                            </p>
                        </div>
                    </BentoCard>


                    {/* Manifesto */}
                    <BentoCard className="sm:col-span-1 lg:col-span-7 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <p className="label-caps">Manifesto</p>
                            <Link href="/manifest" className="text-[10px] font-medium transition-opacity hover:opacity-60"
                                  style={{ color: "var(--violet-text)" }}>
                                Tahtaya Git <ChevronRight size={10} className="inline" />
                            </Link>
                        </div>
                        <div className="flex flex-col gap-3">
                            {MANIFESTO_LINES.map((line, i) => (
                                <p key={i} className="text-xs leading-relaxed"
                                   style={{ color: `rgba(240,249,255,${0.80 - i * 0.07})` }}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </BentoCard>
                    
                    {/* Bağlantılar */}
                    <BentoCard className="sm:col-span-1 lg:col-span-3 flex flex-col">
                        <LinksWidget />
                    </BentoCard>

                    {/* YouTube */}
                    <BentoCard className="sm:col-span-1 lg:col-span-9 flex flex-col min-h-[260px]">
                        <div className="flex items-center justify-between mb-4">
                            <p className="label-caps">YouTube</p>
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" style={{ color: "rgba(255,0,0,0.7)" }}>
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                        </div>
                        <div className="flex-1 rounded-xl overflow-hidden" style={{ minHeight: 200 }}>
                            <YoutubeWidget />
                        </div>
                    </BentoCard>
                
                </div>
            </div>
            <ContactSection />
            <SiteFooter />
        </div>
    );
}
