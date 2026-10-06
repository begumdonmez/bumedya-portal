import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = { title: "Gizlilik Politikası" };

const SECTIONS = [
    {
        title: "1. Veri Sorumlusu",
        content: `Bu gizlilik politikası, bumedya platformu ("Platform") tarafından hazırlanmıştır. Platform, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla hareket etmektedir. İletişim için: bumedyailetisim@gmail.com`,
    },
    {
        title: "2. Toplanan Kişisel Veriler",
        content: `Platform kullanımı sırasında aşağıdaki veriler toplanabilir:

• Kimlik verileri: Ad, kullanıcı adı, e-posta adresi
• Kullanım verileri: Platforma giriş zamanları, paylaşılan içerikler, beğeniler
• Teknik veriler: IP adresi, tarayıcı türü, cihaz bilgisi (oturum güvenliği amacıyla)
• İletişim verileri: Destek talepleriniz kapsamında ilettiğiniz mesajlar`,
    },
    {
        title: "3. Verilerin İşlenme Amaçları",
        content: `Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:

• Hesap oluşturma ve kimlik doğrulama
• Platform hizmetlerinin sunulması ve geliştirilmesi
• Topluluk güvenliğinin sağlanması, kural ihlallerinin önlenmesi
• Bildirim ve iletişim hizmetlerinin yürütülmesi
• Yasal yükümlülüklerin yerine getirilmesi`,
    },
    {
        title: "4. Hukuki Dayanak",
        content: `Verileriniz; KVKK'nın 5. maddesi uyarınca aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:

• Açık rızanız (isteğe bağlı özellikler için)
• Bir sözleşmenin kurulması veya ifası (hesap ve hizmet sözleşmesi)
• Meşru menfaat (platform güvenliği ve kötüye kullanımın önlenmesi)
• Kanuni yükümlülük (yasal mercilerin talepleri)`,
    },
    {
        title: "5. Verilerin Saklanması ve Güvenliği",
        content: `Verileriniz, Supabase altyapısı üzerinde şifreli olarak saklanmaktadır. Yetkisiz erişime karşı teknik ve idari önlemler alınmaktadır. Hesabınızı silmeniz durumunda kişisel verileriniz, yasal saklama yükümlülükleri saklı kalmak kaydıyla 30 gün içinde silinir veya anonim hale getirilir.`,
    },
    {
        title: "6. Üçüncü Taraflarla Paylaşım",
        content: `Kişisel verileriniz, açık rızanız olmaksızın üçüncü taraflarla ticari amaçla paylaşılmaz. Aşağıdaki durumlar istisnadır:

• Yasal zorunluluk: Yetkili kamu kurumlarının talepleri
• Altyapı sağlayıcıları: Supabase (veritabanı), Vercel (hosting) — yalnızca hizmet kapsamında
• Açık içerikler: Platforma kendiniz paylaştığınız içerikler diğer üyelerce görülebilir`,
    },
    {
        title: "7. Çerezler (Cookies)",
        content: `Platform, oturum yönetimi için zorunlu çerezler kullanmaktadır. Bu çerezler olmadan giriş yapılamamaktadır. Analitik veya reklam amaçlı çerez kullanılmamaktadır.`,
    },
    {
        title: "8. KVKK Kapsamındaki Haklarınız",
        content: `KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:

• Verilerinizin işlenip işlenmediğini öğrenme
• İşlenmişse buna ilişkin bilgi talep etme
• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
• Eksik veya yanlış işlenmişse düzeltilmesini isteme
• Silinmesini veya yok edilmesini isteme
• İşlemeye itiraz etme
• Otomatik sistemler aracılığıyla aleyhinize bir sonucun ortaya çıkmasına itiraz etme
• Zararın giderilmesini talep etme

Haklarınızı kullanmak için: bumedyailetisim@gmail.com adresine e-posta gönderebilirsiniz.`,
    },
    {
        title: "9. Değişiklikler",
        content: `Bu politika zaman zaman güncellenebilir. Önemli değişiklikler platform üzerinden duyurulacaktır. Güncel politika her zaman bu sayfada yayımlanır.`,
    },
];

export default function GizlilikPage() {
    return (
        <main className="relative w-full min-h-screen">

            {/* Navbar */}
            <SiteHeader back={{ href: "/", label: "Ana Sayfa" }} minimal />

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">

                {/* Başlık */}
                <PageHeader eyebrow="Yasal" title="Gizlilik politikası"
                            description="Son güncelleme: Mayıs 2026 · KVKK (6698 sayılı Kanun) uyumlu" />

                {/* Bölümler */}
                <div className="flex flex-col">
                    {SECTIONS.map((s, i) => (
                        <section key={s.title} className="grid sm:grid-cols-[3rem_1fr] gap-x-4 py-6" style={{ borderTop: i ? "1px solid var(--border-2)" : undefined }}>
                            <span className="font-display italic text-xl" style={{ color: "var(--accent)" }}>{String(i + 1).padStart(2, "0")}</span>
                            <div>
                            <h2 className="font-display text-xl font-medium mb-2" style={{ color: "var(--text-1)" }}>
                                {s.title.replace(/^\d+\.\s*/, "")}
                            </h2>
                            <p className="text-[15px] leading-relaxed whitespace-pre-line" style={{ color: "var(--text-3)" }}>
                                {s.content}
                            </p>
                            </div>
                        </section>
                    ))}
                </div>

                {/* İletişim */}
                <div className="mt-6 rounded-2xl px-5 py-4 text-center"
                     style={{ background: "color-mix(in srgb, var(--accent) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 15%, transparent)" }}>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                        Sorularınız için{" "}
                        <a href="mailto:bumedyailetisim@gmail.com"
                           className="font-medium transition-opacity hover:opacity-70"
                           style={{ color: "var(--accent-text)" }}>
                            bumedyailetisim@gmail.com
                        </a>
                    </p>
                </div>
            </div>

            <SiteFooter />
        </main>
    );
}
