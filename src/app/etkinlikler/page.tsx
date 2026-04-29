import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft, CalendarDays, MapPin } from "lucide-react";
import EventMapClient from "@/components/EventMapClient";
import type { EventItem } from "@/components/EventMap";

export const metadata: Metadata = { title: "Etkinlikler | bumedya." };

export default async function EtkinliklerPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: events } = await supabase
        .from("events")
        .select("id, username, title, address, lat, lng, event_date, ref_url")
        .order("event_date", { ascending: true });

    const list: EventItem[] = events ?? [];

    const today = new Date().toISOString().split("T")[0];
    const upcoming = list.filter(e => e.event_date >= today);
    const past     = list.filter(e => e.event_date < today);

    return (
        <div className="aurora-bg relative min-h-screen flex flex-col">
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b nav-backdrop"
                 style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3">
                    <Link href="/home" className="text-xs px-2 py-1 rounded-lg transition-colors duration-200 hover:opacity-70"
                          style={{ color: "rgba(240,249,255,0.28)" }}>
                        <ChevronLeft size={15} />
                    </Link>
                    <Link href="/home" className="flex items-baseline gap-0.5">
                        <span className="text-sm font-bold" style={{ color: "rgba(240,249,255,0.5)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "#7C3AED" }}>.</span>
                    </Link>
                    <span style={{ color: "rgba(255,255,255,0.12)" }}>/</span>
                    <span className="text-sm font-medium" style={{ color: "rgba(240,249,255,0.55)" }}>Etkinlikler</span>
                </div>
                <span className="text-xs" style={{ color: "rgba(224,242,254,0.25)" }}>
                    {upcoming.length} yaklaşan etkinlik
                </span>
            </nav>

            <div className="relative z-10 max-w-5xl mx-auto w-full px-6 py-10 flex flex-col gap-8">
                {/* Harita */}
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(124,58,237,0.15)" }}>
                    <EventMapClient events={list} height={320} zoom={10} />
                </div>

                {/* Yaklaşan */}
                <section className="flex flex-col gap-4">
                    <p className="text-[10px] font-medium tracking-[0.15em] uppercase"
                       style={{ color: "rgba(224,242,254,0.3)" }}>Yaklaşan Etkinlikler</p>

                    {upcoming.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <CalendarDays size={32} className="opacity-10" />
                            <p className="text-sm" style={{ color: "rgba(224,242,254,0.25)" }}>Yaklaşan etkinlik yok.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {upcoming.map(ev => <EventCard key={ev.id} ev={ev} />)}
                        </div>
                    )}
                </section>

                {/* Geçmiş */}
                {past.length > 0 && (
                    <section className="flex flex-col gap-4">
                        <p className="text-[10px] font-medium tracking-[0.15em] uppercase"
                           style={{ color: "rgba(224,242,254,0.2)" }}>Geçmiş Etkinlikler</p>
                        <div className="flex flex-col gap-3 opacity-50">
                            {past.map(ev => <EventCard key={ev.id} ev={ev} />)}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

function EventCard({ ev }: { ev: EventItem }) {
    const dateStr = new Date(ev.event_date + "T00:00:00").toLocaleDateString("tr-TR", {
        day: "numeric", month: "long", year: "numeric",
    });

    return (
        <div className="flex items-start gap-4 rounded-2xl p-4"
             style={{
                 background: "rgba(255,255,255,0.03)",
                 border: "1px solid rgba(255,255,255,0.07)",
             }}>
            <div className="flex flex-col items-center justify-center rounded-xl px-3 py-2 shrink-0 min-w-[52px]"
                 style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <span className="text-lg font-bold leading-none" style={{ color: "rgba(167,139,250,0.9)" }}>
                    {new Date(ev.event_date + "T00:00:00").getDate()}
                </span>
                <span className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "rgba(167,139,250,0.5)" }}>
                    {new Date(ev.event_date + "T00:00:00").toLocaleDateString("tr-TR", { month: "short" })}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-1" style={{ color: "#E0F2FE" }}>{ev.title}</p>
                <div className="flex items-center gap-1 mb-1">
                    <MapPin size={11} style={{ color: "rgba(224,242,254,0.35)", flexShrink: 0 }} />
                    <p className="text-xs truncate" style={{ color: "rgba(224,242,254,0.4)" }}>{ev.address}</p>
                </div>
                <p className="text-[11px]" style={{ color: "rgba(224,242,254,0.25)" }}>@{ev.username} · {dateStr}</p>
            </div>
            {ev.ref_url && (
                <a href={ev.ref_url} target="_blank" rel="noopener noreferrer"
                   className="shrink-0 text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
                   style={{
                       background: "rgba(124,58,237,0.12)",
                       border: "1px solid rgba(124,58,237,0.25)",
                       color: "rgba(167,139,250,0.8)",
                   }}>
                    Detaylar
                </a>
            )}
        </div>
    );
}
