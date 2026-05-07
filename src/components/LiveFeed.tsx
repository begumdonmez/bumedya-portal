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
    admin:           { label: "Admin",          icon: Zap,           color: "rgba(239,68,68,0.9)",    bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.3)"    },
    editor:          { label: "Editör",         icon: Shield,        color: "rgba(251,191,36,0.9)",   bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.3)"   },
    artist:          { label: "Sanatçı",        icon: Palette,       color: "rgba(244,114,182,0.9)",  bg: "rgba(244,114,182,0.1)",  border: "rgba(244,114,182,0.3)"  },
    writer:          { label: "Yazar",          icon: PenLine,       color: "rgba(52,211,153,0.9)",   bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.3)"   },
    verified:        { label: "Onaylı",         icon: BadgeCheck,    color: "rgba(147,197,253,0.9)",  bg: "rgba(59,130,246,0.1)",   border: "rgba(59,130,246,0.3)"   },
    founder:         { label: "Kurucu",         icon: Sparkles,      color: "rgba(251,191,36,0.9)",   bg: "rgba(251,191,36,0.06)",  border: "rgba(251,191,36,0.25)"  },
    nakkas:          { label: "Nakkaş",         icon: Palette,       color: "rgba(244,114,182,0.9)",  bg: "rgba(244,114,182,0.1)",  border: "rgba(244,114,182,0.3)"  },
    kalemsor:        { label: "Kalemşor",       icon: PenLine,       color: "rgba(52,211,153,0.9)",   bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.3)"   },
    muretti:         { label: "Mürettip",       icon: Shield,        color: "rgba(251,191,36,0.9)",   bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.3)"   },
    katkici:         { label: "Katkıcı",        icon: BadgeCheck,    color: "rgba(147,197,253,0.9)",  bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.25)"  },
    cizer:           { label: "Çizer",          icon: Palette,       color: "rgba(244,114,182,0.75)", bg: "rgba(244,114,182,0.07)", border: "rgba(244,114,182,0.2)"  },
    yazar:           { label: "Yazar",          icon: PenLine,       color: "rgba(52,211,153,0.75)",  bg: "rgba(52,211,153,0.07)",  border: "rgba(52,211,153,0.2)"   },
    sosyal_kelebek:  { label: "Sosyal Kelebek", icon: MessageCircle, color: "rgba(251,146,60,0.9)",   bg: "rgba(251,146,60,0.1)",   border: "rgba(251,146,60,0.3)"   },
    seri_izleyici:   { label: "Seri İzleyici",  icon: Tv,            color: "rgba(96,165,250,0.9)",   bg: "rgba(59,130,246,0.1)",   border: "rgba(59,130,246,0.3)"   },
    kitap_kurdu:     { label: "Kitap Kurdu",    icon: BookOpen,      color: "rgba(52,211,153,0.9)",   bg: "rgba(52,211,153,0.1)",   border: "rgba(52,211,153,0.3)"   },
    plak_kafasi:     { label: "Plak Kafası",    icon: Headphones,    color: "rgba(244,114,182,0.9)",  bg: "rgba(244,114,182,0.1)",  border: "rgba(244,114,182,0.3)"  },
};

function BadgePill({ id }: { id: string }) {
    const conf = BADGE_CONFIG[id];
    if (!conf) return <span style={{ color: "rgba(255,255,255,0.6)" }}>"{id}"</span>;
    const Icon = conf.icon;
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold align-middle mx-0.5"
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
        case "join":          return { before: "topluluğa katıldı", dot: "bg-emerald-500" };
        case "post_image":    return { before: `bir resim paylaştı${payload.title ? ` · ${payload.title}` : ""}`, dot: "bg-canli-mor" };
        case "post_text":     return { before: `bir yazı paylaştı${payload.title ? ` · ${payload.title}` : ""}`, dot: "bg-blue-500" };
        case "badge_earned":  return { before: "rozetini kazandı →", badgeId: payload.badge, dot: "bg-amber-500" };
        case "event_created": return { before: `yeni etkinlik oluşturdu${payload.title ? ` · ${payload.title}` : ""}`, dot: "bg-pink-500" };
        case "lounge_join":   return { before: "Lounge'a katıldı", dot: "bg-blue-400" };
        case "role_change":   return { before: "üretici oldu", dot: "bg-canli-mor" };
        case "gallery_upload":return { before: "galeriye resim ekledi", dot: "bg-pink-400" };
        default:              return { before: "bir şeyler yaptı", dot: "bg-white/30" };
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
                             className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0 transition-all duration-500"
                             style={{
                                 background: isNew ? "rgba(124,58,237,0.06)" : "transparent",
                                 borderRadius: isNew ? "12px" : undefined,
                             }}
                        >
                            {/* Avatar */}
                            <Link href={`/profil/${item.username}`} className="relative mt-0.5 shrink-0 group">
                                <div className="w-7 h-7 rounded-full glass-strong flex items-center justify-center text-[10px] text-buz-mavisi/60 font-medium group-hover:border-canli-mor/40 transition-all duration-200">
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
                                    {badgeId && <BadgePill id={badgeId} />}
                                </p>
                                {isNew && <span className="text-[9px] text-canli-mor/70 tracking-wider">● yeni</span>}
                            </div>

                            {/* Zaman */}
                            <span suppressHydrationWarning className="text-[10px] text-buz-mavisi/25 shrink-0 mt-0.5">
                                {timeAgo(item.created_at)}
                            </span>
                        </div>
                    );
                })
            ) : (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                    <p className="text-xs text-buz-mavisi/25">Henüz aktivite yok.</p>
                    <p className="text-[10px] text-buz-mavisi/15">İlk hareketi sen yap!</p>
                </div>
            )}
        </div>
    );
}
