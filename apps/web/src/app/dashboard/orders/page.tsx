import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', user!.id)
    .single()

  if (!store) return null

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })

  const statusColor: Record<string, string> = {
    pending: '#e8601a',
    confirmed: '#18b96a',
    shipped: '#2d5be3',
    delivered: '#888'
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Orders</h1>

      {!orders || orders.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid rgba(17,17,20,0.08)',
                     borderRadius: 10, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No orders yet</h3>
          <p style={{ color: '#888', fontSize: 13, margin: 0 }}>
            Share your store link to start receiving orders
          </p>
        </div>
      ) : (
        <div style={{ background: 'white', border: '1px solid rgba(17,17,20,0.08)',
                     borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f5ef', fontSize: 12, color: '#888',
                            textTransform: 'uppercase', letterSpacing: 0.5 }}>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600 }}>Status</th>
                <th style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>Total</th>
                <th style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderTop: '1px solid rgba(17,17,20,0.06)' }}>
                  <td style={{ padding: 16, fontWeight: 700, fontSize: 14 }}>
                    {order.customer_name || '—'}
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4,
                                   fontFamily: 'monospace', letterSpacing: 0.5,
                                   background: `${statusColor[order.status] ?? '#888'}18`,
                                   color: statusColor[order.status] ?? '#888' }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: 16, fontWeight: 700, fontSize: 14 }}>
                    {order.total} TND
                  </td>
                  <td style={{ padding: 16, fontSize: 12, color: '#888', textAlign: 'right' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}