import Link from "next/link";

export default function Wordmark({ size = "sm", href = "/" }: { size?: "sm" | "lg"; href?: string }) {
    return (
        <Link href={href} className="relative z-10 shrink-0 font-display font-semibold leading-none"
              style={{ fontSize: size === "lg" ? 22 : 19, color: "var(--text-1)" }}>
            bumedya<span style={{ color: "var(--accent)" }}>.</span>
        </Link>
    );
}
