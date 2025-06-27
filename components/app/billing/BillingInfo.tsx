import { getSupabaseClient } from '@/utils/supabase/server';
import { auth } from "@/lib/auth"

export default async function BillingInfo() {
	const supabase = await getSupabaseClient();
	const session = await auth();
	const userId = session?.user?.id;

	if (!userId) {
		return (
			<div className="p-6 border border-red-200 bg-red-50 rounded-lg">
				<p className="text-red-800">Please log in to view your billing information.</p>
			</div>
		);
	}

	// Get user's BSV-related data
	const { data: identityData } = await supabase
		.from('identity')
		.select('*')
		.eq('user_id', userId)
		.single();

	const { data: sharedResources } = await supabase
		.from('shared_resource')
		.select('*')
		.eq('user_id', userId)
		.eq('is_active', true);

	const { data: micropayments } = await supabase
		.from('micropayment')
		.select('*')
		.or(`buyer_user_id.eq.${userId},seller_user_id.eq.${userId}`)
		.order('created_at', { ascending: false })
		.limit(10);

	const totalEarnings = sharedResources?.reduce((sum, resource) => 
		sum + (resource.total_earnings_satoshis || 0), 0) || 0;

	const totalSpent = micropayments?.filter(payment => payment.buyer_user_id === userId)
		.reduce((sum, payment) => sum + payment.amount_satoshis, 0) || 0;

	return (
		<div className="space-y-6">
			{/* BSV Wallet Overview */}
			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h2 className="text-xl font-semibold mb-4">BSV Micropayment Overview</h2>
				
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="bg-green-50 border border-green-200 rounded-lg p-4">
						<h3 className="font-semibold text-green-800">Total Earnings</h3>
						<p className="text-2xl font-bold text-green-600">{totalEarnings} sats</p>
						<p className="text-sm text-green-600">≈ ${(totalEarnings * 0.0001).toFixed(4)}</p>
					</div>
					
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
						<h3 className="font-semibold text-blue-800">Total Spent</h3>
						<p className="text-2xl font-bold text-blue-600">{totalSpent} sats</p>
						<p className="text-sm text-blue-600">≈ ${(totalSpent * 0.0001).toFixed(4)}</p>
					</div>
					
					<div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
						<h3 className="font-semibold text-orange-800">Net Balance</h3>
						<p className="text-2xl font-bold text-orange-600">{totalEarnings - totalSpent} sats</p>
						<p className="text-sm text-orange-600">≈ ${((totalEarnings - totalSpent) * 0.0001).toFixed(4)}</p>
					</div>
				</div>
			</div>

			{/* SOLID Pod Status */}
			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h2 className="text-xl font-semibold mb-4">SOLID Pod Status</h2>
				
				{identityData ? (
					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="font-medium">Pod URL:</span>
							<span className="text-blue-600 truncate max-w-md">{identityData.solid_pod_url}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="font-medium">Connection Status:</span>
							<span className={`px-2 py-1 rounded-full text-xs font-semibold ${
								identityData.connection_status === 'connected' 
									? 'bg-green-100 text-green-800' 
									: 'bg-red-100 text-red-800'
							}`}>
								{identityData.connection_status}
							</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="font-medium">DID:</span>
							<span className="text-gray-600 truncate max-w-md">{identityData.did || 'Not set'}</span>
						</div>
					</div>
				) : (
					<div className="text-center py-8">
						<p className="text-gray-500 mb-4">No SOLID pod connected</p>
						<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
							Connect SOLID Pod
						</button>
					</div>
				)}
			</div>

			{/* Recent Transactions */}
			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<h2 className="text-xl font-semibold mb-4">Recent Micropayments</h2>
				
				{micropayments && micropayments.length > 0 ? (
					<div className="space-y-3">
						{micropayments.map((payment) => (
							<div key={payment.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
								<div>
									<p className="font-medium">
										{payment.buyer_user_id === userId ? 'Payment' : 'Received'}
									</p>
									<p className="text-sm text-gray-500">
										{new Date(payment.created_at).toLocaleDateString()}
									</p>
								</div>
								<div className="text-right">
									<p className={`font-semibold ${
										payment.buyer_user_id === userId ? 'text-red-600' : 'text-green-600'
									}`}>
										{payment.buyer_user_id === userId ? '-' : '+'}{payment.amount_satoshis} sats
									</p>
									<p className="text-sm text-gray-500">
										{payment.payment_status}
									</p>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-gray-500 text-center py-4">No micropayments yet</p>
				)}
			</div>

			{/* Shared Resources */}
			{sharedResources && sharedResources.length > 0 && (
				<div className="bg-white border border-gray-200 rounded-lg p-6">
					<h2 className="text-xl font-semibold mb-4">Your Shared Resources</h2>
					
					<div className="space-y-3">
						{sharedResources.map((resource) => (
							<div key={resource.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
								<div>
									<p className="font-medium">{resource.resource_type}</p>
									<p className="text-sm text-gray-500">
										{resource.total_access_count} accesses
									</p>
								</div>
								<div className="text-right">
									<p className="font-semibold">{resource.price_satoshis} sats</p>
									<p className="text-sm text-gray-500">
										Earned: {resource.total_earnings_satoshis} sats
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}