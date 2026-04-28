"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export interface Post {
    id: string;
    user_id: string;
    username: string;
    category: "resimler" | "yazilar" | "editler" | "diger";
    content: string | null;
    storage_path: string | null;
    description: string | null;
    created_at: string;
}

const CATEGORIES = [
    { id: "resimler", label: "Resimler", icon: "🖼",  color: "rgba(244,114,182,0.9)", bg: "rgba(244,114,182,0.08)", border: "rgba(244,114,182,0.2)" },
    { id: "yazilar",  label: "Yazılar",  icon: "📝",  color: "rgba(52,211,153,0.9)",  bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.2)"  },
    { id: "editler",  label: "Editler",  icon: "🎬",  color: "rgba(167,139,250,0.9)", bg: "rgba(124,58,237,0.08)",  border: "rgba(124,58,237,0.2)"  },
    { id: "diger",    label: "Diğer",    icon: "✦",   color: "rgba(147,197,253,0.9)", bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.2)"  },
] as const;

type CategoryId = typeof CATEGORIES[number]["id"];

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "az önce";
    if (mins < 60) return `${mins} dk`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} sa`;
    return `${Math.floor(hrs / 24)} gün`;
}

function CategoryBadge({ id }: { id: string }) {
    const conf = CATEGORIES.find((c) => c.id === id);
    if (!conf) return null;
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}>
            {conf.icon} {conf.label}
        </span>
    );
}

function PostCard({ post, supabaseUrl, userId, onDelete }: {
    post: Post;
    supabaseUrl: string;
    userId: string;
    onDelete: (id: string) => void;
}) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const isOwn = post.user_id === userId;
    const imageUrl = post.storage_path
        ? `${supabaseUrl}/storage/v1/object/public/posts/${post.storage_path}`
        : null;

    const handleDelete = async () => {
        const supabase = createClient();
        if (post.storage_path) {
            await supabase.storage.from("posts").remove([post.storage_path]);
        }
        await supabase.from("posts").delete().eq("id", post.id);
        onDelete(post.id);
        toast.success("Post silindi.");
    };

    return (
        <div className="card rounded-2xl overflow-hidden transition-all duration-300">

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-3">
                    <Link href={`/profil/${post.username}`}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                             style={{
                                 background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(59,130,246,0.2))",
                                 border: "1px solid rgba(124,58,237,0.2)",
                                 color: "#E0F2FE",
                             }}>
                            {post.username[0].toUpperCase()}
                        </div>
                    </Link>
                    <div>
                        <Link href={`/profil/${post.username}`}
                              className="text-sm font-medium hover:opacity-80 transition-opacity"
                              style={{ color: "#E0F2FE" }}>
                            @{post.username}
                        </Link>
                        <p className="text-[10px]" style={{ color: "rgba(224,242,254,0.25)" }}>
                            {timeAgo(post.created_at)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <CategoryBadge id={post.category} />
                    {isOwn && (
                        <button onClick={handleDelete}
                                className="text-[10px] px-2 py-1 rounded-lg transition-all duration-200"
                                style={{ color: "rgba(239,68,68,0.6)", border: "1px solid rgba(239,68,68,0.1)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                            Sil
                        </button>
                    )}
                </div>
            </div>

            {/* Görsel */}
            {imageUrl && (
                <div className="relative mx-4 mb-3 rounded-xl overflow-hidden">
                    {!imgLoaded && (
                        <div className="w-full h-48 animate-pulse rounded-xl"
                             style={{ background: "rgba(124,58,237,0.08)" }} />
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
            )}

            {/* Yazı içeriği */}
            {post.content && (
                <div className="px-4 mb-3">
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(224,242,254,0.8)" }}>
                        {post.content}
                    </p>
                </div>
            )}

            {/* Açıklama */}
            {post.description && (
                <div className="px-4 pb-4">
                    <p className="text-xs" style={{ color: "rgba(224,242,254,0.4)" }}>
                        {post.description}
                    </p>
                </div>
            )}

            {!post.content && !post.description && <div className="pb-2" />}
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
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const needsFile = category === "resimler" || category === "editler";

    const handleFile = (f: File | null) => {
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async () => {
        if (needsFile && !file) { toast.error("Dosya seç."); return; }
        if (!needsFile && !content.trim()) { toast.error("İçerik yaz."); return; }

        setLoading(true);
        const supabase = createClient();
        let storage_path: string | null = null;

        if (file) {
            const ext = file.name.split(".").pop();
            const path = `${userId}/${Date.now()}.${ext}`;
            const { error } = await supabase.storage.from("posts").upload(path, file, { cacheControl: "3600" });
            if (error) { toast.error("Yükleme hatası: " + error.message); setLoading(false); return; }
            storage_path = path;
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
        toast.success("Yayınlandı ✦");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
             style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
             onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-lg rounded-3xl overflow-hidden"
                 style={{ background: "rgba(20,30,58,0.92)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", border: "1px solid rgba(255,255,255,0.1)" }}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b"
                     style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <h2 className="text-sm font-semibold" style={{ color: "#E0F2FE" }}>Yeni Post</h2>
                    <button onClick={onClose} className="text-lg leading-none transition-opacity hover:opacity-60"
                            style={{ color: "rgba(224,242,254,0.4)" }}>✕</button>
                </div>

                <div className="p-6 flex flex-col gap-5">

                    {/* Kategori */}
                    <div>
                        <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "rgba(224,242,254,0.25)" }}>
                            Kategori
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                            {CATEGORIES.map((c) => (
                                <button key={c.id} onClick={() => setCategory(c.id)}
                                        className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all duration-200"
                                        style={{
                                            background: category === c.id ? c.bg : "rgba(255,255,255,0.02)",
                                            border: `1px solid ${category === c.id ? c.border : "rgba(255,255,255,0.06)"}`,
                                            color: category === c.id ? c.color : "rgba(224,242,254,0.3)",
                                        }}>
                                    <span className="text-base">{c.icon}</span>
                                    {c.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dosya yükleme */}
                    {needsFile && (
                        <div>
                            <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "rgba(224,242,254,0.25)" }}>
                                Dosya
                            </p>
                            {preview ? (
                                <div className="relative rounded-xl overflow-hidden">
                                    <img src={preview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
                                    <button onClick={() => { setFile(null); setPreview(null); }}
                                            className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                                            style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>✕</button>
                                </div>
                            ) : (
                                <button onClick={() => fileRef.current?.click()}
                                        className="w-full h-32 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200"
                                        style={{ border: "1.5px dashed rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.04)", color: "rgba(167,139,250,0.6)" }}>
                                    <span className="text-2xl">+</span>
                                    <span className="text-xs">Dosya seç</span>
                                </button>
                            )}
                            <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden"
                                   onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
                        </div>
                    )}

                    {/* Metin içeriği */}
                    {!needsFile && (
                        <div>
                            <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "rgba(224,242,254,0.25)" }}>
                                İçerik
                            </p>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Ne paylaşmak istiyorsun?"
                                rows={5}
                                maxLength={2000}
                                className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none leading-relaxed"
                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#E0F2FE" }}
                            />
                            <p className="text-[10px] mt-1 text-right" style={{ color: "rgba(224,242,254,0.2)" }}>
                                {content.length}/2000
                            </p>
                        </div>
                    )}

                    {/* Açıklama */}
                    <div>
                        <p className="text-[10px] tracking-widest uppercase mb-3" style={{ color: "rgba(224,242,254,0.25)" }}>
                            Açıklama <span style={{ color: "rgba(224,242,254,0.15)" }}>(opsiyonel)</span>
                        </p>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Kısa bir açıklama..."
                            maxLength={200}
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#E0F2FE" }}
                        />
                    </div>

                    {/* Gönder */}
                    <button onClick={handleSubmit} disabled={loading}
                            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40"
                            style={{ background: "rgba(124,58,237,0.8)", color: "#fff", border: "1px solid rgba(124,58,237,0.5)" }}>
                        {loading ? (
                            <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        ) : "Yayınla ✦"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AkisClient({ userId, username, badges, initialPosts, supabaseUrl }: {
    userId: string;
    username: string;
    badges: string[];
    initialPosts: Post[];
    supabaseUrl: string;
}) {
    const [posts, setPosts] = useState(initialPosts);
    const [showModal, setShowModal] = useState(false);

    const handlePost = useCallback((post: Post) => {
        setPosts((prev) => [post, ...prev]);
    }, []);

    const handleDelete = useCallback((id: string) => {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }, []);

    return (
        <div className="aurora-bg relative min-h-screen flex flex-col">
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />

            {/* Navbar */}
            <nav className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 border-b nav-backdrop"
                 style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3">
                    <Link href="/home" className="text-xs px-2 py-1 rounded-lg transition-colors duration-200"
                          style={{ color: "rgba(240,249,255,0.28)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(240,249,255,0.7)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,249,255,0.28)")}>
                        ←
                    </Link>
                    <Link href="/home" className="flex items-baseline gap-0.5 group">
                        <span className="text-sm font-bold" style={{ color: "rgba(240,249,255,0.5)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "#7C3AED" }}>.</span>
                    </Link>
                    <span style={{ color: "rgba(255,255,255,0.12)" }}>/</span>
                    <span className="text-sm font-medium" style={{ color: "rgba(240,249,255,0.55)" }}>Akış</span>
                </div>
                <button onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200"
                        style={{ background: "rgba(124,58,237,0.14)", border: "1px solid rgba(124,58,237,0.3)", color: "rgba(167,139,250,0.95)" }}>
                    <span className="text-base leading-none">+</span> Paylaş
                </button>
            </nav>

            {/* Feed */}
            <div className="relative z-10 max-w-xl mx-auto w-full px-4 py-8 flex flex-col gap-4">
                {posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <span className="text-4xl opacity-10">✦</span>
                        <p className="text-sm" style={{ color: "rgba(224,242,254,0.25)" }}>Henüz paylaşım yok.</p>
                        <button onClick={() => setShowModal(true)}
                                className="mt-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
                                style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "rgba(167,139,250,0.8)" }}>
                            İlk paylaşımı yap
                        </button>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} supabaseUrl={supabaseUrl}
                                  userId={userId} onDelete={handleDelete} />
                    ))
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
        </div>
    );
}
