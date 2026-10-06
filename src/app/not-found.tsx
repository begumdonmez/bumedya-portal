import Link from "next/link";

export default function NotFound() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">

            <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-sm">

                <div className="text-[120px] font-black leading-none select-none"
                     style={{ color: "transparent", WebkitTextStroke: "2px color-mix(in srgb, var(--accent) 40%, transparent)" }}>
                    404
                </div>

                <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-bold" style={{ color: "var(--text-1)" }}>
                        Burası henüz çizilmedi.
                    </h1>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-4)" }}>
                        Aradığın sayfa ya silinmiş, ya taşınmış,<br />
                        ya da hiç var olmamış — tıpkı bazı fikirlerin taslak aşamasında kaybolması gibi.
                    </p>
                </div>

                <div className="flex items-center gap-3 mt-2">
                    <Link href="/home"
                          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                          style={{ background: "var(--accent-bg-md)", border: "1px solid var(--accent-border)", color: "var(--accent-text)" }}>
                        Ana Sayfaya Dön
                    </Link>
                    <Link href="/akis"
                          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                          style={{ background: "var(--bg-2)", border: "1px solid var(--border-2)", color: "var(--text-3)" }}>
                        Akışa Bak
                    </Link>
                </div>

                <p className="text-[11px]" style={{ color: "var(--text-5)" }}>
                    bumedya<span style={{ color: "var(--accent)" }}>.</span> · sayfa bulunamadı
                </p>
            </div>
        </div>
    );
}
