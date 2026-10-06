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
        const { error } = await supabase.from("contact_messages").insert({
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
                     style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)" }}>
                        <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <div>
                    <p className="font-semibold mb-1" style={{ color: "var(--text-1)" }}>Mesajın iletildi!</p>
                    <p className="text-sm" style={{ color: "color-mix(in srgb, var(--fg) 45%, transparent)" }}>En kısa sürede dönüş yapacağız.</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="cf-name" className="field-label">
                        İsim <span style={{ color: "color-mix(in srgb, var(--danger) 70%, transparent)" }}>*</span>
                    </label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                           id="cf-name" autoComplete="name" placeholder="Adın Soyadın" className="form-input" required />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="cf-email" className="field-label">
                        E-posta <span style={{ color: "color-mix(in srgb, var(--danger) 70%, transparent)" }}>*</span>
                    </label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                           id="cf-email" autoComplete="email" placeholder="mail@örnek.com" className="form-input" required />
                </div>
            </div>
            <div className="flex flex-col gap-1.5">
                <label htmlFor="cf-msg" className="field-label">
                    Mesaj <span style={{ color: "color-mix(in srgb, var(--danger) 70%, transparent)" }}>*</span>
                </label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                          id="cf-msg" placeholder="Merhaba, size ulaşmak istedim..." rows={4}
                          className="form-input resize-none" required />
            </div>
            <button type="submit" disabled={loading}
                    className="btn-primary self-end">
                <Send size={14} />
                {loading ? "Gönderiliyor..." : "Gönder"}
            </button>
        </form>
    );
}
