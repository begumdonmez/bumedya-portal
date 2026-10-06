import ContactForm from "./ContactForm";

const CHANNELS = [
    { label: "Instagram", sub: "@bumedya",                  href: "https://tr.ee/P6nG2_pCeD" },
    { label: "Discord",   sub: "discord.gg/rpbQV6ra",       href: "https://discord.gg/rpbQV6ra" },
    { label: "E-posta",   sub: "bumedyailetisim@gmail.com", href: "mailto:bumedyailetisim@gmail.com" },
];

/** Sayfa sonu iletişim bloğu — kanallar solda, form sağda. */
export default function ContactSection() {
    return (
        <section id="iletisim" className="relative z-10 w-full scroll-mt-16" style={{ borderTop: "1px solid var(--border-1)" }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-20 grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20">
                <div>
                    <p className="label-caps mb-3">İletişim</p>
                    <h2 className="font-display text-3xl sm:text-4xl font-medium mb-4" style={{ color: "var(--text-1)" }}>
                        Bize yaz
                    </h2>
                    <p className="text-[15px] leading-relaxed mb-8 max-w-sm" style={{ color: "var(--text-3)" }}>
                        Bir sorun, bir fikir ya da sadece merhaba — hangisi olursa.
                    </p>
                    <ul className="flex flex-col">
                        {CHANNELS.map(({ label, sub, href }) => (
                            <li key={label} style={{ borderTop: "1px solid var(--border-2)" }}>
                                <a href={href}
                                   target={href.startsWith("mailto") ? undefined : "_blank"}
                                   rel="noopener noreferrer"
                                   className="group flex items-baseline justify-between gap-4 py-3.5">
                                    <span className="font-semibold" style={{ color: "var(--text-1)" }}>{label}</span>
                                    <span className="text-sm truncate group-hover:underline underline-offset-4" style={{ color: "var(--accent)" }}>
                                        {sub} ↗
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="card p-6 sm:p-8">
                    <ContactForm />
                </div>
            </div>
        </section>
    );
}
