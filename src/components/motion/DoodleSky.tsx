"use client";

import { useEffect, useState } from "react";

/**
 * Arka planda ara sıra ekranı boydan boya geçen el çizimi karakterler.
 * Ekranda aynı anda en fazla bir çizim olur; sekme gizliyken ya da
 * hareket azaltma tercihinde hiç başlamaz. İçerik tıklamalarını engellemez.
 */

const S = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Cin Ali: çöp adam, elinde kalem, rüzgârda uçuyor */
function CinAli() {
    return (
        <svg viewBox="0 0 120 90" width="120" height="90">
            <circle cx="40" cy="22" r="10" {...S} />
            <path d="M36 21 h0.1 M44 21 h0.1" {...S} strokeWidth={3} />
            <path d="M36 27 q4 3 8 0" {...S} />
            <path d="M40 32 L52 58" {...S} />
            <path d="M44 40 L66 34 M44 40 L30 48" {...S} />
            <path d="M52 58 L44 80 M52 58 L68 74" {...S} />
            <path d="M66 34 l14 -8" {...S} strokeWidth={4} stroke="var(--accent)" />
            <path d="M80 26 l3 -2" {...S} />
            {/* Rüzgâr çizgileri */}
            <path d="M6 30 h16 M2 44 h14 M10 58 h12" {...S} strokeWidth={1.4} opacity=".55" />
        </svg>
    );
}

function Camera() {
    return (
        <svg viewBox="0 0 110 80" width="110" height="80">
            <rect x="14" y="26" width="64" height="40" rx="6" {...S} />
            <circle cx="46" cy="46" r="13" {...S} />
            <circle cx="46" cy="46" r="6" {...S} stroke="var(--accent)" />
            <path d="M26 26 l6 -9 h18 l6 9" {...S} />
            <path d="M78 36 l20 -10 v40 l-20 -10" {...S} />
            <circle cx="70" cy="33" r="2" fill="var(--accent)" stroke="none" />
            <path d="M2 40 h8 M0 52 h9" {...S} strokeWidth={1.4} opacity=".55" />
        </svg>
    );
}

function Astronaut() {
    return (
        <svg viewBox="0 0 100 110" width="100" height="110">
            <circle cx="50" cy="30" r="20" {...S} />
            <path d="M38 26 q12 -10 24 0 v8 q-12 8 -24 0 z" {...S} fill="var(--accent-2)" fillOpacity=".55" />
            <rect x="32" y="50" width="36" height="34" rx="10" {...S} />
            <rect x="42" y="58" width="16" height="10" rx="2" {...S} />
            <path d="M32 58 l-16 10 M68 58 l16 -12" {...S} />
            <path d="M40 84 l-4 18 M60 84 l6 18" {...S} />
            {/* Bağ kablosu */}
            <path d="M84 46 q12 -20 4 -36" {...S} strokeWidth={1.4} strokeDasharray="3 4" />
        </svg>
    );
}

function Rocket() {
    return (
        <svg viewBox="0 0 130 70" width="130" height="70">
            <path d="M30 35 q30 -24 70 -10 q12 4 22 10 q-10 6 -22 10 q-40 14 -70 -10 z" {...S} />
            <circle cx="88" cy="35" r="7" {...S} />
            <path d="M48 26 l-12 -16 h12 l14 14 M48 44 l-12 16 h12 l14 -14" {...S} />
            {/* Alev */}
            <path d="M30 35 l-14 -7 l4 7 l-12 0 l12 4 l-4 6 z" {...S} stroke="var(--accent)" fill="var(--accent-2)" fillOpacity=".7" />
            <path d="M2 30 h6 M0 42 h8" {...S} strokeWidth={1.4} opacity=".55" />
        </svg>
    );
}

function PaperPlane() {
    return (
        <svg viewBox="0 0 110 70" width="110" height="70">
            <path d="M8 38 L100 8 L64 62 L50 42 Z" {...S} />
            <path d="M100 8 L50 42 L46 58 L58 50" {...S} />
            <path d="M2 50 q-2 10 8 14" {...S} strokeWidth={1.4} strokeDasharray="2 4" opacity=".6" />
        </svg>
    );
}

function Pencil() {
    return (
        <svg viewBox="0 0 130 50" width="130" height="50">
            <path d="M14 18 h82 l20 7 l-20 7 h-82 z" {...S} />
            <path d="M96 18 v14 M14 18 v14" {...S} />
            <path d="M108 22.5 l8 2.5 l-8 2.5" fill="currentColor" stroke="none" />
            <path d="M14 18 h-8 a3 3 0 0 0 0 14 h8" {...S} stroke="var(--pink)" />
            {/* Arkasında bıraktığı karalama */}
            <path d="M2 42 q8 -8 16 0 t16 0 t16 0" {...S} strokeWidth={1.6} stroke="var(--accent)" />
        </svg>
    );
}

const DOODLES = [CinAli, Camera, Astronaut, Rocket, PaperPlane, Pencil];
const PATHS = ["doodle-path-a", "doodle-path-b", "doodle-path-c"] as const;

interface Flight { key: number; doodle: number; path: (typeof PATHS)[number]; top: number; dur: number; flip: boolean }

export default function DoodleSky() {
    const [flight, setFlight] = useState<Flight | null>(null);

    useEffect(() => {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let timer: ReturnType<typeof setTimeout>;
        let n = 0;
        let last = -1;

        const launch = () => {
            if (!document.hidden) {
                let d = Math.floor(Math.random() * DOODLES.length);
                if (d === last) d = (d + 1) % DOODLES.length;
                last = d;
                const dur = 14 + Math.random() * 8;
                setFlight({
                    key: ++n, doodle: d,
                    path: PATHS[Math.floor(Math.random() * PATHS.length)],
                    top: 12 + Math.random() * 62,
                    dur,
                    flip: Math.random() < 0.4,
                });
                // Bir sonraki: bu uçuş bittikten sonra bir mola
                timer = setTimeout(launch, (dur + 6 + Math.random() * 14) * 1000);
            } else {
                timer = setTimeout(launch, 4000);
            }
        };
        timer = setTimeout(launch, 2500);
        return () => clearTimeout(timer);
    }, []);

    if (!flight) return null;
    const Doodle = DOODLES[flight.doodle];
    return (
        <div aria-hidden className="doodle-sky">
            {/* Şerit aynalanınca çizim hem sağdan sola gider hem de o yöne bakar */}
            <div key={flight.key} className="doodle-lane" style={{ top: `${flight.top}vh`, scale: flight.flip ? "-1 1" : "1 1" }}>
                <div className={`doodle ${flight.path}`} style={{ animationDuration: `${flight.dur}s` }}>
                    <div className="doodle-bob"><Doodle /></div>
                </div>
            </div>
        </div>
    );
}
