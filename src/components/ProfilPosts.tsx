"use client";

import { useState } from "react";
import Image from "next/image";
import type { Post } from "@/app/akis/AkisClient";
import { Image as ImageIcon, PenLine, Clapperboard, Sparkles } from "lucide-react";
import type { ElementType } from "react";

const TABS = [
    { id: "tumu",    label: "Tümü"    },
    { id: "resimler",label: "Resimler"},
    { id: "yazilar", label: "Yazılar" },
    { id: "editler", label: "Editler" },
    { id: "diger",   label: "Diğer"   },
] as const;

type TabId = typeof TABS[number]["id"];

const CATEGORY_COLORS: Record<string, { color: string; bg: string; border: string; icon: ElementType }> = {
    resimler: { icon: ImageIcon,    color: "rgba(244,114,182,0.9)", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.2)" },
    yazilar:  { icon: PenLine,      color: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)"  },
    editler:  { icon: Clapperboard, color: "rgba(167,139,250,0.9)", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.2)"  },
    diger:    { icon: Sparkles,     color: "rgba(147,197,253,0.9)", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)"  },
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

export default function ProfilPosts({ posts, supabaseUrl }: { posts: Post[]; supabaseUrl: string }) {
    const [tab, setTab] = useState<TabId>("tumu");
    const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());

    const filtered = tab === "tumu" ? posts : posts.filter((p) => p.category === tab);

    return (
        <div className="mt-6 flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {TABS.map((t) => {
                    const count = t.id === "tumu" ? posts.length : posts.filter((p) => p.category === t.id).length;
                    const isActive = tab === t.id;
                    return (
                        <button key={t.id} onClick={() => setTab(t.id)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200"
                                style={{
                                    background: isActive ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                                    border: `1px solid ${isActive ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.06)"}`,
                                    color: isActive ? "rgba(167,139,250,0.9)" : "rgba(224,242,254,0.35)",
                                }}>
                            {t.label}
                            {count > 0 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                                      style={{ background: isActive ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.05)", color: isActive ? "rgba(167,139,250,0.9)" : "rgba(224,242,254,0.25)" }}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Posts */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Sparkles size={24} className="opacity-10" />
                    <p className="text-xs" style={{ color: "rgba(224,242,254,0.2)" }}>Henüz paylaşım yok.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map((post) => {
                        const conf = CATEGORY_COLORS[post.category];
                        const imageUrl = post.storage_path
                            ? `${supabaseUrl}/storage/v1/object/public/posts/${post.storage_path}`
                            : null;
                        const loaded = loadedIds.has(post.id);

                        return (
                            <div key={post.id} className="card rounded-2xl overflow-hidden">

                                {/* Kategori + tarih */}
                                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                                          style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}>
                                        <conf.icon size={10} strokeWidth={2} /> {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                                    </span>
                                    <span className="text-[10px]" style={{ color: "rgba(224,242,254,0.2)" }}>
                                        {timeAgo(post.created_at)}
                                    </span>
                                </div>

                                {/* Görsel */}
                                {imageUrl && (
                                    <div className="relative mx-4 mb-3 rounded-xl overflow-hidden">
                                        {!loaded && (
                                            <div className="w-full h-40 animate-pulse rounded-xl"
                                                 style={{ background: "rgba(124,58,237,0.08)" }} />
                                        )}
                                        <Image src={imageUrl} alt={post.description ?? "post"} width={600} height={400}
                                               className="w-full h-auto object-cover rounded-xl"
                                               style={{ opacity: loaded ? 1 : 0, transition: "opacity 0.4s" }}
                                               onLoad={() => setLoadedIds((prev) => new Set(prev).add(post.id))}
                                               sizes="(max-width: 640px) 100vw, 600px" />
                                    </div>
                                )}

                                {/* Yazı */}
                                {post.content && (
                                    <p className="px-4 pb-3 text-sm leading-relaxed" style={{ color: "rgba(224,242,254,0.8)" }}>
                                        {post.content}
                                    </p>
                                )}

                                {/* Açıklama */}
                                {post.description && (
                                    <p className="px-4 pb-4 text-xs" style={{ color: "rgba(224,242,254,0.35)" }}>
                                        {post.description}
                                    </p>
                                )}

                                {!post.content && !post.description && <div className="pb-2" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
