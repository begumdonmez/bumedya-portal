"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Megaphone, Plus, X, Trash2 } from "lucide-react";

interface Announcement {
    id: string;
    user_id: string;
    username: string;
    content: string;
    created_at: string;
}

function relativeTime(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60)    return "az önce";
    if (diff < 3600)  return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
    return `${Math.floor(diff / 86400)} gün önce`;
}

export default function AnnouncementsWidget({
    initial,
    isAdmin,
    userId,
    username,
}: {
    initial: Announcement[];
    isAdmin: boolean;
    userId: string;
    username: string;
}) {
    const [items, setItems] = useState(initial);
    const [showForm, setShowForm] = useState(false);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from("announcements")
            .insert({ user_id: userId, username, content: content.trim() })
            .select()
            .single();
        setLoading(false);
        if (error) { toast.error("Duyuru eklenemedi."); return; }
        setItems(prev => [data, ...prev]);
        setContent("");
        setShowForm(false);
        toast.success("Duyuru yayınlandı.");
    };

    const handleDelete = async (id: string) => {
        const supabase = createClient();
        const { error } = await supabase.from("announcements").delete().eq("id", id);
        if (error) { toast.error("Silinemedi."); return; }
        setItems(prev => prev.filter(i => i.id !== id));
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Megaphone size={13} style={{ color: "color-mix(in srgb, var(--warn) 70%, transparent)" }} />
                    <p className="label-caps">Duyurular</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowForm(v => !v)}
                        className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-all duration-200"
                        style={{
                            background: showForm ? "color-mix(in srgb, var(--accent) 20%, transparent)" : "color-mix(in srgb, var(--accent) 10%, transparent)",
                            border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
                            color: "color-mix(in srgb, var(--accent) 80%, transparent)",
                        }}>
                        {showForm ? <X size={10} /> : <Plus size={10} />}
                        {showForm ? "İptal" : "Yeni"}
                    </button>
                )}
            </div>

            {/* Form */}
            {showForm && (
                <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-4">
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Duyuru metnini yaz..."
                        rows={3}
                        className="w-full rounded-xl px-3 py-2.5 text-xs resize-none outline-none transition-all duration-200"
                        style={{
                            background: "color-mix(in srgb, var(--fg) 5%, transparent)",
                            color: "var(--text-1)",
                            border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                            boxShadow: "0 0 0 1px color-mix(in srgb, var(--accent) 10%, transparent)",
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="self-end text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-40"
                        style={{ background: "var(--accent)", color: "#fff" }}>
                        {loading ? "Yayınlanıyor..." : "Yayınla"}
                    </button>
                </form>
            )}

            {/* Liste */}
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 gap-2 py-8">
                        <Megaphone size={28} className="opacity-10" />
                        <p className="text-xs" style={{ color: "color-mix(in srgb, var(--fg) 20%, transparent)" }}>Henüz duyuru yok.</p>
                    </div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="group relative rounded-xl p-3"
                             style={{ background: "color-mix(in srgb, var(--fg) 3%, transparent)", border: "1px solid color-mix(in srgb, var(--fg) 6%, transparent)" }}>
                            <div
                                className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full"
                                style={{ background: "color-mix(in srgb, var(--warn) 50%, transparent)", marginLeft: "12px" }}
                            />
                            <div className="pl-3">
                                <p className="text-xs leading-relaxed mb-2" style={{ color: "color-mix(in srgb, var(--fg) 75%, transparent)" }}>
                                    {item.content}
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-[11px]" style={{ color: "color-mix(in srgb, var(--fg) 25%, transparent)" }}>
                                        @{item.username} · {relativeTime(item.created_at)}
                                    </p>
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
                                            style={{ color: "color-mix(in srgb, var(--danger) 50%, transparent)" }}>
                                            <Trash2 size={11} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
