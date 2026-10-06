"use client";

import { useEffect, useState } from "react";

/** Sayfa kaydırılınca üst çubuğa zemin ve alt çizgi verir. */
export default function NavbarBackdrop() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div aria-hidden
             className={`absolute inset-0 -z-10 transition-colors duration-200 ${scrolled ? "nav-backdrop" : ""}`}
             style={scrolled ? undefined : { borderBottom: "1px solid transparent" }} />
    );
}
