"use client";

import { useEffect, useState } from "react";

const EXCUSES = [
    "Sayfayı kedi yedi. Kedi pişman değil.",
    "Mürettip izinde, sayfa da onunla gitti.",
    "Bu sayfa ilham aramaya çıktı, henüz dönmedi.",
    "Editör “biraz kısaltalım” dedi. Biraz fazla kısaltmış.",
    "Burası taslaktı. Taslak buruşturuldu. Buruşturulan sensin değil, merak etme.",
    "Sayfa matbaada sıkıştı. Kâğıt makinesi yine huysuz.",
    "Aradığın sayfa şu an başka bir fanzinde misafir.",
    "404: kahve molası. Kahve de bitmiş.",
];

/** 404'teki “0” — buruşturulmuş kâğıt top. Tıklayınca çöpe atılmaya çalışılır, çoğu zaman ıskalanır. */
export default function NotFoundToy() {
    const [i, setI] = useState(0);
    const [throws, setThrows] = useState(0);
    const [flying, setFlying] = useState<null | "hit" | "miss">(null);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setI(n => (n + 1) % EXCUSES.length), 3600);
        return () => clearInterval(t);
    }, []);

    const toss = () => {
        if (flying) return;
        // Her üç atıştan biri girer — fanzin ekibi basketbolda pek iyi değil
        const hit = Math.random() < 0.34;
        setFlying(hit ? "hit" : "miss");
        setThrows(n => n + 1);
        if (hit) setScore(n => n + 1);
        setTimeout(() => setFlying(null), 1300);
    };

    const line =
        throws === 0 ? "Sıfıra tıkla. Hadi, kimse görmüyor." :
        flying === "hit" ? "Sayıı! Çöp kutusu bile şaşırdı." :
        flying === "miss" ? "Iska. Yerden kim alacak şimdi?" :
        `${throws} atış, ${score} sayı. ${score === 0 ? "Yetenek yok ama azim var." : "Fena değil."}`;

    return (
        <div className="flex flex-col items-start">
            <div className="relative flex items-end select-none font-display font-medium leading-none"
                 style={{ fontSize: "clamp(7rem, 22vw, 14rem)", color: "var(--text-1)" }}>
                <span className="nf-tilt-l">4</span>

                <button type="button" onClick={toss} aria-label="Kâğıt topu çöpe at"
                        className={`relative mx-[0.04em] w-[0.72em] h-[0.72em] mb-[0.08em] cursor-pointer ${flying ? `nf-fly-${flying}` : "nf-bob"}`}>
                    <svg viewBox="0 0 100 100" className="w-full h-full nf-spin" aria-hidden>
                        <path d="M50 4 L66 10 L80 8 L90 24 L96 40 L92 56 L97 70 L86 84 L70 92 L54 96 L38 93 L22 88 L12 74 L4 58 L8 42 L5 26 L18 14 L34 7 Z"
                              fill="var(--surface-solid)" stroke="var(--fg)" strokeWidth="3" strokeLinejoin="round" />
                        <path d="M20 30 L42 40 L36 58 M60 18 L54 40 L74 52 M30 76 L48 64 L66 74 M78 30 L70 48 M14 52 L30 50"
                              fill="none" stroke="var(--fg)" strokeWidth="2" strokeLinecap="round" opacity=".55" />
                        <path d="M42 40 L54 40 M36 58 L48 64" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                </button>

                <span className="nf-tilt-r">4</span>

                {/* Çöp kutusu */}
                <svg viewBox="0 0 60 70" aria-hidden
                     className={`absolute -right-[0.55em] bottom-0 w-[0.38em] ${flying === "hit" ? "nf-bin-hit" : ""}`}>
                    <path d="M8 18 L52 18 L47 66 L13 66 Z" fill="var(--paper-2)" stroke="var(--fg)" strokeWidth="3" strokeLinejoin="round" />
                    <path d="M4 12 L56 12" stroke="var(--fg)" strokeWidth="4" strokeLinecap="round" />
                    <path d="M24 12 L26 6 L34 6 L36 12" fill="none" stroke="var(--fg)" strokeWidth="3" strokeLinejoin="round" />
                    <path d="M22 28 L24 58 M30 28 L30 58 M38 28 L36 58" stroke="var(--fg)" strokeWidth="2" strokeLinecap="round" opacity=".5" />
                </svg>
            </div>

            <p className="font-mono text-xs mt-2" style={{ color: "var(--text-4)" }} aria-live="polite">{line}</p>

            <p key={i} className="nf-excuse mt-8 font-display italic text-2xl sm:text-3xl leading-snug max-w-xl"
               style={{ color: "var(--text-2)" }}>
                <span style={{ color: "var(--accent)" }}>Bahane #{i + 1}:</span> {EXCUSES[i]}
            </p>
        </div>
    );
}
