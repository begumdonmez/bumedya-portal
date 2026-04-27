"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Message {
    id: string;
    room_id: string;
    user_id: string;
    username: string;
    content: string;
    created_at: string;
}

const ROOMS = [
    { id: "genel",            label: "Genel",           icon: "💬", desc: "Genel sohbet" },
    { id: "cizim-atolyesi",   label: "Çizim Atölyesi",  icon: "🎨", desc: "Çizerler burada" },
    { id: "yazarlar-kahvesi", label: "Yazarlar Kahvesi", icon: "📝", desc: "Yazarlar burada" },
];

function timeLabel(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function isSameDay(a: string, b: string) {
    return new Date(a).toDateString() === new Date(b).toDateString();
}

function dayLabel(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Bugün";
    if (d.toDateString() === yesterday.toDateString()) return "Dün";
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

/* Kullanıcıya renk ata (avatar rengi tutarlı kalsın) */
const USER_COLORS = [
    ["rgba(124,58,237,0.35)", "rgba(124,58,237,0.25)", "rgba(167,139,250,0.9)"],
    ["rgba(59,130,246,0.35)", "rgba(59,130,246,0.25)", "rgba(147,197,253,0.9)"],
    ["rgba(244,114,182,0.35)", "rgba(244,114,182,0.25)", "rgba(249,168,212,0.9)"],
    ["rgba(52,211,153,0.35)", "rgba(52,211,153,0.25)", "rgba(110,231,183,0.9)"],
    ["rgba(251,191,36,0.35)", "rgba(251,191,36,0.25)", "rgba(253,211,77,0.9)"],
];
function userColor(username: string) {
    let hash = 0;
    for (const c of username) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
    return USER_COLORS[hash % USER_COLORS.length];
}

export default function ChatClient({ userId, username, initialMessages }: {
    userId: string;
    username: string;
    initialMessages: Message[];
}) {
    const [activeRoom, setActiveRoom] = useState("genel");
    const [messagesByRoom, setMessagesByRoom] = useState<Record<string, Message[]>>(() => {
        const map: Record<string, Message[]> = {};
        ROOMS.forEach((r) => { map[r.id] = []; });
        initialMessages.forEach((m) => { if (map[m.room_id]) map[m.room_id].push(m); });
        return map;
    });
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [typingUsers, setTypingUsers] = useState(false);
    const [newMsgIds, setNewMsgIds] = useState<Set<string>>(new Set());
    const [unread, setUnread] = useState<Record<string, number>>({});
    const [onlineUsers, setOnlineUsers] = useState<{ username: string; room: string }[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const messages = messagesByRoom[activeRoom] ?? [];
    const activeRoomData = ROOMS.find((r) => r.id === activeRoom)!;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, activeRoom]);

    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel(`chat-${activeRoom}`)
            .on("postgres_changes",
                { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${activeRoom}` },
                (payload) => {
                    const msg = payload.new as Message;
                    setMessagesByRoom((prev) => ({ ...prev, [activeRoom]: [...(prev[activeRoom] ?? []), msg] }));
                    setNewMsgIds((prev) => { const s = new Set(prev); s.add(msg.id); return s; });
                    setTimeout(() => setNewMsgIds((prev) => { const s = new Set(prev); s.delete(msg.id); return s; }), 800);
                    if (msg.user_id !== userId) setTypingUsers(false);
                }
            )
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [activeRoom, userId]);

    /* Diğer odalardaki yeni mesajları unread say */
    useEffect(() => {
        const supabase = createClient();
        const channels = ROOMS.filter((r) => r.id !== activeRoom).map((r) =>
            supabase.channel(`unread-${r.id}`)
                .on("postgres_changes",
                    { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${r.id}` },
                    () => setUnread((prev) => ({ ...prev, [r.id]: (prev[r.id] ?? 0) + 1 }))
                )
                .subscribe()
        );
        return () => { channels.forEach((ch) => supabase.removeChannel(ch)); };
    }, [activeRoom]);

    /* Presence — kim çevrimiçi */
    useEffect(() => {
        const supabase = createClient();
        const presence = supabase.channel("lounge-presence");

        const syncUsers = () => {
            const state = presence.presenceState<{ username: string; room: string }>();
            const users = Object.values(state).flat();
            setOnlineUsers(users.filter((u) => u.username !== username));
        };

        presence
            .on("presence", { event: "sync" }, syncUsers)
            .on("presence", { event: "join" }, syncUsers)
            .on("presence", { event: "leave" }, syncUsers)
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await presence.track({ username, room: activeRoom });
                }
            });

        return () => { supabase.removeChannel(presence); };
    }, [username, activeRoom]);

    const switchRoom = (id: string) => {
        setActiveRoom(id);
        setUnread((prev) => ({ ...prev, [id]: 0 }));
    };

    const sendMessage = async () => {
        const content = input.trim();
        if (!content || sending) return;
        setSending(true);
        setInput("");
        const supabase = createClient();
        await supabase.from("messages").insert({ room_id: activeRoom, user_id: userId, username, content });
        await supabase.from("activities").insert({ user_id: userId, username, type: "lounge_join", payload: {} });
        setSending(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        setTypingUsers(true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTypingUsers(false), 2000);
    };

    return (
        <div className="flex flex-1 min-h-0 overflow-hidden" style={{ background: "#0A0F1E" }}>

            {/* ── SIDEBAR ── */}
            <aside className="w-14 sm:w-60 shrink-0 flex flex-col"
                   style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>

                {/* Logo — only on sm+ */}
                <div className="hidden sm:block px-5 pt-6 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <Link href="/" className="flex items-baseline gap-0.5">
                        <span className="text-sm font-bold" style={{ color: "rgba(224,242,254,0.45)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "rgba(52,211,153,0.8)" }} />
                        <span className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(224,242,254,0.2)" }}>Lounge</span>
                    </div>
                </div>
                {/* Mobile logo placeholder spacing */}
                <div className="sm:hidden h-4" />

                {/* Odalar */}
                <div className="flex-1 px-1 sm:px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
                    <p className="text-[9px] tracking-widest uppercase px-2 sm:px-3 mb-2 hidden sm:block" style={{ color: "rgba(224,242,254,0.18)" }}>
                        ODALAR
                    </p>
                    {ROOMS.map((room) => {
                        const isActive = room.id === activeRoom;
                        const unreadCount = unread[room.id] ?? 0;
                        const peopleInRoom = [
                            ...(activeRoom === room.id ? [{ username }] : []),
                            ...onlineUsers.filter((u) => u.room === room.id),
                        ].length;
                        return (
                            <button key={room.id} onClick={() => switchRoom(room.id)}
                                    className="flex items-center gap-3 px-2 sm:px-3 py-3 rounded-xl text-left transition-all duration-200 w-full relative"
                                    style={{
                                        background: isActive ? "rgba(124,58,237,0.12)" : "transparent",
                                        border: `1px solid ${isActive ? "rgba(124,58,237,0.25)" : "transparent"}`,
                                        justifyContent: "center",
                                    }}>
                                <span className="text-lg sm:text-base shrink-0">{room.icon}</span>
                                <div className="hidden sm:block flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate"
                                       style={{ color: isActive ? "rgba(167,139,250,0.95)" : "rgba(224,242,254,0.5)" }}>
                                        {room.label}
                                    </p>
                                    <p className="text-[10px] truncate" style={{ color: "rgba(224,242,254,0.2)" }}>{room.desc}</p>
                                </div>
                                <div className="hidden sm:flex shrink-0 items-center gap-1.5">
                                    {peopleInRoom > 0 && (
                                        <span className="flex items-center gap-1 text-[10px]"
                                              style={{ color: isActive ? "rgba(167,139,250,0.6)" : "rgba(224,242,254,0.2)" }}>
                                            <span className="w-1.5 h-1.5 rounded-full"
                                                  style={{ background: isActive ? "rgba(52,211,153,0.8)" : "rgba(255,255,255,0.2)" }} />
                                            {peopleInRoom}
                                        </span>
                                    )}
                                    {unreadCount > 0 && (
                                        <span className="min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1"
                                              style={{ background: "rgba(124,58,237,0.8)", color: "#fff" }}>
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    )}
                                </div>
                                {/* Mobile unread dot */}
                                {unreadCount > 0 && (
                                    <span className="sm:hidden absolute top-1 right-1 w-2 h-2 rounded-full"
                                          style={{ background: "rgba(124,58,237,0.9)" }} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Çevrimiçi — only on sm+ */}
                {onlineUsers.length > 0 && (
                    <div className="hidden sm:flex px-3 pb-3 flex-col gap-0.5">
                        <p className="text-[9px] tracking-widest uppercase px-3 mb-2 mt-1" style={{ color: "rgba(224,242,254,0.18)" }}>
                            ÇEVRİMİÇİ · {onlineUsers.length}
                        </p>
                        {onlineUsers.map((u) => {
                            const [bg, border] = userColor(u.username);
                            const roomLabel = ROOMS.find((r) => r.id === u.room)?.label ?? u.room;
                            return (
                                <Link key={u.username} href={`/profil/${u.username}`}
                                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200"
                                      style={{ color: "rgba(224,242,254,0.5)" }}
                                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                    <div className="relative shrink-0">
                                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold"
                                             style={{ background: bg, border: `1px solid ${border}`, color: "#E0F2FE" }}>
                                            {u.username[0].toUpperCase()}
                                        </div>
                                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full"
                                              style={{ background: "rgba(52,211,153,0.9)", border: "1.5px solid #0A0F1E" }} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs truncate" style={{ color: "rgba(224,242,254,0.7)" }}>@{u.username}</p>
                                        <p className="text-[9px] truncate" style={{ color: "rgba(224,242,254,0.25)" }}>{roomLabel}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Profil */}
                <div className="px-2 sm:px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <Link href="/profil" className="flex items-center justify-center sm:justify-start gap-3">
                        <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold"
                             style={{
                                 background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(59,130,246,0.25))",
                                 border: "1px solid rgba(124,58,237,0.3)",
                                 color: "#E0F2FE",
                             }}>
                            {username[0].toUpperCase()}
                        </div>
                        <div className="hidden sm:block min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: "rgba(224,242,254,0.8)" }}>@{username}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(52,211,153,0.8)" }} />
                                <span className="text-[10px]" style={{ color: "rgba(224,242,254,0.3)" }}>Çevrimiçi</span>
                            </div>
                        </div>
                    </Link>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <div className="shrink-0 px-3 sm:px-6 h-[60px] flex items-center gap-3 sm:gap-4 border-b"
                     style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-lg">{activeRoomData.icon}</span>
                        <div>
                            <h2 className="text-sm font-semibold leading-tight" style={{ color: "#E0F2FE" }}>
                                {activeRoomData.label}
                            </h2>
                            <p className="text-[10px]" style={{ color: "rgba(224,242,254,0.25)" }}>
                                {activeRoomData.desc}
                            </p>
                        </div>
                    </div>

                    {/* Yazıyor göstergesi */}
                    <div className={`flex items-center gap-2 transition-all duration-300 ${typingUsers ? "opacity-100" : "opacity-0"}`}>
                        <div className="flex gap-0.5">
                            {[0, 1, 2].map((i) => (
                                <span key={i} className="w-1.5 h-1.5 rounded-full"
                                      style={{
                                          background: "rgba(124,58,237,0.8)",
                                          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                                      }} />
                            ))}
                        </div>
                        <span className="text-xs" style={{ color: "rgba(167,139,250,0.6)" }}>yazıyor</span>
                    </div>

                    <span className="text-[10px] px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(224,242,254,0.3)" }}>
                        {messages.length} mesaj
                    </span>
                </div>

                {/* Mesajlar */}
                <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-5 flex flex-col"
                     style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(124,58,237,0.2) transparent" }}>
                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                                 style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
                                {activeRoomData.icon}
                            </div>
                            <p className="text-sm font-medium" style={{ color: "rgba(224,242,254,0.35)" }}>{activeRoomData.label}</p>
                            <p className="text-xs" style={{ color: "rgba(224,242,254,0.2)" }}>İlk mesajı gönder, sohbeti başlat ✦</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {messages.map((msg, i) => {
                                const isOwn = msg.user_id === userId;
                                const prevMsg = messages[i - 1];
                                const showDay = !prevMsg || !isSameDay(prevMsg.created_at, msg.created_at);
                                const showHeader = !prevMsg || prevMsg.user_id !== msg.user_id || showDay;
                                const isNew = newMsgIds.has(msg.id);
                                const [avatarBg, avatarBorder, nameColor] = userColor(msg.username);

                                return (
                                    <div key={msg.id}
                                         className="transition-all duration-300"
                                         style={{
                                             marginTop: showHeader ? "20px" : "2px",
                                             opacity: isNew ? 0.6 : 1,
                                             transform: isNew ? "translateY(4px)" : "translateY(0)",
                                         }}>
                                        {showDay && (
                                            <div className="flex items-center gap-3 mb-5">
                                                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                                                <span className="text-[10px] tracking-widest uppercase"
                                                      style={{ color: "rgba(224,242,254,0.2)" }}>
                                                    {dayLabel(msg.created_at)}
                                                </span>
                                                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                                            </div>
                                        )}

                                        <div className={`flex items-end gap-2.5 ${isOwn ? "justify-end" : "justify-start"}`}>
                                            {/* Avatar — sadece başkalarının mesajları */}
                                            {!isOwn && (
                                                <div className="w-8 shrink-0 self-end">
                                                    {showHeader ? (
                                                        <Link href={`/profil/${msg.username}`}
                                                              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity"
                                                              style={{ background: avatarBg, border: `1px solid ${avatarBorder}`, color: "#E0F2FE" }}>
                                                            {msg.username[0].toUpperCase()}
                                                        </Link>
                                                    ) : <div className="w-8" />}
                                                </div>
                                            )}

                                            <div className={`flex flex-col gap-0.5 max-w-[60%] ${isOwn ? "items-end" : "items-start"}`}>
                                                {showHeader && !isOwn && (
                                                    <span className="text-[11px] font-semibold px-1 mb-0.5"
                                                          style={{ color: nameColor }}>
                                                        @{msg.username}
                                                    </span>
                                                )}
                                                <div className="flex items-end gap-2">
                                                    {isOwn && (
                                                        <span className="text-[10px] shrink-0 mb-1" style={{ color: "rgba(224,242,254,0.18)" }}>
                                                            {timeLabel(msg.created_at)}
                                                        </span>
                                                    )}
                                                    <div className="px-4 py-2.5 text-sm leading-relaxed"
                                                         style={isOwn ? {
                                                             background: "linear-gradient(135deg, rgba(124,58,237,0.35), rgba(109,40,217,0.25))",
                                                             border: "1px solid rgba(124,58,237,0.35)",
                                                             color: "#E0F2FE",
                                                             borderRadius: "18px 18px 4px 18px",
                                                         } : {
                                                             background: "rgba(255,255,255,0.05)",
                                                             border: "1px solid rgba(255,255,255,0.08)",
                                                             color: "rgba(224,242,254,0.85)",
                                                             borderRadius: "18px 18px 18px 4px",
                                                         }}>
                                                        {msg.content}
                                                    </div>
                                                    {!isOwn && (
                                                        <span className="text-[10px] shrink-0 mb-1" style={{ color: "rgba(224,242,254,0.18)" }}>
                                                            {timeLabel(msg.created_at)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="shrink-0 px-3 sm:px-6 pb-4 sm:pb-6 pt-3">
                    <div className="rounded-2xl overflow-hidden transition-all duration-200"
                         style={{
                             background: "rgba(255,255,255,0.04)",
                             border: `1px solid ${input ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.08)"}`,
                             boxShadow: input ? "0 0 0 3px rgba(124,58,237,0.06)" : "none",
                         }}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={`${activeRoomData.label} odasına yaz...`}
                            rows={1}
                            maxLength={500}
                            className="w-full resize-none bg-transparent text-sm outline-none leading-relaxed px-4 pt-3 pb-1"
                            style={{ color: "#E0F2FE", maxHeight: "120px" }}
                        />
                        <div className="flex items-center justify-between px-4 pb-3 pt-1">
                            <span className="hidden sm:inline text-[10px]" style={{ color: "rgba(224,242,254,0.15)" }}>
                                Enter gönder · Shift+Enter yeni satır
                            </span>
                            <div className="flex items-center gap-3">
                                {input.length > 0 && (
                                    <span className="text-[10px]"
                                          style={{ color: input.length > 450 ? "rgba(239,68,68,0.7)" : "rgba(224,242,254,0.2)" }}>
                                        {input.length}/500
                                    </span>
                                )}
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || sending}
                                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                                    style={{
                                        background: input.trim() ? "rgba(124,58,237,0.85)" : "rgba(255,255,255,0.05)",
                                        border: `1px solid ${input.trim() ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
                                    }}>
                                    {sending ? (
                                        <span className="w-3 h-3 rounded-full border border-white/30 border-t-white animate-spin" />
                                    ) : (
                                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                                            <path d="M12 7L2 2l2.5 5L2 12l10-5z" fill="white" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-4px); }
                }
            `}</style>
        </div>
    );
}
