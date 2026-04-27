"use client";

import { useEffect, useState } from "react";

export default function NavbarBackdrop() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div
            className="absolute inset-0 -z-10 transition-all duration-300"
            style={{
                backdropFilter: scrolled ? "blur(16px)" : "none",
                background: scrolled ? "rgba(10,15,30,0.7)" : "transparent",
                borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
            }}
        />
    );
}
