'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const NAV_LINKS = [
  { href: '/dashboard',          label: 'Dashboard' },
  { href: '/dashboard/builder',  label: 'Builder'   },
  { href: '/dashboard/orders',   label: 'Orders'    },
  { href: '/dashboard/products', label: 'Products'  },
]

export default function TopbarNav({ user }: { user: User }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const initial  = (user.email ?? 'U')[0].toUpperCase()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav style={{ background: '#111114', height: 52,
                  display: 'flex', alignItems: 'center', padding: '0 24px',
                  position: 'sticky', top: 0, zIndex: 100 }}>

      <Link href="/dashboard"
        style={{ fontSize: 18, fontWeight: 800, color: 'white',
                 textDecoration: 'none', marginRight: 28 }}>
        Pai<span style={{ color: '#2d5be3' }}>lo</span>
      </Link>

      <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = href === '/dashboard'
            ? pathname === href
            : pathname.startsWith(href)
          return (
            <Link key={href} href={href} style={{
              fontSize: 12, fontWeight: 700, padding: '5px 12px',
              borderRadius: 6, textDecoration: 'none',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: isActive ? 'white' : 'rgba(255,255,255,0.4)',
            }}>{label}</Link>
          )
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
          {user.email}
        </span>
        <div onClick={handleSignOut}
          title="Sign out"
          style={{ width: 30, height: 30, borderRadius: '50%',
                   background: '#2d5be3', display: 'flex',
                   alignItems: 'center', justifyContent: 'center',
                   color: 'white', fontWeight: 700, fontSize: 13,
                   cursor: 'pointer' }}>{initial}</div>
      </div>
    </nav>
  )
}