import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatClient from "./ChatClient";
import SiteHeader from "@/components/SiteHeader";

export const metadata = { title: "Lounge" };

export default async function ChatPage() {
    const supabase = await createClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) redirect("/login");

    const [{ data: { user } }, { data: profile }, { data: messages }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("profiles").select("username, badges").eq("id", session.user.id).single(),
        supabase.from("messages").select("id, room_id, user_id, username, content, created_at").order("created_at", { ascending: true }).limit(200),
    ]);
    if (!user) redirect("/login");

    const username = profile?.username ?? user.email?.split("@")[0] ?? "anonim";
    const isAdmin = (profile?.badges as string[] ?? []).includes("admin");

    return (
        <div className="flex flex-col" style={{ height: "100dvh" }}>

            <SiteHeader userId={user.id} username={username} />

            <div className="flex flex-1 min-h-0 overflow-hidden" style={{ paddingTop: "64px" }}>
                <ChatClient
                    userId={user.id}
                    username={username}
                    isAdmin={isAdmin}
                    initialMessages={messages ?? []}
                />
            </div>
        </div>
    );
}
