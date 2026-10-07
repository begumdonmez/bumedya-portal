/**
 * El çizimi kraliyet nişanı (göğse takılan broş): askısız, tek madalyon.
 * Madalyon biçimi rozetin türünü anlatır; rengi rozetin kendi rengidir.
 */
export type MedalShape = "star" | "rosette" | "coin" | "shield";

const INK = "var(--fg)";

function starPath(cx: number, cy: number, outer: number, inner: number, points: number) {
    let d = "";
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (Math.PI / points) * i - Math.PI / 2;
        d += `${i === 0 ? "M" : "L"}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)} `;
    }
    return d + "Z";
}

function rosettePath(cx: number, cy: number, r: number, bumps: number) {
    // Kenarı tırtıklı rozet çiçeği
    let d = "";
    for (let i = 0; i <= bumps; i++) {
        const a = (2 * Math.PI * i) / bumps;
        const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        if (i === 0) { d += `M${x.toFixed(1)} ${y.toFixed(1)} `; continue; }
        const am = a - Math.PI / bumps;
        const qx = cx + (r + 3.2) * Math.cos(am), qy = cy + (r + 3.2) * Math.sin(am);
        d += `Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    return d + "Z";
}

export default function BadgeMedal({ label, color, shape, size = 40 }: {
    label: string; color: string; shape: MedalShape; size?: number;
}) {
    const initial = label.trim().charAt(0).toLocaleUpperCase("tr-TR");
    const c = 22;

    return (
        <svg viewBox="0 0 44 44" width={size} height={size} aria-hidden className="medal shrink-0 overflow-visible"
             style={{ ["--md" as string]: `${-(label.length % 7) * 0.6}s` }}>
            {shape === "star" && (
                <>
                    {/* İki kat ışınlı nişan yıldızı */}
                    <path d={starPath(c, c, 21, 13, 8)} fill="var(--accent-2)" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" transform={`rotate(22.5 ${c} ${c})`} />
                    <path d={starPath(c, c, 18, 11, 8)} fill={color} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx={c} cy={c} r="9" fill="var(--surface-solid)" stroke={INK} strokeWidth="1.5" />
                    <circle cx={c} cy={c} r="7" fill="none" stroke={INK} strokeWidth="0.8" strokeDasharray="1.4 1.6" />
                </>
            )}
            {shape === "rosette" && (
                <>
                    <path d={rosettePath(c, c, 17, 14)} fill={color} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
                    <path d={rosettePath(c, c, 12.5, 10)} fill="var(--accent-2)" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
                    <circle cx={c} cy={c} r="8.5" fill="var(--surface-solid)" stroke={INK} strokeWidth="1.3" />
                </>
            )}
            {shape === "coin" && (
                <>
                    <circle cx={c} cy={c} r="19" fill={color} stroke={INK} strokeWidth="1.6" />
                    <circle cx={c} cy={c} r="15.5" fill="none" stroke={INK} strokeWidth="0.9" strokeDasharray="1.6 2" />
                    {/* Defne dalları */}
                    <path d={`M${c - 11} ${c + 9} Q${c - 15} ${c} ${c - 10} ${c - 9}`} fill="none" stroke={INK} strokeWidth="1" />
                    <path d={`M${c + 11} ${c + 9} Q${c + 15} ${c} ${c + 10} ${c - 9}`} fill="none" stroke={INK} strokeWidth="1" />
                    {[-6, 0, 6].map(dy => (
                        <g key={dy}>
                            <ellipse cx={c - 13} cy={c + dy} rx="2.2" ry="1" fill={INK} transform={`rotate(-50 ${c - 13} ${c + dy})`} />
                            <ellipse cx={c + 13} cy={c + dy} rx="2.2" ry="1" fill={INK} transform={`rotate(50 ${c + 13} ${c + dy})`} />
                        </g>
                    ))}
                </>
            )}
            {shape === "shield" && (
                <>
                    <path d={`M${c - 15} ${c - 15} Q${c} ${c - 21} ${c + 15} ${c - 15} L${c + 13.5} ${c + 2} Q${c + 11} ${c + 14} ${c} ${c + 20} Q${c - 11} ${c + 14} ${c - 13.5} ${c + 2} Z`}
                          fill={color} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
                    <path d={`M${c - 11} ${c - 11.5} Q${c} ${c - 16} ${c + 11} ${c - 11.5} L${c + 10} ${c + 1} Q${c + 8} ${c + 10} ${c} ${c + 15} Q${c - 8} ${c + 10} ${c - 10} ${c + 1} Z`}
                          fill="none" stroke={INK} strokeWidth="0.8" strokeDasharray="1.4 1.6" />
                </>
            )}

            {/* Baş harf — hafif eğik, elle kazınmış gibi */}
            <text x={c} y={c + 0.5} textAnchor="middle" dominantBaseline="central"
                  fontFamily="var(--font-display)" fontSize="11" fontWeight="700" fill={INK}
                  transform={`rotate(-6 ${c} ${c})`}>
                {initial}
            </text>

            {/* Parıltı */}
            <path d={`M${c + 15} ${c - 18} l3 -3 M${c + 18} ${c - 14} l4 -1`} stroke={INK} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
    );
}
