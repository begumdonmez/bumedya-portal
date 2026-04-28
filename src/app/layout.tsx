import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "leaflet/dist/leaflet.css";
import "./globals.css";

/* ─── Fontlar ───────────────────────────────────────────────── */
const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space",
    display: "swap",
    weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
    display: "swap",
});

/* ─── SEO Metadata ──────────────────────────────────────────── */
export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    ),
    title: {
        default: "bumedya. | Yaratıcı Dijital Evren",
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
        title: "bumedya. | Yaratıcı Dijital Evren",
        description:
            "Fikirlerin forma dönüştüğü, sınırların bulanıklaştığı yeni nesil dijital fanzin ve topluluk portalı.",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "bumedya." }],
    },
    twitter: {
        card: "summary_large_image",
        title: "bumedya. | Yaratıcı Dijital Evren",
        description: "Fikirlerin forma dönüştüğü dijital fanzin ve topluluk portalı.",
        images: ["/og-image.png"],
    },
    robots: { index: true, follow: true },
};

/* ─── Viewport ──────────────────────────────────────────────── */
export const viewport: Viewport = {
    themeColor: "#1A2744",
    colorScheme: "dark",
    width: "device-width",
    initialScale: 1,
};

/* ─── Root Layout ───────────────────────────────────────────── */
export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang="tr"
            className={`h-full ${spaceGrotesk.variable} ${geistMono.variable}`}
            suppressHydrationWarning
        >
        <body className="min-h-full flex flex-col antialiased" style={{ color: "#F1F5F9", fontFamily: "var(--font-space), var(--font-body, system-ui)" }}>
        {children}

        <Toaster
            position="bottom-right"
            expand={false}
            toastOptions={{
                duration: 4000,
                classNames: {
                    toast: [
                        "!bg-white/[0.06]",
                        "!backdrop-blur-2xl",
                        "!border",
                        "!border-white/[0.08]",
                        "!text-white",
                        "!shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
                        "!rounded-2xl",
                    ].join(" "),
                    title: "!text-sm !font-medium !text-white/90",
                    description: "!text-xs !text-white/50",
                    success: "!border-emerald-500/25",
                    error: "!border-red-500/25",
                    info: "!border-purple-500/25",
                },
            }}
        />
        </body>
        </html>
    );
}