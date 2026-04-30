import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ManifestClient from "./ManifestClient";

export const metadata: Metadata = { title: "Manifest | bumedya." };

/*
  Supabase tablosu:
  create table manifest_notes (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles(id) on delete cascade,
    username text not null,
    content text not null default '',
    x float not null,
    y float not null,
    color text not null default 'yellow',
    created_at timestamp with time zone default now()
  );
  alter table manifest_notes enable row level security;
  create policy "Herkes okuyabilir" on manifest_notes for select using (true);
  create policy "Kendi notunu ekleyebilir" on manifest_notes for insert with check (auth.uid() = user_id);
  create policy "Kendi notunu güncelleyebilir" on manifest_notes for update using (auth.uid() = user_id);
  create policy "Kendi notunu silebilir" on manifest_notes for delete using (auth.uid() = user_id);
*/

export default async function ManifestPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("username, badges")
        .eq("id", user.id)
        .single();

    const { data: notes } = await supabase
        .from("manifest_notes")
        .select("*")
        .order("created_at", { ascending: true });

    return (
        <ManifestClient
            userId={user.id}
            username={profile?.username ?? ""}
            badges={(profile?.badges as string[]) ?? []}
            initialNotes={notes ?? []}
        />
    );
}
