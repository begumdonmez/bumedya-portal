"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";

const GRID_SIZES = "(min-width:1024px) 300px, (min-width:768px) 33vw, (min-width:640px) 50vw, 100vw";

/**
 * Supabase Storage görseli — next/image üzerinden cihaz boyutunda AVIF/WebP olarak sunulur.
 * Gerçek oranı bilinmediği için genişlik sabit, yükseklik otomatik.
 */
export function GalleryImage({ src, alt, onError }: { src: string; alt: string; onError?: () => void }) {
    return (
        <Image src={src} alt={alt} width={640} height={640} sizes={GRID_SIZES}
               className="w-full h-auto block" style={{ height: "auto" }}
               onError={onError} />
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
