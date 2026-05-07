import { createClient } from "@supabase/supabase-js";

/**
 * Server-only admin client — service role key kullanır, RLS'i bypass eder.
 * Sadece Server Components veya Route Handlers içinde kullanılmalı.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
    );
}
