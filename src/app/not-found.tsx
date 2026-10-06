import Link from "next/link";

export default function NotFound() {
    return (
        <main className="relative z-10 min-h-dvh flex items-center px-6">
            <div className="max-w-3xl mx-auto w-full">
                <p className="label-caps mb-6">Hata 404 · sayfa bulunamadı</p>
                <h1 className="font-display font-medium leading-[0.95] tracking-tight"
                    style={{ fontSize: "clamp(3rem, 10vw, 7rem)", color: "var(--text-1)" }}>
                    Burası henüz <em className="italic marker" style={{ color: "var(--accent)" }}>çizilmedi.</em>
                </h1>
                <p className="mt-6 text-lg leading-relaxed max-w-lg" style={{ color: "var(--text-3)" }}>
                    Aradığın sayfa silinmiş, taşınmış ya da hiç var olmamış —
                    tıpkı taslakta kaybolan bazı fikirler gibi.
                </p>
                <div className="flex flex-wrap gap-3 mt-10">
                    <Link href="/" className="btn-primary">Ana sayfaya dön</Link>
                    <Link href="/akis" className="btn-ghost">Akışa bak</Link>
                </div>
            </div>
        </main>
    );
}
