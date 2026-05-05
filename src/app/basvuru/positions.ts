import { Landmark, Shield, Zap, Pencil, Palette, Pen, GraduationCap, type LucideIcon } from "lucide-react";

export type PositionId =
    | "topluluk_yk"
    | "kulup_yk"
    | "admin"
    | "rozet_editor"
    | "rozet_cizer"
    | "rozet_yazar"
    | "kulup_ac";

export type Category = "yonetim" | "rozet" | "kulup_ac";

export interface Position {
    id: PositionId;
    category: Category;
    icon: LucideIcon;
    title: string;
    subtitle: string;
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

    /* ══════════════════════════════════════════════
       YÖNETİM POZİSYONLARI
    ══════════════════════════════════════════════ */
    {
        id: "topluluk_yk",
        category: "yonetim",
        icon: Landmark,
        title: "Topluluk Yönetim Kurulu",
        subtitle: "Genel YK",
        color: "rgba(167,139,250,0.9)",
        bg: "rgba(124,58,237,0.08)",
        border: "rgba(124,58,237,0.25)",
        dot: "rgba(124,58,237,0.8)",
        about: "Bumedya'nın tüm kulüp ve kollarını koordine eden, Spotify · Behance · Substack · DC gibi ortak yayın platformlarını yöneten ve sponsorluk ilişkilerini yürüten genel yönetim kuruludur. Daha önce yöneticilik yapmış olman gerekmiyor — burada birlikte öğrenir ve büyürüz.",
        responsibilities: [
            "Spotify, Behance, Substack, DC gibi ortak platformları yönetmek",
            "Sponsor arayışı, iletişim ve anlaşma süreçlerini yürütmek",
            "Kulüp YK sponsorluk taleplerini değerlendirip onaylamak",
            "Genel fanzin koordinasyonu ve yayın süreçleri",
            "Kulüp YK'larıyla koordinasyon, destek ve iletişim",
            "Topluluk içerik stratejisini ve platform politikalarını belirlemek",
        ],
        requirements: [
            "Takım çalışmasına açık olmak",
        ],
        questions: [
            { key: "motivation",
              label: "Neden Topluluk YK'sına başvuruyorsun?",
              placeholder: "Ne hissedip ne düşündüğünü samimice anlat, beklenti yok.",
              rows: 4 },
            { key: "role",
              label: "YK içinde hangi alanda yer almak istersin? (Sponsorluk, içerik, platform yönetimi, kulüp koordinasyonu, sosyal medya vb.)",
              placeholder: "Bir fikrin yoksa 'bilmiyorum, keşfetmek istiyorum' da yazabilirsin.",
              rows: 3 },
            { key: "contribution",
              label: "Topluluğa katkı sağlayabileceğini düşündüğün bir şey var mı?",
              placeholder: "Bir becerin, ilgin ya da sadece enerjin bile olabilir.",
              rows: 4 },
            { key: "vision",
              label: "Bumedya'yı ilerleyen zamanlarda nasıl görüyorsun?",
              placeholder: "Hayalin nedir, ne görmek isterdin?",
              rows: 3 },
            { key: "time",
              label: "Haftada ne kadar vakit ayırabilirsin ve genellikle hangi saatlerde aktifsin?",
              placeholder: "Kabaca bir fikir vermek yeterli.",
              rows: 2 },
        ],
    },
    {
        id: "kulup_yk",
        category: "yonetim",
        icon: Shield,
        title: "Kulüp Yönetim Kurulu",
        subtitle: "Okul Kulübü YK",
        color: "rgba(52,211,153,0.9)",
        bg: "rgba(52,211,153,0.08)",
        border: "rgba(52,211,153,0.25)",
        dot: "rgba(52,211,153,0.8)",
        about: "Üniversitelerde kurulan Bumedya kulüplerini yöneten ekip. Okulunda etkinlik planlamak, içerik üretmek ve kulübü büyütmek isteyenler için. Kulüp yönetimi deneyimi aranmıyor — Bumedya zaten bunun için var.",
        responsibilities: [
            "Üniversite kampüsünde Bumedya etkinlikleri planlamak ve uygulamak",
            "Okul bazlı fanzin içeriği üretmek; genel fanzine katkı sağlamak",
            "Okul Instagram hesabını yönetmek — topluluk sayfasına yönlendirme ile",
            "Sponsorluk fırsatlarını Topluluk YK ile paylaşmak",
            "Diğer kulüp YK'larıyla iletişim kurarak iş birliği yapmak",
        ],
        requirements: [
            "Başvurduğun kulübün bulunduğu üniversitede kayıtlı öğrenci olmak",
            "Yalnızca kendi üniversitendeki Bumedya Kulübünün Yönetim Kuruluna başvurabilirsin",
        ],
        questions: [
            { key: "university",
              label: "Hangi üniversitede okuyorsun ve hangi kulübün YK'sına başvuruyorsun?",
              placeholder: "Üniversite adı ve kulüp adı (ör. Beykoz Üniversitesi — Beykoz Bumedya)...",
              rows: 2 },
            { key: "motivation",
              label: "Bu kulüp YK'sına neden başvuruyorsun?",
              placeholder: "Ne hissedip ne düşündüğünü samimice anlat.",
              rows: 4 },
            { key: "event_idea",
              label: "Okulunda hayata geçirilmesini istediğin bir etkinlik ya da proje aklına geliyor mu?",
              placeholder: "Küçük ya da büyük fark etmez, aklındaki her şeyi yazabilirsin.",
              rows: 4 },
            { key: "content",
              label: "Sosyal medya veya içerik üretimiyle daha önce hiç ilgilendin mi?",
              placeholder: "Olmadıysa da tamam — ne öğrenmek istediğini yazabilirsin.",
              rows: 3 },
            { key: "time",
              label: "Haftada ne kadar vakit ayırabilirsin?",
              placeholder: "Kabaca bir fikir vermek yeterli.",
              rows: 2 },
        ],
    },
    {
        id: "admin",
        category: "yonetim",
        icon: Zap,
        title: "Platform Admin",
        subtitle: "DC & Web Yönetimi",
        color: "rgba(251,191,36,0.9)",
        bg: "rgba(251,191,36,0.06)",
        border: "rgba(251,191,36,0.25)",
        dot: "rgba(251,191,36,0.8)",
        about: "Bumedya'nın Discord sunucusunu ve web platformunu yöneten, sosyal düzeni sağlayan ekip. DC Admin ve Web Admin olarak iki kola ayrılır. Moderasyon deneyimi olmasa da olur — önemli olan yaklaşımın.",
        responsibilities: [
            "Discord veya web platformunda sosyal düzeni sağlamak",
            "Kurallara aykırı içerik ve davranışları adil biçimde yönetmek",
            "Üye başvurularını ve şikayetleri tarafsızca incelemek",
            "Rozet, rol ve izin yönetimi (DC veya Web'e göre)",
            "Platform teknik sorunlarını raporlamak ve takip etmek",
        ],
        requirements: [
            "Tarafsız ve adil olmaya özen göstermek",
            "DC Admin için Discord'a, Web Admin için web platformuna aşinalık",
        ],
        questions: [
            { key: "admin_type",
              label: "DC Admin mi, Web Admin mi olmak istiyorsun?",
              placeholder: "Discord Admin, Web Admin veya her ikisi...",
              rows: 1 },
            { key: "motivation",
              label: "Neden platform admin olmak istiyorsun?",
              placeholder: "Ne hissedip ne düşündüğünü samimice anlat.",
              rows: 4 },
            { key: "moderation",
              label: "Bir çatışma ya da kurallara aykırı bir durumuyla karşılaşsan nasıl yaklaşırdın?",
              placeholder: "Doğru ya da yanlış cevap yok, düşünceni paylaş.",
              rows: 4 },
            { key: "technical",
              label: "Teknik konularla (web, Discord, programlama vb.) daha önce hiç ilgilendin mi?",
              placeholder: "Olmadıysa da tamam — merak etmen yeterli.",
              rows: 2 },
            { key: "availability",
              label: "Günde yaklaşık ne kadar platforma bakabilirsin?",
              placeholder: "Kabaca bir fikir vermek yeterli.",
              rows: 2 },
        ],
    },

    /* ══════════════════════════════════════════════
       ROZET BAŞVURULARI
    ══════════════════════════════════════════════ */
    {
        id: "rozet_editor",
        category: "rozet",
        icon: Pencil,
        title: "Editör Rozeti",
        subtitle: "İçerik & Yazı",
        color: "rgba(251,191,36,0.9)",
        bg: "rgba(251,191,36,0.06)",
        border: "rgba(251,191,36,0.25)",
        dot: "rgba(251,191,36,0.8)",
        about: "Fanzin ve platform içeriklerini düzenlemeye, okumaya ve geliştirmeye ilgi duyanlar için. Profesyonel editörlük geçmişi aranmıyor — metinlere iyi bakmak yeterli.",
        responsibilities: [
            "Fanzin ve platform içeriklerini düzenlemek",
            "Yazarlarla iş birliği yaparak içerik kalitesini artırmak",
            "Yayınları son okumadan geçirmek",
        ],
        requirements: [],
        questions: [
            { key: "portfolio",
              label: "Yazı veya editörlükle ilgili daha önce bir şeyler yaptın mı?",
              placeholder: "Yazdıkların, düzenlediğin metinler, blog, okul gazetesi — her şey sayılır. Hiçbiri yoksa da yazabilirsin.",
              rows: 4 },
            { key: "experience",
              label: "Metinlere nasıl baktığını biraz anlat. Ne dikkatini çeker, ne rahatsız eder?",
              placeholder: "Bir metin okurken neye takılırsın, neyi fark edersin?",
              rows: 3 },
            { key: "contribution",
              label: "Bumedya içeriklerine nasıl katkı sağlamayı düşünürsün?",
              placeholder: "Fikrin yoksa 'bilmiyorum, görmek istiyorum' da yazabilirsin.",
              rows: 3 },
        ],
    },
    {
        id: "rozet_cizer",
        category: "rozet",
        icon: Palette,
        title: "Çizer Rozeti",
        subtitle: "İllüstrasyon & Sanat",
        color: "rgba(244,114,182,0.9)",
        bg: "rgba(244,114,182,0.08)",
        border: "rgba(244,114,182,0.25)",
        dot: "rgba(244,114,182,0.8)",
        about: "İllüstrasyon, dijital sanat, çizgi roman veya herhangi bir görsel üretimle Bumedya'ya katkı sağlamak isteyenler için. Sanat okulu geçmişi ya da profesyonel deneyim aranmıyor — önemli olan çizmek istemen.",
        responsibilities: [
            "Fanzin ve yayınlar için görsel içerik üretmek",
            "Etkinlik ve proje görselleri hazırlamak",
            "Topluluk Behance hesabına katkı sağlamak",
        ],
        requirements: [],
        questions: [
            { key: "portfolio",
              label: "Çizimlerini ya da görsel çalışmalarını paylaşabilir misin?",
              placeholder: "Behance, Instagram, bir link ya da açıklama — karalama defterin bile olabilir.",
              rows: 4 },
            { key: "style",
              label: "Ne tür şeyler çizmeyi ya da üretmeyi seversin? Nasıl çalışırsın?",
              placeholder: "Dijital, analog, hangi araçlar, hangi konular — aklına ne gelirse.",
              rows: 3 },
            { key: "contribution",
              label: "Bumedya'ya görsel anlamda nasıl katkı sağlamak isterdin?",
              placeholder: "Fikrin yoksa 'bilmiyorum, görmek istiyorum' da yazabilirsin.",
              rows: 3 },
        ],
    },
    {
        id: "rozet_yazar",
        category: "rozet",
        icon: Pen,
        title: "Yazar Rozeti",
        subtitle: "Yazı & Anlatı",
        color: "rgba(52,211,153,0.9)",
        bg: "rgba(52,211,153,0.08)",
        border: "rgba(52,211,153,0.25)",
        dot: "rgba(52,211,153,0.8)",
        about: "Hikâye, deneme, eleştiri, şiir ya da aklındaki herhangi bir şeyi Bumedya yayınlarıyla paylaşmak isteyenler için. Yayımlanmış bir eser şart değil — yazmayı seviyor olman yeterli.",
        responsibilities: [
            "Fanzin ve Substack için yazılı içerik üretmek",
            "Topluluk projelerinde yazarlık yapmak",
            "Diğer yazarlarla fikir alışverişinde bulunmak",
        ],
        requirements: [],
        questions: [
            { key: "portfolio",
              label: "Daha önce bir şeyler yazdın mı? Paylaşabilir misin?",
              placeholder: "Yayımlanmış, yayımlanmamış, blog, not defteri — her şey sayılır. Hiçbiri yoksa da yazabilirsin.",
              rows: 4 },
            { key: "genre",
              label: "Ne tür yazmayı seversin ya da denemek istersin?",
              placeholder: "Hikâye, deneme, şiir, eleştiri, röportaj — ya da henüz bilmiyorum da olabilir.",
              rows: 2 },
            { key: "contribution",
              label: "Bumedya yayınlarına nasıl katkı sağlamak isterdin?",
              placeholder: "Fikrin yoksa 'bilmiyorum, görmek istiyorum' da yazabilirsin.",
              rows: 3 },
        ],
    },

    /* ══════════════════════════════════════════════
       KULÜP AÇ
    ══════════════════════════════════════════════ */
    {
        id: "kulup_ac",
        category: "kulup_ac",
        icon: GraduationCap,
        title: "Kulüp Aç",
        subtitle: "Yeni Üniversite Kulübü",
        color: "rgba(147,197,253,0.9)",
        bg: "rgba(59,130,246,0.07)",
        border: "rgba(59,130,246,0.22)",
        dot: "rgba(59,130,246,0.8)",
        about: "Üniversitende henüz bir Bumedya kulübü yoksa, sen kurabilirsin. Kulüp kurma deneyimi aranmıyor — bu süreç zaten seni geliştirmek için var. Başvurun değerlendirildikten sonra Topluluk YK seninle iletişime geçecek.",
        responsibilities: [
            "Okulunda Bumedya kulübünü resmi olarak kurmak",
            "Kulüp YK üyelerini belirlemek",
            "İlk etkinlik ve içerik planını hazırlamak",
            "Toplulukla koordineli şekilde hareket etmek",
        ],
        requirements: [
            "Başvurulan üniversitede kayıtlı öğrenci olmak",
            "O üniversitede henüz aktif Bumedya kulübü bulunmaması",
        ],
        questions: [
            { key: "university",
              label: "Hangi üniversitede ve hangi şehirde okuyorsun?",
              placeholder: "Üniversite adı ve şehir...",
              rows: 1 },
            { key: "team",
              label: "Yanında bu fikre sıcak bakan biri var mı? Biraz anlat.",
              placeholder: "Kaç kişisiniz, kim ne ile ilgileniyor — ya da henüz yalnızsın da olabilir.",
              rows: 3 },
            { key: "plan",
              label: "Kulüpte ne tür şeyler yapmayı hayal ediyorsun?",
              placeholder: "Atölye, sergi, fanzin, sosyal medya, etkinlik — aklına gelen her şeyi yazabilirsin.",
              rows: 4 },
            { key: "motivation",
              label: "Okulunda bir Bumedya kulübü kurmak istemen nasıl bir histen kaynaklanıyor?",
              placeholder: "Samimice anlat.",
              rows: 3 },
        ],
    },
];

/* ── Kategoriye göre gruplama ── */
export const POSITIONS_BY_CATEGORY = {
    yonetim:  POSITIONS.filter(p => p.category === "yonetim"),
    rozet:    POSITIONS.filter(p => p.category === "rozet"),
    kulup_ac: POSITIONS.filter(p => p.category === "kulup_ac"),
} as const;
