import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Soft gate: cookie set by AuthProvider. API still enforces real auth.
  const token = request.cookies.get('nk_token')?.value;
  const role = request.cookies.get('nk_role')?.value;

  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const login = new URL('/login', request.url);
      login.searchParams.set('next', pathname);
      return NextResponse.redirect(login);
    }
    if (pathname.startsWith('/dashboard/admin') && role !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (role === 'viewer') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
