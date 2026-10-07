import Link from "next/link";
import Image from "next/image";
import BadgeMedal, { type MedalShape } from "@/components/BadgeMedal";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SetWelcomeCookie from "@/components/SetWelcomeCookie";
import SiteFooter from "@/components/SiteFooter";
import ContactSection from "@/components/ContactSection";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
    title: "bumedya.",
    description: "Fikirlerin forma dönüştüğü, sınırların bulanıklaştığı yeni nesil dijital fanzin ve topluluk portalı.",
};

const RULES = [
    { icon: "01", title: "Saygı zorunludur", desc: "Her fikre, her insana saygıyla yaklaş. Farklılıklar zenginliktir." },
    { icon: "02", title: "İçerik özgün olmalı", desc: "Başkasının emeğini sahiplenmek yasaktır. Kaynak göster, ilham al." },
    { icon: "03", title: "Üret ve paylaş", desc: "Bu platform tüketmek için değil, üretmek için var. Her katkı değerlidir." },
    { icon: "04", title: "Yapıcı ol", desc: "Eleştiri yıkmak için değil, büyütmek için yapılır. Katkısı olmayan yorum olmaz." },
    { icon: "05", title: "Topluluk kuralları", desc: "Nefret söylemi, taciz ve spam'e sıfır tolerans." },
];

const BADGES = [
    // — Sistem —
    { label: "Onaylı", color: "color-mix(in srgb, var(--info) 90%, transparent)", bg: "color-mix(in srgb, var(--info) 8%, transparent)",  border: "color-mix(in srgb, var(--info) 20%, transparent)",   desc: "Admin tarafından doğrulanmış üyelere verilir. Başvuruyla alınamaz." },
    { label: "Kurucu",           color: "color-mix(in srgb, var(--warn) 90%, transparent)",  bg: "color-mix(in srgb, var(--warn) 6%, transparent)",  border: "color-mix(in srgb, var(--warn) 20%, transparent)",   desc: "Topluluğun kurucu üyelerine özel rozettir. Başvuruyla alınamaz." },
    { label: "Katkıcı",          color: "color-mix(in srgb, var(--accent) 90%, transparent)", bg: "color-mix(in srgb, var(--accent) 8%, transparent)",  border: "color-mix(in srgb, var(--accent) 20%, transparent)",   desc: "Topluluk projelerine aktif katkı sağlayan üyelere admin tarafından verilir." },
    // — Başvuruyla kazanılan —
    { label: "Nakkaş",   color: "color-mix(in srgb, var(--pink) 95%, transparent)", bg: "color-mix(in srgb, var(--pink) 8%, transparent)", border: "color-mix(in srgb, var(--pink) 25%, transparent)", desc: "Çizim, illüstrasyon veya görsel sanat alanında üretim yapan üyelere başvuru ile verilir." },
    { label: "Kalemşor", color: "color-mix(in srgb, var(--success) 95%, transparent)",  bg: "color-mix(in srgb, var(--success) 8%, transparent)",  border: "color-mix(in srgb, var(--success) 20%, transparent)",   desc: "Yazı, şiir veya özgün metin üreten üyelere başvuru ile verilir." },
    { label: "Mürettip", color: "color-mix(in srgb, var(--warn) 95%, transparent)",  bg: "color-mix(in srgb, var(--warn) 8%, transparent)",  border: "color-mix(in srgb, var(--warn) 25%, transparent)",  desc: "İçerikleri derleyip düzenleyen, editoryal katkı sağlayan üyelere başvuru ile verilir." },
    // — İlgi alanı —
    { label: "Çizer",  color: "color-mix(in srgb, var(--pink) 70%, transparent)", bg: "color-mix(in srgb, var(--pink) 5%, transparent)", border: "color-mix(in srgb, var(--pink) 18%, transparent)", desc: "Görsel sanat ve illüstrasyona ilgi duyan üyeleri gösterir." },
    { label: "Yazar",  color: "color-mix(in srgb, var(--success) 70%, transparent)",  bg: "color-mix(in srgb, var(--success) 5%, transparent)",  border: "color-mix(in srgb, var(--success) 15%, transparent)",  desc: "Yazı ve edebiyata ilgi duyan üyeleri gösterir." },
    { label: "Editör", color: "color-mix(in srgb, var(--warn) 70%, transparent)",  bg: "color-mix(in srgb, var(--warn) 6%, transparent)",  border: "color-mix(in srgb, var(--warn) 18%, transparent)",  desc: "Editoryal alana ilgi duyan üyeleri gösterir." },
    // — Kullanıcı kendi alır —
    { label: "Plak Kafası",    color: "color-mix(in srgb, var(--pink) 90%, transparent)", bg: "color-mix(in srgb, var(--pink) 6%, transparent)", border: "color-mix(in srgb, var(--pink) 20%, transparent)", desc: "Müziği yaşayıp nefes alanlar için. Profilden kendin alabilirsin." },
    { label: "Seri İzleyici",  color: "color-mix(in srgb, var(--info) 90%, transparent)",  bg: "color-mix(in srgb, var(--info) 6%, transparent)",  border: "color-mix(in srgb, var(--info) 20%, transparent)",  desc: "Film ve dizi tutkunları için. Profilden kendin alabilirsin." },
    { label: "Kitap Kurdu",    color: "color-mix(in srgb, var(--success) 90%, transparent)",  bg: "color-mix(in srgb, var(--success) 6%, transparent)",  border: "color-mix(in srgb, var(--success) 20%, transparent)",  desc: "Okumaktan yorulmayanlar için. Profilden kendin alabilirsin." },
    { label: "Sosyal Kelebek", color: "color-mix(in srgb, var(--accent-2) 90%, transparent)",  bg: "color-mix(in srgb, var(--accent-2) 6%, transparent)",  border: "color-mix(in srgb, var(--accent-2) 20%, transparent)",  desc: "Aktif sohbete katkı sağlayan, topluluğu canlı tutan üyelere admin tarafından verilir." },
];

const BADGE_GROUPS: { title: string; note: string; shape: MedalShape; items: typeof BADGES }[] = [
    { title: "Sistem",               note: "Yöneticiler verir, başvuruyla alınmaz.",       shape: "star",    items: BADGES.slice(0, 3) },
    { title: "Başvuruyla kazanılan", note: "Başvuru sayfasından form doldurarak alınır.",   shape: "rosette", items: BADGES.slice(3, 6) },
    { title: "İlgi alanı",           note: "Hangi alana ilgi duyduğunu gösterir.",         shape: "coin",    items: BADGES.slice(6, 9) },
    { title: "Profilden kendin al",  note: "Profil ayarlarından dilediğin zaman eklersin.", shape: "shield",  items: BADGES.slice(9) },
];

const PAGES = [
    {
        path: "/galeri",
        label: "Galeri",
        desc: "Etkinliklerden fotoğraflar, çizimler, tasarımlar — topluluğun görsel belleği burada birikir. Yalnızca adminler içerik yükleyebilir.",
        accent: "color-mix(in srgb, var(--accent) 85%, transparent)",
        bg: "color-mix(in srgb, var(--accent) 6%, transparent)",
        border: "color-mix(in srgb, var(--accent) 18%, transparent)",
    },
    {
        path: "/akis",
        label: "Akış",
        desc: "Topluluktan kısa paylaşımlar, fikirler ve günlük üretimler. Üyeler metin veya görsel paylaşabilir, beğeni bırakabilir.",
        accent: "color-mix(in srgb, var(--info) 85%, transparent)",
        bg: "color-mix(in srgb, var(--info) 6%, transparent)",
        border: "color-mix(in srgb, var(--info) 18%, transparent)",
    },
    {
        path: "/etkinlikler",
        label: "Etkinlikler",
        desc: "Yaklaşan buluşmalar, workshoplar ve topluluk etkinlikleri. Haritadan konuma bak, takvime ekle, detaylara ulaş.",
        accent: "color-mix(in srgb, var(--success) 85%, transparent)",
        bg: "color-mix(in srgb, var(--success) 6%, transparent)",
        border: "color-mix(in srgb, var(--success) 18%, transparent)",
    },
    {
        path: "/chat",
        label: "Chat",
        desc: "Gerçek zamanlı topluluk sohbeti. Fikirlerini anlık paylaş, sorularını sor, diğer üyelerle tanış.",
        accent: "color-mix(in srgb, var(--warn) 85%, transparent)",
        bg: "color-mix(in srgb, var(--warn) 6%, transparent)",
        border: "color-mix(in srgb, var(--warn) 18%, transparent)",
    },
    {
        path: "/manifest",
        label: "Manifest",
        desc: "Ortak kara tahta. Hayalini, notunu veya bir söz bırak — renk seç, tahtaya tıkla. Topluluktan herkesin notu burada birikir.",
        accent: "color-mix(in srgb, var(--success) 85%, transparent)",
        bg: "color-mix(in srgb, var(--success) 6%, transparent)",
        border: "color-mix(in srgb, var(--success) 18%, transparent)",
    },
    {
        path: "/basvuru",
        label: "Başvuru",
        desc: "Yönetim kuruluna katıl, rozet başvurusu yap veya okulunda bir Bumedya kulübü aç. Formlar yeteneklerini ölçmek için değil, seni tanımak için.",
        accent: "color-mix(in srgb, var(--pink) 85%, transparent)",
        bg: "color-mix(in srgb, var(--pink) 6%, transparent)",
        border: "color-mix(in srgb, var(--pink) 18%, transparent)",
    },
    {
        path: "/yildizlar",
        label: "Yıldızlar",
        desc: "Her hafta topluluk bir film, dizi, kitap veya şarkı önerir; oylamayla haftanın yıldızları belirlenir. Oy ver, öneri sun, tartış.",
        accent: "color-mix(in srgb, var(--warn) 85%, transparent)",
        bg: "color-mix(in srgb, var(--warn) 6%, transparent)",
        border: "color-mix(in srgb, var(--warn) 18%, transparent)",
    },
    {
        path: "/arsiv",
        label: "Arşiv",
        desc: "Topluluğun beğendiği filmler, diziler, kitaplar ve şarkılar — raf raf sıralanmış. Puan ver, yorum yap, kendi keşiflerini ekle.",
        accent: "color-mix(in srgb, var(--info) 85%, transparent)",
        bg: "color-mix(in srgb, var(--info) 6%, transparent)",
        border: "color-mix(in srgb, var(--info) 18%, transparent)",
    },
];

const CLUBS = [
    {
        uni: "Beykoz Üniversitesi", city: "İstanbul", active: true,
        socials: [
            { label: "Instagram", handle: "@bu_medya",        href: "https://www.instagram.com/bu_medya/" },
            { label: "YouTube",   handle: "@BumedyaOfficial", href: "https://www.youtube.com/@BumedyaOfficial" },
        ],
    },
];

export default async function LandingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { count: totalCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

    let username: string | null = null;
    if (user) {
        const { data: profile } = await supabase
            .from("profiles").select("username").eq("id", user.id).single();
        username = profile?.username ?? user.email?.split("@")[0] ?? null;
    }

    const contents = [
        { path: "/fanzin", label: "Fanzin", desc: "Kadraj — elden ele dolaşan üç kırımlı fanzinimizin tüm sayıları. Kapağa tıkla, içini oku." },
        { path: "/akis", label: "Akış", desc: "Kısa paylaşımlar, fikirler ve günlük üretimler. Metin ya da görsel paylaş, beğeni bırak." },
        ...PAGES.filter(p => p.path !== "/akis").map(p => ({ path: p.path, label: p.label, desc: p.desc })),
    ];

    return (
        <main className="relative w-full">
            <SetWelcomeCookie />
            <SiteHeader userId={user?.id} username={username} />

            {/* ── KAPAK ───────────────────────────────────────── */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 pt-28 sm:pt-32 pb-16 sm:pb-24">
                <div className="flex items-center gap-3 label-caps mb-10 sm:mb-14 animate-float-up">
                    <span>Sayı 01</span>
                    <span aria-hidden className="h-px flex-1" style={{ background: "var(--border-1)" }} />
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--success)" }} />
                        {totalCount ?? 0} üye
                    </span>
                </div>

                <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-center">
                    <div className="animate-float-up delay-100">
                        <h1 className="font-display font-medium leading-[0.95] tracking-tight"
                            style={{ fontSize: "clamp(3.25rem, 9vw, 7.5rem)", color: "var(--text-1)" }}>
                            Üret.<br />
                            <em className="italic font-normal marker" style={{ color: "var(--accent)" }}>Paylaş.</em><br />
                            Büyü.
                        </h1>
                        <p className="mt-8 text-lg sm:text-xl leading-relaxed max-w-xl" style={{ color: "var(--text-2)" }}>
                            bumedya; çizen, yazan, çeken, düşünen herkesin buluştuğu bir dijital fanzin ve topluluk.
                            Mükemmel olmak gerekmiyor — hayal etmek yeter.
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-10">
                            {user ? (
                                <Link href="/home" className="btn-primary">Panoya git <span aria-hidden>→</span></Link>
                            ) : (
                                <Link href="/register" className="btn-primary">Topluluğa katıl <span aria-hidden>→</span></Link>
                            )}
                            <a href="#icindekiler" className="btn-ghost">İçinde ne var?</a>
                        </div>
                    </div>

                    <div className="relative hidden sm:flex justify-center lg:justify-end animate-float-up delay-200">
                        <Image src="/logo.png" alt="" width={420} height={420} priority sizes="420px"
                               className="w-[min(420px,80vw)] h-auto -rotate-3 transition-transform duration-500 hover:rotate-2" />
                        <span className="sticker absolute top-6 right-0 lg:-right-2 text-sm">{totalCount ?? 0} üretici & meraklı</span>
                    </div>
                </div>
            </section>

            {/* ── ŞERİT ───────────────────────────────────────── */}
            <div aria-hidden className="marquee relative z-10 py-3 font-display text-2xl sm:text-3xl italic">
                {[0, 1].map(k => (
                    <div key={k} className="marquee__track">
                        {["çiz", "yaz", "çek", "kaydet", "tartış", "oyla", "paylaş", "büyü"].map(w => (
                            <span key={w} className="px-6 flex items-center gap-6">{w} <span className="not-italic text-xl">✳</span></span>
                        ))}
                    </div>
                ))}
            </div>

            {/* ── İÇİNDEKİLER ─────────────────────────────────── */}
            <section id="icindekiler" className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24 scroll-mt-16">
                <div className="grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16">
                    <div>
                        <p className="label-caps mb-3">İçindekiler</p>
                        <h2 className="font-display text-4xl sm:text-5xl font-medium leading-tight" style={{ color: "var(--text-1)" }}>
                            Nerede ne var?
                        </h2>
                        <p className="mt-4 text-base leading-relaxed max-w-sm" style={{ color: "var(--text-3)" }}>
                            İlk kez geliyorsan buradan başla. Her bölüm topluluğun farklı bir köşesi.
                        </p>
                    </div>
                    <ol className="flex flex-col">
                        {contents.map((c, i) => (
                            <li key={c.path} style={{ borderTop: "1px solid var(--border-2)" }}>
                                <Link href={c.path}
                                      className="row-hover group grid grid-cols-[2.5rem_1fr_auto] gap-x-4 gap-y-1 py-5 items-baseline transition-colors">
                                    <span className="font-mono text-xs" style={{ color: "var(--text-4)" }}>
                                        {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span className="font-display text-xl sm:text-2xl font-medium group-hover:underline underline-offset-4 decoration-1"
                                          style={{ color: "var(--text-1)", textDecorationColor: "var(--accent)" }}>
                                        {c.label}
                                    </span>
                                    <span aria-hidden className="text-lg transition-transform group-hover:translate-x-1" style={{ color: "var(--accent)" }}>→</span>
                                    <span />
                                    <span className="col-span-2 text-sm leading-relaxed max-w-xl" style={{ color: "var(--text-3)" }}>{c.desc}</span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* ── SÖZLEŞME + KATILIM ──────────────────────────── */}
            <section id="kurallar" className="relative z-10 scroll-mt-16" style={{ background: "var(--paper-2)" }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24 grid lg:grid-cols-2 gap-14 lg:gap-20">
                    <div>
                        <p className="label-caps mb-3">Topluluk sözleşmesi</p>
                        <h2 className="font-display text-3xl sm:text-4xl font-medium mb-8" style={{ color: "var(--text-1)" }}>
                            Huzurlu ve saygılı bir alan için
                        </h2>
                        <ol className="flex flex-col gap-6">
                            {RULES.map(rule => (
                                <li key={rule.icon} className="grid grid-cols-[2.5rem_1fr] gap-4">
                                    <span className="font-display text-2xl italic" style={{ color: "var(--accent)" }}>{rule.icon}</span>
                                    <div>
                                        <h3 className="font-sans text-base font-semibold mb-1" style={{ color: "var(--text-1)" }}>{rule.title}</h3>
                                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>{rule.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="flex flex-col gap-12">
                        <div>
                            <p className="label-caps mb-3">Nasıl katılırsın?</p>
                            <h2 className="font-display text-3xl sm:text-4xl font-medium mb-8" style={{ color: "var(--text-1)" }}>
                                Üç adım
                            </h2>
                            <ol className="flex flex-col">
                                {[
                                    { title: "Kayıt ol", desc: "Kullanıcı adını seç, e-postanla hesap oluştur. Ücretsiz." },
                                    { title: "Doğrula", desc: "Gelen kutuna düşen bağlantıya tıkla, hesabın açılsın." },
                                    { title: "Üretmeye başla", desc: "Akışa yaz, galeriye bak, etkinliklere katıl." },
                                ].map((s, i) => (
                                    <li key={s.title} className="flex gap-4 py-4" style={{ borderTop: "1px dashed var(--border-1)" }}>
                                        <span className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold"
                                              style={{ background: "var(--accent)", color: "var(--on-accent)" }}>{i + 1}</span>
                                        <div>
                                            <p className="font-semibold" style={{ color: "var(--text-1)" }}>{s.title}</p>
                                            <p className="text-sm" style={{ color: "var(--text-3)" }}>{s.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                            {!user && <Link href="/register" className="btn-primary mt-6">Hesap oluştur</Link>}
                        </div>

                        <div>
                            <p className="label-caps mb-3">Kulüpler</p>
                            <ul className="flex flex-col">
                                {CLUBS.map(c => (
                                    <li key={c.uni} className="py-3" style={{ borderTop: "1px solid var(--border-2)" }}>
                                        <div className="flex items-center justify-between">
                                            <span>
                                                <span className="font-semibold" style={{ color: "var(--text-1)" }}>{c.uni}</span>
                                                <span className="text-sm ml-2" style={{ color: "var(--text-4)" }}>{c.city}</span>
                                            </span>
                                            <span className="chip" style={{ color: "var(--success)", border: "1px solid color-mix(in srgb, var(--success) 35%, transparent)" }}>Aktif</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2.5">
                                            {c.socials.map(so => (
                                                <a key={so.href} href={so.href} target="_blank" rel="noopener noreferrer"
                                                   className="btn-ghost !py-1.5 !px-3 !text-[13px]">
                                                    {so.label} <span style={{ color: "var(--text-4)" }}>{so.handle}</span> ↗
                                                </a>
                                            ))}
                                        </div>
                                    </li>
                                ))}
                                <li className="py-3" style={{ borderTop: "1px solid var(--border-2)" }}>
                                    <Link href={user ? "/basvuru#kulup-ac" : "/register?next=%2Fbasvuru%23kulup-ac"}
                                          className="text-sm font-medium underline underline-offset-4" style={{ color: "var(--accent)" }}>
                                        Üniversiten burada yok mu? Kulüp açmak için başvur →
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ROZETLER + SSS ──────────────────────────────── */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24 grid lg:grid-cols-2 gap-14 lg:gap-20">
                <div>
                    <p className="label-caps mb-3">Rozet sözlüğü</p>
                    <h2 className="font-display text-3xl sm:text-4xl font-medium mb-3" style={{ color: "var(--text-1)" }}>
                        Hangi rozet ne demek?
                    </h2>
                    <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>
                        Bazıları başvuruyla, bazıları admin tarafından, bazıları ilgi alanına göre verilir.
                    </p>
                    <div className="flex flex-col gap-8">
                        {BADGE_GROUPS.map((g, gi) => (
                            <section key={g.title}>
                                <div className="flex items-baseline gap-3 pb-2" style={{ borderBottom: "2px solid var(--text-1)" }}>
                                    <span className="font-mono text-xs" style={{ color: "var(--accent)" }}>{String(gi + 1).padStart(2, "0")}</span>
                                    <h3 className="font-display text-xl font-medium" style={{ color: "var(--text-1)" }}>{g.title}</h3>
                                </div>
                                <p className="text-xs mt-2 mb-1" style={{ color: "var(--text-4)" }}>{g.note}</p>
                                <dl className="flex flex-col">
                                    {g.items.map(b => (
                                        <div key={b.label} className="grid grid-cols-[2.5rem_7.5rem_1fr] gap-x-3 py-3 items-center"
                                             style={{ borderTop: "1px solid var(--border-2)" }}>
                                            <BadgeMedal label={b.label} color={b.color} shape={g.shape} size={38} />
                                            <dt>
                                                <span className="chip" style={{ background: b.bg, border: `1px solid ${b.border}`, color: b.color }}>{b.label}</span>
                                            </dt>
                                            <dd className="text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>{b.desc}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="label-caps mb-3">SSS</p>
                    <h2 className="font-display text-3xl sm:text-4xl font-medium mb-8" style={{ color: "var(--text-1)" }}>
                        Sık sorulanlar
                    </h2>
                    <div className="flex flex-col">
                        {[
                            { q: "Katılmak ücretsiz mi?", a: "Evet, tamamen ücretsiz. Kayıt ol, doğrula, kullanmaya başla." },
                            { q: "İçerik paylaşmak için ne gerekiyor?", a: "Üye olman yeterli. Akışa herkes yazabilir; galeriye yüklemeyi yöneticiler yapar." },
                            { q: "Rozet başvurusu yapabilir miyim?", a: "Nakkaş, Kalemşor ve Mürettip rozetleri için Başvuru sayfasından form doldurabilirsin. Kurucu ve Onaylı gibi sistem rozetlerini yalnızca yöneticiler verir." },
                            { q: "Paylaştığım içerikler kime ait?", a: "Sana. Platforma yüklemen, içeriği başkasına devrettiğin anlamına gelmez." },
                            { q: "Bir sorunum olursa?", a: "Discord sunucumuzdan ya da bumedyailetisim@gmail.com adresinden bize yaz." },
                        ].map(({ q, a }) => (
                            <details key={q} className="group py-4" style={{ borderTop: "1px solid var(--border-2)" }}>
                                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold"
                                         style={{ color: "var(--text-1)" }}>
                                    {q}
                                    <span aria-hidden className="text-xl transition-transform group-open:rotate-45" style={{ color: "var(--accent)" }}>+</span>
                                </summary>
                                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>{a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <ContactSection />
            <SiteFooter />
        </main>
    );
}
