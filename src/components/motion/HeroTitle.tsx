"use client";

import { Fragment, useEffect, useRef, useState } from "react";

interface Line { text: string; className?: string; style?: React.CSSProperties; marker?: boolean }

/**
 * Ana sayfa başlığı: satırlar arasında aynı harfler (ör. "Üret"teki Ü ile "Büyü"deki ü)
 * ara sıra kavis çizerek uçup yer değiştirir, bir süre öyle kalır, sonra geri döner.
 * Satır içinde de iki komşu harf arada bir zıplayıp takas yapar.
 * Yalnızca ekrandayken ve hareket azaltma kapalıyken çalışır.
 */
export default function HeroTitle({ lines }: { lines: Line[] }) {
    const rootRef = useRef<HTMLSpanElement>(null);
    const [chars, setChars] = useState(() => lines.map(l => [...l.text]));

    useEffect(() => {
        const root = rootRef.current;
        if (!root || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let visible = false;
        const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
        io.observe(root);

        const span = (li: number, ci: number) =>
            root.querySelector<HTMLElement>(`[data-l="${li}"][data-c="${ci}"]`);

        /** İki harfi FLIP tekniğiyle uçur: konumlarını ölç, takas et, eski yerlerinden kavisle getir */
        const fly = (a: [number, number], b: [number, number], arc: number) => {
            const ea = span(...a), eb = span(...b);
            if (!ea || !eb) return;
            const ra = ea.getBoundingClientRect(), rb = eb.getBoundingClientRect();
            setChars(prev => {
                const next = prev.map(l => [...l]);
                [next[a[0]][a[1]], next[b[0]][b[1]]] = [next[b[0]][b[1]], next[a[0]][a[1]]];
                return next;
            });
            requestAnimationFrame(() => {
                const go = (el: HTMLElement, from: DOMRect, to: DOMRect, side: number) => {
                    const dx = from.left - to.left, dy = from.top - to.top;
                    el.animate([
                        { transform: `translate(${dx}px, ${dy}px) rotate(0deg)`, color: "var(--accent)" },
                        { transform: `translate(${dx / 2 + side * arc * 0.35}px, ${dy / 2 - arc}px) rotate(${side * 180}deg) scale(1.15)`, color: "var(--accent)", offset: 0.5 },
                        { transform: "translate(0, 0) rotate(360deg)", color: "inherit" },
                    ], { duration: 900, easing: "cubic-bezier(.34,1.2,.64,1)" });
                };
                // Takastan sonra a'daki harf b'den, b'deki harf a'dan geldi
                go(ea, rb, ra, 1);
                go(eb, ra, rb, -1);
            });
        };

        // Satırlar arası eşleşmeler: aynı harf (büyük/küçük fark etmez)
        const pairs: [[number, number], [number, number]][] = [];
        lines.forEach((la, i) => lines.forEach((lb, j) => {
            if (j <= i) return;
            [...la.text].forEach((ca, x) => [...lb.text].forEach((cb, y) => {
                if (/\p{L}/u.test(ca) && ca.toLocaleLowerCase("tr") === cb.toLocaleLowerCase("tr")) pairs.push([[i, x], [j, y]]);
            }));
        }));

        let swapped: [[number, number], [number, number]] | null = null;
        let timer: ReturnType<typeof setTimeout>;

        const tick = () => {
            if (visible && !document.hidden) {
                if (swapped) {
                    // Yerine dön
                    fly(swapped[0], swapped[1], 60);
                    swapped = null;
                } else if (pairs.length && Math.random() < 0.6) {
                    const p = pairs[Math.floor(Math.random() * pairs.length)];
                    fly(p[0], p[1], 90);
                    swapped = p;
                } else {
                    // Satır içi komşu harf takası (kısa zıplama, hemen geri)
                    const li = Math.floor(Math.random() * lines.length);
                    const t = [...lines[li].text];
                    const idx = t.map((_, k) => k).filter(k => /\p{L}/u.test(t[k]) && /\p{L}/u.test(t[k + 1] ?? ""));
                    if (idx.length) {
                        const k = idx[Math.floor(Math.random() * idx.length)];
                        fly([li, k], [li, k + 1], 26);
                        setTimeout(() => fly([li, k], [li, k + 1], 20), 1100);
                    }
                }
            }
            timer = setTimeout(tick, swapped ? 2600 : 3200 + Math.random() * 2600);
        };
        timer = setTimeout(tick, 1800);
        return () => { clearTimeout(timer); io.disconnect(); };
    }, [lines]);

    return (
        <span ref={rootRef} aria-label={lines.map(l => l.text).join(" ")}>
            {lines.map((l, li) => (
                <Fragment key={li}>
                    <span aria-hidden className={`${l.className ?? ""}${l.marker ? " marker-draw" : ""}`} style={l.style}
                          data-anim={l.marker ? "once" : undefined}>
                        {chars[li].map((ch, ci) => (
                            <span key={ci} data-l={li} data-c={ci} style={{ display: "inline-block", whiteSpace: "pre" }}>{ch}</span>
                        ))}
                    </span>
                    {li < lines.length - 1 && <br />}
                </Fragment>
            ))}
        </span>
    );
}
