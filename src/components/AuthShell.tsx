import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";

interface Props {
    title: ReactNode;
    description?: ReactNode;
    back?: { href: string; label: string };
    children: ReactNode;
}

/** Giriş/kayıt/şifre sayfalarının ortak iskeleti: solda kapak, sağda form. */
export default function AuthShell({ title, description, back, children }: Props) {
    return (
        <div className="relative z-10 min-h-dvh grid lg:grid-cols-2">
            <aside className="hidden lg:flex flex-col justify-between p-12" style={{ background: "var(--paper-2)", borderRight: "1px solid var(--border-2)" }}>
                <Link href="/" className="font-display text-2xl font-semibold" style={{ color: "var(--text-1)" }}>
                    bumedya<span style={{ color: "var(--accent)" }}>.</span>
                </Link>
                <Image src="/logo.png" alt="" width={360} height={360} className="w-[min(360px,70%)] h-auto self-center -rotate-3" />
                <blockquote className="font-display text-2xl italic leading-snug max-w-md" style={{ color: "var(--text-2)" }}>
                    “Kusursuzu aramayın; kusurlarımız bizi biz yapan şeylerdir.”
                </blockquote>
            </aside>

            <main className="flex flex-col px-5 sm:px-10 py-6">
                <div className="flex items-center justify-between">
                    {back ? (
                        <Link href={back.href} className="flex items-center gap-1 text-sm" style={{ color: "var(--text-3)" }}>
                            <ChevronLeft size={16} /> {back.label}
                        </Link>
                    ) : (
                        <Link href="/" className="lg:invisible font-display text-xl font-semibold" style={{ color: "var(--text-1)" }}>
                            bumedya<span style={{ color: "var(--accent)" }}>.</span>
                        </Link>
                    )}
                    <ThemeSwitcher />
                </div>

                <div className="flex-1 flex items-center justify-center py-10">
                    <div className="w-full max-w-sm animate-float-up">
                        <h1 className="font-display text-4xl font-medium tracking-tight mb-2" style={{ color: "var(--text-1)" }}>
                            {title}
                        </h1>
                        {description && <p className="text-[15px] mb-8" style={{ color: "var(--text-3)" }}>{description}</p>}
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
