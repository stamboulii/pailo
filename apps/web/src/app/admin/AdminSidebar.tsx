'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/stores', label: 'Stores', icon: '🏪' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: 260,
      height: '100vh',
      background: '#111',
      color: 'white',
      padding: '24px 16px',
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
    }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>Pailo Admin</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Super Admin Panel</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
