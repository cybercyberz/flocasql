import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle trailing slashes for API routes
  if (pathname.startsWith('/api/')) {
    const withoutTrailingSlash = pathname.replace(/\/$/, '');
    if (pathname !== withoutTrailingSlash) {
      return NextResponse.redirect(
        new URL(withoutTrailingSlash, request.url),
        { status: 308 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};
