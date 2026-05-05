"use client";

import { useState } from "react";
import { Music2 } from "lucide-react";

export interface SpotifyPlaylist {
    id: string;
    name: string;
    spotify_id: string;
    description: string | null;
}

const EMBED_H = 152; // px

export default function SpotifyWidget({ playlists }: { playlists: SpotifyPlaylist[] }) {
    const [selected, setSelected] = useState<SpotifyPlaylist | null>(playlists[0] ?? null);

    if (!playlists.length) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-2" style={{ minHeight: EMBED_H }}>
                <Music2 size={22} style={{ color: "var(--text-5)" }} />
                <p className="text-xs" style={{ color: "var(--text-4)" }}>Henüz playlist eklenmemiş.</p>
            </div>
        );
    }

    const embedSrc = selected
        ? `https://open.spotify.com/embed/playlist/${selected.spotify_id}?utm_source=generator&theme=0`
        : null;

    return (
        <>
            {/* ── Desktop: yan yana ── */}
            <div className="hidden sm:flex gap-3" style={{ height: EMBED_H }}>

                {/* Sol — embed */}
                <div className="flex-1 min-w-0 rounded-xl overflow-hidden" style={{ height: EMBED_H, background: "#121212" }}>
                    {embedSrc && (
                        <iframe
                            key={embedSrc}
                            src={embedSrc}
                            width="100%"
                            height="100%"
                            style={{ display: "block", border: "none" }}
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="rounded-xl"
                        />
                    )}
                </div>

                {/* Sağ — scrollable liste */}
                <div
                    className="w-32 shrink-0 flex flex-col gap-1 overflow-y-auto"
                    style={{ height: EMBED_H, scrollbarWidth: "none" }}
                >
                    {playlists.map((pl) => {
                        const active = selected?.id === pl.id;
                        return (
                            <button
                                key={pl.id}
                                onClick={() => setSelected(pl)}
                                className="text-left px-3 py-2.5 rounded-xl transition-all duration-150 flex flex-col gap-0.5 shrink-0"
                                style={{
                                    background: active ? "rgba(29,185,84,0.10)" : "var(--bg-2)",
                                    border: `1px solid ${active ? "rgba(29,185,84,0.28)" : "var(--border-3)"}`,
                                }}
                            >
                                {active && (
                                    <span className="flex items-center gap-1.5 mb-0.5">
                                        <span className="flex gap-px items-end" style={{ height: 12 }}>
                                            {[8, 12, 6].map((h, i) => (
                                                <span
                                                    key={i}
                                                    className="w-0.5 rounded-full animate-pulse"
                                                    style={{ height: h, background: "rgba(29,185,84,0.8)", animationDelay: `${i * 0.15}s` }}
                                                />
                                            ))}
                                        </span>
                                        <span
                                            className="text-[9px] tracking-widest uppercase font-semibold"
                                            style={{ color: "rgba(29,185,84,0.8)" }}
                                        >
                                            Çalıyor
                                        </span>
                                    </span>
                                )}
                                <p
                                    className="text-xs font-medium leading-snug line-clamp-2"
                                    style={{ color: active ? "rgba(29,185,84,0.95)" : "var(--text-2)" }}
                                >
                                    {pl.name}
                                </p>
                                {pl.description && (
                                    <p
                                        className="text-[10px] leading-snug line-clamp-1"
                                        style={{ color: active ? "rgba(29,185,84,0.6)" : "var(--text-4)" }}
                                    >
                                        {pl.description}
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Mobile: alt alta ── */}
            <div className="flex sm:hidden flex-col gap-3">
                {/* Embed — sabit yükseklik */}
                <div className="rounded-xl overflow-hidden" style={{ height: 152, background: "#121212" }}>
                    {embedSrc && (
                        <iframe
                            key={embedSrc}
                            src={embedSrc}
                            width="100%"
                            height="100%"
                            style={{ display: "block", border: "none" }}
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="rounded-xl"
                        />
                    )}
                </div>

                {/* Yatay scroll playlist chip'leri */}
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    {playlists.map((pl) => {
                        const active = selected?.id === pl.id;
                        return (
                            <button
                                key={pl.id}
                                onClick={() => setSelected(pl)}
                                className="shrink-0 text-left px-3 py-2 rounded-xl transition-all duration-150"
                                style={{
                                    background: active ? "rgba(29,185,84,0.10)" : "var(--bg-2)",
                                    border: `1px solid ${active ? "rgba(29,185,84,0.28)" : "var(--border-3)"}`,
                                    maxWidth: 160,
                                }}
                            >
                                <p
                                    className="text-xs font-medium truncate"
                                    style={{ color: active ? "rgba(29,185,84,0.95)" : "var(--text-2)" }}
                                >
                                    {pl.name}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
