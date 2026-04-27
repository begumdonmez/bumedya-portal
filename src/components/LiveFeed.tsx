"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Activity {
    id: string;
    username: string;
    type: string;
    payload: Record<string, string>;
    created_at: string;
}

function activityText(type: string, payload: Record<string, string>): { text: string; dot: string } {
    switch (type) {
        case "join":         return { text: "topluluğa katıldı", dot: "bg-emerald-500" };
        case "post_image":   return { text: `bir resim paylaştı${payload.title ? ` · ${payload.title}` : ""}`, dot: "bg-canli-mor" };
        case "post_text":    return { text: `bir yazı paylaştı${payload.title ? ` · ${payload.title}` : ""}`, dot: "bg-blue-500" };
        case "badge_earned": return { text: `${payload.badge ?? "yeni"} rozeti kazandı ✦`, dot: "bg-amber-500" };
        case "event_created":return { text: `yeni etkinlik oluşturdu${payload.title ? ` · ${payload.title}` : ""}`, dot: "bg-pink-500" };
        case "lounge_join":  return { text: "Lounge'a katıldı", dot: "bg-blue-400" };
        case "role_change":  return { text: "üretici oldu ✏️", dot: "bg-canli-mor" };
        default:             return { text: "bir şeyler yaptı", dot: "bg-white/30" };
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
                    const { text, dot } = activityText(item.type, item.payload ?? {});
                    const isNew = newIds.has(item.id);
                    return (
                        <div key={item.id}
                             className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0 transition-all duration-500"
                             style={{
                                 background: isNew ? "rgba(124,58,237,0.06)" : "transparent",
                                 borderRadius: isNew ? "12px" : undefined,
                             }}
                        >
                            {/* Avatar — tıklanabilir */}
                            <Link href={`/profil/${item.username}`} className="relative mt-0.5 shrink-0 group">
                                <div className="w-7 h-7 rounded-full glass-strong flex items-center justify-center text-[10px] text-buz-mavisi/60 font-medium group-hover:border-canli-mor/40 transition-all duration-200">
                                    {item.username[0].toUpperCase()}
                                </div>
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${dot} ring-1 ring-ana-lacivert`} />
                            </Link>

                            {/* Metin */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-buz-mavisi/70 leading-relaxed">
                                    <Link
                                        href={`/profil/${item.username}`}
                                        className="text-buz-mavisi/90 font-medium hover:text-canli-mor transition-colors duration-200"
                                    >
                                        @{item.username}
                                    </Link>{" "}
                                    {text}
                                </p>
                                {isNew && <span className="text-[9px] text-canli-mor/70 tracking-wider">● yeni</span>}
                            </div>

                            {/* Zaman */}
                            <span className="text-[10px] text-buz-mavisi/25 shrink-0 mt-0.5">
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