'use client'
import { useState } from "react";

interface PricingTier {
	name: string;
	description: string;
	pricePerAction: number; // in satoshis
	features: string[];
	isHighlighted?: boolean;
}

// BSV-based pricing tiers focused on micropayments per action
const pricingTiers: PricingTier[] = [
	{
		name: "Free Tier",
		description: "Basic SOLID pod management",
		pricePerAction: 0,
		features: [
			"Connect your SOLID pod",
			"Basic identity management",
			"Local context storage",
			"Up to 10 pod resources"
		]
	},
	{
		name: "Pay-per-Use", 
		description: "BSV micropayments for advanced features",
		pricePerAction: 100, // 100 satoshis per action
		features: [
			"Everything in Free",
			"BSV notarization per item",
			"Unlimited pod resources",
			"Context sharing & discovery",
			"Micropayment earnings"
		],
		isHighlighted: true
	},
	{
		name: "Power User",
		description: "Volume discounts for heavy usage",
		pricePerAction: 50, // 50 satoshis per action (50% discount)
		features: [
			"Everything in Pay-per-Use",
			"50% discount on all actions",
			"Priority overlay synchronization",
			"Advanced DID/VC management",
			"Bulk operations support"
		]
	}
];

export default function Pricing() {
	const [selectedTier, setSelectedTier] = useState<string>('Pay-per-Use');

	return (
		<section id="pricing" className="bg-[var(--background)] py-16">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold mb-4">BSV Micropayment Pricing</h2>
					<p className="text-gray-600 max-w-2xl mx-auto">
						Pay only for what you use with BSV micropayments. No subscriptions, 
						just transparent per-action pricing for SOLID pod operations and BSV attestations.
					</p>
				</div>

				<div className="grid md:grid-cols-3 gap-8">
					{pricingTiers.map((tier) => {
						const isFree = tier.pricePerAction === 0;
						const satoshiToUSD = tier.pricePerAction * 0.0001; // Rough conversion for display

						return (
							<div 
								key={tier.name}
								className={`bg-[var(--background)] p-8 rounded-lg shadow-md border-2 relative cursor-pointer transition-all duration-300 hover:shadow-lg ${
									tier.isHighlighted ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20' : 'border-[var(--border)]'
								} ${selectedTier === tier.name ? 'ring-2 ring-[var(--primary)]/40' : ''}`}
								onClick={() => setSelectedTier(tier.name)}
							>
								{tier.isHighlighted && (
									<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
										<span className="bg-[#5059FE] text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
											Most Popular
										</span>
									</div>
								)}
								
								<h3 className="text-xl font-bold mb-2">{tier.name}</h3>
								<p className="text-sm text-gray-600 mb-6">{tier.description}</p>
								
								<div className="mb-6">
									{isFree ? (
										<div className="text-3xl font-bold text-green-600">Free</div>
									) : (
										<div>
											<div className="text-2xl font-bold">{tier.pricePerAction} sats</div>
											<div className="text-sm text-gray-500">≈ ${satoshiToUSD.toFixed(4)} per action</div>
										</div>
									)}
								</div>

								{!isFree && (
									<div className="mb-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
										<div className="text-sm text-orange-800">
											<div className="font-semibold">Example Actions:</div>
											<ul className="text-xs mt-1 space-y-1">
												<li>• Notarize pod resource: {tier.pricePerAction} sats</li>
												<li>• Share context entry: {tier.pricePerAction} sats</li>
												<li>• DID/VC timestamping: {tier.pricePerAction} sats</li>
											</ul>
										</div>
									</div>
								)}

								<button className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 mb-6 ${
									isFree 
										? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
										: 'bg-[#5059FE] text-white hover:bg-[#4048ed] hover:shadow-md'
								}`}>
									{isFree ? 'Get Started Free' : 'Connect BSV Wallet'}
								</button>

								<ul className="space-y-3">
									{tier.features.map((feature, index) => (
										<li key={index} className="flex items-start">
											<svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
											</svg>
											<span className="text-sm">{feature}</span>
										</li>
									))}
								</ul>
							</div>
						);
					})}
				</div>

				<div className="mt-12 text-center">
					<div className="max-w-3xl mx-auto p-6 bg-blue-50 border border-blue-200 rounded-lg">
						<h3 className="font-semibold text-blue-900 mb-2">Why BSV Micropayments?</h3>
						<p className="text-sm text-blue-800">
							BSV's ultra-low fees (typically &lt;$0.001) make true micropayments possible. 
							Pay only for the actions you use - no monthly subscriptions or hidden fees. 
							Your data stays in your SOLID pod, while BSV provides immutable timestamping and discovery.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}