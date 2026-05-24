import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AIFeed from './AIFeed'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch user's store (RLS ensures they only see their own)
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  // No store yet — show onboarding
  if (!store) return <OnboardingCTA />

  // Fetch last 10 orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Compute today's revenue
  const today = new Date().toDateString()
  const todayRevenue = (orders ?? [])
    .filter(o => new Date(o.created_at).toDateString() === today)
    .reduce((sum, o) => sum + parseFloat(o.total), 0)

  const pending = (orders ?? []).filter(o => o.status === 'pending').length
  const firstName = user!.email!.split('@')[0]

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
        Good morning, {firstName} 👋
      </h1>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 28 }}>
        Here's how {store.name} is doing today
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Revenue today" value={`${todayRevenue.toFixed(0)} TND`} />
        <StatCard label="Orders" value={String(orders?.length ?? 0)}
          sub={`${pending} pending`} />
        <StatCard label="Store" value={store.subdomain + '.pailo.io'} />
        <StatCard label="Status" value={store.published_at ? 'Live ✓' : 'Draft'}
          accent={!!store.published_at} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <OrdersList orders={orders ?? []} />
        <AIFeed storeId={store.id} orders={orders ?? []} />
      </div>

      <Link href="/dashboard/builder" style={{
        display: 'inline-block', marginTop: 24,
        background: '#2d5be3', color: 'white', padding: '12px 28px',
        borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14
      }}>Open store builder →</Link>
    </div>
  )
}

// Simple stat card component
function StatCard({ label, value, sub, accent }: any) {
  return (
    <div style={{ background: 'white', border: '1px solid rgba(17,17,20,0.08)',
                  borderRadius: 10, padding: 16 }}>
      <div style={{ fontSize: 10, color: '#888', fontFamily: 'monospace',
                    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800,
                    color: accent ? '#18b96a' : '#111' }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// Orders list component
function OrdersList({ orders }: { orders: any[] }) {
  const statusColor: Record<string, string> = {
    pending:   '#e8601a',
    confirmed: '#18b96a',
    shipped:   '#2d5be3',
    delivered: '#888',
  }
  return (
    <div style={{ background: 'white', border: '1px solid rgba(17,17,20,0.08)',
                  borderRadius: 10, padding: 16 }}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
        Recent orders
      </div>
      {orders.length === 0 && (
        <p style={{ fontSize: 12, color: '#888' }}>No orders yet — share your store link!</p>
      )}
      {orders.map(order => (
        <div key={order.id} style={{ display: 'flex', alignItems: 'center',
                                     gap: 8, padding: '7px 0',
                                     borderBottom: '1px solid rgba(17,17,20,0.06)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%',
                        background: statusColor[order.status] ?? '#888',
                        flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 12, fontWeight: 700 }}>
            {order.customer_name ?? 'Customer'}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>{order.total} TND</div>
          <div style={{ fontSize: 9, padding: '2px 7px', borderRadius: 3,
                        fontFamily: 'monospace', letterSpacing: 0.5,
                        background: `${statusColor[order.status] ?? '#888'}18`,
                        color: statusColor[order.status] ?? '#888' }}>
            {order.status}
          </div>
        </div>
      ))}
    </div>
  )
}

// Onboarding banner for users with no store yet
function OnboardingCTA() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 40px' }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
        Welcome to Pailo!
      </h2>
      <p style={{ color: '#888', marginBottom: 32, fontSize: 15 }}>
        Describe your business in one sentence — the AI builds your store.
      </p>
      <Link href="/dashboard/onboarding" style={{
        background: '#2d5be3', color: 'white', padding: '14px 36px',
        borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 15
      }}>Create my store →</Link>
    </div>
  )
}