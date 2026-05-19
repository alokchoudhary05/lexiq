import { NextRequest, NextResponse } from 'next/server'
import { createClient as createBrowserClient } from '@supabase/supabase-js'

// Admin client — uses service role key to bypass RLS and query auth.users directly.
// IMPORTANT: flowType must be 'implicit' here because we run server-side (Node.js).
// PKCE generates a code verifier that needs localStorage — which doesn't exist on
// the server. Without a stored verifier the recovery link always fails with otp_expired.
function createAdminClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: {
        flowType: 'implicit',   // no PKCE — verifier can't be stored server-side
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email address is required.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // ── Step 1: Check if email exists in auth.users (the ground truth) ───────
    // Using auth.admin.listUsers() with a filter is the most reliable approach.
    // profiles.email can be NULL for old accounts or Google OAuth users.
    const adminSupabase = createAdminClient()

    const { data: userList, error: adminError } =
      await adminSupabase.auth.admin.listUsers({ perPage: 1000 })

    if (adminError) {
      console.error('[forgot-password] admin.listUsers error:', adminError)
      return NextResponse.json(
        { error: 'An error occurred. Please try again later.' },
        { status: 500 }
      )
    }

    const matchedUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    )

    if (!matchedUser) {
      return NextResponse.json(
        {
          error:
            'No account found with this email address. Please check the email or create a new account.',
          code: 'EMAIL_NOT_REGISTERED',
        },
        { status: 404 }
      )
    }

    // ── Step 2: Email found — send reset link via admin client ───────────────
    // Using the admin client's resetPasswordForEmail avoids cookie/session issues
    // and works consistently on the server side.
    const origin =
      request.headers.get('origin') ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'http://localhost:3000'

    const { error: resetError } = await adminSupabase.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        // With implicit flow, Supabase puts #access_token=...&type=recovery directly
        // in the URL hash. We point straight to the reset page so the hash arrives
        // there intact — no server-side redirect that would strip the hash fragment.
        redirectTo: `${origin}/auth/reset-password`,
      }
    )

    if (resetError) {
      console.error('[forgot-password] resetPasswordForEmail error:', resetError)

      // Supabase free tier: max ~2 reset emails per hour per address
      if (
        resetError.message?.toLowerCase().includes('rate limit') ||
        (resetError as { code?: string }).code === 'over_email_send_rate_limit'
      ) {
        return NextResponse.json(
          {
            error:
              'Too many reset emails sent recently. Please wait a few minutes before trying again.',
            code: 'RATE_LIMITED',
          },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[forgot-password] Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

