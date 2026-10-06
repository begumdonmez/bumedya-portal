import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import LiveFeed from "@/components/LiveFeed";
import EventMapClient from "@/components/EventMapClient";
import AnnouncementsWidget from "@/components/AnnouncementsWidget";
import LinksWidget from "@/components/LinksWidget";
import YoutubeWidget from "@/components/YoutubeWidget";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";
import SpotifyWidget from "./SpotifyWidget";
import SiteHeader from "@/components/SiteHeader";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Ana Sayfa" };

const SPOTIFY = (<svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden style={{ color: "#1DB954" }}><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.360-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.320.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.020.599-1.559.3z"/></svg>);

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

    // Tüm pano verileri paralel
    const [
        { data: profile },
        { data: statsData },
        { data: activities },
        { data: playlists },
        { data: events },
        { data: announcements },
    ] = await Promise.all([
        supabase.from("profiles").select("username, badges").eq("id", user.id).single(),
        supabase.rpc("get_profile_stats"),
        supabase.from("activities").select("id, username, type, payload, created_at").order("created_at", { ascending: false }).limit(8),
        supabase.from("spotify_playlists").select("id, name, spotify_id, description").order("created_at", { ascending: true }),
        supabase.from("events").select("id, username, title, address, lat, lng, event_date, ref_url, approved")
            .gte("event_date", new Date().toISOString().split("T")[0])
            .order("event_date", { ascending: true }).limit(20),
        supabase.from("announcements").select("id, user_id, username, content, created_at").order("created_at", { ascending: false }).limit(10),
    ]);

    const username = profile?.username ?? user.email?.split("@")[0] ?? "";
    const isAdmin = (profile?.badges as string[] ?? []).includes("admin");

    const stats = (statsData as Record<string, number> | null) ?? {};
    const totalCount    = stats.total    ?? 0;
    const creatorCount  = stats.creator  ?? 0;
    const memberCount   = stats.member   ?? 0;
    const editorCount   = stats.editor   ?? 0;
    const writerCount   = stats.yazar    ?? 0;
    const artistCount   = stats.cizer    ?? 0;
    const murrettiCount = stats.muretti  ?? 0;
    const kalemsorCount = stats.kalemsor ?? 0;
    const nakkasCount   = stats.nakkas   ?? 0;

    const hours = parseInt(new Intl.DateTimeFormat("tr-TR", { hour: "numeric", hour12: false, timeZone: "Europe/Istanbul" }).format(new Date()), 10);
    const greeting = hours < 6 ? "Gece kuşu" : hours < 12 ? "Günaydın" : hours < 17 ? "İyi günler" : hours < 21 ? "İyi akşamlar" : "İyi geceler";


    const today = new Date().toISOString().split("T")[0];
    const groups = [
        { interest: "Editör", interestCount: editorCount, earned: "Mürettip", earnedCount: murrettiCount, color: "var(--warn)" },
        { interest: "Yazar",  interestCount: writerCount, earned: "Kalemşor", earnedCount: kalemsorCount, color: "var(--success)" },
        { interest: "Çizer",  interestCount: artistCount, earned: "Nakkaş",   earnedCount: nakkasCount,   color: "var(--pink)" },
    ];

    return (
        <div className="relative min-h-screen w-full">
            <SiteHeader userId={user.id} username={username} />

            <main className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-8 pt-24 sm:pt-28 pb-16">
                <PageHeader
                    eyebrow={new Intl.DateTimeFormat("tr-TR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Istanbul" }).format(new Date())}
                    title={<>{greeting}, <em className="italic" style={{ color: "var(--accent)" }}>@{username}</em></>}
                    description={`Toplulukta ${totalCount} kişiyiz. Bugün neler oluyor, bir göz at.`}
                    actions={<Link href="/akis" className="btn-primary">Akışa yaz</Link>}
                />

                <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-10 lg:gap-12">
                    {/* ── Ana sütun ─────────────────────── */}
                    <div className="flex flex-col gap-12 min-w-0">
                        <Section title="Canlı akış" href="/chat" linkLabel="Lounge'a git" live>
                            <LiveFeed initial={activities ?? []} />
                        </Section>

                        <Section title="Yaklaşan etkinlikler" href="/etkinlikler" linkLabel="Tümü">
                            <div className="rounded-[var(--radius-card)] overflow-hidden mb-4" style={{ height: 220, border: "1px solid var(--border-2)" }}>
                                <EventMapClient events={events ?? []} height={220} zoom={10} />
                            </div>
                            {(events ?? []).length === 0 ? (
                                <p className="text-sm py-2" style={{ color: "var(--text-4)" }}>Yaklaşan etkinlik yok.</p>
                            ) : (
                                <ul className="flex flex-col">
                                    {(events ?? []).slice(0, 6).map(ev => {
                                        const d = new Date(ev.event_date + "T00:00:00");
                                        const isToday = ev.event_date === today;
                                        return (
                                            <li key={ev.id} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 py-3"
                                                style={{ borderTop: "1px solid var(--border-2)" }}>
                                                <span className="flex flex-col items-center leading-none">
                                                    <span className="font-display text-2xl" style={{ color: isToday ? "var(--accent)" : "var(--text-1)" }}>{d.getDate()}</span>
                                                    <span className="label-caps !text-[11px] mt-1">{d.toLocaleDateString("tr-TR", { month: "short" })}</span>
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-[15px] font-medium truncate" style={{ color: "var(--text-1)" }}>{ev.title}</span>
                                                    {ev.address && <span className="block text-xs truncate" style={{ color: "var(--text-4)" }}>{ev.address}</span>}
                                                </span>
                                                {isToday && <span className="chip" style={{ background: "var(--accent)", color: "var(--on-accent)" }}>bugün</span>}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </Section>

                        <Section title="YouTube">
                            <div className="rounded-[var(--radius-card)] overflow-hidden" style={{ minHeight: 220 }}>
                                <YoutubeWidget />
                            </div>
                        </Section>
                    </div>

                    {/* ── Yan sütun ─────────────────────── */}
                    <aside className="flex flex-col gap-10 min-w-0">
                        <div className="card p-5 flex flex-col">
                            <AnnouncementsWidget initial={announcements ?? []} isAdmin={isAdmin} userId={user.id} username={username} />
                        </div>

                        <Section title="Topluluk">
                            <dl className="grid grid-cols-2 gap-4 mb-5">
                                <div>
                                    <dt className="label-caps">Üretici</dt>
                                    <dd className="font-display text-4xl" style={{ color: "var(--accent)" }}>{creatorCount}</dd>
                                </div>
                                <div>
                                    <dt className="label-caps">İzleyici</dt>
                                    <dd className="font-display text-4xl" style={{ color: "var(--text-1)" }}>{memberCount}</dd>
                                </div>
                            </dl>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="label-caps text-left"><th className="font-medium pb-2">İlgi</th><th className="font-medium pb-2 text-right">Rozet</th></tr>
                                </thead>
                                <tbody>
                                    {groups.map(g => (
                                        <tr key={g.interest} style={{ borderTop: "1px solid var(--border-2)" }}>
                                            <td className="py-2"><span style={{ color: g.color }}>●</span> {g.interest} <span style={{ color: "var(--text-4)" }}>{g.interestCount}</span></td>
                                            <td className="py-2 text-right">{g.earned} <span style={{ color: "var(--text-4)" }}>{g.earnedCount}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Section>

                        <Section title="Playlist" icon={SPOTIFY}>
                            <SpotifyWidget playlists={playlists ?? []} />
                        </Section>

                        <Section title="Manifesto" href="/manifest" linkLabel="Tahtaya git">
                            <blockquote className="font-display text-lg italic leading-snug" style={{ color: "var(--text-2)" }}>
                                “{MANIFESTO_LINES[new Date().getDate() % MANIFESTO_LINES.length]}”
                            </blockquote>
                        </Section>

                        <div className="card p-5"><LinksWidget /></div>
                    </aside>
                </div>
            </main>
            <ContactSection />
            <SiteFooter />
        </div>
    );
}

function Section({ title, href, linkLabel, live, icon, children }: {
    title: string; href?: string; linkLabel?: string; live?: boolean; icon?: React.ReactNode; children: React.ReactNode;
}) {
    return (
        <section>
            <div className="flex items-center justify-between gap-3 mb-4 pb-2" style={{ borderBottom: "2px solid var(--text-1)" }}>
                <h2 className="font-display text-xl font-medium flex items-center gap-2" style={{ color: "var(--text-1)" }}>
                    {live && <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--success)" }} />}
                    {title}
                </h2>
                {icon}
                {href && (
                    <Link href={href} className="text-sm font-medium flex items-center" style={{ color: "var(--accent)" }}>
                        {linkLabel} <ChevronRight size={14} />
                    </Link>
                )}
            </div>
            {children}
        </section>
    );
}
