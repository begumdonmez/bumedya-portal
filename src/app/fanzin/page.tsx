import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FANZINLER } from "@/data/fanzinler";
import SiteHeader from "@/components/SiteHeader";
import PageHeader from "@/components/PageHeader";
import SiteFooter from "@/components/SiteFooter";
import FanzinRaf from "./FanzinRaf";

export const metadata: Metadata = {
    title: "Fanzin",
    description: "Kadraj — Beykoz Üniversitesi Medya Kulübü bumedya'nın üç kırımlı fanzini. Tüm sayılar.",
};

export default async function FanzinPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let username: string | null = null;
    if (user) {
        const { data } = await supabase.from("profiles").select("username").eq("id", user.id).single();
        username = data?.username ?? null;
    }

    return (
        <div className="relative min-h-screen flex flex-col">
            <SiteHeader userId={user?.id} username={username} />
            <main className="relative z-10 max-w-6xl mx-auto w-full px-4 sm:px-8 pt-24 sm:pt-28 pb-24 flex-1">
                <PageHeader
                    eyebrow={`${FANZINLER.length} sayı · basılı & dijital`}
                    title={<>Kadraj <em className="italic marker">fanzin</em></>}
                    description="Kampüste elden ele dolaşan üç kırımlı fanzinimiz. Film önerileri, şiirler, çizimler, şehirden haberler — hepsi topluluğun kaleminden. Bir sayıya tıkla, içini aç."
                />
                <FanzinRaf fanzinler={FANZINLER} />

                <aside className="mt-20 card-accent p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="font-display text-2xl font-medium" style={{ color: "var(--text-1)" }}>Bir sonraki sayıda sen de ol.</p>
                        <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>Çizim, şiir, öykü, öneri — içeriğini bize gönder.</p>
                    </div>
                    <a href="mailto:bumedyailetisim@gmail.com" className="btn-primary shrink-0">İçerik gönder</a>
                </aside>
            </main>
            <SiteFooter />
        </div>
    );
}
