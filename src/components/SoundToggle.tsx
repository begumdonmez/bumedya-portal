"use client";

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { setSoundEnabled, sfx } from "@/lib/sfx";

function read() {
    try { return localStorage.getItem("bm-sound") !== "off"; } catch { return true; }
}
function subscribe(cb: () => void) {
    window.addEventListener("bm-sound-change", cb);
    return () => window.removeEventListener("bm-sound-change", cb);
}

/** Ses aç/kapa — tercih tarayıcıda saklanır. */
export default function SoundToggle({ className = "" }: { className?: string }) {
    const on = useSyncExternalStore(subscribe, read, () => true);
    return (
        <button type="button" data-sfx="none"
                onClick={() => { setSoundEnabled(!on); if (!on) setTimeout(() => sfx.chime(), 0); }}
                aria-pressed={on} aria-label={on ? "Sesi kapat" : "Sesi aç"} title={on ? "Sesi kapat" : "Sesi aç"}
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${className}`}
                style={{ border: "1px solid var(--border-2)", color: on ? "var(--text-2)" : "var(--text-4)" }}>
            {on ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
    );
}
