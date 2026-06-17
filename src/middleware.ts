import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for static files and API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  console.log('[Middleware]', {
    path: request.nextUrl.pathname,
    hasUser: !!user,
    userId: user?.id,
    error: error?.message,
    cookies: request.cookies.getAll().map(c => c.name)
  })

  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password']
  const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname.startsWith(route)) || 
                      request.nextUrl.pathname.startsWith('/auth')
  const isAccessDeniedRoute = request.nextUrl.pathname === '/access-denied'

  // Redirect unauthenticated users to login (except if already on auth routes or access denied)
  if (!user && !isAuthRoute && !isAccessDeniedRoute) {
    console.log('[Middleware] Redirecting to /login - no user')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (user && authRoutes.some(route => request.nextUrl.pathname === route)) {
    console.log('[Middleware] Redirecting to / - user already logged in')
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Owner-only routes - check authorization
  const ownerOnlyRoutes = ['/inventory', '/financial']
  const isOwnerOnlyRoute = ownerOnlyRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (user && isOwnerOnlyRoute) {
    // Fetch user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    console.log('[Middleware] Role check:', {
      path: request.nextUrl.pathname,
      role: profile?.role,
      isOwnerOnly: isOwnerOnlyRoute
    })

    // Redirect non-owners to access denied page
    if (profile?.role !== 'owner') {
      console.log('[Middleware] Redirecting to /access-denied - not an owner')
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