import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProductsClient from './ProductsClient'

interface Product {
  id: string
  name: string
  description: string
  price: number
  emoji: string
  imageUrl: string
  stock: number
  sku: string
  is_available: boolean
}

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: store } = await supabase
    .from('stores')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!store) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: '#888', marginBottom: 16 }}>No store found. Create your store first.</p>
        <a href="/dashboard/onboarding" style={{
          background: '#2d5be3', color: 'white', padding: '10px 24px',
          borderRadius: 8, textDecoration: 'none', fontWeight: 700,
        }}>Create store →</a>
      </div>
    )
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .order('sort_order', { ascending: true })

  return <ProductsClient storeId={store.id} initialProducts={products ?? []} />
}
