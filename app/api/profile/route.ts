import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/utils/supabase/server';
import { auth } from "@/lib/auth";

export async function GET() {
	try {
		const supabase = await getSupabaseClient();
		const session = await auth();

		const userId = session?.user?.id;
		if (!userId) {
			return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
		}

		// Get user data
		const { data: userData, error: userError } = await supabase
			.from('users')
			.select('*')
			.eq('id', userId)
			.single();

		if (userError) {
			console.error('Error fetching user data:', userError);
			return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
		}

		// Get SOLID identity data
		const { data: identityData, error: identityError } = await supabase
			.from('identity')
			.select('*')
			.eq('user_id', userId)
			.single();

		// Get pod resources count
		const { count: podResourcesCount, error: podResourcesError } = await supabase
			.from('pod_resource')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', userId);

		// Get context entries count
		const { count: contextEntriesCount, error: contextEntriesError } = await supabase
			.from('context_entry')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', userId);

		// Get BSV attestations count
		const { count: attestationsCount, error: attestationsError } = await supabase
			.from('bsv_attestation')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', userId);

		// Get shared resources count and earnings
		const { data: sharedResources, error: sharedError } = await supabase
			.from('shared_resource')
			.select('total_earnings_satoshis, total_access_count')
			.eq('user_id', userId)
			.eq('is_active', true);

		const totalEarnings = sharedResources?.reduce((sum, resource) => 
			sum + (resource.total_earnings_satoshis || 0), 0) || 0;
		const totalAccess = sharedResources?.reduce((sum, resource) => 
			sum + (resource.total_access_count || 0), 0) || 0;

		return NextResponse.json({
			userData,
			identityData: identityData || null,
			stats: {
				podResourcesCount: podResourcesCount || 0,
				contextEntriesCount: contextEntriesCount || 0,
				attestationsCount: attestationsCount || 0,
				totalEarnings,
				totalAccess,
				solidConnected: identityData?.connection_status === 'connected'
			}
		});
	} catch (error) {
		console.error('Error in profile API route:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}