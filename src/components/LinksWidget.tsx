import { ExternalLink, BookOpen, Palette, Link2, MessageCircle, PlayCircle } from "lucide-react";

const LINKS = [
    {
        icon: Link2,
        label: "Linktree",
        sub: "linktr.ee/Bumedya",
        href: "https://linktr.ee/Bumedya",
        color: "color-mix(in srgb, var(--success) 90%, transparent)",
        bg: "color-mix(in srgb, var(--success) 8%, transparent)",
        border: "color-mix(in srgb, var(--success) 20%, transparent)",
    },
    {
        icon: BookOpen,
        label: "Substack",
        sub: "Yazılar & Bülten",
        href: "https://tr.ee/8yqLkD1Pui",
        color: "color-mix(in srgb, var(--warn) 90%, transparent)",
        bg: "color-mix(in srgb, var(--warn) 6%, transparent)",
        border: "color-mix(in srgb, var(--warn) 20%, transparent)",
    },
    {
        icon: Palette,
        label: "Behance",
        sub: "Portfolyo & Projeler",
        href: "https://tr.ee/KzNm63eLY-",
        color: "color-mix(in srgb, var(--accent) 90%, transparent)",
        bg: "color-mix(in srgb, var(--accent) 8%, transparent)",
        border: "color-mix(in srgb, var(--accent) 20%, transparent)",
    },
    {
        icon: Link2,
        label: "Instagram",
        sub: "@bumedya",
        href: "https://tr.ee/P6nG2_pCeD",
        color: "color-mix(in srgb, var(--pink) 90%, transparent)",
        bg: "color-mix(in srgb, var(--pink) 6%, transparent)",
        border: "color-mix(in srgb, var(--pink) 18%, transparent)",
    },
    {
        icon: PlayCircle,
        label: "YouTube",
        sub: "@BumedyaOfficial",
        href: "https://www.youtube.com/@BumedyaOfficial",
        color: "color-mix(in srgb, var(--danger) 90%, transparent)",
        bg: "color-mix(in srgb, var(--danger) 6%, transparent)",
        border: "color-mix(in srgb, var(--danger) 15%, transparent)",
    },
    {
        icon: MessageCircle,
        label: "Discord",
        sub: "Sunucuya Katıl",
        href: "https://discord.gg/rpbQV6ra",
        color: "color-mix(in srgb, var(--accent) 90%, transparent)",
        bg: "color-mix(in srgb, var(--accent) 8%, transparent)",
        border: "color-mix(in srgb, var(--accent) 20%, transparent)",
    },
    {
        icon: PlayCircle,
        label: "Spotify",
        sub: "Playlist & Müzik",
        href: "https://open.spotify.com/user/31snmflqv6wdmuoi4zkmsk7rh3vq",
        color: "rgba(29,185,84,0.9)",
        bg: "rgba(29,185,84,0.06)",
        border: "rgba(29,185,84,0.18)",
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
                                 style={{ background: "var(--bg-2)", color }}>
                                <Icon size={14} strokeWidth={1.8} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium" style={{ color }}>{label}</p>
                                <p className="text-[11px] truncate" style={{ color: "var(--text-4)" }}>{sub}</p>
                            </div>
                            {href && <ExternalLink size={11} style={{ color: "var(--text-4)" }} />}
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
