import Link from "next/link";

const LINKS = [
    { label: "Gizlilik",  href: "/gizlilik"     },
    { label: "Kurallar",  href: "/#kurallar"    },
    { label: "İletişim",  href: "/iletisim"     },
];

export default function SiteFooter() {
    return (
        <footer className="relative z-10 px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="font-mono text-xs" style={{ color: "rgba(240,249,255,0.2)" }}>
                bumedya. v0.1
            </span>
            <div className="flex items-center gap-6">
                {LINKS.map(({ label, href }) => (
                    <Link key={label} href={href}
                          className="text-xs transition-colors duration-200 hover:opacity-60"
                          style={{ color: "rgba(240,249,255,0.2)" }}>
                        {label}
                    </Link>
                ))}
            </div>
        </footer>
    );
}
