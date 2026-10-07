import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import GaleriClient from "./GaleriClient";
import type { GalleryVideo } from "./Videos";
import { createAdminClient } from "@/lib/supabase/admin";
import { GALLERY_COLUMNS, GALLERY_PAGE_SIZE } from "./config";

export const metadata: Metadata = { title: "Galeri" };

export default async function GaleriPage() {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect("/login");

    const [{ data: { user } }, { data: profile }, { data: items }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("username, role, badges").eq("id", session.user.id).single(),
        supabase.from("gallery_items")
            .select(GALLERY_COLUMNS)
            .order("created_at", { ascending: false })
            .range(0, GALLERY_PAGE_SIZE - 1),
    ]);
    if (!user) redirect("/login");

    // Videolar: tablo RLS ile kapalı, sunucuda service role ile okunur.
    // Yayındakiler herkese; bekleyenler admin'e hepsi, üyeye yalnızca kendi önerileri.
    const isAdmin = ((profile?.badges as string[]) ?? []).includes("admin");
    const admin = createAdminClient();
    const VIDEO_COLS = "id, youtube_id, title, description, username, status, created_at";
    let pendingQuery = admin.from("gallery_videos").select(VIDEO_COLS).eq("status", "pending").order("created_at", { ascending: false });
    if (!isAdmin) pendingQuery = pendingQuery.eq("submitted_by", user.id);
    const [{ data: videos, error: videoError }, { data: pendingVideos }] = await Promise.all([
        admin.from("gallery_videos").select(VIDEO_COLS).eq("status", "approved").order("created_at", { ascending: false }).limit(60),
        pendingQuery,
    ]);
    // Tablo henüz oluşturulmadıysa galeri yine çalışsın
    if (videoError) console.warn("gallery_videos okunamadı:", videoError.message);

    return (
        <GaleriClient
            userId={user.id}
            username={profile?.username ?? ""}
            role={profile?.role ?? "member"}
            badges={(profile?.badges as string[]) ?? []}
            items={items ?? []}
            supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
            videos={(videos ?? []) as GalleryVideo[]}
            pendingVideos={(pendingVideos ?? []) as GalleryVideo[]}
        />
    );
}
