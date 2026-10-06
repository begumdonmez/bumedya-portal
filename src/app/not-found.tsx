import Link from "next/link";
import NotFoundToy from "@/components/NotFoundToy";

export default function NotFound() {
    return (
        <main className="relative z-10 min-h-dvh flex items-center px-6 py-16 overflow-hidden">
            <div className="max-w-4xl mx-auto w-full">
                <p className="label-caps mb-4">Sayı 404 · kayıp sayfalar özel eki</p>

                <NotFoundToy />

                <p className="mt-6 text-lg leading-relaxed max-w-lg" style={{ color: "var(--text-3)" }}>
                    Aradığın sayfa yok. Ama sen buradasın, bu da bir şeydir.
                </p>
                <div className="flex flex-wrap gap-3 mt-8">
                    <Link href="/" className="btn-primary">Ana sayfaya kaç</Link>
                    <Link href="/akis" className="btn-ghost">Akışta oyalan</Link>
                </div>
            </div>
        </main>
    );
}
