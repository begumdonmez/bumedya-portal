"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Image as ImageIcon, X, ExternalLink, Link2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import PageHeader from "@/components/PageHeader";
import { GalleryImage, Lightbox, YoutubeLite, compressImage } from "./media";
import { GALLERY_COLUMNS, GALLERY_PAGE_SIZE } from "./config";
import { sfx } from "@/lib/sfx";

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
            const upload = await compressImage(file);
            const ext = upload.name.split(".").pop();
            const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
            // Dosya adı benzersiz → içerik değişmez, tarayıcı/CDN 1 yıl önbellekleyebilir
            const { error: uploadError } = await supabase.storage
                .from("gallery")
                .upload(path, upload, { cacheControl: "31536000", upsert: false, contentType: upload.type });
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
                                        style={{ background: "var(--overlay)", color: "var(--on-accent)" }}><X size={12} /></button>
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
                            style={{ background: "color-mix(in srgb, var(--accent) 80%, transparent)", color: "var(--on-accent)", border: "1px solid color-mix(in srgb, var(--accent) 50%, transparent)" }}>
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
    const [hasMore, setHasMore] = useState(initialItems.length === GALLERY_PAGE_SIZE);
    const [viewer, setViewer] = useState<number | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadMore = async () => {
        setLoadingMore(true);
        const { data, error } = await createClient()
            .from("gallery_items")
            .select(GALLERY_COLUMNS)
            .order("created_at", { ascending: false })
            .range(items.length, items.length + GALLERY_PAGE_SIZE - 1);
        setLoadingMore(false);
        if (error) { toast.error("Daha fazla eser yüklenemedi."); return; }
        const next = (data ?? []) as GalleryItem[];
        setItems(prev => [...prev, ...next.filter(n => !prev.some(p => p.id === n.id))]);
        setHasMore(next.length === GALLERY_PAGE_SIZE);
    };
    const [showModal, setShowModal] = useState(false);
    const [errorIds, setErrorIds] = useState<Set<string>>(new Set());
    // Görüntüleyicide gezilebilen görseller: yalnızca dosyası olan ve hatasız yüklenenler
    const viewable = items.filter(i => i.storage_path && !errorIds.has(i.id));
    const lightboxImages = viewable.map(i => ({
        src: getPublicUrl(supabaseUrl, i.storage_path), alt: i.title ?? "Galeri görseli", href: i.ref_url, author: i.username,
    }));
    const openViewer = (id: string) => { sfx.paper(); setViewer(viewable.findIndex(v => v.id === id)); };

    const isAdmin = badges.includes("admin");
    const canUpload = isAdmin;

    const handleUploaded = useCallback((item: GalleryItem) => {
        setItems((prev) => [item, ...prev]);
    }, []);

    const handleDelete = async (item: GalleryItem) => {
        if (!isAdmin) return;
        const name = item.title ? `“${item.title}”` : "Bu eser";
        if (!window.confirm(`${name} galeriden kalıcı olarak silinecek. Emin misin?`)) return;
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
            <SiteHeader userId={userId} username={username} />

            {/* Grid */}
            <div className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-8 pt-24 sm:pt-28 pb-10">
                <PageHeader eyebrow="Görsel bellek" title="Galeri" description="Etkinliklerden fotoğraflar, çizimler, tasarımlar."
                            actions={<>{canUpload && <button onClick={() => setShowModal(true)} className="btn-primary">+ Yükle</button>}</>} className="!mb-2" />
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
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3 [&>*]:mb-3 [&>*]:break-inside-avoid">
                                {items.map((item) => {
                                    const hasFile = !!item.storage_path;
                                    const url = hasFile ? getPublicUrl(supabaseUrl, item.storage_path) : null;
                                    const hasError = errorIds.has(item.id);

                                    if (!hasFile && item.ref_url) {
                                        const ytId = getYoutubeId(item.ref_url);
                                        return (
                                            <div key={item.id} className="card relative group rounded-2xl overflow-hidden">
                                                {ytId ? (
                                                    <YoutubeLite id={ytId} title={item.title} />
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
                                                    <GalleryImage src={url} alt={item.title ?? "Galeri görseli"} onOpen={() => openViewer(item.id)} onError={() => setErrorIds((prev) => new Set(prev).add(item.id))} />
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
                )}
                {hasMore && (
                    <div className="flex justify-center mt-10">
                        <button type="button" onClick={loadMore} disabled={loadingMore} className="btn-ghost">
                            {loadingMore ? "Yükleniyor…" : "Daha fazla göster"}
                        </button>
                    </div>
                )}
            </div>

            {viewer !== null && viewer >= 0 && (
                <Lightbox images={lightboxImages} index={viewer} onClose={() => setViewer(null)} onIndex={i => { sfx.pageTurn(); setViewer(i); }} />
            )}

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
