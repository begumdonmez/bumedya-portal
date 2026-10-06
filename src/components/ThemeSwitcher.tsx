"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Scissors, Sun } from "lucide-react";

export type Theme = "kagit" | "gece" | "fanzin" | "sistem";

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
    { value: "kagit",  label: "Kâğıt (açık)",           Icon: Sun },
    { value: "gece",   label: "Gece (koyu)",            Icon: Moon },
    { value: "fanzin", label: "Fanzin (siyah-beyaz)",   Icon: Scissors },
    { value: "sistem", label: "Sistem (açık/koyu)",     Icon: Monitor },
];

const STORAGE_KEY = "bm-theme";

function readTheme(): Theme {
    const t = document.documentElement.dataset.theme;
    return t === "kagit" || t === "gece" || t === "fanzin" ? t : "sistem";
}

function subscribe(onChange: () => void) {
    const mo = new MutationObserver(onChange);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;
    if (theme === "sistem") delete root.dataset.theme;
    else root.dataset.theme = theme;
    try {
        if (theme === "sistem") localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, theme);
    } catch { /* gizli mod vb. — tema yine de bu sekmede uygulanır */ }
}

export default function ThemeSwitcher({ className = "" }: { className?: string }) {
    const theme = useSyncExternalStore(subscribe, readTheme, () => "sistem" as Theme);

    return (
        <div role="radiogroup" aria-label="Tema"
             className={`inline-flex items-center rounded-lg p-0.5 ${className}`}
             style={{ border: "1px solid var(--border-2)" }}>
            {OPTIONS.map(({ value, label, Icon }) => {
                const active = theme === value;
                return (
                    <button key={value} type="button" role="radio" aria-checked={active}
                            aria-label={label} title={label}
                            onClick={() => applyTheme(value)}
                            className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
                            style={{
                                background: active ? "var(--accent-bg-md)" : "transparent",
                                color: active ? "var(--accent)" : "var(--text-4)",
                            }}>
                        <Icon size={14} strokeWidth={2} />
                    </button>
                );
            })}
        </div>
    );
}
