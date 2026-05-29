import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  if (!store) return null

  const products = store.config_json?.canvas ? extractProducts(store.config_json.canvas) : []

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Products</h1>
        <Link href="/dashboard/builder" style={{
          background: '#2d5be3', color: 'white', padding: '8px 20px',
          borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 13
        }}>Edit in builder →</Link>
      </div>

      {products.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid rgba(17,17,20,0.08)',
                     borderRadius: 10, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No products yet</h3>
          <p style={{ color: '#888', fontSize: 13, margin: 0 }}>
            Add products from the store builder
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {products.map((p: any, i: number) => (
            <div key={i} style={{ background: 'white', border: '1px solid rgba(17,17,20,0.08)',
                                   borderRadius: 10, padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{p.emoji || '📦'}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
              <div style={{ color: '#888', fontSize: 12 }}>{p.price} TND</div>
              {p.desc && (
                <div style={{ color: '#666', fontSize: 11, marginTop: 8, lineHeight: 1.4 }}>
                  {p.desc}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function extractProducts(canvasStr: string) {
  try {
    const canvas = typeof canvasStr === 'string' ? JSON.parse(canvasStr) : canvasStr
    const productsNode = Object.values(canvas as object).find(
      (n: any) => n?.type?.resolvedName?.includes('Products')
    )
    return productsNode?.props?.products ?? []
  } catch {
    return []
  }
}