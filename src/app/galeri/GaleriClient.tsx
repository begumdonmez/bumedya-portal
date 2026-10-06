"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Image as ImageIcon, X, ExternalLink, Link2 } from "lucide-react";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import HomeNavLinks from "@/components/HomeNavLinks";
import NotificationBell from "@/components/NotificationBell";
import SiteHeader from "@/components/SiteHeader";

interface GalleryItem {
    id: string;
    user_id: string;
    username: string;
    title: string | null;
    storage_path: string;
    created_at: string;
    ref_url?: string | null;
}

function getPublicUrl(supabaseUrl: string, path: string) {
    return `${supabaseUrl}/storage/v1/object/public/gallery/${path}`;
}

function isImageUrl(url: string) {
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
}
function getYoutubeId(url: string) {
    const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return m?.[1] ?? null;
}

function UploadModal({ onClose, onUploaded, userId, username }: {
    onClose: () => void;
    onUploaded: (item: GalleryItem) => void;
    userId: string;
    username: string;
}) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = (f: File | null) => {
        if (!f) return;
        if (!f.type.startsWith("image/")) {
            toast.error("Sadece resim dosyası yükleyebilirsin.");
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            toast.error("Dosya 5 MB'dan küçük olmalı.");
            return;
        }
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleSubmit = async () => {
        if (!file && !linkUrl.trim()) {
            toast.error("Resim seç veya link ekle.");
            return;
        }
        setLoading(true);
        const supabase = createClient();
        let storage_path = "";

        if (file) {
            const ext = file.name.split(".").pop();
            const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from("gallery")
                .upload(path, file, { cacheControl: "3600", upsert: false });
            if (uploadError) {
                toast.error(`Yükleme hatası: ${uploadError.message}`);
                setLoading(false);
                return;
            }
            storage_path = path;
        }

        const { data: inserted, error: dbError } = await supabase
            .from("gallery_items")
            .insert({
                user_id: userId,
                username,
                storage_path,
                title: title.trim() || null,
                ref_url: linkUrl.trim() || null,
            })
            .select()
            .single();

        if (dbError) {
            toast.error(`Kayıt hatası: ${dbError.message}`);
            setLoading(false);
            return;
        }

        await supabase.from("activities").insert({
            user_id: userId,
            username,
            type: "gallery_upload",
            payload: { storage_path },
        });

        onUploaded(inserted);
        toast.success("Yüklendi.");
        onClose();
    };

    const linkPreviewActive = linkUrl.trim() && !preview;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
             style={{ background: "var(--overlay)" }}
             onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-lg rounded-2xl overflow-hidden"
                 style={{ background: "color-mix(in srgb, var(--surface-solid) 92%, transparent)", border: "1px solid var(--border-1)" }}>

                <div className="flex items-center justify-between px-6 py-5 border-b"
                     style={{ borderColor: "var(--border-3)" }}>
                    <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>Galeriye Ekle</h2>
                    <button onClick={onClose} className="flex items-center justify-center transition-opacity hover:opacity-60"
                            style={{ color: "var(--text-3)" }}><X size={16} /></button>
                </div>

                <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">

                    {/* Dosya */}
                    <div>
                        <p className="label-caps mb-3" style={{ color: "var(--text-4)" }}>
                            Resim <span style={{ color: "var(--text-5)" }}>(maks. 5 MB)</span>
                        </p>
                        {preview ? (
                            <div className="relative rounded-xl overflow-hidden">
                                <img loading="lazy" decoding="async" src={preview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
                                <button onClick={() => { setFile(null); setPreview(null); }}
                                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                                        style={{ background: "var(--overlay)", color: "#fff" }}><X size={12} /></button>
                            </div>
                        ) : (
                            <button onClick={() => fileRef.current?.click()}
                                    className="w-full h-32 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-200"
                                    style={{ border: "1.5px dashed var(--accent-border)", background: "var(--accent-bg)", color: "var(--accent-text)" }}>
                                <span className="text-2xl">+</span>
                                <span className="text-xs">Resim seç</span>
                            </button>
                        )}
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                               onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
                    </div>

                    {/* Link */}
                    <div>
                        <p className="label-caps mb-2" style={{ color: "var(--text-4)" }}>
                            Link <span style={{ color: "var(--text-5)" }}>(opsiyonel)</span>
                        </p>
                        <input
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                            style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-1)" }}
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
                                    <img loading="lazy" decoding="async" src={linkUrl} alt="link önizleme" className="w-full h-48 object-cover rounded-xl" />
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
                                         style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-bg-md)", color: "var(--accent-text)" }}>
                                        <ExternalLink size={12} />
                                        <span className="truncate">{linkUrl}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Başlık */}
                    <div>
                        <p className="label-caps mb-2" style={{ color: "var(--text-4)" }}>
                            Başlık <span style={{ color: "var(--text-5)" }}>(opsiyonel)</span>
                        </p>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Eser başlığı..."
                            maxLength={100}
                            className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                            style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-1)" }}
                        />
                    </div>

                    <button onClick={handleSubmit} disabled={loading}
                            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40"
                            style={{ background: "color-mix(in srgb, var(--accent) 80%, transparent)", color: "#fff", border: "1px solid color-mix(in srgb, var(--accent) 50%, transparent)" }}>
                        {loading ? (
                            <span className="inline-block w-4 h-4 rounded-full border-2 border-[color-mix(in_srgb,var(--fg)_30%,transparent)] border-t-[var(--on-accent)] animate-spin" />
                        ) : "Ekle"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function GaleriClient({
    userId,
    username,
    role,
    badges,
    items: initialItems,
    supabaseUrl,
}: {
    userId: string;
    username: string;
    role: string;
    badges: string[];
    items: GalleryItem[];
    supabaseUrl: string;
}) {
    const [items, setItems] = useState(initialItems);
    const [showModal, setShowModal] = useState(false);
    const [errorIds, setErrorIds] = useState<Set<string>>(new Set());
    const [numCols, setNumCols] = useState(4);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        const update = () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const w = window.innerWidth;
                setNumCols(w < 640 ? 1 : w < 768 ? 2 : w < 1024 ? 3 : 4);
            }, 150);
        };
        update();
        window.addEventListener("resize", update);
        return () => { window.removeEventListener("resize", update); clearTimeout(timer); };
    }, []);

    const masonryCols = useMemo(() => {
        const cols: typeof items[] = Array.from({ length: numCols }, () => []);
        items.forEach((item, i) => cols[i % numCols].push(item));
        return cols;
    }, [items, numCols]);

    const isAdmin = badges.includes("admin");
    const canUpload = isAdmin;

    const handleUploaded = useCallback((item: GalleryItem) => {
        setItems((prev) => [item, ...prev]);
    }, []);

    const handleDelete = async (item: GalleryItem) => {
        if (!isAdmin) return;
        const supabase = createClient();

        if (item.storage_path) {
            await supabase.storage.from("gallery").remove([item.storage_path]);
        }
        await supabase.from("gallery_items").delete().eq("id", item.id);

        setItems((prev) => prev.filter((i) => i.id !== item.id));
        toast.success("Silindi.");
    };

    return (
        <div className="relative min-h-screen flex flex-col">

            {/* Navbar */}
            <SiteHeader userId={userId} username={username}
                actions={<>
                    {canUpload && (
                        <button onClick={() => setShowModal(true)}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                                style={{ background: "var(--accent-bg-md)", border: "1px solid var(--accent-border)", color: "var(--accent-text)" }}>
                            <span>+</span> Yükle
                        </button>
                    )}
                </>}
            />

            {/* Grid */}
            <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-24 pb-10">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <ImageIcon size={36} className="opacity-10" />
                        <p className="text-sm" style={{ color: "var(--text-4)" }}>
                            {canUpload ? "Henüz eser yok. İlk yükleyen sen ol." : "Henüz eser yok."}
                        </p>
                        {canUpload && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
                                style={{
                                    background: "var(--accent-bg-md)",
                                    border: "1px solid var(--accent-border)",
                                    color: "var(--accent-text)",
                                }}>
                                Eser Ekle
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex gap-3 items-start">
                        {masonryCols.map((col, ci) => (
                            <div key={ci} className="flex-1 flex flex-col gap-3 min-w-0">
                                {col.map((item) => {
                                    const hasFile = !!item.storage_path;
                                    const url = hasFile ? getPublicUrl(supabaseUrl, item.storage_path) : null;
                                    const hasError = errorIds.has(item.id);

                                    if (!hasFile && item.ref_url) {
                                        const ytId = getYoutubeId(item.ref_url);
                                        return (
                                            <div key={item.id} className="card relative group rounded-2xl overflow-hidden">
                                                {ytId ? (
                                                    <div style={{ aspectRatio: "16/9" }}>
                                                        <iframe
                                                            src={`https://www.youtube.com/embed/${ytId}`}
                                                            className="w-full h-full"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        />
                                                    </div>
                                                ) : isImageUrl(item.ref_url) ? (
                                                    <a href={item.ref_url} target="_blank" rel="noopener noreferrer">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img loading="lazy" decoding="async" src={item.ref_url} alt={item.title ?? "eser"} className="w-full h-auto block" />
                                                    </a>
                                                ) : (
                                                    <a href={item.ref_url} target="_blank" rel="noopener noreferrer"
                                                       className="flex items-center gap-3 px-4 py-5 transition-all duration-200"
                                                       style={{ color: "var(--accent-text)" }}>
                                                        <Link2 size={20} className="shrink-0 opacity-50" />
                                                        <div className="min-w-0">
                                                            {item.title && <p className="text-xs font-medium mb-0.5" style={{ color: "var(--text-1)" }}>{item.title}</p>}
                                                            <p className="text-[11px] truncate" style={{ color: "var(--text-3)" }}>{item.ref_url}</p>
                                                        </div>
                                                        <ExternalLink size={12} className="shrink-0 ml-auto opacity-40" />
                                                    </a>
                                                )}
                                                <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                     style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--surface-solid) 88%, transparent) 0%, transparent 60%)" }}>
                                                    <div className="flex items-center justify-between">
                                                        <Link href={`/profil/${item.username}`}
                                                              className="text-[11px] font-medium"
                                                              style={{ color: "var(--text-2)" }}>
                                                            @{item.username}
                                                        </Link>
                                                        {isAdmin && (
                                                            <button onClick={() => handleDelete(item)}
                                                                    className="text-[11px] px-2 py-1 rounded-lg transition-all duration-200"
                                                                    style={{ background: "color-mix(in srgb, var(--danger) 15%, transparent)", border: "1px solid color-mix(in srgb, var(--danger) 20%, transparent)", color: "color-mix(in srgb, var(--danger) 80%, transparent)" }}>
                                                                Sil
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={item.id} className="card relative group rounded-2xl overflow-hidden">
                                            {hasError ? (
                                                <div className="flex flex-col items-center justify-center min-h-[140px] gap-2 py-8"
                                                     style={{ background: "color-mix(in srgb, var(--danger) 4%, transparent)" }}>
                                                    <X size={18} className="opacity-20" />
                                                    <span className="text-[11px]" style={{ color: "var(--text-4)" }}>Yüklenemedi</span>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => handleDelete(item)}
                                                            className="mt-1 text-[11px] px-2 py-1 rounded-lg"
                                                            style={{
                                                                background: "color-mix(in srgb, var(--danger) 12%, transparent)",
                                                                border: "1px solid color-mix(in srgb, var(--danger) 20%, transparent)",
                                                                color: "color-mix(in srgb, var(--danger) 70%, transparent)",
                                                            }}>
                                                            Sil
                                                        </button>
                                                    )}
                                                </div>
                                            ) : url ? (
                                                <>
                                                    {item.ref_url ? (
                                                        <a href={item.ref_url} target="_blank" rel="noopener noreferrer" className="block">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img loading="lazy" decoding="async"
                                                                src={url}
                                                                alt={item.title ?? "Galeri görseli"}
                                                                className="w-full h-auto block"
                                                                onError={() => setErrorIds((prev) => new Set(prev).add(item.id))}
                                                            />
                                                        </a>
                                                    ) : (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img loading="lazy" decoding="async"
                                                            src={url}
                                                            alt={item.title ?? "Galeri görseli"}
                                                            className="w-full h-auto block"
                                                            onError={() => setErrorIds((prev) => new Set(prev).add(item.id))}
                                                        />
                                                    )}
                                                    <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                         style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--surface-solid) 88%, transparent) 0%, transparent 60%)" }}>
                                                        <div className="flex items-center justify-between">
                                                            <Link href={`/profil/${item.username}`}
                                                                  className="text-[11px] font-medium"
                                                                  style={{ color: "var(--text-2)" }}>
                                                                @{item.username}
                                                            </Link>
                                                            <div className="flex items-center gap-2">
                                                                {item.ref_url && (
                                                                    <a href={item.ref_url} target="_blank" rel="noopener noreferrer"
                                                                       className="text-[11px] px-2 py-1 rounded-lg"
                                                                       style={{ background: "var(--accent-border)", border: "1px solid var(--accent-border)", color: "var(--accent-text)" }}
                                                                       onClick={(e) => e.stopPropagation()}>
                                                                        <ExternalLink size={10} />
                                                                    </a>
                                                                )}
                                                                {isAdmin && (
                                                                    <button
                                                                        onClick={() => handleDelete(item)}
                                                                        className="text-[11px] px-2 py-1 rounded-lg transition-all duration-200"
                                                                        style={{
                                                                            background: "color-mix(in srgb, var(--danger) 15%, transparent)",
                                                                            border: "1px solid color-mix(in srgb, var(--danger) 20%, transparent)",
                                                                            color: "color-mix(in srgb, var(--danger) 80%, transparent)",
                                                                        }}>
                                                                        Sil
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <UploadModal
                    onClose={() => setShowModal(false)}
                    onUploaded={handleUploaded}
                    userId={userId}
                    username={username}
                />
            )}
        </div>
    );
}
