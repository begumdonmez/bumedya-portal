/**
 * Site ses efektleri — dosya yok, hepsi Web Audio ile anında sentezlenir.
 * Yalnızca kullanıcı etkileşiminden sonra çalınır (tarayıcı otomatik oynatma kuralı).
 * Ses kapalıysa ya da "hareket azaltma" tercihi varsa hiçbir şey çalmaz.
 */

const STORAGE_KEY = "bm-sound";
let ctx: AudioContext | null = null;

export function soundEnabled(): boolean {
    if (typeof window === "undefined") return false;
    try { if (localStorage.getItem(STORAGE_KEY) === "off") return false; } catch { /* yok say */ }
    return !matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function setSoundEnabled(on: boolean) {
    try { localStorage.setItem(STORAGE_KEY, on ? "on" : "off"); } catch { /* yok say */ }
    window.dispatchEvent(new Event("bm-sound-change"));
}

function audio(): AudioContext | null {
    if (!soundEnabled()) return null;
    try {
        ctx ??= new AudioContext();
        if (ctx.state === "suspended") void ctx.resume();
        return ctx;
    } catch {
        return null;
    }
}

function noiseBuffer(a: AudioContext, seconds: number) {
    const buf = a.createBuffer(1, Math.ceil(a.sampleRate * seconds), a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
}

/** Filtrelenmiş gürültü patlaması — hışırtı, kalem, fırlatma için ortak taban */
function noise(a: AudioContext, { dur, type, from, to, q = 1, peak = 0.2, attack = 0.01 }: {
    dur: number; type: BiquadFilterType; from: number; to: number; q?: number; peak?: number; attack?: number;
}) {
    const t = a.currentTime;
    const src = a.createBufferSource();
    src.buffer = noiseBuffer(a, dur);
    const f = a.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(a.destination);
    src.start(t);
    src.stop(t + dur);
    return { src, gain: g, t };
}

/** Kısa ton — tık, pop, zil için */
function tone(a: AudioContext, { freq, to, dur, type = "sine", peak = 0.15, delay = 0 }: {
    freq: number; to?: number; dur: number; type?: OscillatorType; peak?: number; delay?: number;
}) {
    const t = a.currentTime + delay;
    const o = a.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
}

export const sfx = {
    /** Buton tıkı — kâğıda bastırılan tükenmez kalem gibi kuru, kısa */
    tap() {
        const a = audio(); if (!a) return;
        tone(a, { freq: 1800, to: 900, dur: 0.035, type: "triangle", peak: 0.06 });
        noise(a, { dur: 0.03, type: "highpass", from: 3000, to: 2500, peak: 0.04, attack: 0.002 });
    },

    /** Fosforlu kalem çekişi (~0.4 sn) */
    marker() {
        const a = audio(); if (!a) return;
        const dur = 0.42;
        const { gain, t } = noise(a, { dur, type: "bandpass", from: 1900, to: 3200, q: 6, peak: 0.22, attack: 0.03 });
        // Kalemin titreşimi
        const lfo = a.createOscillator();
        const lg = a.createGain();
        lfo.frequency.value = 38;
        lg.gain.value = 0.08;
        lfo.connect(lg).connect(gain.gain);
        lfo.start(t);
        lfo.stop(t + dur);
    },

    /** Kâğıt hışırtısı — görsel / okuyucu açılırken */
    paper() {
        const a = audio(); if (!a) return;
        noise(a, { dur: 0.22, type: "highpass", from: 2500, to: 6000, peak: 0.08, attack: 0.04 });
    },

    /** Sayfa çevirme — fanzin okuyucusunda yüz değişirken */
    pageTurn() {
        const a = audio(); if (!a) return;
        noise(a, { dur: 0.32, type: "bandpass", from: 900, to: 4500, q: 0.8, peak: 0.12, attack: 0.08 });
    },

    /** Beğeni — yumuşak pop */
    pop() {
        const a = audio(); if (!a) return;
        tone(a, { freq: 520, to: 980, dur: 0.12, type: "sine", peak: 0.16 });
    },

    /** Kâğıt topu fırlatma — hava sesi */
    whoosh() {
        const a = audio(); if (!a) return;
        noise(a, { dur: 0.5, type: "bandpass", from: 400, to: 1800, q: 1.2, peak: 0.12, attack: 0.15 });
    },

    /** Çöp kutusuna isabet — teneke tok */
    thunk() {
        const a = audio(); if (!a) return;
        tone(a, { freq: 160, to: 70, dur: 0.25, type: "sine", peak: 0.3 });
        tone(a, { freq: 720, to: 540, dur: 0.18, type: "square", peak: 0.03 });
        noise(a, { dur: 0.08, type: "lowpass", from: 1200, to: 300, peak: 0.12, attack: 0.002 });
    },

    /** Iska — yerde sekme (üç küçük tık) */
    bounce() {
        const a = audio(); if (!a) return;
        [0, 0.16, 0.27].forEach((d, i) =>
            tone(a, { freq: 300 - i * 40, to: 140, dur: 0.07, type: "triangle", peak: 0.12 / (i + 1), delay: d }));
    },

    /** Başarı — iki notalı küçük zil */
    chime() {
        const a = audio(); if (!a) return;
        tone(a, { freq: 880, dur: 0.18, peak: 0.08 });
        tone(a, { freq: 1320, dur: 0.28, peak: 0.07, delay: 0.09 });
    },
};
