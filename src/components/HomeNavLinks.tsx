"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
    { href: "/home",        label: "Ana Sayfa"   },
    { href: "/akis",        label: "Akış"         },
    { href: "/galeri",      label: "Galeri"       },
    { href: "/members",     label: "Üyeler"       },
    { href: "/etkinlikler", label: "Etkinlikler"  },
    { href: "/chat",        label: "Lounge"       },
    { href: "/manifest",   label: "Manifest"     },
];

export default function HomeNavLinks() {
    const pathname = usePathname();

    return (
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
    );
}
