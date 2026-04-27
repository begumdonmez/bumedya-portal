import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatClient from "./ChatClient";

export const metadata = { title: "Lounge | bumedya." };

export default async function ChatPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();

    const username = profile?.username ?? user.email?.split("@")[0] ?? "anonim";

    const { data: messages } = await supabase
        .from("messages")
        .select("id, room_id, user_id, username, content, created_at")
        .order("created_at", { ascending: true })
        .limit(200);

    return (
        <ChatClient
            userId={user.id}
            username={username}
            initialMessages={messages ?? []}
        />
    );
}
