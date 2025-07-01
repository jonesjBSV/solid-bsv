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
import { handleSolidRedirect, getSolidProfile, initializePodStructure } from '@/lib/solid/auth'
import { createClient } from '@/lib/database/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Handle the SOLID OIDC redirect
    const session = await handleSolidRedirect()
    
    if (!session || !session.info.isLoggedIn || !session.info.webId) {
      return NextResponse.redirect(new URL('/login?error=solid_auth_failed', request.url))
    }
    
    // Get user profile from SOLID Pod
    const profile = await getSolidProfile(session.info.webId, session.fetch)
    
    if (!profile || !profile.podUrl) {
      return NextResponse.redirect(new URL('/login?error=solid_profile_failed', request.url))
    }
    
    // Initialize pod structure
    await initializePodStructure(profile.podUrl, session.fetch)
    
    // Store SOLID info in our database
    const supabase = await createClient()
    const { data: authUser } = await supabase.auth.getUser()
    
    if (authUser?.user) {
      // Update user profile with SOLID info
      await supabase
        .from('profiles')
        .update({
          solid_webid: profile.webId,
          solid_pod_url: profile.podUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.user.id)
    }
    
    // Store SOLID session info in a secure cookie
    const response = NextResponse.redirect(new URL('/app/solid', request.url))
    response.cookies.set('solid-session', JSON.stringify({
      webId: session.info.webId,
      isLoggedIn: true,
      podUrl: profile.podUrl,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    return response
  } catch (error) {
    console.error('SOLID callback error:', error)
    return NextResponse.redirect(new URL('/login?error=solid_callback_failed', request.url))
  }
}