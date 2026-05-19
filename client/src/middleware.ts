import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Protect /chat and /explore — redirect unauthenticated to /auth
  if (!user && (pathname.startsWith('/chat') || pathname.startsWith('/explore'))) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Redirect logged-in users away from auth page (but NOT away from reset-password)
  if (user && pathname === '/auth') {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  // Allow unauthenticated access to the reset-password page
  // (user arrives here via a Supabase recovery email link)
  if (pathname.startsWith('/auth/reset-password')) {
    return response
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
