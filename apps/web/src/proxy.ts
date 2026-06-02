import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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
        get(name: string) {
          return request.cookies.get(name)?.value ?? null
        },
        set(name: string, value: string, options: object) {
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: object) {
          response.cookies.delete(name)
        },
      },
    }
  )

  // Always use getUser() — verifies the token server-side
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Skip role-based redirection for API routes
  if (pathname.startsWith('/api')) {
    return response
  }

  // If user is logged in, check their role for admin redirection
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'super_admin'
    const isAdminPath = pathname.startsWith('/admin')

    // Redirect super_admin users to admin dashboard if they're not already in an admin path
    if (isAdmin && !isAdminPath) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Redirect non-admin users away from admin paths
    if (!isAdmin && isAdminPath) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  const PROTECTED = ['/dashboard', '/editor']
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))

  const isAuthRoute = pathname.startsWith('/login')

  // Not logged in → redirect to login, preserve destination
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // Already logged in → skip login page
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
