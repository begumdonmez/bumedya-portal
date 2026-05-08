import { createClient } from "@/lib/supabase/server";

export interface AdminUser {
    id: string;
    username: string;
    badges: string[];
}

export async function getAdminUser(): Promise<AdminUser | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("badges, username")
        .eq("id", user.id)
        .single();

    if (!profile || !(profile.badges as string[]).includes("admin")) return null;

    return { id: user.id, username: profile.username as string, badges: profile.badges as string[] };
}
