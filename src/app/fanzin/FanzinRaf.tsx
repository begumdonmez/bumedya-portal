"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { Fanzin } from "@/data/fanzinler";

const TILTS = ["-2deg", "1.5deg", "-1deg", "2.5deg", "-2.5deg", "1deg"];

export default function FanzinRaf({ fanzinler }: { fanzinler: Fanzin[] }) {
    const [open, setOpen] = useState<number | null>(null);
    const [yuz, setYuz] = useState(0);
    const dialogRef = useRef<HTMLDialogElement>(null);

    const show = (i: number) => { setOpen(i); setYuz(0); };
    const close = useCallback(() => setOpen(null), []);

    useEffect(() => {
        const d = dialogRef.current;
        if (!d) return;
        if (open !== null && !d.open) d.showModal();
        if (open === null && d.open) d.close();
    }, [open]);

    const current = open !== null ? fanzinler[open] : null;

    const step = useCallback((dir: 1 | -1) => {
        if (!current) return;
        setYuz(y => (y + dir + current.yuzler.length) % current.yuzler.length);
    }, [current]);

    useEffect(() => {
        if (open === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, step]);

    return (
        <>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
                {fanzinler.map((f, i) => (
                    <li key={f.slug}>
                        <button type="button" onClick={() => show(i)}
                                className="group block w-full text-left"
                                aria-label={`${f.baslik} ${f.sayi} — ${f.tema} sayısını aç`}>
                            <div className="relative aspect-[667/1414] rounded-[4px] overflow-hidden transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:rotate-0"
                                 style={{
                                     rotate: TILTS[i % TILTS.length],
                                     border: "1px solid var(--border-1)",
                                     boxShadow: `5px 5px 0 ${f.renk}, 0 14px 28px color-mix(in srgb, var(--shade) 18%, transparent)`,
                                 }}>
                                <Image src={f.kapak} alt="" fill sizes="(min-width:1024px) 20vw, (min-width:640px) 33vw, 50vw"
                                       className="object-cover" />
                                <span className="absolute top-2 left-2 sticker !text-xs !rotate-[-6deg]">{f.sayi}</span>
                            </div>
                            <p className="mt-5 font-display text-xl font-medium leading-tight" style={{ color: "var(--text-1)" }}>
                                {f.baslik} <span className="italic" style={{ color: "var(--accent)" }}>{f.sayi}</span>
                            </p>
                            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>{f.tema}</p>
                        </button>
                    </li>
                ))}
            </ul>

            <dialog ref={dialogRef} onClose={close} onClick={e => { if (e.target === e.currentTarget) close(); }}
                    className="m-auto w-[min(1200px,96vw)] max-h-[94dvh] overflow-y-auto p-0 rounded-xl backdrop:bg-[var(--overlay)]"
                    style={{ background: "var(--paper)", color: "var(--text-1)", border: "1px solid var(--border-1)" }}>
                {current && (
                    <div className="flex flex-col">
                        <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3"
                                style={{ borderBottom: "1px solid var(--border-2)" }}>
                            <div className="min-w-0">
                                <p className="font-display text-xl font-medium truncate">
                                    {current.baslik} <span className="italic" style={{ color: "var(--accent)" }}>{current.sayi}</span>
                                </p>
                                <p className="text-xs truncate" style={{ color: "var(--text-4)" }}>
                                    {current.tema}{current.kapakCizeri ? ` · kapak: ${current.kapakCizeri}` : ""}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <a href={current.yuzler[yuz].src} target="_blank" rel="noopener noreferrer"
                                   className="btn-ghost !py-1.5 !px-3" title="Tam boy aç">
                                    <Maximize2 size={14} /> <span className="hidden sm:inline">Tam boy</span>
                                </a>
                                <button type="button" onClick={close} aria-label="Kapat" className="btn-ghost !p-2">
                                    <X size={16} />
                                </button>
                            </div>
                        </header>

                        <div className="relative px-2 sm:px-6 py-4">
                            <div className="relative w-full aspect-[2000/1414] rounded-md overflow-hidden" style={{ background: "var(--surface-solid)" }}>
                                <Image key={current.yuzler[yuz].src} src={current.yuzler[yuz].src}
                                       alt={`${current.baslik} ${current.sayi} — ${current.yuzler[yuz].etiket}`}
                                       fill sizes="(min-width:1200px) 1150px, 96vw" className="object-contain animate-float-up" />
                            </div>
                            {current.yuzler.length > 1 && (
                                <>
                                    <button type="button" onClick={() => step(-1)} aria-label="Önceki yüz"
                                            className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{ background: "var(--fg)", color: "var(--paper)" }}>
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button type="button" onClick={() => step(1)} aria-label="Sonraki yüz"
                                            className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{ background: "var(--fg)", color: "var(--paper)" }}>
                                        <ChevronRight size={18} />
                                    </button>
                                </>
                            )}
                        </div>

                        <footer className="flex flex-wrap items-center justify-center gap-2 px-4 pb-4">
                            {current.yuzler.map((y, i) => (
                                <button key={y.src} type="button" className="pill" aria-pressed={yuz === i} onClick={() => setYuz(i)}>
                                    {y.etiket}
                                </button>
                            ))}
                        </footer>
                    </div>
                )}
            </dialog>
        </>
    );
}
