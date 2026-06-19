import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password']
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isAccessDeniedRoute = request.nextUrl.pathname === '/access-denied'

  // Unauthenticated: redirect to login
  if (!user && !isAuthRoute && !isAccessDeniedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated on auth route: detect loop via Referer header.
  // If the request came from within the app (a dashboard page), pass through
  // instead of rewriting. This breaks any client-side redirect loop.
  if (user && authRoutes.some(route => request.nextUrl.pathname === route)) {
    const referer = request.headers.get('referer') || ''
    const isInternalReferer = referer && new URL(referer).origin === request.nextUrl.origin
    
    if (isInternalReferer && !referer.includes('/login') && !referer.includes('/signup')) {
      // Loop detected: let the auth page render to break the cycle
      return NextResponse.next()
    }
    // Normal case: rewrite to serve dashboard content at auth URL
    return NextResponse.rewrite(new URL('/', request.url))
  }

  // Owner-only routes
  const ownerOnlyRoutes = ['/inventory', '/financial', '/staff']
  const isOwnerOnlyRoute = ownerOnlyRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  if (user && isOwnerOnlyRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (profile?.role !== 'owner') {
      return NextResponse.redirect(new URL('/access-denied', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}