import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const body = await request.json()
  const { query, session_id, domain, domain_prefix, client_memory, tone } = body

  if (!query || !session_id) {
    return new Response('Missing query or session_id', { status: 400 })
  }

  // Build Tone Instruction
  let tone_instruction = ''
  if (tone === 'simple') {
    tone_instruction = '[INSTRUCTION: Answer in very simple, easy-to-understand language. Avoid complex legal jargon. Explain like I am a layman.]\n\n'
  } else if (tone === 'professional') {
    tone_instruction = '[INSTRUCTION: Provide a highly professional, detailed, and technically precise legal analysis. Cite relevant sections, acts, and case laws where applicable.]\n\n'
  }

  // Prepend domain prefix and tone to query
  const full_query = `${tone_instruction}${domain_prefix ? domain_prefix : ''}${query}`

  // Proxy to FastAPI with streaming
  const fastapiUrl = process.env.FASTAPI_URL ?? 'http://localhost:8000'

  try {
    const upstream = await fetch(`${fastapiUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: full_query, session_id, domain, client_memory }),
    })

    if (!upstream.ok) {
      const err = await upstream.text()
      return new Response(`FastAPI error: ${err}`, { status: 502 })
    }

    // Stream the SSE response back to client
    return new Response(upstream.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    console.error('FastAPI connection error:', err)
    return new Response(
      `data: ${JSON.stringify({ type: 'error', data: 'Failed to connect to AI service. Please ensure the FastAPI service is running.' })}\n\ndata: [DONE]\n\n`,
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      }
    )
  }
}
