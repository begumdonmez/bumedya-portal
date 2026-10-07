"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";

const GRID_SIZES = "(min-width:1024px) 300px, (min-width:768px) 33vw, (min-width:640px) 50vw, 100vw";

/**
 * Supabase Storage görseli — next/image üzerinden cihaz boyutunda AVIF/WebP olarak sunulur.
 * Gerçek oranı bilinmediği için genişlik sabit, yükseklik otomatik.
 */
export function GalleryImage({ src, alt, onError, onOpen }: { src: string; alt: string; onError?: () => void; onOpen?: () => void }) {
    const img = (
        <Image src={src} alt={alt} width={640} height={640} sizes={GRID_SIZES}
               className="w-full h-auto block" style={{ height: "auto" }}
               onError={onError} />
    );
    if (!onOpen) return img;
    return (
        <button type="button" onClick={onOpen} aria-label={`Büyüt: ${alt}`} className="block w-full cursor-zoom-in">
            {img}
        </button>
    );
}

/** YouTube cephesi: önce yalnızca küçük resim, iframe tıklanınca yüklenir (~1 MB JS tasarrufu). */
export function YoutubeLite({ id, title }: { id: string; title?: string | null }) {
    const [play, setPlay] = useState(false);
    if (play) {
        return (
            <div style={{ aspectRatio: "16/9" }}>
                <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`}
                        title={title ?? "YouTube videosu"} className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen />
            </div>
        );
    }
    return (
        <button type="button" onClick={() => setPlay(true)} aria-label={`Videoyu oynat${title ? `: ${title}` : ""}`}
                className="group/yt relative block w-full" style={{ aspectRatio: "16/9" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- küçük, sabit boyutlu YouTube küçük resmi */}
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async"
                 className="absolute inset-0 w-full h-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover/yt:scale-110"
                      style={{ background: "var(--accent)", color: "var(--on-accent)" }}>
                    <Play size={22} fill="currentColor" />
                </span>
            </span>
        </button>
    );
}

/**
 * Yüklemeden önce görseli tarayıcıda küçültür: en uzun kenar 2048px, WebP %85.
 * Telefon fotoğrafları ~5 MB → ~400 KB. GIF/SVG ve zaten küçük dosyalar olduğu gibi kalır.
 */
export async function compressImage(file: File): Promise<File> {
    if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type) || file.size < 400_000) return file;
    try {
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height));
        const w = Math.round(bitmap.width * scale);
        const h = Math.round(bitmap.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
        bitmap.close();
        const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, "image/webp", 0.85));
        if (!blob || blob.size >= file.size) return file;
        return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
    } catch {
        return file; // tarayıcı desteklemiyorsa orijinali yükle
    }
}

/** Tam ekran görüntüleyici: ←/→ ile gezinme, Esc ile kapanma, dışarı tıklayınca kapanır. */
export function Lightbox({ images, index, onClose, onIndex }: {
    images: { src: string; alt: string; href?: string | null; author?: string }[];
    index: number;
    onClose: () => void;
    onIndex: (i: number) => void;
}) {
    const img = images[index];
    const go = (d: number) => onIndex((index + d + images.length) % images.length);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
            if (e.key === "ArrowLeft") onIndex((index - 1 + images.length) % images.length);
        };
        window.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
    }, [index, images.length, onClose, onIndex]);

    if (!img) return null;
    return (
        <div role="dialog" aria-modal="true" aria-label="Görsel görüntüleyici"
             className="fixed inset-0 z-[100] flex flex-col" style={{ background: "color-mix(in srgb, #000 92%, transparent)" }}
             onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-white/80 text-sm">
                <span className="truncate">{img.author ? `@${img.author}` : ""} {img.alt && img.alt !== "Galeri görseli" ? `· ${img.alt}` : ""}</span>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs">{index + 1} / {images.length}</span>
                    {img.href && (
                        <a href={img.href} target="_blank" rel="noopener noreferrer"
                           className="px-3 py-1.5 rounded-md border border-white/30 hover:bg-white/10">Bağlantıya git ↗</a>
                    )}
                    <button type="button" onClick={onClose} aria-label="Kapat"
                            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10"><X size={18} /></button>
                </div>
            </div>
            <div className="relative flex-1 min-h-0" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
                <Image key={img.src} src={img.src} alt={img.alt} fill sizes="100vw" priority
                       className="object-contain p-2 sm:p-6 animate-float-up" />
                {images.length > 1 && (
                    <>
                        <button type="button" onClick={() => go(-1)} aria-label="Önceki"
                                className="absolute left-2 sm:left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-white/90 text-black">
                            <ChevronLeft size={20} />
                        </button>
                        <button type="button" onClick={() => go(1)} aria-label="Sonraki"
                                className="absolute right-2 sm:right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center bg-white/90 text-black">
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
