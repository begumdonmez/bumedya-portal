"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface GalleryItem {
    id: string;
    user_id: string;
    username: string;
    title: string | null;
    storage_path: string;
    created_at: string;
}

function getPublicUrl(supabaseUrl: string, path: string) {
    return `${supabaseUrl}/storage/v1/object/public/gallery/${path}`;
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
    const [uploading, setUploading] = useState(false);
    const [loadedIds, setLoadedIds] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAuthorized = badges.includes("authorized");

    const handleUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];

        if (!file.type.startsWith("image/")) {
            toast.error("Sadece resim dosyası yükleyebilirsin.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Dosya 5 MB'dan küçük olmalı.");
            return;
        }

        setUploading(true);
        const supabase = createClient();
        const ext = file.name.split(".").pop();
        const path = `${userId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("gallery")
            .upload(path, file, { cacheControl: "3600", upsert: false });

        if (uploadError) {
            toast.error("Yükleme başarısız: " + uploadError.message);
            setUploading(false);
            return;
        }

        const { data: inserted, error: dbError } = await supabase
            .from("gallery_items")
            .insert({ user_id: userId, username, storage_path: path, title: null })
            .select()
            .single();

        if (dbError) {
            toast.error("Kayıt hatası: " + dbError.message);
            setUploading(false);
            return;
        }

        await supabase.from("activities").insert({
            user_id: userId,
            username,
            type: "gallery_upload",
            payload: { storage_path: path },
        });

        setItems((prev) => [inserted, ...prev]);
        toast.success("Yüklendi ✦");
        setUploading(false);
    }, [userId, username]);

    const handleDelete = async (item: GalleryItem) => {
        if (item.user_id !== userId && !isAuthorized) return;
        const supabase = createClient();

        await supabase.storage.from("gallery").remove([item.storage_path]);
        await supabase.from("gallery_items").delete().eq("id", item.id);

        setItems((prev) => prev.filter((i) => i.id !== item.id));
        toast.success("Silindi.");
    };

    return (
        <div className="relative min-h-screen flex flex-col" style={{ background: "#0A0F1E" }}>
            <div aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
                 style={{ background: "rgba(124,58,237,0.05)", filter: "blur(120px)" }} />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-5 border-b"
                 style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-3">
                    <Link href="/home" className="flex items-baseline gap-0.5">
                        <span className="text-sm font-bold" style={{ color: "rgba(224,242,254,0.5)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "rgba(124,58,237,0.7)" }}>.</span>
                    </Link>
                    <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
                    <span className="text-sm font-medium" style={{ color: "rgba(224,242,254,0.6)" }}>Galeri</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: "rgba(224,242,254,0.25)" }}>{items.length} eser</span>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 disabled:opacity-40"
                        style={{
                            background: "rgba(124,58,237,0.15)",
                            border: "1px solid rgba(124,58,237,0.3)",
                            color: "rgba(167,139,250,0.9)",
                        }}>
                        {uploading ? (
                            <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                        ) : (
                            <span>+</span>
                        )}
                        Yükle
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleUpload(e.target.files)}
                    />
                </div>
            </nav>

            {/* Grid */}
            <div className="relative z-10 max-w-6xl mx-auto w-full px-6 py-10">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <span className="text-4xl opacity-10">🖼</span>
                        <p className="text-sm" style={{ color: "rgba(224,242,254,0.25)" }}>
                            Henüz eser yok. İlk yükleyen sen ol.
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200"
                            style={{
                                background: "rgba(124,58,237,0.12)",
                                border: "1px solid rgba(124,58,237,0.25)",
                                color: "rgba(167,139,250,0.8)",
                            }}>
                            Resim Yükle
                        </button>
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
                        {items.map((item) => {
                            const url = getPublicUrl(supabaseUrl, item.storage_path);
                            const loaded = loadedIds.has(item.id);
                            return (
                                <div key={item.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden"
                                     style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                    <div className="relative">
                                        {!loaded && (
                                            <div className="absolute inset-0 w-full h-full min-h-[120px] animate-pulse"
                                                 style={{ background: "rgba(124,58,237,0.08)" }} />
                                        )}
                                        <Image
                                            src={url}
                                            alt={item.title ?? "Galeri görseli"}
                                            width={600}
                                            height={400}
                                            className="w-full h-auto object-cover transition-opacity duration-500"
                                            style={{ opacity: loaded ? 1 : 0 }}
                                            onLoad={() => setLoadedIds((prev) => new Set(prev).add(item.id))}
                                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        />
                                    </div>
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                         style={{ background: "linear-gradient(to top, rgba(10,15,30,0.85) 0%, transparent 60%)" }}>
                                        <div className="flex items-center justify-between">
                                            <Link href={`/profil/${item.username}`}
                                                  className="text-[11px] font-medium"
                                                  style={{ color: "rgba(224,242,254,0.7)" }}>
                                                @{item.username}
                                            </Link>
                                            {(item.user_id === userId || isAuthorized) && (
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="text-[10px] px-2 py-1 rounded-lg transition-all duration-200"
                                                    style={{
                                                        background: "rgba(239,68,68,0.15)",
                                                        border: "1px solid rgba(239,68,68,0.2)",
                                                        color: "rgba(239,68,68,0.8)",
                                                    }}>
                                                    Sil
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
