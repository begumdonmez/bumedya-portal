"use client";

import { useEffect } from "react";
import { sfx } from "@/lib/sfx";

/**
 * Sitedeki genel tıklama sesleri. Tek bir dinleyiciyle çalışır:
 *   filtre hapı  → Fanzin'de fosforlu kalem, diğer temalarda tık
 *   buton / buton görünümlü bağlantı → tık
 * Özel anlarda (beğeni, görüntüleyici, 404 oyunu) bileşenler sfx'i doğrudan çağırır;
 * onlar data-sfx="none" ile bu genel sesi bastırır.
 */
export default function SoundLayer() {
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            const el = (e.target as HTMLElement).closest<HTMLElement>("button, a, summary, [role='button']");
            if (!el || el.closest("[data-sfx='none']") || (el as HTMLButtonElement).disabled) return;

            if (el.classList.contains("pill")) {
                if (el.getAttribute("aria-pressed") === "true") return; // zaten seçili
                if (document.documentElement.dataset.theme === "fanzin") sfx.marker();
                else sfx.tap();
                return;
            }
            const isButtonLike = el.tagName !== "A" || /\bbtn-(primary|ghost)\b/.test(el.className);
            if (isButtonLike) sfx.tap();
        };
        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, []);
    return null;
}
