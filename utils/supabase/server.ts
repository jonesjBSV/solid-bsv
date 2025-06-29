import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Database } from '@/types/database.types'

const getSupabaseClient = async () => {
	const session = await auth()

	if (!session?.supabaseAccessToken) {
		redirect('/')
	}
	// 如何 使用 session.supabaseAccessToken 来创建 supabase client
	return createSupabaseClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			global: {
				headers: {
					Authorization: `Bearer ${session.supabaseAccessToken}`,
				},
			},
		}
	)
}

function createSupabaseAdminClient() {
	// server  api
	return createSupabaseClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SECRET_KEY!,
	)
}

// Export createClient for compatibility
export function createClient() {
	return createSupabaseClient<Database>(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
	)
}

export { getSupabaseClient, createSupabaseAdminClient }