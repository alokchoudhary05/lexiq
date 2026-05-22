import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET — fetch current user profile
export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('memory_data, memory_signature')
      .eq('id', user.id)
      .maybeSingle()

    const memory_data = userProfile?.memory_data ?? ''
    const memory_signature = userProfile?.memory_signature ?? ''

    if (profile) {
      return NextResponse.json({
        id: profile.id,
        email: profile.email ?? user.email,
        full_name: profile.full_name ?? user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User',
        role: profile.role ?? 'citizen',
        avatar_url: profile.avatar_url ?? null,
        username: user.user_metadata?.username ?? '',
        memory_data,
        memory_signature,
      })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email ?? '',
      full_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User',
      role: user.user_metadata?.role ?? 'citizen',
      avatar_url: user.user_metadata?.avatar_url ?? null,
      username: user.user_metadata?.username ?? '',
      memory_data,
      memory_signature,
    })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// PATCH — update display name and username
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { full_name, username } = body

    // Update profiles table
    if (full_name !== undefined) {
      await supabase
        .from('profiles')
        .update({ full_name: full_name.trim() })
        .eq('id', user.id)
    }

    // Update username in user_metadata
    if (username !== undefined) {
      await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          username: username.trim(),
          ...(full_name !== undefined ? { full_name: full_name.trim() } : {}),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// DELETE — delete all user data (profile, sessions, messages)
export async function DELETE() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Delete sessions (messages cascade automatically)
    await supabase.from('chat_sessions').delete().eq('user_id', user.id)

    // Delete profile row
    await supabase.from('profiles').delete().eq('id', user.id)

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
