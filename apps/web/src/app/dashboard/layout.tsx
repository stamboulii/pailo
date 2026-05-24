import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopbarNav from './TopbarNav'

export default async function DashboardLayout({
  children
}: { children: React.ReactNode }) {

  // Server-side session — Supabase SSR reads the cookie automatically
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Middleware already handles this — this is a safety net
  if (!user) redirect('/login')

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef' }}>
      <TopbarNav user={user} />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  )
}