import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 })
  }

  const storagePath = `${user.id}/${Date.now()}_${file.name}`

  // Upload to Supabase Storage
  const { error: storageError } = await supabase.storage
    .from('user-uploads')
    .upload(storagePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 500 })
  }

  // Save metadata to uploaded_files table
  const { data, error: dbError } = await supabase
    .from('uploaded_files')
    .insert({
      user_id: user.id,
      filename: file.name,
      storage_path: storagePath,
      file_size: file.size,
      file_type: 'application/pdf',
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, file: data })
}
