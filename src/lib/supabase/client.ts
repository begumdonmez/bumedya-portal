import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Components için Supabase browser client.
 * Singleton pattern — her render'da yeni instance oluşturmaz.
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}