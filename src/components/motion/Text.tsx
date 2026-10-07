"use client";

import { useEffect, useRef, useState } from "react";

/* Deterministik sözde-rastgele: sunucu ve istemci aynı gecikmeleri üretsin (hydration uyumu) */
function seeded(n: number) {
    const x = Math.sin(n * 9301 + 49297) * 233280;
    return x - Math.floor(x);
}

/**
 * Canlı kelimeler: her kelime kendi zamanında kısa süre vurgu rengine bürünür.
 * Tamamen CSS; yalnızca ekrandayken çalışır.
 */
export function LivelyWords({ text, className = "" }: { text: string; className?: string }) {
    const words = text.split(/(\s+)/);
    return (
        <span data-anim className={`lively ${className}`}>
            {words.map((w, i) =>
                /^\s+$/.test(w) ? w : (
                    <span key={i} className="lively-word"
                          style={{
                              ["--d" as string]: `${(seeded(i + text.length) * 9).toFixed(2)}s`,
                              ["--c" as string]: seeded(i * 7) > 0.5 ? "var(--accent)" : "var(--pink)",
                          }}>
                        {w}
                    </span>
                ),
            )}
        </span>
    );
}

/**
 * Harf karıştırma: ekrandayken ara sıra yan yana iki harf yer değiştirir, kısa süre sonra düzelir.
 * Ekran okuyucular için asıl metin aria-label'da kalır.
 */
export function ScrambleText({ text, every = 3800 }: { text: string; every?: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const [swap, setSwap] = useState<number | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const letters = [...text];
        const candidates = letters.map((_, i) => i).filter(i => /\p{L}/u.test(letters[i]) && /\p{L}/u.test(letters[i + 1] ?? ""));
        if (!candidates.length) return;

        let timer: ReturnType<typeof setTimeout>;
        let visible = false;
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
        io.observe(el);

        const tick = () => {
            if (visible && !document.hidden) {
                setSwap(candidates[Math.floor(Math.random() * candidates.length)]);
                setTimeout(() => setSwap(null), 420);
            }
            timer = setTimeout(tick, every + Math.random() * every);
        };
        timer = setTimeout(tick, 1200 + Math.random() * every);
        return () => { clearTimeout(timer); io.disconnect(); };
    }, [text, every]);

    const letters = [...text];
    if (swap !== null) [letters[swap], letters[swap + 1]] = [letters[swap + 1], letters[swap]];

    return (
        <span ref={ref} aria-label={text}>
            {letters.map((ch, i) => (
                <span key={i} aria-hidden
                      className={swap !== null && (i === swap || i === swap + 1) ? "scramble-hop" : undefined}
                      style={{ display: "inline-block", whiteSpace: "pre" }}>
                    {ch}
                </span>
            ))}
        </span>
    );
}

/** Fosforlu kalemle çizilen kelime: ekrana ilk girişte soldan sağa çizilir. */
export function MarkerDraw({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <span data-anim="once" className="marker-draw" style={{ ["--md-delay" as string]: `${delay}ms` }}>
            {children}
        </span>
    );
}
