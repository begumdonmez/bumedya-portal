import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import EtkinliklerClient from "./EtkinliklerClient";
import type { EventItem } from "@/components/EventMap";

export const metadata: Metadata = { title: "Etkinlikler | bumedya." };

export default async function EtkinliklerPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const [{ data: profile }, { data: events }] = await Promise.all([
        supabase.from("profiles").select("username, badges").eq("id", user.id).single(),
        supabase.from("events")
            .select("id, user_id, username, title, address, lat, lng, event_date, event_time, ref_url, approved")
            .order("event_date", { ascending: true }),
    ]);

    const isAdmin = (profile?.badges as string[] ?? []).includes("admin");
    const username = profile?.username ?? user.email?.split("@")[0] ?? "";

    return (
        <EtkinliklerClient
            initialEvents={(events ?? []) as EventItem[]}
            userId={user.id}
            username={username}
            isAdmin={isAdmin}
        />
    );
}
