import { NextRequest, NextResponse } from 'next/server'
import { generateStoreFromDescription } from '@pailo/ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Handle Bearer token from Authorization header (for API clients like Postman)
  const authHeader = req.headers.get('Authorization')
  let token: string | undefined
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '')
  }

  const supabase = await createClient(token)

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { description } = await req.json()
  const storeData = await generateStoreFromDescription(description)

  // Save to database
  const { data, error } = await supabase
    .from('stores')
    .insert({
      user_id:     user.id,
      name:        storeData.name,
      subdomain:   storeData.name.toLowerCase().replace(/\s+/g, '-'),
      config_json: storeData
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
