import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth"
import { Database } from '@/types/database.types'

export async function createAuthenticatedClient() {
  const session = await auth()
  // @ts-ignore
  const { supabaseAccessToken } = session
  console.log(supabaseAccessToken)

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`,
        },
      }
    },
  )
}

// Simple client for browser usage
export function createClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
