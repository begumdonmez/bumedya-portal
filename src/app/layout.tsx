import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, Geist_Mono, Patrick_Hand } from "next/font/google";
import { Toaster } from "sonner";
import ScrollToTop from "@/components/ScrollToTop";
import SoundLayer from "@/components/SoundLayer";
import InViewObserver from "@/components/motion/InViewObserver";
import DoodleSky from "@/components/motion/DoodleSky";
import "./globals.css";

/* ─── Fontlar ───────────────────────────────────────────────── */
const fraunces = Fraunces({
    subsets: ["latin", "latin-ext"],
    variable: "--font-serif",
    display: "swap",
    axes: ["opsz", "SOFT"],
});

const instrumentSans = Instrument_Sans({
    subsets: ["latin", "latin-ext"],
    variable: "--font-body",
    display: "swap",
});

// Yalnızca Fanzin temasında kullanılır — diğer temalarda indirme yükü olmasın diye önceden yüklenmez
const patrickHand = Patrick_Hand({
    subsets: ["latin", "latin-ext"],
    weight: "400",
    variable: "--font-hand",
    display: "swap",
    preload: false,
});

const geistMono = Geist_Mono({
    subsets: ["latin", "latin-ext"],
    variable: "--font-geist-mono",
    display: "swap",
});

/* ─── SEO Metadata ──────────────────────────────────────────── */
export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ),
    title: {
        default: "bumedya. — dijital fanzin ve topluluk",
        template: "%s | bumedya.",
    },
    description:
        "Fikirlerin forma dönüştüğü, sınırların bulanıklaştığı yeni nesil dijital fanzin ve topluluk portalı.",
    keywords: ["dijital fanzin", "yaratıcı topluluk", "sanat portalı", "bumedya"],
    authors: [{ name: "bumedya." }],
    openGraph: {
        type: "website",
        locale: "tr_TR",
        siteName: "bumedya.",
        title: "bumedya. — dijital fanzin ve topluluk",
        description:
            "Fikirlerin forma dönüştüğü, sınırların bulanıklaştığı yeni nesil dijital fanzin ve topluluk portalı.",
    },
    twitter: {
        card: "summary_large_image",
        title: "bumedya. — dijital fanzin ve topluluk",
        description: "Fikirlerin forma dönüştüğü dijital fanzin ve topluluk portalı.",
    },
    robots: { index: true, follow: true },
};

/* ─── Viewport ──────────────────────────────────────────────── */
export const viewport: Viewport = {
    themeColor: "var(--paper)",
    colorScheme: "dark",
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

// Varsayılan tema Fanzin; kullanıcı başka bir tema (ya da "sistem") seçtiyse o hatırlanır
const THEME_INIT = `(function(){var t="fanzin";try{t=localStorage.getItem("bm-theme")||"fanzin"}catch(e){}if(t==="kagit"||t==="gece"||t==="fanzin")document.documentElement.dataset.theme=t})()`;

/* ─── Root Layout ───────────────────────────────────────────── */
export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="tr"
            className={`h-full ${fraunces.variable} ${instrumentSans.variable} ${patrickHand.variable} ${geistMono.variable}`}
            suppressHydrationWarning
        >
        <head>
            {/* Tema, ilk boyamadan önce uygulanır — yanıp sönme olmaz */}
            <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        </head>
        <body className="paper-grain min-h-full flex flex-col antialiased">
        <ScrollToTop />
        <SoundLayer />
        <InViewObserver />
        <DoodleSky />
        {children}

        <Toaster
            position="top-right"
            expand={false}
            toastOptions={{
                duration: 4000,
                style: {
                    background: "var(--surface-solid)",
                    color: "var(--text-1)",
                    border: "1px solid var(--border-1)",
                    borderRadius: "10px",
                    fontFamily: "var(--font-sans)",
                },
            }}
        />
        </body>
        </html>
    );
}