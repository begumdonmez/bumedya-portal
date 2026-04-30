import { Link2, Mail, MessageCircle } from "lucide-react";
import ContactForm from "./ContactForm";

const CHANNELS = [
    {
        icon: Link2,
        label: "Instagram",
        sub: "@bumedya",
        href: "https://tr.ee/P6nG2_pCeD",
        color: "rgba(244,114,182,0.9)",
        bg: "rgba(244,114,182,0.08)",
        border: "rgba(244,114,182,0.2)",
    },
    {
        icon: MessageCircle,
        label: "Discord",
        sub: "discord.gg/rpbQV6ra",
        href: "https://discord.gg/rpbQV6ra",
        color: "rgba(129,140,248,0.9)",
        bg: "rgba(99,102,241,0.08)",
        border: "rgba(99,102,241,0.2)",
    },
    {
        icon: Mail,
        label: "E-Posta",
        sub: "bumedyailetisim@gmail.com",
        href: "mailto:bumedyailetisim@gmail.com",
        color: "rgba(147,197,253,0.9)",
        bg: "rgba(59,130,246,0.08)",
        border: "rgba(59,130,246,0.2)",
    },
];

export default function ContactSection() {
    return (
        <section id="iletisim" className="relative z-10 px-4 sm:px-8 py-20 max-w-5xl mx-auto w-full">
            <div className="text-center mb-12">
                <p className="label-caps mb-4">İletişim</p>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "#E0F2FE" }}>
                    Bize Ulaşın
                </h2>
                <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: "rgba(224,242,254,0.4)" }}>
                    Sormak istediğin bir şey mi var? Sosyal medyadan ya da doğrudan mesaj göndererek bize ulaşabilirsin.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sol — kanallar */}
                <div className="flex flex-col gap-4">
                    <p className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: "rgba(224,242,254,0.3)" }}>
                        Kanallar
                    </p>
                    {CHANNELS.map(({ icon: Icon, label, sub, href, color, bg, border }) => (
                        <a key={label} href={href} target={href.startsWith("mailto") ? undefined : "_blank"}
                           rel="noopener noreferrer"
                           className="flex items-center gap-4 rounded-2xl p-4 transition-all duration-200 group"
                           style={{ background: bg, border: `1px solid ${border}` }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                 style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${border}`, color }}>
                                <Icon size={18} strokeWidth={1.8} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color }}>{label}</p>
                                <p className="text-xs" style={{ color: "rgba(224,242,254,0.4)" }}>{sub}</p>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Sağ — form */}
                <div className="rounded-2xl p-6"
                     style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <p className="text-[10px] font-medium tracking-[0.15em] uppercase mb-5" style={{ color: "rgba(224,242,254,0.3)" }}>
                        Mesaj Gönder
                    </p>
                    <ContactForm />
                </div>
            </div>
        </section>
    );
}
