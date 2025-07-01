/**
 * > **⚠️ BSV SPV ARCHITECTURE REQUIREMENTS**
 * > 
 * > This implementation strictly follows BSV SPV (Simplified Payment Verification) architecture:
 * > - **NO HD Wallets or key management** - Users bring existing BRC-100 wallets
 * > - **ProtoWallet for app operations** - App manages internal transactions only
 * > - **WalletClient for user interactions** - Users sign with their own wallets
 * > - **BSV SPV verification** - Use merkle proofs, not full blockchain validation
 * > - **BSV overlay integration** - Publish to overlay topics, not P2P networks
 * > - See `BSV_SPV_ARCHITECTURE_REQUIREMENTS.md` for complete guidelines
 */

import { NextRequest, NextResponse } from 'next/server'
import { loginToSolid } from '@/lib/solid/auth'

export async function POST(request: NextRequest) {
  try {
    const { oidcIssuer } = await request.json()
    
    // This will redirect the user to the SOLID OIDC provider
    await loginToSolid(oidcIssuer)
    
    return NextResponse.json({ 
      success: true,
      message: 'Redirecting to SOLID login...'
    })
  } catch (error) {
    console.error('SOLID login error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate SOLID login' },
      { status: 500 }
    )
  }
}