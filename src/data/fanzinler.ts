/**
 * Kadraj fanzin arşivi.
 *
 * Yeni sayı eklemek için:
 *   1. Dış ve iç yüz görsellerini (yatay, üç kırımlı) public/fanzin/ altına koy.
 *   2. Dış yüzün orta panelinden kesilmiş dikey kapak görselini <ad>_kapak.jpg olarak ekle.
 *   3. Aşağıdaki listenin BAŞINA yeni bir kayıt ekle (en yeni en üstte görünür).
 */

export interface FanzinYuz {
    /** public/ altındaki yol */
    src: string;
    etiket: string;
}

export interface Fanzin {
    slug: string;
    sayi: string;
    baslik: string;
    tema: string;
    /** Kapak rengi — rafta sırt şeridi olarak kullanılır */
    renk: string;
    kapak: string;
    kapakCizeri?: string;
    yuzler: FanzinYuz[];
}

export const FANZINLER: Fanzin[] = [
    {
        slug: "kadraj-6",
        sayi: "No 6",
        baslik: "Kadraj",
        tema: "Müzik sayısı",
        renk: "#6B1F5C",
        kapak: "/fanzin/kadraj6_dis_kapak.jpg",
        kapakCizeri: "Beril Bilgen",
        yuzler: [
            { src: "/fanzin/kadraj6_dis.jpg", etiket: "Dış yüz" },
            { src: "/fanzin/kadraj6_ic.jpg",  etiket: "İç yüz" },
        ],
    },
    {
        slug: "kadraj-5",
        sayi: "No 5",
        baslik: "Kadraj",
        tema: "Autumn Time",
        renk: "#D9661F",
        kapak: "/fanzin/kadraj5_dis_kapak.jpg",
        yuzler: [
            { src: "/fanzin/kadraj5_dis.jpg", etiket: "Dış yüz" },
            { src: "/fanzin/kadraj5_ic.jpg",  etiket: "İç yüz" },
        ],
    },
    {
        slug: "kadraj-3",
        sayi: "No 3",
        baslik: "Kadraj",
        tema: "29 Ekim · Cumhuriyet özel sayısı",
        renk: "#C8102E",
        kapak: "/fanzin/kadraj3_dis_kapak.jpg",
        yuzler: [
            { src: "/fanzin/kadraj3_dis.jpg", etiket: "Dış yüz" },
            { src: "/fanzin/kadraj3_ic.jpg",  etiket: "İç yüz" },
        ],
    },
    {
        slug: "kadraj-2",
        sayi: "No 2",
        baslik: "Kadraj",
        tema: "Trick or Treat · Cadılar Bayramı",
        renk: "#2B2B2B",
        kapak: "/fanzin/hallowen_dis_kapak.jpg",
        kapakCizeri: "Beril Bilgen & Yağmur Gül",
        yuzler: [
            { src: "/fanzin/hallowen_dis.jpg",   etiket: "Dış yüz · kapak 2.1" },
            { src: "/fanzin/hallowen_dis_2.jpg", etiket: "Dış yüz · kapak 2" },
            { src: "/fanzin/hallowen_ic.jpg",    etiket: "İç yüz" },
        ],
    },
    {
        slug: "kadraj-1",
        sayi: "No 1.2",
        baslik: "Kadraj",
        tema: "Get Ready for the Encore",
        renk: "#111111",
        kapak: "/fanzin/kadraj1_dis_kapak.jpg",
        kapakCizeri: "Yiğit İbrahim Erkal",
        yuzler: [
            { src: "/fanzin/kadraj1_dis.jpg", etiket: "Dış yüz" },
            { src: "/fanzin/kadraj1_ic.jpg",  etiket: "İç yüz" },
        ],
    },
];
