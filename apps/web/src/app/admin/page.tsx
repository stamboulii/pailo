import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from './AdminSidebar'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') {
    redirect('/dashboard')
  }

  const { count: storesCount } = await supabase
    .from('stores')
    .select('*', { count: 'exact', head: true })

  const { count: ordersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  return (
    <div>
      <AdminSidebar />
      <div style={{ marginTop: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, color: '#111' }}>Admin Dashboard</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
          <StatCard label="Stores" value={storesCount ?? 0} color="#2d5be3" />
          <StatCard label="Orders" value={ordersCount ?? 0} color="#18b96a" />
          <StatCard label="Users" value={usersCount ?? 0} color="#e8601a" />
        </div>

        <div style={{ background: 'white', border: '1px solid rgba(17,17,20,0.06)', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: 12 }}>
            <a
              href="/admin/stores"
              style={{
                padding: '10px 20px',
                background: '#111',
                color: 'white',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Manage Stores
            </a>
            <a
              href="/admin/users"
              style={{
                padding: '10px 20px',
                background: '#111',
                color: 'white',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Manage Users
            </a>
            <a
              href="/admin/audit-logs"
              style={{
                padding: '10px 20px',
                background: '#111',
                color: 'white',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Audit Logs
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'white', border: '1px solid rgba(17,17,20,0.06)', borderRadius: 16, padding: 24 }}>
      <p style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 800, color }}>{value}</p>
    </div>
  )
}
