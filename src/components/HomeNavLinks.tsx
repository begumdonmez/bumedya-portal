"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
    { href: "/home",        label: "Ana Sayfa"   },
    { href: "/akis",        label: "Akış"         },
    { href: "/galeri",      label: "Galeri"       },
    { href: "/members",     label: "Üyeler"       },
    { href: "/etkinlikler", label: "Etkinlikler"  },
    { href: "/chat",        label: "Lounge"       },
    { href: "/manifest",    label: "Manifest"     },
];

export default function HomeNavLinks() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    // Route değişince kapat
    useEffect(() => { setOpen(false); }, [pathname]);

    // Scroll lock
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    return (
        <>
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 relative z-10">
                {LINKS.map(({ href, label }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={active ? () => window.scrollTo({ top: 0, behavior: "smooth" }) : undefined}
                            className="text-xs tracking-widest uppercase font-medium transition-colors duration-200"
                            style={{ color: active ? "rgba(240,249,255,0.9)" : "rgba(240,249,255,0.38)" }}
                        >
                            {label}
                        </Link>
                    );
                })}
            </div>

            {/* Mobile hamburger button */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="md:hidden relative z-10 flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200"
                style={{
                    background: open ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${open ? "rgba(124,58,237,0.35)" : "rgba(255,255,255,0.08)"}`,
                    color: "rgba(240,249,255,0.7)",
                }}
                aria-label="Menüyü aç"
            >
                {open ? <X size={16} /> : <Menu size={16} />}
            </button>

            {/* Mobile overlay */}
            {open && (
                <div
                    className="md:hidden fixed inset-0 z-40"
                    style={{ background: "rgba(4,6,26,0.6)", backdropFilter: "blur(4px)" }}
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <div
                className="md:hidden fixed top-0 right-0 bottom-0 z-50 flex flex-col"
                style={{
                    width: 260,
                    background: "rgba(8,12,36,0.97)",
                    backdropFilter: "blur(32px)",
                    borderLeft: "1px solid rgba(124,58,237,0.15)",
                    transform: open ? "translateX(0)" : "translateX(100%)",
                    transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
                }}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 py-5 border-b"
                     style={{ borderColor: "rgba(124,58,237,0.12)" }}>
                    <div className="flex items-baseline gap-0.5">
                        <span className="text-sm font-bold" style={{ color: "rgba(224,242,254,0.55)" }}>bumedya</span>
                        <span className="text-sm font-bold" style={{ color: "rgba(124,58,237,0.8)" }}>.</span>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ color: "rgba(224,242,254,0.4)", background: "rgba(255,255,255,0.04)" }}
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Links */}
                <nav className="flex-1 flex flex-col px-3 py-4 gap-1">
                    {LINKS.map(({ href, label }) => {
                        const active = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={active ? () => window.scrollTo({ top: 0, behavior: "smooth" }) : undefined}
                                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-150"
                                style={{
                                    color: active ? "rgba(167,139,250,0.95)" : "rgba(224,242,254,0.55)",
                                    background: active ? "rgba(124,58,237,0.12)" : "transparent",
                                    border: `1px solid ${active ? "rgba(124,58,237,0.25)" : "transparent"}`,
                                }}
                            >
                                {active && (
                                    <span className="w-1.5 h-1.5 rounded-full shrink-0"
                                          style={{ background: "rgba(124,58,237,0.8)" }} />
                                )}
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom decoration */}
                <div className="px-5 py-5 border-t" style={{ borderColor: "rgba(124,58,237,0.08)" }}>
                    <p className="text-[10px] tracking-widest uppercase" style={{ color: "rgba(224,242,254,0.2)" }}>
                        Bumedya Portalı
                    </p>
                </div>
            </div>
        </>
    );
}
