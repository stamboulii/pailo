import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AIFeed from './AIFeed'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  if (!store) return <OnboardingCTA />

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const today = new Date().toDateString()
  const todayRevenue = (orders ?? [])
    .filter(o => new Date(o.created_at).toDateString() === today)
    .reduce((sum, o) => sum + parseFloat(o.total), 0)

  const pending = (orders ?? []).filter(o => o.status === 'pending').length
  const firstName = user!.email!.split('@')[0]

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#111', letterSpacing: -0.5 }}>
          Good morning, {firstName}
        </h1>
        <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
          {store.name} dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Revenue today" value={`${todayRevenue.toFixed(0)} TND`} icon="💰" />
        <StatCard label="Orders" value={String(orders?.length ?? 0)} sub={`${pending} pending`} icon="📦" />
        <StatCard label="Store" value={`${store.subdomain}.pailo.io`} icon="🔗" />
        <StatCard 
          label="Status" 
          value={store.published_at ? 'Live' : 'Draft'} 
          icon={store.published_at ? '✓' : '○'}
          accent={!!store.published_at} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <OrdersCard orders={orders ?? []} />
        <AIFeed storeId={store.id} orders={orders ?? []} />
      </div>

      <div style={{ marginTop: 32, display: 'flex', gap: 12 }}>
        <Link href="/dashboard/builder" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#2d5be3', color: 'white', padding: '12px 24px',
          borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 14
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          Open store builder
        </Link>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon, accent }: any) {
  return (
    <div style={{ 
      background: 'white', 
      border: '1px solid rgba(17,17,20,0.06)',
      borderRadius: 12, 
      padding: 20,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ 
        position: 'absolute', top: -8, right: -8, fontSize: 32, opacity: 0.05 
      }}>{icon}</div>
      <div style={{ 
        fontSize: 11, color: '#888', fontWeight: 600, 
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: 24, fontWeight: 700,
        color: accent ? '#18b96a' : '#111' 
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function OrdersCard({ orders }: { orders: any[] }) {
  const statusColor: Record<string, string> = {
    pending:   '#e8601a',
    confirmed: '#18b96a',
    shipped:   '#2d5be3',
    delivered: '#888',
  }
  
  return (
    <div style={{ 
      background: 'white', 
      border: '1px solid rgba(17,17,20,0.06)',
      borderRadius: 12, 
      padding: 20
    }}>
      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(17,17,20,0.06)'
      }}>
        <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0, color: '#111' }}>
          Recent orders
        </h3>
        <span style={{ fontSize: 11, color: '#888', background: '#f8f5ef', padding: '2px 8px', borderRadius: 4 }}>
          {orders.length} total
        </span>
      </div>
      
      {orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
            No orders yet — share your store
          </p>
        </div>
      )}
      
      {orders.map(order => (
        <div key={order.id} style={{ 
          display: 'flex', alignItems: 'center', gap: 12, 
          padding: '10px 0',
          borderBottom: '1px solid rgba(17,17,20,0.04)'
        }}>
          <div style={{ 
            width: 8, height: 8, borderRadius: '50%',
            background: statusColor[order.status] ?? '#888',
            flexShrink: 0
          }} />
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#111' }}>
            {order.customer_name ?? 'Customer'}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111', width: 60, textAlign: 'right' }}>
            {order.total} TND
          </div>
          <span style={{ 
            fontSize: 10, padding: '3px 8px', borderRadius: 4,
            fontWeight: 600, letterSpacing: 0.5,
            background: `${statusColor[order.status] ?? '#888'}12`,
            color: statusColor[order.status] ?? '#888'
          }}>
            {order.status}
          </span>
        </div>
      ))}
    </div>
  )
}

function OnboardingCTA() {
  return (
    <div style={{ 
      textAlign: 'center', padding: '80px 40px',
      background: 'white', borderRadius: 16, border: '1px solid rgba(17,17,20,0.06)',
      maxWidth: 480, margin: '0 auto'
    }}>
      <div style={{ 
        width: 64, height: 64, borderRadius: 16, background: '#2d5be3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', fontSize: 28
      }}>
        🚀
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#111' }}>
        Welcome to Pailo
      </h2>
      <p style={{ color: '#888', marginBottom: 28, fontSize: 15 }}>
        Describe your business in one sentence — the AI builds your store
      </p>
      <Link href="/dashboard/onboarding" style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: '#2d5be3', color: 'white', padding: '12px 28px',
        borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 14
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Create my store
      </Link>
    </div>
  )
}