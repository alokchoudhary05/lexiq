import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')   // 'recovery' when coming from a password-reset email

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // For password-reset flows, send the user to the reset-password page.
  // For everything else (OAuth, email confirmation) send them to /chat.
  if (type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/reset-password`)
  }

  return NextResponse.redirect(`${origin}/chat`)
}
