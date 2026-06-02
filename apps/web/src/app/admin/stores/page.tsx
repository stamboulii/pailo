import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '../AdminSidebar'

export default async function AdminStoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/dashboard')

  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, subdomain, published_at, is_active, created_at, user_id')
    .order('created_at', { ascending: false })

  return (
    <div>
      <AdminSidebar />
      <div style={{ marginTop: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, color: '#111' }}>Stores</h1>

        <div style={{ background: 'white', border: '1px solid rgba(17,17,20,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa', fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid rgba(17,17,20,0.06)' }}>
                <th style={{ padding: 16, textAlign: 'left' }}>Name</th>
                <th style={{ padding: 16, textAlign: 'left' }}>Subdomain</th>
                <th style={{ padding: 16, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 16, textAlign: 'left' }}>Owner</th>
                <th style={{ padding: 16, textAlign: 'right' }}>Created</th>
                <th style={{ padding: 16, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(stores ?? []).map((store) => (
                <tr key={store.id} style={{ borderBottom: '1px solid rgba(17,17,20,0.04)' }}>
                  <td style={{ padding: 16, fontWeight: 600 }}>{store.name}</td>
                  <td style={{ padding: 16, color: '#666' }}>{store.subdomain}</td>
                  <td style={{ padding: 16 }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background: store.published_at ? '#18b96a12' : '#e8601a12',
                      color: store.published_at ? '#18b96a' : '#e8601a',
                    }}>
                      {store.published_at ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding: 16, color: '#666', fontSize: 13 }}>{store.user_id.slice(0, 8)}...</td>
                  <td style={{ padding: 16, textAlign: 'right', fontSize: 13, color: '#888' }}>
                    {new Date(store.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td style={{ padding: 16, textAlign: 'right' }}>
                    <form action={`/api/admin/stores/${store.id}/toggle`} method="POST">
                      <button
                        type="submit"
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: 'none',
                          background: store.is_active ? '#e8601a' : '#18b96a',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {store.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
