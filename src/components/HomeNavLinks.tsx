"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import SoundToggle from "@/components/SoundToggle";

const PRIMARY = [
    { href: "/fanzin",      label: "Fanzin"      },
    { href: "/akis",        label: "Akış"        },
    { href: "/arsiv",       label: "Arşiv"       },
    { href: "/galeri",      label: "Galeri"      },
    { href: "/etkinlikler", label: "Etkinlikler" },
    { href: "/chat",        label: "Lounge"      },
];

const MORE = [
    { href: "/home",      label: "Pano"      },
    { href: "/members",   label: "Üyeler"    },
    { href: "/yildizlar", label: "Yıldızlar" },
    { href: "/manifest",  label: "Manifest"  },
    { href: "/basvuru",   label: "Başvuru"   },
];

const ALL = [...MORE.slice(0, 1), ...PRIMARY, ...MORE.slice(1)];

function isActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(href + "/");
}

export default function HomeNavLinks() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const moreRef = useRef<HTMLDivElement>(null);

    // Sayfa değişince menüleri kapat (render sırasında, efekt yerine)
    const [lastPath, setLastPath] = useState(pathname);
    if (lastPath !== pathname) {
        setLastPath(pathname);
        setOpen(false);
        setMoreOpen(false);
    }

    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    useEffect(() => {
        if (!moreOpen) return;
        const close = (e: MouseEvent) => {
            if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
        };
        const esc = (e: KeyboardEvent) => e.key === "Escape" && setMoreOpen(false);
        document.addEventListener("mousedown", close);
        document.addEventListener("keydown", esc);
        return () => {
            document.removeEventListener("mousedown", close);
            document.removeEventListener("keydown", esc);
        };
    }, [moreOpen]);

    const moreActive = MORE.some(l => isActive(pathname, l.href));

    return (
        <>
            {/* Masaüstü */}
            <div className="hidden lg:flex items-center gap-1 relative z-10">
                {PRIMARY.map(({ href, label }) => {
                    const active = isActive(pathname, href);
                    return (
                        <Link key={href} href={href} aria-current={active ? "page" : undefined}
                              className="relative px-3 py-2 text-sm font-medium transition-colors"
                              style={{ color: active ? "var(--text-1)" : "var(--text-3)" }}>
                            {label}
                            {active && (
                                <span aria-hidden className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full"
                                      style={{ background: "var(--accent)" }} />
                            )}
                        </Link>
                    );
                })}

                <div ref={moreRef} className="relative">
                    <button type="button" onClick={() => setMoreOpen(v => !v)}
                            aria-expanded={moreOpen} aria-haspopup="menu"
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors"
                            style={{ color: moreActive || moreOpen ? "var(--text-1)" : "var(--text-3)" }}>
                        Daha <ChevronDown size={14} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
                    </button>
                    {moreOpen && (
                        <div role="menu"
                             className="absolute right-0 top-full mt-1 w-44 py-1.5 rounded-lg animate-float-up"
                             style={{ background: "var(--surface-solid)", border: "1px solid var(--border-1)",
                                      boxShadow: "0 8px 24px color-mix(in srgb, var(--shade) 12%, transparent)" }}>
                            {MORE.map(({ href, label }) => (
                                <Link key={href} href={href} role="menuitem"
                                      className="block px-3.5 py-2 text-sm transition-colors hover:bg-[var(--bg-1)]"
                                      style={{ color: isActive(pathname, href) ? "var(--accent)" : "var(--text-2)" }}>
                                    {label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobil menü düğmesi */}
            <button type="button" onClick={() => setOpen(v => !v)}
                    className="lg:hidden relative z-10 flex items-center justify-center w-9 h-9 rounded-lg order-last"
                    style={{ border: "1px solid var(--border-2)", color: "var(--text-2)" }}
                    aria-label={open ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={open}>
                {open ? <X size={16} /> : <Menu size={16} />}
            </button>

            {open && (
                <div className="lg:hidden fixed inset-0 z-40" style={{ background: "var(--overlay)" }}
                     onClick={() => setOpen(false)} />
            )}

            <aside aria-hidden={!open}
                   className="lg:hidden fixed top-0 right-0 bottom-0 z-50 flex flex-col w-[min(280px,85vw)] safe-top"
                   style={{
                       background: "var(--paper)",
                       borderLeft: "1px solid var(--border-2)",
                       transform: open ? "translateX(0)" : "translateX(100%)",
                       visibility: open ? "visible" : "hidden",
                       transition: "transform 240ms cubic-bezier(0.4,0,0.2,1), visibility 240ms",
                   }}>
                <div className="flex items-center justify-between px-5 h-16" style={{ borderBottom: "1px solid var(--border-2)" }}>
                    <span className="font-display font-semibold text-lg" style={{ color: "var(--text-1)" }}>
                        bumedya<span style={{ color: "var(--accent)" }}>.</span>
                    </span>
                    <button type="button" onClick={() => setOpen(false)} aria-label="Menüyü kapat"
                            className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: "var(--text-3)" }}>
                        <X size={16} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto flex flex-col px-3 py-3">
                    {ALL.map(({ href, label }) => {
                        const active = isActive(pathname, href);
                        return (
                            <Link key={href} href={href} aria-current={active ? "page" : undefined}
                                  className="px-3 py-3 rounded-lg text-[15px] font-medium transition-colors"
                                  style={{
                                      color: active ? "var(--accent)" : "var(--text-2)",
                                      background: active ? "var(--accent-bg)" : "transparent",
                                  }}>
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-5 py-4 flex items-center justify-between safe-bottom" style={{ borderTop: "1px solid var(--border-2)" }}>
                    <span className="label-caps">Tema & ses</span>
                    <span className="flex items-center gap-2"><ThemeSwitcher /><SoundToggle /></span>
                </div>
            </aside>
        </>
    );
}
