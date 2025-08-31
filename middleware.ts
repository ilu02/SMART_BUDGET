import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/signup'];
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Get the auth token from cookies or headers
  const authToken = request.cookies.get('authToken')?.value;

  // If it's a public route, allow access
  if (isPublicRoute) {
    // If user is already authenticated and trying to access login, redirect to dashboard
    if (authToken && (pathname === '/auth/login' || pathname === '/auth/signup')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // For protected routes, check authentication
  if (!authToken) {
    // Redirect to login if not authenticated
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Allow access to protected routes if authenticated
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};