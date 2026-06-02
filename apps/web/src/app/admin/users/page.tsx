import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '../AdminSidebar'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/dashboard')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, is_active, created_at')
    .order('created_at', { ascending: false })

  const { data: authUsers } = await supabase.auth.admin.listUsers()

  const usersWithEmail = (profiles ?? []).map((p) => {
    const authUser = (authUsers?.users ?? []).find((u) => u.id === p.id)
    return {
      ...p,
      email: authUser?.email ?? 'unknown',
    }
  })

  return (
    <div>
      <AdminSidebar />
      <div style={{ marginTop: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, color: '#111' }}>Users</h1>

        <div style={{ background: 'white', border: '1px solid rgba(17,17,20,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa', fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid rgba(17,17,20,0.06)' }}>
                <th style={{ padding: 16, textAlign: 'left' }}>Name</th>
                <th style={{ padding: 16, textAlign: 'left' }}>Email</th>
                <th style={{ padding: 16, textAlign: 'left' }}>Role</th>
                <th style={{ padding: 16, textAlign: 'left' }}>Status</th>
                <th style={{ padding: 16, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersWithEmail.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(17,17,20,0.04)' }}>
                  <td style={{ padding: 16, fontWeight: 600 }}>{user.full_name ?? '—'}</td>
                  <td style={{ padding: 16, color: '#666', fontSize: 13 }}>{user.email}</td>
                  <td style={{ padding: 16 }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background: user.role === 'super_admin' ? '#2d5be312' : '#88812',
                      color: user.role === 'super_admin' ? '#2d5be3' : '#888',
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: 16 }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background: user.is_active ? '#18b96a12' : '#e8601a12',
                      color: user.is_active ? '#18b96a' : '#e8601a',
                    }}>
                      {user.is_active ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td style={{ padding: 16, textAlign: 'right' }}>
                    <form action={`/api/admin/users/${user.id}/role`} method="POST">
                      <button
                        type="submit"
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: 'none',
                          background: user.role === 'super_admin' ? '#888' : '#2d5be3',
                          color: 'white',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {user.role === 'super_admin' ? 'Demote' : 'Make Admin'}
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
