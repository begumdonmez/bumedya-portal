import type { Metadata } from "next";
import Link from "next/link";
import NavbarBackdrop from "@/components/NavbarBackdrop";
import SiteFooter from "@/components/SiteFooter";

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
        <main className="relative w-full aurora-bg min-h-screen">
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="fixed inset-0 dot-grid opacity-[0.2] pointer-events-none" style={{ zIndex: 0 }} />

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4">
                <NavbarBackdrop />
                <Link href="/" className="group flex items-baseline gap-0.5 shrink-0 relative z-10">
                    <span className="text-sm font-bold" style={{ color: "var(--text-3)" }}>bumedya</span>
                    <span className="text-sm font-bold transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(124,58,237,0.9)]"
                          style={{ color: "var(--violet)" }}>.</span>
                </Link>
                <Link href="/" className="relative z-10 text-xs px-3 py-2 rounded-xl transition-all duration-200"
                      style={{ color: "var(--text-3)", border: "1px solid var(--border-3)" }}>
                    ← Ana Sayfa
                </Link>
            </nav>

            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">

                {/* Başlık */}
                <div className="mb-10">
                    <p className="label-caps mb-3">Yasal</p>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient-white mb-3">
                        Gizlilik Politikası
                    </h1>
                    <p className="text-xs" style={{ color: "var(--text-4)" }}>
                        Son güncelleme: Mayıs 2026 · KVKK (6698 Sayılı Kanun) uyumlu
                    </p>
                </div>

                {/* Bölümler */}
                <div className="flex flex-col gap-4">
                    {SECTIONS.map((s) => (
                        <div key={s.title} className="card p-5 sm:p-6">
                            <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-2)" }}>
                                {s.title}
                            </h2>
                            <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: "var(--text-3)" }}>
                                {s.content}
                            </p>
                        </div>
                    ))}
                </div>

                {/* İletişim */}
                <div className="mt-6 rounded-2xl px-5 py-4 text-center"
                     style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                        Sorularınız için{" "}
                        <a href="mailto:bumedyailetisim@gmail.com"
                           className="font-medium transition-opacity hover:opacity-70"
                           style={{ color: "var(--violet-text)" }}>
                            bumedyailetisim@gmail.com
                        </a>
                    </p>
                </div>
            </div>

            <SiteFooter />
        </main>
    );
}
