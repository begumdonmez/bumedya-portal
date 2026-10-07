"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Tek gözlemci: [data-anim] taşıyan her öğe ekrana girince .in-view sınıfını alır,
 * çıkınca kaybeder. CSS, .in-view olmayan öğelerdeki animasyonları durdurur —
 * böylece yalnızca kullanıcının o an baktığı alan hareket eder.
 * [data-anim="once"] olanlar bir kez görününce işaretli kalır (ör. fosforlu çizim).
 */
export default function InViewObserver() {
    const pathname = usePathname();

    useEffect(() => {
        const io = new IntersectionObserver(entries => {
            for (const e of entries) {
                const el = e.target as HTMLElement;
                if (e.isIntersecting) {
                    el.classList.add("in-view");
                    if (el.dataset.anim === "once") io.unobserve(el);
                } else if (el.dataset.anim !== "once") {
                    el.classList.remove("in-view");
                }
            }
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.15 });

        const watch = (root: ParentNode) =>
            root.querySelectorAll<HTMLElement>("[data-anim]:not([data-anim-watched])").forEach(el => {
                el.dataset.animWatched = "";
                io.observe(el);
            });

        watch(document);
        // Sonradan eklenen öğeleri de yakala (sayfalama, modallar…); kare başına en fazla bir tarama
        let raf = 0;
        const mo = new MutationObserver(() => {
            if (raf) return;
            raf = requestAnimationFrame(() => { raf = 0; watch(document); });
        });
        mo.observe(document.body, { childList: true, subtree: true });

        return () => { io.disconnect(); mo.disconnect(); cancelAnimationFrame(raf); };
    }, [pathname]);

    return null;
}
