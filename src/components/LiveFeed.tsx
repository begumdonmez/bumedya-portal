"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Zap, Shield, Palette, PenLine, BadgeCheck, Sparkles, MessageCircle, Tv, BookOpen, Headphones } from "lucide-react";
import type { ElementType } from "react";

interface Activity {
    id: string;
    username: string;
    type: string;
    payload: Record<string, string>;
    created_at: string;
}

/* ─── Rozet konfigürasyonu ──────────────────────────────────── */
const BADGE_CONFIG: Record<string, { label: string; icon: ElementType; color: string; bg: string; border: string }> = {
    admin:           { label: "Admin",          icon: Zap,           color: "color-mix(in srgb, var(--danger) 90%, transparent)",    bg: "color-mix(in srgb, var(--danger) 10%, transparent)",    border: "color-mix(in srgb, var(--danger) 30%, transparent)"    },
    editor:          { label: "Editör",         icon: Shield,        color: "color-mix(in srgb, var(--warn) 90%, transparent)",   bg: "color-mix(in srgb, var(--warn) 10%, transparent)",   border: "color-mix(in srgb, var(--warn) 30%, transparent)"   },
    artist:          { label: "Sanatçı",        icon: Palette,       color: "color-mix(in srgb, var(--pink) 90%, transparent)",  bg: "color-mix(in srgb, var(--pink) 10%, transparent)",  border: "color-mix(in srgb, var(--pink) 30%, transparent)"  },
    writer:          { label: "Yazar",          icon: PenLine,       color: "color-mix(in srgb, var(--success) 90%, transparent)",   bg: "color-mix(in srgb, var(--success) 10%, transparent)",   border: "color-mix(in srgb, var(--success) 30%, transparent)"   },
    verified:        { label: "Onaylı",         icon: BadgeCheck,    color: "color-mix(in srgb, var(--info) 90%, transparent)",  bg: "color-mix(in srgb, var(--info) 10%, transparent)",   border: "color-mix(in srgb, var(--info) 30%, transparent)"   },
    founder:         { label: "Kurucu",         icon: Sparkles,      color: "color-mix(in srgb, var(--warn) 90%, transparent)",   bg: "color-mix(in srgb, var(--warn) 6%, transparent)",  border: "color-mix(in srgb, var(--warn) 25%, transparent)"  },
    nakkas:          { label: "Nakkaş",         icon: Palette,       color: "color-mix(in srgb, var(--pink) 90%, transparent)",  bg: "color-mix(in srgb, var(--pink) 10%, transparent)",  border: "color-mix(in srgb, var(--pink) 30%, transparent)"  },
    kalemsor:        { label: "Kalemşor",       icon: PenLine,       color: "color-mix(in srgb, var(--success) 90%, transparent)",   bg: "color-mix(in srgb, var(--success) 10%, transparent)",   border: "color-mix(in srgb, var(--success) 30%, transparent)"   },
    muretti:         { label: "Mürettip",       icon: Shield,        color: "color-mix(in srgb, var(--warn) 90%, transparent)",   bg: "color-mix(in srgb, var(--warn) 10%, transparent)",   border: "color-mix(in srgb, var(--warn) 30%, transparent)"   },
    katkici:         { label: "Katkıcı",        icon: BadgeCheck,    color: "color-mix(in srgb, var(--info) 90%, transparent)",  bg: "color-mix(in srgb, var(--info) 8%, transparent)",  border: "color-mix(in srgb, var(--info) 25%, transparent)"  },
    cizer:           { label: "Çizer",          icon: Palette,       color: "color-mix(in srgb, var(--pink) 75%, transparent)", bg: "color-mix(in srgb, var(--pink) 7%, transparent)", border: "color-mix(in srgb, var(--pink) 20%, transparent)"  },
    yazar:           { label: "Yazar",          icon: PenLine,       color: "color-mix(in srgb, var(--success) 75%, transparent)",  bg: "color-mix(in srgb, var(--success) 7%, transparent)",  border: "color-mix(in srgb, var(--success) 20%, transparent)"   },
    sosyal_kelebek:  { label: "Sosyal Kelebek", icon: MessageCircle, color: "color-mix(in srgb, var(--accent-2) 90%, transparent)",   bg: "color-mix(in srgb, var(--accent-2) 10%, transparent)",   border: "color-mix(in srgb, var(--accent-2) 30%, transparent)"   },
    seri_izleyici:   { label: "Seri İzleyici",  icon: Tv,            color: "color-mix(in srgb, var(--info) 90%, transparent)",   bg: "color-mix(in srgb, var(--info) 10%, transparent)",   border: "color-mix(in srgb, var(--info) 30%, transparent)"   },
    kitap_kurdu:     { label: "Kitap Kurdu",    icon: BookOpen,      color: "color-mix(in srgb, var(--success) 90%, transparent)",   bg: "color-mix(in srgb, var(--success) 10%, transparent)",   border: "color-mix(in srgb, var(--success) 30%, transparent)"   },
    plak_kafasi:     { label: "Plak Kafası",    icon: Headphones,    color: "color-mix(in srgb, var(--pink) 90%, transparent)",  bg: "color-mix(in srgb, var(--pink) 10%, transparent)",  border: "color-mix(in srgb, var(--pink) 30%, transparent)"  },
};

function BadgePill({ id }: { id: string }) {
    const conf = BADGE_CONFIG[id];
    if (!conf) return <span style={{ color: "color-mix(in srgb, var(--fg) 60%, transparent)" }}>"{id}"</span>;
    const Icon = conf.icon;
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold align-middle mx-0.5"
              style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}>
            <Icon size={9} strokeWidth={2.5} />
            {conf.label}
        </span>
    );
}

/* ─── Aktivite satırı içeriği ───────────────────────────────── */
interface ActivityContent {
    before: string;        // "@user" dan sonra, rozetten önce
    badgeId?: string;      // rozet varsa
    after?: string;        // rozetten sonra
    dot: string;
}

function parseActivity(type: string, payload: Record<string, string>): ActivityContent {
    switch (type) {
        case "join":          return { before: "topluluğa katıldı", dot: "bg-[var(--success)]" };
        case "post_image":    return { before: `bir resim paylaştı${payload.title ? ` · ${payload.title}` : ""}`, dot: "bg-canli-mor" };
        case "post_text":     return { before: `bir yazı paylaştı${payload.title ? ` · ${payload.title}` : ""}`, dot: "bg-[var(--info)]" };
        case "badge_earned":  return { before: "yeni bir rozet kazandı", badgeId: payload.badge, dot: "bg-[var(--warn)]" };
        case "event_created": return { before: `yeni etkinlik oluşturdu${payload.title ? ` · ${payload.title}` : ""}`, dot: "bg-[var(--pink)]" };
        case "lounge_join":   return { before: "Lounge'a katıldı", dot: "bg-[var(--info)]" };
        case "role_change":   return { before: "üretici oldu", dot: "bg-canli-mor" };
        case "gallery_upload":return { before: "galeriye resim ekledi", dot: "bg-[var(--pink)]" };
        default:              return { before: "bir şeyler yaptı", dot: "bg-[color-mix(in_srgb,var(--fg)_30%,transparent)]" };
    }
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "az önce";
    if (mins < 60) return `${mins} dk`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} sa`;
    return `${Math.floor(hrs / 24)} gün`;
}

export default function LiveFeed({ initial }: { initial: Activity[] }) {
    const [activities, setActivities] = useState<Activity[]>(initial);
    const [newIds, setNewIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel("activities-feed")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "activities" },
                (payload) => {
                    const newActivity = payload.new as Activity;
                    setActivities((prev) => [newActivity, ...prev].slice(0, 8));
                    setNewIds((prev) => new Set(prev).add(newActivity.id));
                    setTimeout(() => {
                        setNewIds((prev) => { const next = new Set(prev); next.delete(newActivity.id); return next; });
                    }, 3000);
                }
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    return (
        <div className="flex flex-col gap-0">
            {activities.length > 0 ? (
                activities.map((item) => {
                    const { before, badgeId, dot } = parseActivity(item.type, item.payload ?? {});
                    const isNew = newIds.has(item.id);
                    return (
                        <div key={item.id}
                             className="flex items-start gap-3 py-3 border-b border-[color-mix(in_srgb,var(--fg)_4%,transparent)] last:border-0 transition-all duration-500"
                             style={{
                                 background: isNew ? "color-mix(in srgb, var(--accent) 6%, transparent)" : "transparent",
                                 borderRadius: isNew ? "12px" : undefined,
                             }}
                        >
                            {/* Avatar */}
                            <Link href={`/profil/${item.username}`} className="relative mt-0.5 shrink-0 group">
                                <div className="w-7 h-7 rounded-full glass-strong flex items-center justify-center text-[11px] text-buz-mavisi/60 font-medium group-hover:border-canli-mor/40 transition-all duration-200">
                                    {item.username[0].toUpperCase()}
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${dot} ring-1 ring-ana-lacivert`} />
                            </Link>

                            {/* Metin */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-buz-mavisi/70 leading-relaxed">
                                    <Link href={`/profil/${item.username}`}
                                          className="text-buz-mavisi/90 font-medium hover:text-canli-mor transition-colors duration-200">
                                        @{item.username}
                                    </Link>{" "}
                                    {before}
                                </p>
                                {badgeId && <div className="mt-1.5"><BadgePill id={badgeId} /></div>}
                                {isNew && <span className="text-[11px] text-canli-mor/70 tracking-wider">● yeni</span>}
                            </div>

                            {/* Zaman */}
                            <span suppressHydrationWarning className="text-[11px] text-buz-mavisi/25 shrink-0 mt-0.5">
                                {timeAgo(item.created_at)}
                            </span>
                        </div>
                    );
                })
            ) : (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                    <p className="text-xs text-buz-mavisi/25">Henüz aktivite yok.</p>
                    <p className="text-[11px] text-buz-mavisi/15">İlk hareketi sen yap!</p>
                </div>
            )}
        </div>
    );
}
