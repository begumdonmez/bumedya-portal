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
    { id: "genel",            label: "Genel",            icon: "💬" },
    { id: "cizim-atolyesi",   label: "Çizim Atölyesi",   icon: "🎨" },
    { id: "yazarlar-kahvesi", label: "Yazarlar Kahvesi",  icon: "📝" },
];

function timeLabel(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function isSameDay(a: string, b: string) {
    return new Date(a).toDateString() === new Date(b).toDateString();
}

function dayLabel(dateStr: string): string {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Bugün";
    if (d.toDateString() === yesterday.toDateString()) return "Dün";
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

export default function ChatClient({
    userId,
    username,
    initialMessages,
}: {
    userId: string;
    username: string;
    initialMessages: Message[];
}) {
    const [activeRoom, setActiveRoom] = useState("genel");
    const [messagesByRoom, setMessagesByRoom] = useState<Record<string, Message[]>>(() => {
        const map: Record<string, Message[]> = {};
        ROOMS.forEach((r) => { map[r.id] = []; });
        initialMessages.forEach((m) => {
            if (map[m.room_id]) map[m.room_id].push(m);
        });
        return map;
    });
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [typing, setTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const messages = messagesByRoom[activeRoom] ?? [];

    // Scroll to bottom when messages change or room changes
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length, activeRoom]);

    // Realtime subscription
    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel(`chat-${activeRoom}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${activeRoom}` },
                (payload) => {
                    const msg = payload.new as Message;
                    setMessagesByRoom((prev) => ({
                        ...prev,
                        [activeRoom]: [...(prev[activeRoom] ?? []), msg],
                    }));
                    if (msg.user_id !== userId) setTyping(false);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [activeRoom, userId]);

    const sendMessage = async () => {
        const content = input.trim();
        if (!content || sending) return;

        setSending(true);
        setInput("");

        const supabase = createClient();
        await supabase.from("messages").insert({
            room_id: activeRoom,
            user_id: userId,
            username,
            content,
        });

        // Aktivite kaydı — sadece ilk mesajda değil her seferinde gürültü olur,
        // bu yüzden lounge_join yerine mesaj bazlı bir tip kullanmak daha iyi
        // ama talep lounge_join olduğu için bırakıyoruz
        await supabase.from("activities").insert({
            user_id: userId,
            username,
            type: "lounge_join",
            payload: {},
        });

        setSending(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        setTyping(true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTyping(false), 1500);
    };

    return (
        <div className="flex h-screen" style={{ background: "#0A0F1E" }}>

            {/* ── SIDEBAR ── */}
            <aside className="w-64 shrink-0 flex flex-col border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {/* Logo */}
                <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <Link href="/" className="flex items-baseline gap-0.5">
                        <span className="text-sm font-bold" style={{ color: "rgba(224,242,254,0.5)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                    </Link>
                    <p className="text-[10px] tracking-widest uppercase mt-1" style={{ color: "rgba(224,242,254,0.2)" }}>Lounge</p>
                </div>

                {/* Odalar */}
                <div className="flex-1 px-3 py-4 flex flex-col gap-1">
                    <p className="text-[10px] tracking-widest uppercase px-2 mb-2" style={{ color: "rgba(224,242,254,0.2)" }}>Odalar</p>
                    {ROOMS.map((room) => {
                        const isActive = room.id === activeRoom;
                        return (
                            <button
                                key={room.id}
                                onClick={() => setActiveRoom(room.id)}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-200 w-full"
                                style={{
                                    background: isActive ? "rgba(124,58,237,0.15)" : "transparent",
                                    border: `1px solid ${isActive ? "rgba(124,58,237,0.3)" : "transparent"}`,
                                    color: isActive ? "rgba(167,139,250,0.95)" : "rgba(224,242,254,0.4)",
                                }}
                            >
                                <span className="text-base">{room.icon}</span>
                                <span className="font-medium">{room.label}</span>
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse"
                                          style={{ background: "rgba(124,58,237,0.9)" }} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Profil */}
                <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <Link href="/profil" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                             style={{
                                 background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
                                 border: "1px solid rgba(124,58,237,0.2)",
                                 color: "#E0F2FE",
                             }}>
                            {username[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium" style={{ color: "rgba(224,242,254,0.6)" }}>@{username}</span>
                    </Link>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center gap-3"
                     style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    <span className="text-xl">{ROOMS.find((r) => r.id === activeRoom)?.icon}</span>
                    <div>
                        <h2 className="text-sm font-semibold" style={{ color: "#E0F2FE" }}>
                            {ROOMS.find((r) => r.id === activeRoom)?.label}
                        </h2>
                        <p className="text-[10px]" style={{ color: "rgba(224,242,254,0.25)" }}>
                            {messages.length} mesaj
                        </p>
                    </div>
                    {typing && (
                        <div className="ml-auto flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "rgba(124,58,237,0.8)" }} />
                            <span className="text-xs" style={{ color: "rgba(167,139,250,0.6)" }}>yazıyor...</span>
                        </div>
                    )}
                </div>

                {/* Mesajlar */}
                <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-1">
                    {messages.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-30">
                            <span className="text-4xl">{ROOMS.find((r) => r.id === activeRoom)?.icon}</span>
                            <p className="text-sm" style={{ color: "rgba(224,242,254,0.5)" }}>Henüz mesaj yok. İlk mesajı sen gönder!</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isOwn = msg.user_id === userId;
                            const prevMsg = messages[i - 1];
                            const showDay = !prevMsg || !isSameDay(prevMsg.created_at, msg.created_at);
                            const showAvatar = !prevMsg || prevMsg.user_id !== msg.user_id || showDay;

                            return (
                                <div key={msg.id}>
                                    {showDay && (
                                        <div className="flex items-center gap-3 my-4">
                                            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                                            <span className="text-[10px] tracking-widest uppercase px-3"
                                                  style={{ color: "rgba(224,242,254,0.2)" }}>
                                                {dayLabel(msg.created_at)}
                                            </span>
                                            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                                        </div>
                                    )}
                                    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"} ${showAvatar ? "mt-3" : "mt-0.5"}`}>
                                        {/* Avatar */}
                                        {showAvatar && !isOwn ? (
                                            <Link href={`/profil/${msg.username}`}
                                                  className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mb-0.5"
                                                  style={{
                                                      background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(59,130,246,0.2))",
                                                      border: "1px solid rgba(124,58,237,0.2)",
                                                      color: "#E0F2FE",
                                                  }}>
                                                {msg.username[0].toUpperCase()}
                                            </Link>
                                        ) : !isOwn ? (
                                            <div className="w-7 shrink-0" />
                                        ) : null}

                                        <div className={`flex flex-col gap-0.5 max-w-[65%] ${isOwn ? "items-end" : "items-start"}`}>
                                            {showAvatar && !isOwn && (
                                                <span className="text-[10px] px-1" style={{ color: "rgba(224,242,254,0.35)" }}>
                                                    @{msg.username}
                                                </span>
                                            )}
                                            <div className="flex items-end gap-1.5">
                                                <div
                                                    className="px-3.5 py-2 rounded-2xl text-sm leading-relaxed"
                                                    style={isOwn ? {
                                                        background: "rgba(124,58,237,0.25)",
                                                        border: "1px solid rgba(124,58,237,0.3)",
                                                        color: "#E0F2FE",
                                                        borderBottomRightRadius: "6px",
                                                    } : {
                                                        background: "rgba(255,255,255,0.05)",
                                                        border: "1px solid rgba(255,255,255,0.08)",
                                                        color: "rgba(224,242,254,0.85)",
                                                        borderBottomLeftRadius: "6px",
                                                    }}
                                                >
                                                    {msg.content}
                                                </div>
                                                <span className="text-[10px] shrink-0 mb-1" style={{ color: "rgba(224,242,254,0.2)" }}>
                                                    {timeLabel(msg.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="px-6 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-end gap-3 rounded-2xl px-4 py-3"
                         style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder={`${ROOMS.find((r) => r.id === activeRoom)?.label} odasına yaz...`}
                            rows={1}
                            className="flex-1 resize-none bg-transparent text-sm outline-none leading-relaxed"
                            style={{
                                color: "#E0F2FE",
                                maxHeight: "120px",
                            }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || sending}
                            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                            style={{
                                background: input.trim() ? "rgba(124,58,237,0.8)" : "rgba(255,255,255,0.05)",
                                border: `1px solid ${input.trim() ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M12 7L2 2l2.5 5L2 12l10-5z" fill="white" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-[10px] mt-2 text-center" style={{ color: "rgba(224,242,254,0.15)" }}>
                        Enter ile gönder · Shift+Enter yeni satır
                    </p>
                </div>
            </div>
        </div>
    );
}
