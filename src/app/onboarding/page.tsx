"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const ROLES = [
    {
        id: "member",
        title: "İzleyici",
        subtitle: "Member",
        description: "Topluluğu keşfet, eserleri beğen, etkinliklere katıl ve yorumlarınla katkıda bulun.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 24c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
        perks: ["Galeriyi keşfet", "Etkinliklere katıl", "Yorum yap", "Favorile"],
        color: "rgba(59,130,246,0.8)",
        glow: "rgba(59,130,246,0.15)",
        border: "rgba(59,130,246,0.3)",
    },
    {
        id: "creator",
        title: "Üretici",
        subtitle: "Creator",
        description: "Çizimlerini ve yazılarını paylaş, fanzin ekosistemine içerik üret, stüdyoya eriş.",
        icon: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 20L16 8l4 4L8 24H4v-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 11l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M19 5l4 4-2 2-4-4 2-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        perks: ["Çizim paylaş", "Yazı yayınla", "Stüdyo erişimi", "İstatistikler"],
        color: "rgba(124,58,237,0.9)",
        glow: "rgba(124,58,237,0.18)",
        border: "rgba(124,58,237,0.4)",
    },
] as const;

type RoleId = "member" | "creator";

export default function OnboardingPage() {
    const router = useRouter();
    const [selected, setSelected] = useState<RoleId | null>(null);
    const [loading, setLoading] = useState(false);

    const handleContinue = async () => {
        if (!selected) {
            toast.error("Lütfen bir rol seç.");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Kaydediliyor...");
        const supabase = createClient();

        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                toast.error("Oturum bulunamadı. Lütfen tekrar giriş yap.", { id: toastId });
                router.push("/login");
                return;
            }

            const { error } = await supabase
                .from("profiles")
                .upsert({
                    id: user.id,
                    username: user.email!.split("@")[0],
                    role: selected,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "id" });

            if (error) {
                toast.error("Rol kaydedilemedi: " + error.message, { id: toastId });
                setLoading(false);
                return;
            }

            toast.success(
                selected === "creator"
                    ? "Hoş geldin, üretici! Stüdyo seni bekliyor."
                    : "Hoş geldin! Topluluğu keşfetmeye başla.",
                { id: toastId }
            );

            router.push("/");
            router.refresh();

        } catch {
            toast.error("Beklenmedik bir hata oluştu.", { id: toastId });
            setLoading(false);
        }
    };

    return (
        <div
            className="aurora-bg relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden"
        >
            <div aria-hidden className="aurora-layer" />
            <div aria-hidden className="aurora-orb-pink" />

            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center" style={{ animation: "float-up 0.6s ease-out both" }}>

                {/* Adım göstergesi */}
                <div className="flex items-center gap-2 mb-10">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="rounded-full transition-all duration-300"
                             style={{
                                 width: step === 2 ? "28px" : "8px",
                                 height: "8px",
                                 background: step === 2 ? "#7C3AED" : step < 2 ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.1)",
                             }} />
                    ))}
                </div>

                {/* Başlık */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5"
                         style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(167,139,250,0.8)" }}>
              Son bir adım
            </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3" style={{ color: "#E0F2FE" }}>
                        Nasıl olmak istersin?
                    </h1>
                    <p className="text-base" style={{ color: "rgba(224,242,254,0.45)" }}>
                        Rolünü seçerek başla. İstersen sonradan değiştirebilirsin.
                    </p>
                </div>

                {/* Rol kartları */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
                    {ROLES.map((role) => {
                        const isSelected = selected === role.id;
                        return (
                            <button
                                key={role.id}
                                onClick={() => setSelected(role.id)}
                                className="relative text-left rounded-3xl p-6 transition-all duration-300 overflow-hidden group"
                                style={{
                                    background: isSelected ? role.glow : "rgba(255,255,255,0.03)",
                                    border: `1px solid ${isSelected ? role.border : "rgba(255,255,255,0.07)"}`,
                                    boxShadow: isSelected ? `0 0 40px ${role.glow}, inset 0 1px 0 rgba(255,255,255,0.08)` : "none",
                                    transform: isSelected ? "scale(1.02)" : "scale(1)",
                                }}
                            >
                                {/* Seçili işareti */}
                                <div className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300"
                                     style={{
                                         background: isSelected ? role.color : "rgba(255,255,255,0.06)",
                                         border: `1px solid ${isSelected ? "transparent" : "rgba(255,255,255,0.1)"}`,
                                     }}>
                                    {isSelected && (
                                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>

                                {/* İkon */}
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300"
                                     style={{
                                         background: isSelected ? role.glow : "rgba(255,255,255,0.05)",
                                         color: isSelected ? role.color : "rgba(224,242,254,0.4)",
                                         border: `1px solid ${isSelected ? role.border : "rgba(255,255,255,0.06)"}`,
                                     }}>
                                    {role.icon}
                                </div>

                                {/* Başlık */}
                                <div className="mb-3">
                                    <div className="flex items-baseline gap-2">
                                        <h2 className="text-lg font-bold tracking-tight transition-colors duration-300"
                                            style={{ color: isSelected ? "#E0F2FE" : "rgba(224,242,254,0.7)" }}>
                                            {role.title}
                                        </h2>
                                        <span className="text-[10px] tracking-widest uppercase font-medium"
                                              style={{ color: isSelected ? role.color : "rgba(224,242,254,0.25)" }}>
                      {role.subtitle}
                    </span>
                                    </div>
                                    <p className="text-sm mt-1.5 leading-relaxed" style={{ color: "rgba(224,242,254,0.45)" }}>
                                        {role.description}
                                    </p>
                                </div>

                                {/* Yetkiler */}
                                <div className="flex flex-col gap-1.5 mt-4">
                                    {role.perks.map((perk) => (
                                        <div key={perk} className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full shrink-0"
                                                 style={{ background: isSelected ? role.color : "rgba(255,255,255,0.2)" }} />
                                            <span className="text-xs"
                                                  style={{ color: isSelected ? "rgba(224,242,254,0.65)" : "rgba(224,242,254,0.3)" }}>
                        {perk}
                      </span>
                                        </div>
                                    ))}
                                </div>

                                {!isSelected && (
                                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                         style={{ background: "rgba(255,255,255,0.02)" }} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Devam butonu */}
                <button
                    onClick={handleContinue}
                    disabled={!selected || loading}
                    className="relative w-full max-w-xs py-4 rounded-2xl text-sm font-bold text-white transition-all duration-300 overflow-hidden disabled:cursor-not-allowed"
                    style={{
                        background: !selected ? "rgba(124,58,237,0.2)" : loading ? "rgba(124,58,237,0.5)" : "#7C3AED",
                        boxShadow: selected && !loading ? "0 8px 24px rgba(124,58,237,0.4), 0 0 0 1px rgba(124,58,237,0.3)" : "none",
                        color: !selected ? "rgba(255,255,255,0.3)" : "white",
                    }}
                >
                    {selected && !loading && (
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
                <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Kaydediliyor...
                </>
            ) : !selected ? (
                "Bir rol seç"
            ) : (
                <>
                    Devam Et
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </>
            )}
          </span>
                </button>

                <p className="mt-4 text-xs" style={{ color: "rgba(224,242,254,0.2)" }}>
                    Profil ayarlarından istediğin zaman değiştirebilirsin.
                </p>
            </div>
        </div>
    );
}