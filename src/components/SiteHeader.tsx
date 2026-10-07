import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import HomeNavLinks from "@/components/HomeNavLinks";
import NotificationBell from "@/components/NotificationBell";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import SoundToggle from "@/components/SoundToggle";
import Wordmark from "@/components/Wordmark";

interface Props {
    userId?: string | null;
    username?: string | null;
    /** Sayfaya özel aksiyon (ör. "Paylaş") — zil ve profilin soluna gelir */
    actions?: ReactNode;
    /** Logo yerine geri bağlantısı göster */
    back?: { href: string; label: string };
    /** Ana gezinmeyi gizle (yasal sayfalar vb.) */
    minimal?: boolean;
}

/** Tüm sayfalarda ortak üst çubuk. */
export default function SiteHeader({ userId, username, actions, back, minimal }: Props) {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-8 h-16">
            <NavbarBackdrop />

            {back ? (
                <Link href={back.href} className="relative z-10 flex items-center gap-1 text-sm"
                      style={{ color: "var(--text-3)" }}>
                    <ChevronLeft size={16} /> {back.label}
                </Link>
            ) : (
                <Wordmark href={userId ? "/home" : "/"} />
            )}

            {!minimal && <HomeNavLinks />}

            <div className="relative z-10 ml-auto flex items-center gap-2 shrink-0">
                {actions}
                <ThemeSwitcher className="hidden sm:inline-flex" />
                <SoundToggle className="hidden sm:flex" />
                {userId && username ? (
                    <>
                        <NotificationBell userId={userId} />
                        <Link href="/profil"
                              className="text-xs font-medium px-3 py-2 rounded-lg max-w-[96px] sm:max-w-none truncate transition-colors"
                              style={{ color: "var(--text-1)", border: "1px solid var(--border-1)" }}>
                            @{username}
                        </Link>
                    </>
                ) : !minimal ? (
                    <>
                        <Link href="/login" className="text-sm font-medium px-3 py-2" style={{ color: "var(--text-2)" }}>
                            Giriş
                        </Link>
                        <Link href="/register" className="btn-primary !py-2 !px-4 !text-sm">Katıl</Link>
                    </>
                ) : null}
            </div>
        </nav>
    );
}
