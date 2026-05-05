export type PositionId = "topluluk_yk" | "kulup_yk" | "admin";

export interface Position {
    id: PositionId;
    title: string;
    subtitle: string;
    emoji: string;
    color: string;
    bg: string;
    border: string;
    dot: string;
    about: string;
    responsibilities: string[];
    requirements: string[];
    questions: { key: string; label: string; placeholder: string; rows: number }[];
}

export const POSITIONS: Position[] = [
    {
        id: "topluluk_yk",
        title: "Topluluk Yönetim Kurulu",
        subtitle: "Genel YK",
        emoji: "🏛",
        color: "rgba(167,139,250,0.9)",
        bg: "rgba(124,58,237,0.08)",
        border: "rgba(124,58,237,0.25)",
        dot: "rgba(124,58,237,0.8)",
        about: "Bumedya topluluğunun genel stratejisini belirleyen, kararlarını alan ve topluluğu temsil eden yönetim kuruludur.",
        responsibilities: [
            "Topluluğun genel yönetimi ve stratejik kararları",
            "Etkinlik ve proje onayları",
            "Topluluk kurallarının güncellenmesi ve uygulanması",
            "Üye şikayetlerinin değerlendirilmesi",
            "Diğer kollarla koordinasyon",
        ],
        requirements: [
            "En az 3 aydır aktif topluluk üyesi olmak",
            "Haftada en az 3 saat ayırabilmek",
            "Takım çalışmasına yatkınlık",
            "Üretici (Creator) rolüne sahip olmak",
        ],
        questions: [
            { key: "motivation",   label: "Neden Topluluk YK'sına başvuruyorsun?",                          placeholder: "Motivasyonunu ve hedeflerini paylaş...",         rows: 4 },
            { key: "contribution", label: "Topluluğa ne katkı sağlayabilirsin?",                           placeholder: "Becerilerini, deneyimlerini ve fikirlerini anlat...", rows: 4 },
            { key: "experience",   label: "Daha önce herhangi bir yönetim/organizasyon deneyimin var mı?", placeholder: "Varsa anlat, yoksa 'hayır' yazabilirsin...",        rows: 3 },
            { key: "vision",       label: "Bumedya'yı 1 yıl sonra nasıl görüyorsun?",                     placeholder: "Vizyonunu paylaş...",                               rows: 3 },
            { key: "time",         label: "Haftada kaç saat ayırabilirsin ve hangi saatlerde aktifsin?",   placeholder: "Zaman planını belirt...",                           rows: 2 },
        ],
    },
    {
        id: "kulup_yk",
        title: "Kulüp Yönetim Kurulu",
        subtitle: "Kol YK",
        emoji: "🛡",
        color: "rgba(52,211,153,0.9)",
        bg: "rgba(52,211,153,0.08)",
        border: "rgba(52,211,153,0.25)",
        dot: "rgba(52,211,153,0.8)",
        about: "Bumedya bünyesindeki çizim, yazı, editörlük gibi spesifik kolları yöneten ve o alanlarda projeleri koordine eden ekiptir.",
        responsibilities: [
            "İlgili kol etkinlik ve projelerini organize etmek",
            "Kol üyelerine rehberlik etmek",
            "Aylık içerik ve etkinlik planı hazırlamak",
            "Kol çalışmalarını toplulukla paylaşmak",
            "Kol üyelerinin gelişimini desteklemek",
        ],
        requirements: [
            "Başvurulan kolda aktif olarak içerik üretmek",
            "En az 2 aydır topluluk üyesi olmak",
            "Haftada en az 2 saat ayırabilmek",
            "İlgili alanda temel bilgi ve deneyim",
        ],
        questions: [
            { key: "which_branch", label: "Hangi kola başvuruyorsun? (Çizim, Yazı, Editörlük, Müzik vb.)", placeholder: "Başvurduğun kolun adını yaz...",           rows: 1 },
            { key: "motivation",   label: "Bu kola neden başvuruyorsun?",                                  placeholder: "Motivasyonunu ve hedeflerini paylaş...",    rows: 4 },
            { key: "portfolio",    label: "Bu alandaki çalışmalarını/portföyünü paylaş",                  placeholder: "Link veya açıklama ekleyebilirsin...",      rows: 3 },
            { key: "project_idea", label: "Kol için hayata geçirmek istediğin bir proje fikrin var mı?",  placeholder: "Proje fikirlerini anlat...",                rows: 4 },
            { key: "time",         label: "Haftada kaç saat ayırabilirsin?",                              placeholder: "Zaman planını belirt...",                   rows: 2 },
        ],
    },
    {
        id: "admin",
        title: "Platform Admin",
        subtitle: "Site Yönetimi",
        emoji: "⚡",
        color: "rgba(251,191,36,0.9)",
        bg: "rgba(251,191,36,0.06)",
        border: "rgba(251,191,36,0.25)",
        dot: "rgba(251,191,36,0.8)",
        about: "Bumedya platformunun teknik yönetiminden, içerik moderasyonundan ve site işleyişinden sorumlu olan ekiptir.",
        responsibilities: [
            "Platform içerik moderasyonu",
            "Üye başvurularını ve şikayetleri incelemek",
            "Rozet ve rol yönetimi",
            "Teknik sorunları raporlamak ve çözmek",
            "Site güncellemelerini test etmek",
        ],
        requirements: [
            "En az 3 aydır aktif topluluk üyesi olmak",
            "Moderasyon konusunda tarafsız ve adil davranabilmek",
            "Gün içinde en az birkaç kez platforma bakabilmek",
            "Teknik konulara ilgi (zorunlu değil ama tercih edilir)",
        ],
        questions: [
            { key: "motivation",   label: "Neden platform admin olmak istiyorsun?",                          placeholder: "Motivasyonunu ve hedeflerini paylaş...", rows: 4 },
            { key: "moderation",   label: "Kurallara aykırı bir içerikle karşılaştığında nasıl yaklaşırsın?", placeholder: "Moderasyon anlayışını açıkla...",       rows: 4 },
            { key: "technical",    label: "Teknik geçmişin var mı? (Programlama, web, vb.)",                placeholder: "Varsa anlat, yoksa 'hayır' yazabilirsin...", rows: 3 },
            { key: "conflict",     label: "Toplulukta bir çatışma durumunda nasıl davranırsın?",            placeholder: "Yaklaşımını açıkla...",                  rows: 3 },
            { key: "availability", label: "Günde yaklaşık kaç saat platforma bakabilirsin?",                placeholder: "Müsaitlik durumunu belirt...",           rows: 2 },
        ],
    },
];
