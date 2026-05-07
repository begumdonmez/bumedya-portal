"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Notification {
    id: string;
    user_id: string;
    from_username: string;
    type: string;
    payload: { room_id?: string; message?: string };
    read: boolean;
    created_at: string;
}

const ROOM_LABELS: Record<string, string> = {
    "genel": "Genel",
    "cizim-atolyesi": "Çizim Atölyesi",
    "yazarlar-kahvesi": "Yazarlar Kahvesi",
    "kulturel-paylasim": "Kültürel Paylaşım",
    "etkinlik-gruplasma": "Etkinlik Grupları",
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "az önce";
    if (mins < 60) return `${mins} dk`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} sa`;
    return `${Math.floor(hrs / 24)} gün`;
}

export default function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter((n) => !n.read).length;

    useEffect(() => {
        const supabase = createClient();

        supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(20)
            .then(({ data }) => setNotifications((data as Notification[]) ?? []));

        const showToast = (n: Notification) => {
            const room = n.payload?.room_id ? ROOM_LABELS[n.payload.room_id] ?? n.payload.room_id : null;
            const isAll = n.payload?.message?.includes("@all");
            toast.custom(() => (
                <div style={{
                    background: isAll ? "rgba(30,15,5,0.97)" : "rgba(15,10,35,0.97)",
                    border: `1px solid ${isAll ? "rgba(252,211,77,0.25)" : "rgba(124,58,237,0.25)"}`,
                    borderRadius: 16,
                    padding: "12px 16px",
                    backdropFilter: "blur(32px)",
                    boxShadow: `0 8px 32px ${isAll ? "rgba(252,211,77,0.08)" : "rgba(124,58,237,0.12)"}, 0 2px 8px rgba(0,0,0,0.4)`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    minWidth: 280,
                    maxWidth: 340,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                            width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                            background: isAll ? "rgba(252,211,77,0.9)" : "rgba(167,139,250,0.9)",
                            boxShadow: `0 0 6px ${isAll ? "rgba(252,211,77,0.6)" : "rgba(167,139,250,0.6)"}`,
                        }} />
                        <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)", margin: 0 }}>
                            {isAll
                                ? <><span style={{ color: "rgba(252,211,77,0.95)" }}>@{n.from_username}</span> herkesi mention etti</>
                                : <><span style={{ color: "rgba(167,139,250,0.95)" }}>@{n.from_username}</span> seni mention etti</>
                            }
                        </p>
                    </div>
                    {room && (
                        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0, paddingLeft: 16 }}>
                            #{room}
                        </p>
                    )}
                    {n.payload?.message && (
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0, paddingLeft: 16, fontStyle: "italic" }}>
                            &ldquo;{n.payload.message.slice(0, 80)}{n.payload.message.length > 80 ? "…" : ""}&rdquo;
                        </p>
                    )}
                </div>
            ), { duration: 5000 });
        };

        // filter parametresi yerine callback'te filtrele — daha güvenilir
        const channel = supabase
            .channel(`notifications-${userId}`)
            .on("postgres_changes",
                { event: "INSERT", schema: "public", table: "notifications" },
                (payload) => {
                    const n = payload.new as Notification;
                    if (n.user_id !== userId) return; // başkasının bildirimi
                    setNotifications((prev) => prev.some((x) => x.id === n.id) ? prev : [n, ...prev]);
                    showToast(n);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [userId]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = async () => {
        setOpen((v) => !v);
        if (!open && unreadCount > 0) {
            const supabase = createClient();
            await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }
    };

    return (
        <div ref={panelRef} className="relative z-10">
            <button
                onClick={handleOpen}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
                style={{ background: open ? "var(--violet-bg)" : "transparent", border: `1px solid ${open ? "var(--violet-border)" : "transparent"}` }}
            >
                <Bell size={16} style={{ color: "var(--text-3)" }} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-1"
                          style={{ background: "rgba(239,68,68,0.9)", color: "#fff" }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-11 w-80 rounded-2xl overflow-hidden shadow-2xl"
                     style={{ background: "rgba(15,25,50,0.96)", backdropFilter: "blur(32px)", border: "1px solid var(--border-1)" }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border-3)" }}>
                        <p className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Bildirimler</p>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-2">
                            <Bell size={24} className="opacity-10" />
                            <p className="text-xs" style={{ color: "var(--text-4)" }}>Henüz bildirim yok.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col max-h-80 overflow-y-auto">
                            {notifications.map((n) => (
                                <div key={n.id}
                                     className="flex flex-col gap-1 px-4 py-3 border-b transition-colors duration-150"
                                     style={{
                                         borderColor: "var(--border-3)",
                                         background: n.read ? "transparent" : "rgba(124,58,237,0.05)",
                                     }}>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-medium" style={{ color: "var(--text-2)" }}>
                                            <span style={{ color: "var(--violet-text)" }}>@{n.from_username}</span>
                                            {" "}seni mention etti
                                            {n.payload?.room_id && (
                                                <span style={{ color: "var(--text-4)" }}> · {ROOM_LABELS[n.payload.room_id] ?? n.payload.room_id}</span>
                                            )}
                                        </p>
                                        {!n.read && (
                                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "rgba(124,58,237,0.8)" }} />
                                        )}
                                    </div>
                                    {n.payload?.message && (
                                        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-4)" }}>
                                            &ldquo;{n.payload.message.slice(0, 80)}{n.payload.message.length > 80 ? "…" : ""}&rdquo;
                                        </p>
                                    )}
                                    <p className="text-[10px]" style={{ color: "var(--text-5)" }}>{timeAgo(n.created_at)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
