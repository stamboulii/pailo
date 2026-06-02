import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '../AdminSidebar'

export default async function AdminAuditLogsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin') redirect('/dashboard')

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('id, action, entity_type, entity_id, created_at, actor_id, store_id')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <AdminSidebar />
      <div style={{ marginTop: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, color: '#111' }}>Audit Logs</h1>

        <div style={{ background: 'white', border: '1px solid rgba(17,17,20,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa', fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid rgba(17,17,20,0.06)' }}>
                <th style={{ padding: 16, textAlign: 'left' }}>Action</th>
                <th style={{ padding: 16, textAlign: 'left' }}>Entity</th>
                <th style={{ padding: 16, textAlign: 'left' }}>Store</th>
                <th style={{ padding: 16, textAlign: 'left' }}>Actor</th>
                <th style={{ padding: 16, textAlign: 'right' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).map((log: any) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(17,17,20,0.04)' }}>
                  <td style={{ padding: 16, fontWeight: 600, fontSize: 13 }}>{log.action}</td>
                  <td style={{ padding: 16, color: '#666', fontSize: 13 }}>
                    {log.entity_type ?? '—'} / {log.entity_id?.slice(0, 8)}...
                  </td>
                  <td style={{ padding: 16, color: '#666', fontSize: 13 }}>
                    {log.store_id ? log.store_id.slice(0, 8) + '...' : '—'}
                  </td>
                  <td style={{ padding: 16, color: '#666', fontSize: 13 }}>
                    {log.actor_id ? log.actor_id.slice(0, 8) + '...' : 'system'}
                  </td>
                  <td style={{ padding: 16, textAlign: 'right', fontSize: 13, color: '#888' }}>
                    {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
