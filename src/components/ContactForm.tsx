"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function ContactForm() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;

        setLoading(true);
        const supabase = createClient();
        const { error } = await supabase.from("messages").insert({
            name: form.name.trim(),
            email: form.email.trim(),
            message: form.message.trim(),
        });
        setLoading(false);

        if (error) { toast.error("Mesaj gönderilemedi, tekrar dene."); return; }

        setSent(true);
        toast.success("Mesajın iletildi!");
    };

    if (sent) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center"
                     style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "#A78BFA" }}>
                        <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div>
                    <p className="font-semibold mb-1" style={{ color: "#E0F2FE" }}>Mesajın iletildi!</p>
                    <p className="text-sm" style={{ color: "rgba(224,242,254,0.45)" }}>En kısa sürede dönüş yapacağız.</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: "rgba(224,242,254,0.4)" }}>
                        İsim <span style={{ color: "rgba(239,68,68,0.7)" }}>*</span>
                    </label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                           placeholder="Adın Soyadın" className="form-input" required />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: "rgba(224,242,254,0.4)" }}>
                        E-Posta <span style={{ color: "rgba(239,68,68,0.7)" }}>*</span>
                    </label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                           placeholder="mail@örnek.com" className="form-input" required />
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-medium tracking-[0.15em] uppercase" style={{ color: "rgba(224,242,254,0.4)" }}>
                    Mesaj <span style={{ color: "rgba(239,68,68,0.7)" }}>*</span>
                </label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                          placeholder="Merhaba, size ulaşmak istedim..." rows={4}
                          className="form-input resize-none" required />
            </div>
            <button type="submit" disabled={loading}
                    className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "#7C3AED", boxShadow: "0 8px 24px rgba(124,58,237,0.35)" }}>
                <Send size={14} />
                {loading ? "Gönderiliyor..." : "Gönder"}
            </button>
        </form>
    );
}
