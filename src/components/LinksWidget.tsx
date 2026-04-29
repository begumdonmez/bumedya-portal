import { ExternalLink, BookOpen, Palette, Link2, MessageCircle } from "lucide-react";

const LINKS = [
    {
        icon: Link2,
        label: "Linktree",
        sub: "linktr.ee/Bumedya",
        href: "https://linktr.ee/Bumedya",
        color: "rgba(52,211,153,0.9)",
        bg: "rgba(52,211,153,0.08)",
        border: "rgba(52,211,153,0.2)",
    },
    {
        icon: BookOpen,
        label: "Substack",
        sub: "Yazılar & Bülten",
        href: "https://tr.ee/8yqLkD1Pui",
        color: "rgba(251,191,36,0.9)",
        bg: "rgba(251,191,36,0.06)",
        border: "rgba(251,191,36,0.2)",
    },
    {
        icon: Palette,
        label: "Behance",
        sub: "Portfolyo & Projeler",
        href: "https://tr.ee/KzNm63eLY-",
        color: "rgba(167,139,250,0.9)",
        bg: "rgba(124,58,237,0.08)",
        border: "rgba(124,58,237,0.2)",
    },
    {
        icon: MessageCircle,
        label: "Discord",
        sub: "Yakında",
        href: null,
        color: "rgba(224,242,254,0.25)",
        bg: "rgba(255,255,255,0.03)",
        border: "rgba(255,255,255,0.07)",
    },
];

export default function LinksWidget() {
    return (
        <div className="flex flex-col h-full">
            <p className="label-caps mb-4">Bağlantılar</p>
            <div className="flex flex-col gap-2 flex-1">
                {LINKS.map(({ icon: Icon, label, sub, href, color, bg, border }) => {
                    const inner = (
                        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group"
                             style={{ background: bg, border: `1px solid ${border}` }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                 style={{ background: "rgba(255,255,255,0.05)", color }}>
                                <Icon size={14} strokeWidth={1.8} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium" style={{ color }}>{label}</p>
                                <p className="text-[10px] truncate" style={{ color: "rgba(224,242,254,0.3)" }}>{sub}</p>
                            </div>
                            {href && <ExternalLink size={11} style={{ color: "rgba(224,242,254,0.2)" }} />}
                        </div>
                    );

                    return href ? (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="block">
                            {inner}
                        </a>
                    ) : (
                        <div key={label} className="opacity-40 cursor-not-allowed">{inner}</div>
                    );
                })}
            </div>
        </div>
    );
}
