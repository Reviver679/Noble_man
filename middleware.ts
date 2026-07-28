import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifySessionToken } from '@/lib/admin/session';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await verifySessionToken(req.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname === '/admin/login') {
    if (authed) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  if (!authed) {
    const login = new URL('/admin/login', req.url);
    // Preserve where they were heading so login can bounce them back.
    if (pathname !== '/admin') login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  // Only page routes; /api/admin/* guards itself so it can return 401 JSON
  // instead of a redirect.
  matcher: ['/admin', '/admin/:path*'],
};
