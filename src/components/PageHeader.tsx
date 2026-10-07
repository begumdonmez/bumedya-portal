import type { ReactNode } from "react";
import { LivelyWords, ScrambleText } from "@/components/motion/Text";

interface Props {
    eyebrow?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    /** Başlığın sağında (mobilde altında) duran aksiyonlar */
    actions?: ReactNode;
    className?: string;
}

/** Sayfa başlığı — fanzin bölüm açılışı: küçük üst etiket, serif başlık, alt çizgi. */
export default function PageHeader({ eyebrow, title, description, actions, className = "" }: Props) {
    return (
        <header className={`flex flex-col sm:flex-row sm:items-end justify-between gap-5 pb-6 mb-8 ${className}`}
                style={{ borderBottom: "1px solid var(--border-1)" }}>
            <div className="min-w-0">
                {eyebrow && <p className="label-caps mb-2">{eyebrow}</p>}
                <h1 className="font-display font-medium leading-[1.05] tracking-tight"
                    style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", color: "var(--text-1)" }}>
                    {typeof title === "string" ? <ScrambleText text={title} every={5000} /> : title}
                </h1>
                {description && (
                    <div className="mt-3 text-[15px] leading-relaxed max-w-xl" style={{ color: "var(--text-3)" }}>
                        {typeof description === "string" ? <LivelyWords text={description} /> : description}
                    </div>
                )}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </header>
    );
}
