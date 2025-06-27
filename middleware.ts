import authConfig from "@/lib/auth.config"
import NextAuth from "next-auth"
import { NextResponse } from "next/server"

export const config = {
	matcher: [
		// Match all app routes
		"/app/:path*",
		// Don't run on these paths
		"/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
	],
};

const { auth } = NextAuth(authConfig)

export default auth((req) => {
	console.log('Middleware called for path:', req.nextUrl.pathname)
	console.log('Auth status:', !!req.auth)

	// Define protected routes that require authentication
	const protectedRoutes = [
		'/app/profile',
		'/app/settings', 
		'/app/vault',
		'/app/context',
		'/app/sharing',
		'/app/wallet'
	]

	// Check if the current path is protected
	const isProtectedRoute = protectedRoutes.some(route => 
		req.nextUrl.pathname.startsWith(route)
	)

	console.log('Is protected route:', isProtectedRoute)

	// If it's a protected route and user is not authenticated
	if (isProtectedRoute && !req.auth) {
		console.log('Redirecting unauthenticated user to signin')
		
		// Create the signin URL with a callback to the original page
		const signInUrl = new URL("/api/auth/signin", req.url);
		signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
		
		return NextResponse.redirect(signInUrl);
	}

	// Allow main app dashboard access (non-protected routes)
	if (req.nextUrl.pathname === '/app' && !req.auth) {
		console.log('Redirecting to signin for main app access')
		return NextResponse.redirect(new URL("/api/auth/signin", req.url));
	}

	console.log('Allowing request to continue')
	return NextResponse.next();
});