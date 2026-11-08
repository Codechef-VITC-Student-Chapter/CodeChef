import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifySessionCookieValue } from '@/lib/adminSession';
import { verifyAdminJwt } from '@/lib/jwt';
import { logProxyRequest } from '@/lib/logger';

export async function proxy(request: NextRequest) {
  const start = Date.now();
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const method = request.method;
  const referer = request.headers.get('referer') || '';

  // 1. Check if this is a request from or for the Flappy Chef game
  const isAssets = pathname.startsWith('/assets/');
  const isClient = pathname.startsWith('/Client/');
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(pathname);
  const isNextInternal = pathname.startsWith('/_next/') || pathname.startsWith('/api/');

  if (
    isAssets ||
    isClient ||
    (hasExtension &&
      !isNextInternal &&
      (referer.includes('proxy-flappy') || referer.includes('flappy-chef')))
  ) {
    const targetUrl = new URL(pathname + url.search, 'https://flappychef.poseidon0z.com');
    try {
      const response = await fetch(targetUrl.toString(), {
        headers: {
          'User-Agent': request.headers.get('user-agent') || '',
        },
      });

      const duration = Date.now() - start;
      if (response.ok) {
        logProxyRequest(method, pathname, `Flappy Chef Proxy -> ${targetUrl.hostname}`, 200, duration);
        const contentType = response.headers.get('content-type') || '';
        const body = await response.arrayBuffer();
        return new NextResponse(body, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
      logProxyRequest(method, pathname, 'Flappy Chef Proxy Upstream Error', response.status, duration);
    } catch (e) {
      const duration = Date.now() - start;
      logProxyRequest(method, pathname, 'Flappy Chef Proxy Failed', 502, duration);
      console.error('[PROXY] Flappy Chef Proxy error:', e);
    }
    return NextResponse.next();
  }

  // 2. Allow login and logout endpoints through
  if (
    pathname === '/admin/login' ||
    pathname === '/api/admin/login' ||
    pathname === '/api/admin/logout'
  ) {
    // If user is already logged in and visiting /admin/login, redirect to /admin/recruitment
    if (pathname === '/admin/login') {
      const token = request.cookies.get('admin_jwt')?.value;
      const legacyCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

      let loggedIn = false;
      if (token) {
        const payload = await verifyAdminJwt(token);
        if (payload) loggedIn = true;
      }
      if (!loggedIn && legacyCookie) {
        const legacySession = await verifySessionCookieValue(legacyCookie);
        if (legacySession) loggedIn = true;
      }

      if (loggedIn) {
        const duration = Date.now() - start;
        logProxyRequest(method, pathname, 'Redirect -> /admin/recruitment (Already Authenticated)', 307, duration);
        return NextResponse.redirect(new URL('/admin/recruitment', request.url));
      }
    }

    const duration = Date.now() - start;
    logProxyRequest(method, pathname, 'Public Auth Route', 200, duration);
    return NextResponse.next();
  }

  // 3. Protect Admin Page and API routes
  const isProtectedAdminPage = pathname.startsWith('/admin');
  const isProtectedAdminApi = pathname.startsWith('/api/admin');

  if (isProtectedAdminPage || isProtectedAdminApi) {
    const token = request.cookies.get('admin_jwt')?.value;
    const legacyCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    let payload = token ? await verifyAdminJwt(token) : null;
    let role = payload?.role;

    // Fallback support for legacy HMAC session cookie
    if (!payload && legacyCookie) {
      const legacySession = await verifySessionCookieValue(legacyCookie);
      if (legacySession) {
        payload = {
          id: 'legacy',
          email: legacySession.email,
          role: 'super_admin',
          department: null,
        };
        role = 'super_admin';
      }
    }

    if (!payload) {
      const duration = Date.now() - start;
      if (isProtectedAdminApi) {
        logProxyRequest(method, pathname, 'Unauthorized API Block', 401, duration);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      logProxyRequest(method, pathname, 'Redirect -> /admin/login (Unauthenticated)', 307, duration);
      const loginUrl = new URL('/admin/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      if (token) response.cookies.delete('admin_jwt');
      if (legacyCookie) response.cookies.delete(ADMIN_SESSION_COOKIE);
      return response;
    }

    // Role-based access control:
    // /admin (Members & Leaderboard) requires super_admin
    // Department admins are restricted to /admin/recruitment
    if (role !== 'super_admin') {
      if (pathname === '/admin' || pathname === '/admin/') {
        const duration = Date.now() - start;
        logProxyRequest(method, pathname, 'Redirect -> /admin/recruitment (Dept Admin)', 307, duration);
        return NextResponse.redirect(new URL('/admin/recruitment', request.url));
      }

      if (
        pathname.startsWith('/api/admin/members') ||
        pathname.startsWith('/api/admin/leaderboard')
      ) {
        const duration = Date.now() - start;
        logProxyRequest(method, pathname, 'Forbidden API Block (Super Admin required)', 403, duration);
        return NextResponse.json(
          { error: 'Forbidden: Super Admin access required' },
          { status: 403 }
        );
      }
    }

    const duration = Date.now() - start;
    logProxyRequest(method, pathname, `Admin Authorized (${role || 'admin'})`, 200, duration);
    return NextResponse.next();
  }

  // 4. Standard Next.js route passing through proxy
  const duration = Date.now() - start;
  logProxyRequest(method, pathname, 'Route Handler', 200, duration);
  return NextResponse.next();
}

export const config = {
  // Match all paths except internal Next.js paths and static assets
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export default proxy;
