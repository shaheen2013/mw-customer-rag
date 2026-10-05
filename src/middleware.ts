import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, internal Next.js paths, and public api routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Identify public and auth routes
  const isLandingPage = pathname === '/';
  const isLoginPage = pathname === '/login';
  const isRegisterPage = pathname === '/register';
  const isAdminLoginPage = pathname === '/admin/login';

  const token = request.cookies.get('mw_token')?.value;
  const role = request.cookies.get('mw_role')?.value;

  const isAdmin = role === 'super_admin' || role === 'platform_admin';
  const isAuthenticated = Boolean(token);

  // 3. Admin Routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (isAdminLoginPage) {
      if (isAuthenticated && isAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // Protected Admin routes: must have valid token and admin role
    if (!isAuthenticated || !isAdmin) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 4. Public Tenant Auth Routes (/login, /register)
  if (isLoginPage || isRegisterPage) {
    if (isAuthenticated) {
      const target = isAdmin ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // 5. Public Landing Page (/)
  if (isLandingPage) {
    return NextResponse.next();
  }

  // 6. Protected Tenant Routes (/dashboard, /knowledge-base, /assistant, /conversations, etc.)
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

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
