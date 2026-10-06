import Link from "next/link";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const LINKS = [
    { label: "Gizlilik", href: "/gizlilik"   },
    { label: "Kurallar", href: "/#kurallar"  },
    { label: "İletişim", href: "#iletisim"   },
];

export default function SiteFooter() {
    return (
        <footer className="relative z-10 w-full" style={{ borderTop: "1px solid var(--border-1)" }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <p className="font-display text-lg font-semibold" style={{ color: "var(--text-1)" }}>
                        bumedya<span style={{ color: "var(--accent)" }}>.</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-4)" }}>
                        Üret. Paylaş. Büyü. — {new Date().getFullYear()}
                    </p>
                </div>
                <div className="flex items-center gap-6 flex-wrap">
                    <nav className="flex items-center gap-5">
                        {LINKS.map(({ label, href }) => (
                            <Link key={label} href={href} className="text-sm hover:underline underline-offset-4"
                                  style={{ color: "var(--text-3)" }}>
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <ThemeSwitcher />
                </div>
            </div>
        </footer>
    );
}
