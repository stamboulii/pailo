import { createClient } from '@/lib/supabase/server'

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
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#111', letterSpacing: -0.5 }}>
          Orders
        </h1>
        <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
          {orders?.length ?? 0} total orders
        </p>
      </div>

      {!orders || orders.length === 0 ? (
        <EmptyState />
      ) : (
        <OrdersTable orders={orders} statusColor={statusColor} />
      )}
    </div>
  )
}

function OrdersTable({ orders, statusColor }: { orders: any[], statusColor: Record<string, string> }) {
  return (
    <div style={{ 
      background: 'white', 
      border: '1px solid rgba(17,17,20,0.06)',
      borderRadius: 16, overflow: 'hidden'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ 
            background: '#fafafa', 
            fontSize: 11, 
            color: '#888',
            textTransform: 'uppercase', 
            letterSpacing: 0.5,
            borderBottom: '1px solid rgba(17,17,20,0.06)'
          }}>
            <th style={{ padding: 16, textAlign: 'left', fontWeight: 600 }}>Customer</th>
            <th style={{ padding: 16, textAlign: 'left', fontWeight: 600 }}>Status</th>
            <th style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>Total</th>
            <th style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} style={{ borderBottom: '1px solid rgba(17,17,20,0.04)' }}>
              <td style={{ padding: 16, fontWeight: 600, fontSize: 14, color: '#111' }}>
                {order.customer_name || '—'}
              </td>
              <td style={{ padding: 16 }}>
                <span style={{ 
                  fontSize: 10, 
                  padding: '4px 10px', 
                  borderRadius: 6,
                  fontWeight: 600, 
                  letterSpacing: 0.5,
                  background: `${statusColor[order.status] ?? '#888'}12`,
                  color: statusColor[order.status] ?? '#888'
                }}>
                  {order.status}
                </span>
              </td>
              <td style={{ padding: 16, fontWeight: 700, fontSize: 14, color: '#111', textAlign: 'right' }}>
                {order.total} TND
              </td>
              <td style={{ padding: 16, fontSize: 12, color: '#888', textAlign: 'right' }}>
                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ 
      background: 'white', 
      border: '1px solid rgba(17,17,20,0.06)',
      borderRadius: 16, padding: 60, textAlign: 'center',
      maxWidth: 400, margin: '0 auto'
    }}>
      <div style={{ 
        width: 72, height: 72, borderRadius: 16, background: '#f8f5ef',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', fontSize: 32
      }}>
        📭
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#111' }}>
        No orders yet
      </h3>
      <p style={{ color: '#888', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
        Share your store link to receive orders
      </p>
    </div>
  )
}