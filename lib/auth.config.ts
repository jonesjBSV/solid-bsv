import NextAuth, { NextAuthConfig } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { SupabaseAdapter } from "@auth/supabase-adapter"

// Extend the Session type to include supabaseAccessToken
declare module 'next-auth' {
	interface Session {
		supabaseAccessToken?: string
	}
}

const authConfig = {
	secret: process.env.AUTH_SECRET,
	trustHost: true,
	providers: [
		GoogleProvider({
			allowDangerousEmailAccountLinking: true,
			clientId: process.env.AUTH_GOOGLE_ID!,
			clientSecret: process.env.AUTH_GOOGLE_SECRET!,
		}),
	],
	// Temporarily disable adapter to test basic OAuth flow
	// adapter: SupabaseAdapter({
	// 	url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
	// 	secret: process.env.SUPABASE_SECRET_KEY!,
	// }),
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async jwt({ token, account, profile }) {
			// Save the user info to the token on first sign in
			if (account && profile) {
				token.id = profile.sub || account.providerAccountId
				token.email = profile.email
				token.name = profile.name
				token.picture = profile.picture
			}
			return token
		},
		async session({ session, token }) {
			// Send properties to the client
			if (token) {
				session.user.id = token.id as string
				session.user.email = token.email as string
				session.user.name = token.name as string
				session.user.image = token.picture as string
			}
			return session
		},
	},
} satisfies NextAuthConfig

const handler = NextAuth(authConfig)

export const { auth, signIn, signOut, handlers } = handler
export const { GET, POST } = handlers

export default authConfig