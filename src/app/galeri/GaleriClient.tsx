"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, Image as ImageIcon, X } from "lucide-react";

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
    const [errorIds, setErrorIds] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isAdmin = badges.includes("admin");
    const canUpload = isAdmin;

    const handleUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        if (!canUpload) {
            toast.error("Yükleme yetkisine sahip değilsin.");
            return;
        }

        const fileArray = Array.from(files);
        for (const file of fileArray) {
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name}: Sadece resim dosyası yükleyebilirsin.`);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name}: Dosya 5 MB'dan küçük olmalı.`);
                return;
            }
        }

        setUploading(true);
        const supabase = createClient();
        const newItems: GalleryItem[] = [];

        for (const file of fileArray) {
            const ext = file.name.split(".").pop();
            const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from("gallery")
                .upload(path, file, { cacheControl: "3600", upsert: false });

            if (uploadError) {
                toast.error(`${file.name}: ${uploadError.message}`);
                continue;
            }

            const { data: inserted, error: dbError } = await supabase
                .from("gallery_items")
                .insert({ user_id: userId, username, storage_path: path, title: null })
                .select()
                .single();

            if (dbError) {
                toast.error(`Kayıt hatası: ${dbError.message}`);
                continue;
            }

            await supabase.from("activities").insert({
                user_id: userId,
                username,
                type: "gallery_upload",
                payload: { storage_path: path },
            });

            newItems.push(inserted);
        }

        if (newItems.length > 0) {
            setItems((prev) => [...newItems.reverse(), ...prev]);
            toast.success(`${newItems.length} resim yüklendi`);
        }
        setUploading(false);
    }, [userId, username]);

    const handleDelete = async (item: GalleryItem) => {
        if (!isAdmin) return;
        const supabase = createClient();

        await supabase.storage.from("gallery").remove([item.storage_path]);
        await supabase.from("gallery_items").delete().eq("id", item.id);

        setItems((prev) => prev.filter((i) => i.id !== item.id));
        toast.success("Silindi.");
    };

    return (
        <div className="aurora-bg relative min-h-screen flex flex-col">
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-4 border-b nav-backdrop"
                 style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3">
                    <Link href="/home" className="text-xs px-2 py-1 rounded-lg transition-colors duration-200"
                          style={{ color: "rgba(240,249,255,0.28)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(240,249,255,0.7)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(240,249,255,0.28)")}>
                        <ChevronLeft size={15} />
                    </Link>
                    <Link href="/home" className="flex items-baseline gap-0.5 group">
                        <span className="text-sm font-bold" style={{ color: "rgba(240,249,255,0.5)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "#7C3AED" }}>.</span>
                    </Link>
                    <span style={{ color: "rgba(255,255,255,0.12)" }}>/</span>
                    <span className="text-sm font-medium" style={{ color: "rgba(240,249,255,0.55)" }}>Galeri</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: "rgba(224,242,254,0.25)" }}>{items.length} eser</span>
                    {canUpload && (
                        <>
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
                        </>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={(e) => handleUpload(e.target.files)}
                    />
                </div>
            </nav>

            {/* Grid */}
            <div className="relative z-10 max-w-6xl mx-auto w-full px-6 py-10">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <ImageIcon size={36} className="opacity-10" />
                        <p className="text-sm" style={{ color: "rgba(224,242,254,0.25)" }}>
                            {canUpload ? "Henüz eser yok. İlk yükleyen sen ol." : "Henüz eser yok."}
                        </p>
                        {canUpload && (
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
                        )}
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
                        {items.map((item) => {
                            const url = getPublicUrl(supabaseUrl, item.storage_path);
                            const hasError = errorIds.has(item.id);
                            return (
                                <div key={item.id} className="card break-inside-avoid relative group rounded-2xl overflow-hidden">
                                    {hasError ? (
                                        <div className="flex flex-col items-center justify-center min-h-[140px] gap-2 py-8"
                                             style={{ background: "rgba(239,68,68,0.04)" }}>
                                            <X size={18} className="opacity-20" />
                                            <span className="text-[10px]" style={{ color: "rgba(240,249,255,0.2)" }}>Yüklenemedi</span>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="mt-1 text-[10px] px-2 py-1 rounded-lg"
                                                    style={{
                                                        background: "rgba(239,68,68,0.12)",
                                                        border: "1px solid rgba(239,68,68,0.2)",
                                                        color: "rgba(239,68,68,0.7)",
                                                    }}>
                                                    Sil
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <Image
                                                src={url}
                                                alt={item.title ?? "Galeri görseli"}
                                                width={600}
                                                height={400}
                                                className="w-full h-auto object-cover"
                                                onError={() => setErrorIds((prev) => new Set(prev).add(item.id))}
                                                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                unoptimized
                                            />
                                            <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                 style={{ background: "linear-gradient(to top, rgba(15,25,50,0.88) 0%, transparent 60%)" }}>
                                                <div className="flex items-center justify-between">
                                                    <Link href={`/profil/${item.username}`}
                                                          className="text-[11px] font-medium"
                                                          style={{ color: "rgba(224,242,254,0.7)" }}>
                                                        @{item.username}
                                                    </Link>
                                                    {isAdmin && (
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
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
