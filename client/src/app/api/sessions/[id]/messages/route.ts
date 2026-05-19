import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET — messages for a session
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', params.id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST — save a message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { role, content, metadata } = await request.json()

  const { data, error } = await supabase
    .from('messages')
    .insert({
      session_id: params.id,
      user_id: user.id,
      role,
      content,
      metadata: metadata ?? {},
    })
    .select()
    .single()

  // Update session updated_at
  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
