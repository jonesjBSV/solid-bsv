'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

// Simplified profile data interface
interface ProfileData {
	userData: any;
	identityData: any;
	stats: {
		podResourcesCount: number;
		contextEntriesCount: number;
		attestationsCount: number;
		totalEarnings: number;
		totalAccess: number;
		solidConnected: boolean;
	};
}

export default function ProfileAndBillingContent() {
	const { data: session, status } = useSession();
	const [profileData, setProfileData] = useState<ProfileData | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<'overview' | 'pod' | 'bsv'>('overview');

	useEffect(() => {
		// Debug logging
		console.log('ProfileAndBillingContent mounted, session status:', status);
		console.log('Session data:', session);

		async function fetchProfile() {
			try {
				// For now, create mock data based on session
				if (session?.user) {
					const mockData: ProfileData = {
						userData: session.user,
						identityData: null, // Will be populated when SOLID pod is connected
						stats: {
							podResourcesCount: 0,
							contextEntriesCount: 0,
							attestationsCount: 0,
							totalEarnings: 0,
							totalAccess: 0,
							solidConnected: false
						}
					};
					setProfileData(mockData);
					console.log('Profile data set with mock data:', mockData);
				}
			} catch (error) {
				console.error('Error setting up profile:', error);
			} finally {
				setLoading(false);
			}
		}

		if (status !== 'loading') {
			fetchProfile();
		}
	}, [session, status]);

	if (loading || status === 'loading') {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="animate-pulse space-y-6">
					<div className="h-8 bg-gray-200 rounded w-1/3"></div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="h-24 bg-gray-200 rounded"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (status === 'unauthenticated') {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="text-center py-8">
					<p className="text-gray-500 mb-4">Please sign in to view your profile</p>
					<button 
						onClick={() => window.location.href = '/auth/signin'}
						className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
					>
						Sign In
					</button>
				</div>
			</div>
		);
	}

	if (!profileData) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="text-center py-8">
					<p className="text-gray-500">Error loading profile data</p>
				</div>
			</div>
		);
	}

	const { userData, identityData, stats } = profileData;

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="bg-white border border-gray-200 rounded-lg p-6">
				<div className="flex items-center space-x-4">
					{userData?.image && (
						<img 
							src={userData.image} 
							alt="Profile" 
							className="w-16 h-16 rounded-full"
						/>
					)}
					<div>
						<h1 className="text-2xl font-bold">{userData?.name || 'User'}</h1>
						<p className="text-gray-600">{userData?.email}</p>
					</div>
				</div>
			</div>

			{/* Tab Navigation */}
			<div className="bg-white border border-gray-200 rounded-lg">
				<div className="border-b border-gray-200">
					<nav className="flex space-x-8 px-6">
						{[
							{ id: 'overview', label: 'Overview' },
							{ id: 'pod', label: 'SOLID Pod' },
							{ id: 'bsv', label: 'BSV Micropayments' }
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id as any)}
								className={`py-4 px-1 border-b-2 font-medium text-sm ${
									activeTab === tab.id
										? 'border-blue-500 text-blue-600'
										: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
								}`}
							>
								{tab.label}
							</button>
						))}
					</nav>
				</div>

				{/* Tab Content */}
				<div className="p-6">
					<AnimatePresence mode="wait">
						{activeTab === 'overview' && (
							<motion.div
								key="overview"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="space-y-6"
							>
								<h2 className="text-xl font-semibold">Account Overview</h2>
								
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
										<h3 className="font-semibold text-blue-800">Pod Resources</h3>
										<p className="text-2xl font-bold text-blue-600">{stats.podResourcesCount}</p>
									</div>
									
									<div className="bg-green-50 border border-green-200 rounded-lg p-4">
										<h3 className="font-semibold text-green-800">Context Entries</h3>
										<p className="text-2xl font-bold text-green-600">{stats.contextEntriesCount}</p>
									</div>
									
									<div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
										<h3 className="font-semibold text-orange-800">BSV Attestations</h3>
										<p className="text-2xl font-bold text-orange-600">{stats.attestationsCount}</p>
									</div>
								</div>

								<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
									<h3 className="font-semibold mb-2">SOLID Pod Status</h3>
									<div className="flex items-center space-x-2">
										<div className={`w-3 h-3 rounded-full ${
											stats.solidConnected ? 'bg-green-500' : 'bg-red-500'
										}`}></div>
										<span className={stats.solidConnected ? 'text-green-700' : 'text-red-700'}>
											{stats.solidConnected ? 'Connected' : 'Not Connected'}
										</span>
									</div>
								</div>
							</motion.div>
						)}

						{activeTab === 'pod' && (
							<motion.div
								key="pod"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="space-y-6"
							>
								<h2 className="text-xl font-semibold">SOLID Pod Management</h2>
								
								{identityData ? (
									<div className="space-y-4">
										<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
											<h3 className="font-semibold mb-2">Pod Configuration</h3>
											<div className="space-y-2 text-sm">
												<div className="flex justify-between">
													<span className="text-gray-600">Pod URL:</span>
													<span className="font-mono text-blue-600 truncate max-w-xs">
														{identityData.solid_pod_url}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-gray-600">DID:</span>
													<span className="font-mono text-gray-800 truncate max-w-xs">
														{identityData.did || 'Not set'}
													</span>
												</div>
												<div className="flex justify-between">
													<span className="text-gray-600">Status:</span>
													<span className={`px-2 py-1 rounded text-xs ${
														identityData.connection_status === 'connected'
															? 'bg-green-100 text-green-800'
															: 'bg-red-100 text-red-800'
													}`}>
														{identityData.connection_status}
													</span>
												</div>
											</div>
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
							</motion.div>
						)}

						{activeTab === 'bsv' && (
							<motion.div
								key="bsv"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="space-y-6"
							>
								<h2 className="text-xl font-semibold">BSV Micropayments</h2>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="bg-green-50 border border-green-200 rounded-lg p-4">
										<h3 className="font-semibold text-green-800">Total Earnings</h3>
										<p className="text-2xl font-bold text-green-600">{stats.totalEarnings} sats</p>
										<p className="text-sm text-green-600">≈ ${(stats.totalEarnings * 0.0001).toFixed(4)}</p>
									</div>
									
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
										<h3 className="font-semibold text-blue-800">Total Access Granted</h3>
										<p className="text-2xl font-bold text-blue-600">{stats.totalAccess}</p>
										<p className="text-sm text-blue-600">Resource accesses</p>
									</div>
								</div>

								<div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
									<h3 className="font-semibold text-orange-800 mb-2">BSV Wallet Integration</h3>
									<p className="text-sm text-orange-800 mb-4">
										Connect your BSV wallet to enable micropayments for notarization and sharing.
									</p>
									<button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
										Connect BSV Wallet
									</button>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}