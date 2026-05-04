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
    shape: string;
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

type ShapeId = "square" | "bear" | "heart" | "speech";

interface ShapeDef {
    label: string;
    width: number;
    height?: number;
    minHeight?: number;
    clipPath?: string;
    borderRadius?: string | number;
    ears?: boolean;
    padding: string;
    showTape: boolean;
    deletePos?: { top: number; right: number };
}

const NOTE_SHAPES: Record<ShapeId, ShapeDef> = {
    square: {
        label: "Kare", width: 148, minHeight: 120,
        borderRadius: 4, padding: "10px 10px 8px 10px", showTape: true,
    },
    bear: {
        label: "Ayı", width: 132, minHeight: 112,
        borderRadius: 18, ears: true, padding: "10px 10px 8px 10px", showTape: true,
    },
    heart: {
        label: "Kalp", width: 150, height: 140,
        clipPath: "path('M75 132C22 100 2 68 2 42C2 20 18 3 40 3C53 3 64 10 75 25C86 10 97 3 110 3C132 3 148 20 148 42C148 68 128 100 75 132Z')",
        borderRadius: 0, padding: "38px 20px 18px 20px", showTape: false, deletePos: { top: 22, right: 26 },
    },
    speech: {
        label: "Balon", width: 148, height: 132,
        clipPath: "path('M10,0 Q0,0 0,10 L0,96 Q0,108 10,108 L48,108 L36,130 L66,108 L138,108 Q148,108 148,96 L148,10 Q148,0 138,0 Z')",
        borderRadius: 0, padding: "10px 10px 30px 10px", showTape: false,
    },
};

function ShapeIcon({ shape, color }: { shape: ShapeId; color: string }) {
    switch (shape) {
        case "square":
            return <svg width="15" height="15" viewBox="0 0 20 20" fill={color}><rect x="1" y="1" width="18" height="18" rx="3" /></svg>;
        case "bear":
            return <svg width="15" height="15" viewBox="0 0 20 20" fill={color}>
                <circle cx="4" cy="5" r="3.5" />
                <circle cx="16" cy="5" r="3.5" />
                <circle cx="10" cy="13" r="7.5" />
            </svg>;
        case "heart":
            return <svg width="15" height="15" viewBox="0 0 20 20" fill={color}>
                <path d="M10 18C3 13 0 8.5 0 5.5C0 2.5 2.5 0 5.5 0C7.5 0 9 1.5 10 3C11 1.5 12.5 0 14.5 0C17.5 0 20 2.5 20 5.5C20 8.5 17 13 10 18Z" />
            </svg>;
        case "speech":
            return <svg width="15" height="15" viewBox="0 0 20 20" fill={color}>
                <path d="M2,0 Q0,0 0,2 L0,13 Q0,15 2,15 L6,15 L4,19 L9,15 L18,15 Q20,15 20,13 L20,2 Q20,0 18,0 Z" />
            </svg>;
    }
}

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
    const [selectedShape, setSelectedShape] = useState<ShapeId>("square");
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
            .insert({ user_id: userId, username, content: "", x, y, color: selectedColor, shape: selectedShape })
            .select()
            .single();

        if (error) { toast.error("Not eklenemedi."); return; }

        setNotes((prev) => [...prev, data]);
        setEditingId(data.id);
        setEditContent("");
        setSelectedColor(null);
    }, [selectedColor, selectedShape, userId, username, editingId]);

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
        const { error } = await supabase.from("manifest_notes").delete().eq("id", id);
        if (error) { toast.error("Silinemedi: " + error.message); return; }
        setNotes((prev) => prev.filter((n) => n.id !== id));
        if (editingId === id) setEditingId(null);
    }, [editingId]);

    return (
        <div className="flex flex-col" style={{ height: "100dvh", background: "#04061a" }}>

            {/* Navbar */}
            <nav className="shrink-0 relative z-20 flex items-center justify-between px-5 py-3.5 border-b"
                 style={{ borderColor: "rgba(124,58,237,0.15)", background: "rgba(4,6,26,0.88)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center gap-3">
                    <Link href="/home"
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: "rgba(224,242,254,0.45)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(224,242,254,0.9)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(224,242,254,0.45)")}>
                        <ChevronLeft size={16} />
                    </Link>
                    <Link href="/home" className="flex items-baseline gap-0.5">
                        <span className="text-sm font-bold" style={{ color: "rgba(224,242,254,0.55)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "rgba(167,139,250,0.8)" }}>.</span>
                    </Link>
                    <span style={{ color: "rgba(224,242,254,0.2)" }}>/</span>
                    <span className="text-sm font-medium" style={{ color: "rgba(224,242,254,0.55)" }}>Manifest</span>
                </div>

                <p className="text-xs hidden sm:block" style={{ color: "rgba(224,242,254,0.3)" }}>
                    {notes.length} not • tahtaya tıkla, bir şey bırak
                </p>
            </nav>

            <div className="flex flex-1 overflow-hidden">

                {/* Sidebar */}
                <aside className="shrink-0 flex flex-col items-center gap-3 px-2.5 py-4 border-r z-10"
                       style={{ borderColor: "rgba(124,58,237,0.12)", background: "rgba(4,6,26,0.75)", width: 52 }}>

                    {/* Renk seçici */}
                    <p className="text-[9px] uppercase tracking-widest mb-1"
                       style={{ color: "rgba(224,242,254,0.35)", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                        Renk
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

                    {/* Şekil seçici */}
                    <div className="w-7 h-px my-1" style={{ background: "var(--border-3)" }} />
                    <p className="text-[9px] uppercase tracking-widest mb-1"
                       style={{ color: "rgba(224,242,254,0.35)", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                        Şekil
                    </p>
                    {(Object.keys(NOTE_SHAPES) as ShapeId[]).map((id) => {
                        const active = selectedShape === id;
                        return (
                            <button
                                key={id}
                                title={NOTE_SHAPES[id].label}
                                onClick={() => setSelectedShape(id)}
                                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150"
                                style={{
                                    background: active ? "var(--violet-bg-md)" : "var(--bg-1)",
                                    boxShadow: active ? "0 0 0 1.5px var(--violet-border)" : "none",
                                    transform: active ? "scale(1.1)" : "scale(1)",
                                }}>
                                <ShapeIcon
                                    shape={id}
                                    color={active ? "rgba(167,139,250,0.9)" : "rgba(255,255,255,0.25)"}
                                />
                            </button>
                        );
                    })}

                    {selectedColor && (
                        <button
                            onClick={() => setSelectedColor(null)}
                            className="mt-auto transition-opacity hover:opacity-80"
                            style={{ color: "rgba(224,242,254,0.4)" }}>
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
                        background: [
                            "radial-gradient(ellipse at 12% 55%, rgba(109,40,217,0.22) 0%, transparent 48%)",
                            "radial-gradient(ellipse at 88% 18%, rgba(37,99,235,0.16) 0%, transparent 42%)",
                            "radial-gradient(ellipse at 62% 90%, rgba(124,58,237,0.14) 0%, transparent 45%)",
                            "radial-gradient(ellipse at 38% 12%, rgba(236,72,153,0.07) 0%, transparent 32%)",
                            "#04061a",
                        ].join(", "),
                    }}>

                    {/* Uzak yıldızlar */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }} />
                    {/* Yakın yıldızlar */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
                        backgroundSize: "22px 22px",
                        backgroundPosition: "11px 11px",
                    }} />

                    {/* Nebula — sol violet */}
                    <div className="absolute pointer-events-none" style={{
                        width: 700, height: 700,
                        left: "-8%", top: "30%",
                        transform: "translateY(-50%)",
                        background: "radial-gradient(circle, rgba(109,40,217,0.18) 0%, rgba(88,28,220,0.08) 40%, transparent 70%)",
                        filter: "blur(60px)",
                    }} />
                    {/* Nebula — sağ üst mavi */}
                    <div className="absolute pointer-events-none" style={{
                        width: 550, height: 550,
                        right: "-5%", top: "-10%",
                        background: "radial-gradient(circle, rgba(37,99,235,0.14) 0%, rgba(59,130,246,0.06) 45%, transparent 70%)",
                        filter: "blur(70px)",
                    }} />
                    {/* Nebula — alt orta */}
                    <div className="absolute pointer-events-none" style={{
                        width: 500, height: 400,
                        left: "50%", bottom: "-5%",
                        transform: "translateX(-50%)",
                        background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
                        filter: "blur(55px)",
                    }} />

                    {/* Placing hint */}
                    {selectedColor && (
                        <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
                            <p className="text-sm animate-pulse"
                               style={{ color: "rgba(224,242,254,0.4)" }}>
                                Tıkladığın yere not bırak
                            </p>
                        </div>
                    )}

                    {/* Empty state */}
                    {notes.length === 0 && !selectedColor && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                            <p className="text-3xl font-bold tracking-tight"
                               style={{ color: "rgba(224,242,254,0.25)" }}>
                                Hayalini bırak
                            </p>
                            <p className="text-xs"
                               style={{ color: "rgba(224,242,254,0.4)" }}>
                                Sol taraftan renk ve şekil seç, tahtaya tıkla
                            </p>
                        </div>
                    )}

                    {/* Notes */}
                    {notes.map((note) => {
                        const s = NOTE_STYLES[note.color] ?? NOTE_STYLES.yellow;
                        const shapeId = (note.shape as ShapeId) ?? "square";
                        const shape = NOTE_SHAPES[shapeId] ?? NOTE_SHAPES.square;
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

                                {/* Bear ears — rendered before card so they appear behind */}
                                {shape.ears && (
                                    <>
                                        <div style={{
                                            position: "absolute", top: -11, left: 10,
                                            width: 27, height: 27, borderRadius: "50%",
                                            background: s.bg,
                                            boxShadow: `2px 3px 10px ${s.shadow}`,
                                        }} />
                                        <div style={{
                                            position: "absolute", top: -11, right: 10,
                                            width: 27, height: 27, borderRadius: "50%",
                                            background: s.bg,
                                            boxShadow: `2px 3px 10px ${s.shadow}`,
                                        }} />
                                    </>
                                )}

                                <div
                                    className="relative flex flex-col"
                                    style={{
                                        width: shape.width,
                                        height: shape.height,
                                        minHeight: shape.minHeight,
                                        background: s.bg,
                                        borderRadius: shape.borderRadius,
                                        clipPath: shape.clipPath,
                                        boxShadow: `2px 4px 16px ${s.shadow}, 0 1px 3px rgba(0,0,0,0.3)`,
                                        padding: shape.padding,
                                    }}>

                                    {/* Tape strip */}
                                    {shape.showTape && (
                                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 h-5 rounded-sm"
                                             style={{ background: "rgba(255,255,255,0.4)" }} />
                                    )}

                                    {/* Delete */}
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(note.id)}
                                            className="absolute w-4 h-4 rounded-full flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
                                            style={{
                                                top: shape.deletePos?.top ?? 6,
                                                right: shape.deletePos?.right ?? 6,
                                                background: "rgba(0,0,0,0.15)",
                                                color: s.text,
                                            }}>
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
                                            onKeyDown={(e) => { if (e.key === "Escape") handleSave(note.id); }}
                                            placeholder="Hayalini yaz..."
                                            maxLength={200}
                                            rows={4}
                                            className="w-full resize-none outline-none bg-transparent text-xs leading-relaxed font-medium placeholder:opacity-40 flex-1"
                                            style={{ color: s.text }}
                                        />
                                    ) : (
                                        <p
                                            className="text-xs leading-relaxed font-medium flex-1 cursor-pointer text-center"
                                            style={{ color: s.text, minHeight: 48, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                                            onClick={() => {
                                                if (isOwn) { setEditingId(note.id); setEditContent(note.content); }
                                            }}>
                                            {note.content || (isOwn ? <span style={{ opacity: 0.35 }}>Düzenle...</span> : "")}
                                        </p>
                                    )}

                                    {/* Username */}
                                    <p className="text-[9px] mt-2 font-medium text-center"
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
