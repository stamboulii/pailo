'use client'

import { useNode } from '@craftjs/core'
import type { Variant } from '../../types'

// ─────────────────────────────────────────
// CRAFT.JS BLOCK — rendered inside the editor
// ─────────────────────────────────────────
interface Props {
  storeName?: string
  links?: string[]
  bgColor?: string
}

export function HeaderDarkBlock({
  storeName = 'My Store',
  links = ['Home', 'Shop', 'About', 'Contact'],
  bgColor = '#111114',
}: Props) {
  const { connectors: { connect, drag } } = useNode()

  return (
    <nav
      ref={ref => { if (ref) connect(drag(ref)) }}
      style={{
        background: bgColor,
        padding: '0 32px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'move',
      }}
    >
      <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>
        {storeName}
      </span>
      <div style={{ display: 'flex', gap: 20 }}>
        {links.map(l => (
          <span key={l} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{l}</span>
        ))}
      </div>
      <button style={{
        background: '#2d5be3', color: 'white', border: 'none',
        padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700,
      }}>
        Cart (0)
      </button>
    </nav>
  )
}

HeaderDarkBlock.craft = {
  displayName: 'Header — Dark',
  props: {
    storeName: 'My Store',
    links: ['Home', 'Shop', 'About', 'Contact'],
    bgColor: '#111114',
  },
  related: { settings: HeaderDarkSettings },
}

function HeaderDarkSettings() {
  const { props }: { props: Props } = useNode() as any as { props: Props }
  const { setProp }: { setProp: (cb: (p: Props) => void) => void } = (useNode() as any).actions as any
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Field label="Store name" value={props.storeName ?? ''} onChange={v => setProp((p: Props) => { p.storeName = v })} />
      <Field label="Background" value={props.bgColor ?? '#111114'} onChange={v => setProp((p: Props) => { p.bgColor = v })} type="color" />
    </div>
  )
}

// ─────────────────────────────────────────
// VARIANT DEFINITION — used by the picker
// ─────────────────────────────────────────
export const HeaderDark: Variant = {
  label: 'Dark Centered',

  Thumb: () => (
    <div style={{ background: '#111', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ color: 'white', fontWeight: 800, fontSize: 11 }}>LOGO</span>
      <div style={{ display: 'flex', gap: 8 }}>
        {['Home', 'Shop', 'About'].map(l => (
          <span key={l} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 8 }}>{l}</span>
        ))}
      </div>
      <span style={{ background: '#2d5be3', color: 'white', fontSize: 7, padding: '2px 7px', borderRadius: 3 }}>Cart</span>
    </div>
  ),

  Preview: ({ storeName }) => (
    <nav style={{ background: '#111114', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{storeName || 'My Store'}</span>
      <div style={{ display: 'flex', gap: 20 }}>
        {['Home', 'Shop', 'About', 'Contact'].map(l => (
          <span key={l} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{l}</span>
        ))}
      </div>
      <button style={{ background: '#2d5be3', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
        Cart (0)
      </button>
    </nav>
  ),

  craftJson: () => ({
    type: { resolvedName: 'HeaderDarkBlock' },
    props: { storeName: 'My Store', links: ['Home', 'Shop', 'About', 'Contact'], bgColor: '#111114' },
    displayName: 'Header — Dark',
    custom: {},
    isCanvas: false,
  }),
}

// Reusable settings field
function Field({ label, value, onChange, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string
}) {
  return (
    <div>
      <div style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 3 }}>
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '6px 8px', fontSize: 11, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, fontFamily: 'inherit' }}
      />
    </div>
  )
}
