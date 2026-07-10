import { NextResponse } from 'next/server';
import { isAdmin } from './lib/auth';

// Middleware to protect admin routes
export function middleware(request) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // For client-side, we can't access localStorage in middleware
    // So we'll allow the request to proceed and handle authentication client-side
    // But we can still do a basic check if needed
    
    // For now, we'll just allow it through and handle auth in the layout
    if (typeof window !== 'undefined') {
      // Client-side check would happen in the component
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/admin/:path*',
  ],
};