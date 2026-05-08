"use client";

import { useState, useRef, useCallback, memo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Image as ImageIcon, PenLine, Clapperboard, Sparkles, X, ExternalLink, Heart, Pencil } from "lucide-react";
import type { ElementType } from "react";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import HomeNavLinks from "@/components/HomeNavLinks";
import NotificationBell from "@/components/NotificationBell";

export interface Post {
    id: string;
    user_id: string;
    username: string;
    category: "resimler" | "yazilar" | "editler" | "diger";
    content: string | null;
    storage_path: string | null;
    description: string | null;
    created_at: string;
    ref_url?: string | null;
}

type CategoryId = "resimler" | "yazilar" | "editler" | "diger";

const CATEGORIES: { id: CategoryId; label: string; icon: ElementType; color: string; bg: string; border: string }[] = [
    { id: "resimler", label: "Resimler", icon: ImageIcon,    color: "rgba(244,114,182,0.9)", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.2)" },
    { id: "yazilar",  label: "Yazılar",  icon: PenLine,      color: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)"  },
    { id: "editler",  label: "Editler",  icon: Clapperboard, color: "var(--violet-text)",    bg: "var(--violet-bg)",       border: "var(--violet-border)"  },
    { id: "diger",    label: "Diğer",    icon: Sparkles,     color: "rgba(147,197,253,0.9)", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)"  },
];

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "az önce";
    if (mins < 60) return `${mins} dk`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} sa`;
    return `${Math.floor(hrs / 24)} gün`;
}

function isImageUrl(url: string) {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
}
function getYoutubeId(url: string) {
    const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return m?.[1] ?? null;
}

function LinkPreview({ url }: { url: string }) {
    const ytId = getYoutubeId(url);
    if (ytId) {
        return (
            <div className="relative mx-4 mb-3 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                <iframe
                    src={`https://www.youtube.com/embed/${ytId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        );
    }
    if (isImageUrl(url)) {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="block mx-4 mb-3 rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="link önizleme" className="w-full h-auto object-cover rounded-xl" />
            </a>
        );
    }
    return (
        <div className="mx-4 mb-3">
            <a href={url} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs transition-all duration-200"
               style={{ background: "var(--violet-bg)", border: "1px solid var(--violet-border)", color: "var(--violet-text)" }}>
                <ExternalLink size={12} />
                <span className="truncate">{url}</span>
            </a>
        </div>
    );
}

function CategoryBadge({ id }: { id: string }) {
    const conf = CATEGORIES.find((c) => c.id === id);
    if (!conf) return null;
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}>
            <conf.icon size={10} strokeWidth={2} /> {conf.label}
        </span>
    );
}

const PostCard = memo(function PostCard({ post, supabaseUrl, userId, likeCount, likedByMe, onLike, onDelete, onEdit }: {
    post: Post;
    supabaseUrl: string;
    userId: string;
    likeCount: number;
    likedByMe: boolean;
    onLike: (postId: string) => void;
    onDelete: (id: string) => void;
    onEdit: (post: Post) => void;
}) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const isOwn = post.user_id === userId;
    const imageUrl = post.storage_path
        ? `${supabaseUrl}/storage/v1/object/public/posts/${post.storage_path}`
        : null;
    // Sadece http/https URL'lere izin ver — eski kayıtlarda javascript: vb. olabilir
    const safeRefUrl = (() => {
        if (!post.ref_url) return null;
        try {
            const p = new URL(post.ref_url);
            return (p.protocol === "http:" || p.protocol === "https:") ? post.ref_url : null;
        } catch { return null; }
    })();

    const handleDelete = async () => {
        const res = await fetch(`/api/posts?id=${post.id}`, { method: "DELETE" });
        if (!res.ok) { toast.error("Silinemedi."); return; }
        onDelete(post.id);
        toast.success("Post silindi.");
    };

    const imageElement = imageUrl ? (
        <div className="relative mx-4 mb-3 rounded-xl overflow-hidden">
            {!imgLoaded && (
                <div className="w-full h-48 animate-pulse rounded-xl"
                     style={{ background: "var(--violet-bg)" }} />
            )}
            <Image
                src={imageUrl}
                alt={post.description ?? "post görseli"}
                width={800}
                height={600}
                className="w-full h-auto object-cover rounded-xl"
                style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 0.4s" }}
                onLoad={() => setImgLoaded(true)}
                sizes="(max-width: 640px) 100vw, 600px"
            />
        </div>
    ) : null;

    return (
        <div className="card rounded-2xl overflow-hidden transition-all duration-300">

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-3">
                    <Link href={`/profil/${post.username}`}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                             style={{
                                 background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
                                 border: "1px solid var(--violet-border)",
                                 color: "var(--text-1)",
                             }}>
                            {post.username[0].toUpperCase()}
                        </div>
                    </Link>
                    <div>
                        <Link href={`/profil/${post.username}`}
                              className="text-sm font-medium hover:opacity-80 transition-opacity"
                              style={{ color: "var(--text-1)" }}>
                            @{post.username}
                        </Link>
                        <p className="text-[10px]" style={{ color: "var(--text-4)" }}>
                            {timeAgo(post.created_at)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <CategoryBadge id={post.category} />
                    {isOwn && (
                        <div className="flex items-center gap-1">
                            <button onClick={() => onEdit(post)}
                                    className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-all duration-200"
                                    style={{ color: "rgba(124,58,237,0.6)", border: "1px solid rgba(124,58,237,0.1)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.08)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                <Pencil size={10} /> Düzenle
                            </button>
                            <button onClick={handleDelete}
                                    className="text-[10px] px-2 py-1 rounded-lg transition-all duration-200"
                                    style={{ color: "rgba(239,68,68,0.6)", border: "1px solid rgba(239,68,68,0.1)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                Sil
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Görsel — tıklanabilir eğer ref_url varsa */}
            {imageUrl && (
                safeRefUrl ? (
                    <a href={safeRefUrl} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                        {imageElement}
                    </a>
                ) : imageElement
            )}

            {/* Link önizleme — dosya yoksa */}
            {!imageUrl && safeRefUrl && <LinkPreview url={safeRefUrl} />}

            {/* Yazı içeriği */}
            {post.content && (
                <div className="px-4 mb-3">
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                        {post.content}
                    </p>
                </div>
            )}

            {/* Açıklama */}
            {post.description && (
                <div className="px-4 pb-4">
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                        {post.description}
                    </p>
                </div>
            )}

            {/* Footer — beğeni + link */}
            <div className="flex items-center justify-between px-4 pb-4 pt-1">
                <button
                    onClick={() => onLike(post.id)}
                    className="flex items-center gap-1.5 transition-all duration-200 group"
                    style={{ color: likedByMe ? "rgba(244,114,182,0.9)" : "var(--text-4)" }}>
                    <Heart
                        size={15}
                        strokeWidth={2}
                        fill={likedByMe ? "rgba(244,114,182,0.9)" : "none"}
                        className="transition-transform duration-150 group-active:scale-90"
                    />
                    {likeCount > 0 && (
                        <span className="text-[11px] font-medium tabular-nums">{likeCount}</span>
                    )}
                </button>

                {imageUrl && safeRefUrl && (
                    <a href={safeRefUrl} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1.5 text-[10px] transition-opacity hover:opacity-70"
                       style={{ color: "var(--violet-text)" }}>
                        <ExternalLink size={10} /> Linke git
                    </a>
                )}
            </div>
        </div>
    );
});

function EditModal({ post, onClose, onSave }: {
    post: Post;
    onClose: () => void;
    onSave: (updated: Post) => void;
}) {
    const needsFile = post.category === "resimler" || post.category === "editler";
    const [content, setContent] = useState(post.content ?? "");
    const [description, setDescription] = useState(post.description ?? "");
    const [refUrl, setRefUrl] = useState(post.ref_url ?? "");
    const [loading, setLoading] = useState(false);

    const inputStyle = {
        background: "var(--bg-2)",
        border: "1px solid var(--border-2)",
        color: "var(--text-1)",
    } as React.CSSProperties;

    const handleSave = async () => {
        setLoading(true);
        const res = await fetch("/api/posts", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: post.id,
                content: content || null,
                description: description || null,
                ref_url: refUrl || null,
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            toast.error(err.error ?? "Düzenlenemedi.");
            setLoading(false);
            return;
        }
        const { post: updated } = await res.json();
        onSave(updated as Post);
        toast.success("Post güncellendi.");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
             style={{ background: "var(--overlay)", backdropFilter: "blur(8px)" }}
             onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-lg rounded-3xl overflow-hidden"
                 style={{ background: "rgba(20,30,58,0.92)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", border: "1px solid var(--border-1)" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b"
                     style={{ borderColor: "var(--border-3)" }}>
                    <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>Postu Düzenle</h2>
                    <button onClick={onClose} className="flex items-center justify-center transition-opacity hover:opacity-60"
                            style={{ color: "var(--text-3)" }}><X size={16} /></button>
                </div>

                <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">

                    {/* Metin içeriği — yazılar ve diger */}
                    {!needsFile && (
                        <div>
                            <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--text-4)" }}>İçerik</p>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Ne paylaşmak istiyorsun?"
                                rows={5}
                                maxLength={2000}
                                className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none leading-relaxed"
                                style={inputStyle}
                            />
                            <p className="text-[10px] mt-1 text-right" style={{ color: "var(--text-4)" }}>
                                {content.length}/2000
                            </p>
                        </div>
                    )}

                    {/* Link (resimler/editler için) */}
                    {needsFile && (
                        <div>
                            <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--text-4)" }}>
                                Link <span style={{ color: "var(--text-5)" }}>(opsiyonel)</span>
                            </p>
                            <input
                                value={refUrl}
                                onChange={(e) => setRefUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                                style={inputStyle}
                            />
                        </div>
                    )}

                    {/* Açıklama */}
                    <div>
                        <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--text-4)" }}>
                            Açıklama <span style={{ color: "var(--text-5)" }}>(opsiyonel)</span>
                        </p>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Kısa bir açıklama..."
                            maxLength={200}
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                            style={inputStyle}
                        />
                    </div>

                    {/* Kaydet */}
                    <button onClick={handleSave} disabled={loading}
                            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40"
                            style={{ background: "rgba(124,58,237,0.8)", color: "#fff", border: "1px solid rgba(124,58,237,0.5)" }}>
                        {loading ? (
                            <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : "Kaydet"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function UploadModal({ onClose, onPost, userId, username }: {
    onClose: () => void;
    onPost: (post: Post) => void;
    userId: string;
    username: string;
}) {
    const [category, setCategory] = useState<CategoryId>("resimler");
    const [content, setContent] = useState("");
    const [description, setDescription] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [linkUrl, setLinkUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const needsFile = category === "resimler" || category === "editler";
    const isVideo = category === "editler";
    const limitMb = isVideo ? 25 : 5;

    const handleFile = (f: File | null) => {
        if (!f) return;
        if (f.size > limitMb * 1024 * 1024) {
            toast.error(`Dosya ${limitMb} MB'dan küçük olmalı.`);
            return;
        }
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async () => {
        if (needsFile && !file && !linkUrl.trim()) {
            toast.error("Dosya seç veya link ekle.");
            return;
        }
        if (!needsFile && !content.trim()) { toast.error("İçerik yaz."); return; }

        setLoading(true);
        const supabase = createClient();
        let storage_path: string | null = null;

        if (file) {
            // İzin verilen uzantılar — güvenlik için whitelist
            const ALLOWED_IMAGE_EXT = new Set(["jpg", "jpeg", "png", "gif", "webp", "avif"]);
            const ALLOWED_VIDEO_EXT = new Set(["mp4", "mov", "webm"]);
            const rawExt = file.name.split(".").pop()?.toLowerCase() ?? "";
            const allowed = isVideo ? ALLOWED_VIDEO_EXT : ALLOWED_IMAGE_EXT;
            if (!allowed.has(rawExt)) {
                toast.error(`Desteklenmeyen dosya formatı. İzinliler: ${[...allowed].join(", ")}`);
                setLoading(false); return;
            }
            const path = `${userId}/${Date.now()}.${rawExt}`;
            const { error } = await supabase.storage.from("posts").upload(path, file, { cacheControl: "3600" });
            if (error) { toast.error("Yükleme hatası: " + error.message); setLoading(false); return; }
            storage_path = path;
        }

        // ref_url güvenlik kontrolü — sadece http/https kabul et
        const rawUrl = linkUrl.trim();
        let safeRefUrl: string | null = null;
        if (rawUrl) {
            try {
                const parsed = new URL(rawUrl);
                if (parsed.protocol === "http:" || parsed.protocol === "https:") {
                    safeRefUrl = rawUrl;
                } else {
                    toast.error("Geçersiz link — sadece http/https desteklenir.");
                    setLoading(false); return;
                }
            } catch {
                toast.error("Geçersiz link formatı.");
                setLoading(false); return;
            }
        }

        const { data, error } = await supabase
            .from("posts")
            .insert({
                user_id: userId,
                username,
                category,
                content: content.trim() || null,
                storage_path,
                description: description.trim() || null,
                ref_url: safeRefUrl,
            })
            .select()
            .single();

        if (error) { toast.error("Kayıt hatası: " + error.message); setLoading(false); return; }

        await supabase.from("activities").insert({
            user_id: userId,
            username,
            type: category === "resimler" ? "post_image" : category === "yazilar" ? "post_text" : "post_image",
            payload: { category },
        });

        onPost(data as Post);
        toast.success("Yayınlandı");
        onClose();
    };

    const linkPreviewActive = needsFile && linkUrl.trim() && !preview;

    const inputStyle = {
        background: "var(--bg-2)",
        border: "1px solid var(--border-2)",
        color: "var(--text-1)",
    } as React.CSSProperties;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
             style={{ background: "var(--overlay)", backdropFilter: "blur(8px)" }}
             onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-lg rounded-3xl overflow-hidden"
                 style={{ background: "rgba(20,30,58,0.92)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", border: "1px solid var(--border-1)" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b"
                     style={{ borderColor: "var(--border-3)" }}>
                    <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>Yeni Post</h2>
                    <button onClick={onClose} className="flex items-center justify-center transition-opacity hover:opacity-60"
                            style={{ color: "var(--text-3)" }}><X size={16} /></button>
                </div>

                <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">

                    {/* Kategori */}
                    <div>
                        <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--text-4)" }}>
                            Kategori
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                            {CATEGORIES.map((c) => (
                                <button key={c.id} onClick={() => { setCategory(c.id); setFile(null); setPreview(null); setLinkUrl(""); }}
                                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all duration-200"
                                        style={{
                                            background: category === c.id ? c.bg : "var(--bg-3)",
                                            border: `1px solid ${category === c.id ? c.border : "var(--border-3)"}`,
                                            color: category === c.id ? c.color : "var(--text-4)",
                                        }}>
                                    <c.icon size={16} strokeWidth={1.8} />
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dosya yükleme */}
                    {needsFile && (
                        <div>
                            <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--text-4)" }}>
                                Dosya <span style={{ color: "var(--text-5)" }}>(maks. {limitMb} MB)</span>
                            </p>
                            {preview ? (
                                <div className="relative rounded-xl overflow-hidden">
                                    {isVideo ? (
                                        <video src={preview} controls className="w-full rounded-xl max-h-48 object-contain" />
                                    ) : (
                                        <img src={preview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
                                    )}
                                    <button onClick={() => { setFile(null); setPreview(null); }}
                                            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                                            style={{ background: "var(--overlay)", color: "#fff" }}><X size={12} /></button>
                                </div>
                            ) : (
                                <button onClick={() => fileRef.current?.click()}
                                        className="w-full h-32 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200"
                                        style={{ border: "1.5px dashed var(--violet-border)", background: "var(--violet-bg)", color: "var(--violet-text)" }}>
                                    <span className="text-2xl">+</span>
                                    <span className="text-xs">Dosya seç</span>
                                </button>
                            )}
                            <input ref={fileRef} type="file" accept={isVideo ? "video/*" : "image/*"} className="hidden"
                                   onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
                        </div>
                    )}

                    {/* Link alanı */}
                    {needsFile && (
                        <div>
                            <p className="text-[10px] tracking-widest uppercase mb-2" style={{ color: "var(--text-4)" }}>
                                Link <span style={{ color: "var(--text-5)" }}>(opsiyonel)</span>
                            </p>
                            <input
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                                style={inputStyle}
                            />
                            {linkPreviewActive && (
                                <div className="mt-3 rounded-xl overflow-hidden">
                                    {getYoutubeId(linkUrl) ? (
                                        <div style={{ aspectRatio: "16/9" }}>
                                            <iframe
                                                src={`https://www.youtube.com/embed/${getYoutubeId(linkUrl)}`}
                                                className="w-full h-full rounded-xl"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        </div>
                                    ) : isImageUrl(linkUrl) ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={linkUrl} alt="link önizleme" className="w-full h-48 object-cover rounded-xl" />
                                    ) : (
                                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
                                             style={{ background: "var(--violet-bg)", border: "1px solid var(--violet-border)", color: "var(--violet-text)" }}>
                                            <ExternalLink size={12} />
                                            <span className="truncate">{linkUrl}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Metin içeriği */}
                    {!needsFile && (
                        <div>
                            <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--text-4)" }}>
                                İçerik
                            </p>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Ne paylaşmak istiyorsun?"
                                rows={5}
                                maxLength={2000}
                                className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none leading-relaxed"
                                style={inputStyle}
                            />
                            <p className="text-[10px] mt-1 text-right" style={{ color: "var(--text-4)" }}>
                                {content.length}/2000
                            </p>
                        </div>
                    )}

                    {/* Açıklama */}
                    <div>
                        <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "var(--text-4)" }}>
                            Açıklama <span style={{ color: "var(--text-5)" }}>(opsiyonel)</span>
                        </p>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Kısa bir açıklama..."
                            maxLength={200}
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                            style={inputStyle}
                        />
                    </div>

                    {/* Gönder */}
                    <button onClick={handleSubmit} disabled={loading}
                            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40"
                            style={{ background: "rgba(124,58,237,0.8)", color: "#fff", border: "1px solid rgba(124,58,237,0.5)" }}>
                        {loading ? (
                            <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : "Yayınla"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AkisClient({ userId, username, badges, initialPosts, initialLikesData, supabaseUrl }: {
    userId: string;
    username: string;
    badges: string[];
    initialPosts: Post[];
    initialLikesData: { post_id: string; user_id: string }[];
    supabaseUrl: string;
}) {
    const PAGE_SIZE = 20;

    const [posts, setPosts] = useState(initialPosts);
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [hasMore, setHasMore] = useState(initialPosts.length === PAGE_SIZE);
    const [loadingMore, setLoadingMore] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const postsRef = useRef(initialPosts);
    postsRef.current = posts;

    const buildLikesMap = (data: { post_id: string; user_id: string }[]) => {
        const map = new Map<string, { count: number; liked: boolean }>();
        for (const { post_id, user_id } of data) {
            const cur = map.get(post_id) ?? { count: 0, liked: false };
            map.set(post_id, {
                count: cur.count + 1,
                liked: cur.liked || user_id === userId,
            });
        }
        return map;
    };

    const [likesMap, setLikesMap] = useState(() => buildLikesMap(initialLikesData));
    const likesMapRef = useRef(likesMap);
    likesMapRef.current = likesMap;

    const handleLike = useCallback(async (postId: string) => {
        const cur = likesMapRef.current.get(postId) ?? { count: 0, liked: false };
        const newLiked = !cur.liked;
        setLikesMap((prev) => {
            const next = new Map(prev);
            next.set(postId, { count: cur.count + (newLiked ? 1 : -1), liked: newLiked });
            return next;
        });
        const supabase = createClient();
        if (newLiked) {
            await supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
        } else {
            await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId);
        }
    }, [userId]);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const supabase = createClient();
        const oldest = postsRef.current[postsRef.current.length - 1]?.created_at;

        const postsQuery = supabase
            .from("posts")
            .select("id, user_id, username, category, content, storage_path, description, created_at, ref_url")
            .order("created_at", { ascending: false })
            .lt("created_at", oldest)
            .limit(PAGE_SIZE);

        // İlk olarak postları çek, sonra likes'ı paralel olmak zorunda değil —
        // ama postIds olmadan likes çekemeyiz, o yüzden posts önce gelir.
        const { data: newPosts } = await postsQuery;

        if (!newPosts || newPosts.length === 0) { setHasMore(false); setLoadingMore(false); return; }

        const postIds = newPosts.map((p) => p.id);
        const { data: likes } = await supabase.from("post_likes").select("post_id, user_id").in("post_id", postIds);
        setLikesMap((prev) => {
            const next = new Map(prev);
            for (const { post_id, user_id } of likes ?? []) {
                const cur = next.get(post_id) ?? { count: 0, liked: false };
                next.set(post_id, { count: cur.count + 1, liked: cur.liked || user_id === userId });
            }
            return next;
        });
        setPosts((prev) => [...prev, ...(newPosts as Post[])]);
        if (newPosts.length < PAGE_SIZE) setHasMore(false);
        setLoadingMore(false);
    }, [loadingMore, hasMore, userId]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadMore(); }, { rootMargin: "200px" });
        observer.observe(el);
        return () => observer.disconnect();
    }, [loadMore]);

    const handlePost = useCallback((post: Post) => {
        setPosts((prev) => [post, ...prev]);
    }, []);

    const handleDelete = useCallback((id: string) => {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }, []);

    const handleEditSave = useCallback((updated: Post) => {
        setPosts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    }, []);

    // Realtime — başkalarının yaptığı paylaşımları/silmeleri/güncellemeleri anlık yansıt
    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel("posts-realtime")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, (payload) => {
                const newPost = payload.new as Post;
                // Kendi paylaşımımızı handlePost zaten ekliyor, duplicate önle
                setPosts((prev) => prev.some((p) => p.id === newPost.id) ? prev : [newPost, ...prev]);
            })
            .on("postgres_changes", { event: "DELETE", schema: "public", table: "posts" }, (payload) => {
                setPosts((prev) => prev.filter((p) => p.id !== (payload.old as Post).id));
            })
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "posts" }, (payload) => {
                setPosts((prev) => prev.map((p) => p.id === (payload.new as Post).id ? payload.new as Post : p));
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    return (
        <div className="aurora-bg relative min-h-screen flex flex-col">
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4">
                <NavbarBackdrop />
                <Link href="/" className="group flex items-baseline gap-0.5 shrink-0 relative z-10">
                    <span className="text-sm font-bold" style={{ color: "var(--text-3)" }}>bumedya</span>
                    <span className="text-sm font-bold transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.9)]"
                          style={{ color: "var(--violet)" }}>.</span>
                </Link>
                <HomeNavLinks />
                <div className="relative z-10 flex items-center gap-2">
                    <button onClick={() => setShowModal(true)}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                            style={{ background: "var(--violet-bg-md)", border: "1px solid var(--violet-border)", color: "var(--violet-text)" }}>
                        <span className="text-sm leading-none">+</span> Paylaş
                    </button>
                    <NotificationBell userId={userId} />
                    <Link href="/profil"
                          className="text-xs px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 max-w-[80px] sm:max-w-none truncate"
                          style={{ color: "var(--violet-text)", border: "1px solid var(--violet-border)", background: "var(--violet-bg)" }}>
                        @{username}
                    </Link>
                </div>
            </nav>

            {/* Feed */}
            <div className="relative z-10 max-w-xl mx-auto w-full px-4 pt-24 pb-8 flex flex-col gap-4">
                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Sparkles size={36} className="opacity-10" />
                        <p className="text-sm" style={{ color: "var(--text-4)" }}>Henüz paylaşım yok.</p>
                        <button onClick={() => setShowModal(true)}
                                className="mt-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
                                style={{ background: "var(--violet-bg-md)", border: "1px solid var(--violet-border)", color: "var(--violet-text)" }}>
                            İlk paylaşımı yap
                        </button>
                    </div>
                ) : (
                    <>
                        {posts.map((post) => {
                            const likes = likesMap.get(post.id) ?? { count: 0, liked: false };
                            return (
                                <PostCard key={post.id} post={post} supabaseUrl={supabaseUrl}
                                          userId={userId} onDelete={handleDelete}
                                          likeCount={likes.count} likedByMe={likes.liked}
                                          onLike={handleLike} onEdit={setEditingPost} />
                            );
                        })}
                        <div ref={sentinelRef} className="flex justify-center py-6">
                            {loadingMore && (
                                <span className="w-5 h-5 rounded-full border-2 border-white/10 border-t-purple-500 animate-spin" />
                            )}
                            {!hasMore && posts.length > 0 && (
                                <p className="text-xs" style={{ color: "var(--text-5)" }}>Hepsi bu kadar.</p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {showModal && (
                <UploadModal
                    onClose={() => setShowModal(false)}
                    onPost={handlePost}
                    userId={userId}
                    username={username}
                />
            )}

            {editingPost && (
                <EditModal
                    post={editingPost}
                    onClose={() => setEditingPost(null)}
                    onSave={handleEditSave}
                />
            )}
        </div>
    );
}
