"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, X, Plus } from "lucide-react";

interface Note {
    id: string;
    user_id: string;
    username: string;
    content: string;
    x: number;
    y: number;
    color: string;
    created_at: string;
}

const NOTE_STYLES: Record<string, { bg: string; shadow: string; text: string; muted: string; label: string }> = {
    yellow: { bg: "#fef9c3", shadow: "rgba(202,138,4,0.25)",  text: "#713f12", muted: "#a16207", label: "Sarı"   },
    pink:   { bg: "#fce7f3", shadow: "rgba(219,39,119,0.2)",  text: "#831843", muted: "#be185d", label: "Pembe"  },
    blue:   { bg: "#dbeafe", shadow: "rgba(37,99,235,0.2)",   text: "#1e3a8a", muted: "#1d4ed8", label: "Mavi"   },
    green:  { bg: "#dcfce7", shadow: "rgba(22,163,74,0.2)",   text: "#14532d", muted: "#15803d", label: "Yeşil"  },
    purple: { bg: "#f3e8ff", shadow: "rgba(147,51,234,0.2)",  text: "#581c87", muted: "#7c3aed", label: "Mor"    },
    white:  { bg: "#f8fafc", shadow: "rgba(100,116,139,0.2)", text: "#0f172a", muted: "#475569", label: "Beyaz"  },
};

function getRotation(id: string): number {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    return ((Math.abs(h) % 13) - 6);
}

export default function ManifestClient({
    userId,
    username,
    badges,
    initialNotes,
}: {
    userId: string;
    username: string;
    badges: string[];
    initialNotes: Note[];
}) {
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState("");
    const [saving, setSaving] = useState(false);
    const boardRef = useRef<HTMLDivElement>(null);
    const isAdmin = badges.includes("admin");

    // Realtime
    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel("manifest_notes_rt")
            .on("postgres_changes", { event: "*", schema: "public", table: "manifest_notes" }, (payload) => {
                if (payload.eventType === "INSERT") {
                    setNotes((prev) => {
                        if (prev.some((n) => n.id === (payload.new as Note).id)) return prev;
                        return [...prev, payload.new as Note];
                    });
                } else if (payload.eventType === "DELETE") {
                    setNotes((prev) => prev.filter((n) => n.id !== (payload.old as Note).id));
                } else if (payload.eventType === "UPDATE") {
                    setNotes((prev) => prev.map((n) => n.id === (payload.new as Note).id ? payload.new as Note : n));
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const handleBoardClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectedColor) return;
        if (!boardRef.current) return;
        if (editingId) return;

        const rect = boardRef.current.getBoundingClientRect();
        const x = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 4), 94);
        const y = Math.min(Math.max(((e.clientY - rect.top) / rect.height) * 100, 3), 90);

        const supabase = createClient();
        const { data, error } = await supabase
            .from("manifest_notes")
            .insert({ user_id: userId, username, content: "", x, y, color: selectedColor })
            .select()
            .single();

        if (error) { toast.error("Not eklenemedi."); return; }

        setNotes((prev) => [...prev, data]);
        setEditingId(data.id);
        setEditContent("");
        setSelectedColor(null);
    }, [selectedColor, userId, username, editingId]);

    const handleSave = useCallback(async (id: string) => {
        if (saving) return;
        setSaving(true);
        const supabase = createClient();
        await supabase.from("manifest_notes").update({ content: editContent.trim() }).eq("id", id);
        setNotes((prev) => prev.map((n) => n.id === id ? { ...n, content: editContent.trim() } : n));
        setEditingId(null);
        setSaving(false);
    }, [editContent, saving]);

    const handleDelete = useCallback(async (id: string) => {
        const supabase = createClient();
        await supabase.from("manifest_notes").delete().eq("id", id);
        setNotes((prev) => prev.filter((n) => n.id !== id));
        if (editingId === id) setEditingId(null);
    }, [editingId]);

    return (
        <div className="flex flex-col" style={{ height: "100dvh", background: "#111c11" }}>

            {/* Navbar */}
            <nav className="shrink-0 relative z-20 flex items-center justify-between px-5 py-3.5 border-b"
                 style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(10,18,10,0.85)", backdropFilter: "blur(12px)" }}>
                <div className="flex items-center gap-3">
                    <Link href="/home"
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "rgba(224,242,254,0.3)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(224,242,254,0.7)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(224,242,254,0.3)")}>
                        <ChevronLeft size={16} />
                    </Link>
                    <Link href="/home" className="flex items-baseline gap-0.5">
                        <span className="text-sm font-bold" style={{ color: "rgba(224,242,254,0.4)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                    </Link>
                    <span style={{ color: "rgba(255,255,255,0.12)" }}>/</span>
                    <span className="text-sm font-medium" style={{ color: "rgba(224,242,254,0.5)" }}>Manifest</span>
                </div>

                <p className="text-xs hidden sm:block" style={{ color: "rgba(224,242,254,0.2)" }}>
                    {notes.length} not • tahtaya tıkla, bir şey bırak
                </p>
            </nav>

            <div className="flex flex-1 overflow-hidden">

                {/* Sidebar */}
                <aside className="shrink-0 flex flex-col items-center gap-3 px-2.5 py-4 border-r z-10"
                       style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(10,18,10,0.6)", width: 52 }}>
                    <p className="text-[9px] uppercase tracking-widest mb-1"
                       style={{ color: "rgba(255,255,255,0.2)", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                        Not
                    </p>
                    {Object.entries(NOTE_STYLES).map(([id, style]) => {
                        const active = selectedColor === id;
                        return (
                            <button
                                key={id}
                                title={style.label}
                                onClick={() => setSelectedColor(active ? null : id)}
                                className="w-8 h-8 rounded-xl transition-all duration-150 relative"
                                style={{
                                    background: style.bg,
                                    boxShadow: active
                                        ? `0 0 0 2px ${style.muted}, 0 4px 12px ${style.shadow}`
                                        : `0 2px 6px ${style.shadow}`,
                                    transform: active ? "scale(1.15)" : "scale(1)",
                                }}>
                                {active && (
                                    <Plus size={12} className="absolute inset-0 m-auto"
                                          style={{ color: style.text }} />
                                )}
                            </button>
                        );
                    })}

                    {selectedColor && (
                        <button
                            onClick={() => setSelectedColor(null)}
                            className="mt-auto text-[9px] uppercase tracking-wider transition-opacity hover:opacity-80"
                            style={{ color: "rgba(255,255,255,0.25)" }}>
                            <X size={12} />
                        </button>
                    )}
                </aside>

                {/* Board */}
                <div
                    ref={boardRef}
                    onClick={handleBoardClick}
                    className="relative flex-1 overflow-hidden select-none"
                    style={{
                        cursor: selectedColor ? "crosshair" : "default",
                        background: "radial-gradient(ellipse at 30% 40%, rgba(20,40,20,0.8) 0%, #0d180d 100%)",
                    }}>

                    {/* Subtle dot grid */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
                        backgroundSize: "32px 32px",
                    }} />

                    {/* Placing hint */}
                    {selectedColor && (
                        <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
                            <p className="text-sm animate-pulse"
                               style={{ color: "rgba(255,255,255,0.15)" }}>
                                Tıkladığın yere not bırak
                            </p>
                        </div>
                    )}

                    {/* Empty state */}
                    {notes.length === 0 && !selectedColor && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                            <p className="text-3xl font-bold tracking-tight"
                               style={{ color: "rgba(255,255,255,0.04)" }}>
                                Hayalini bırak
                            </p>
                            <p className="text-xs"
                               style={{ color: "rgba(255,255,255,0.1)" }}>
                                Sol taraftan renk seç, tahtaya tıkla
                            </p>
                        </div>
                    )}

                    {/* Notes */}
                    {notes.map((note) => {
                        const s = NOTE_STYLES[note.color] ?? NOTE_STYLES.yellow;
                        const rot = getRotation(note.id);
                        const isEditing = editingId === note.id;
                        const isOwn = note.user_id === userId;
                        const canDelete = isOwn || isAdmin;

                        return (
                            <div
                                key={note.id}
                                className="absolute"
                                style={{
                                    left: `${note.x}%`,
                                    top: `${note.y}%`,
                                    transform: `translate(-50%, -50%) rotate(${isEditing ? 0 : rot}deg)`,
                                    zIndex: isEditing ? 30 : 1,
                                    transition: isEditing ? "transform 0.15s ease" : undefined,
                                }}
                                onClick={(e) => e.stopPropagation()}>

                                <div
                                    className="relative flex flex-col"
                                    style={{
                                        width: 148,
                                        minHeight: 120,
                                        background: s.bg,
                                        borderRadius: 4,
                                        boxShadow: `2px 4px 16px ${s.shadow}, 0 1px 3px rgba(0,0,0,0.3)`,
                                        padding: "10px 10px 8px 10px",
                                    }}>

                                    {/* Sticky tape strip at top */}
                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-5 rounded-sm"
                                         style={{ background: "rgba(255,255,255,0.4)" }} />

                                    {/* Delete */}
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(note.id)}
                                            className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                            style={{ background: "rgba(0,0,0,0.12)", color: s.text }}>
                                            <X size={9} />
                                        </button>
                                    )}

                                    {/* Content */}
                                    {isEditing ? (
                                        <textarea
                                            autoFocus
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            onBlur={() => handleSave(note.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Escape") handleSave(note.id);
                                            }}
                                            placeholder="Hayalini yaz..."
                                            maxLength={200}
                                            rows={4}
                                            className="w-full resize-none outline-none bg-transparent text-xs leading-relaxed font-medium placeholder:opacity-40"
                                            style={{ color: s.text }}
                                        />
                                    ) : (
                                        <p
                                            className="text-xs leading-relaxed font-medium flex-1 cursor-pointer"
                                            style={{ color: s.text, minHeight: 64, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                            onClick={() => {
                                                if (isOwn) { setEditingId(note.id); setEditContent(note.content); }
                                            }}>
                                            {note.content || (isOwn ? <span style={{ opacity: 0.35 }}>Düzenle...</span> : "")}
                                        </p>
                                    )}

                                    {/* Username */}
                                    <p className="text-[9px] mt-2 font-medium"
                                       style={{ color: s.muted, opacity: 0.7 }}>
                                        @{note.username}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
