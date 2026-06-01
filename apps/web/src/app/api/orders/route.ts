import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!store) {
    return NextResponse.json(
      { error: 'Store not found for this user' },
      { status: 404 }
    )
  }

  let payload: any
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const items = Array.isArray(payload?.items) ? payload.items : []
  const total =
    typeof payload?.total === 'number' ? payload.total : Number(payload?.total || 0)

  if (!items.length) {
    return NextResponse.json(
      { error: 'Cart is empty' },
      { status: 400 }
    )
  }

  const { error } = await supabase.from('orders').insert({
    store_id: store.id,
    customer_name: String(payload?.customerName ?? ''),
    customer_phone: String(payload?.customerPhone ?? ''),
    customer_email: '',
    items_json: items,
    total,
    status: 'pending',
    payment_method: 'cod',
  })

  if (error) {
    return NextResponse.json(
      { error: error.message ?? 'Failed to create order' },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
