'use client'

import { useNode } from '@craftjs/core'
import type { Variant } from '../../types'

interface Props {
  storeName?: string
  bgColor?: string
}

export function HeaderMinimalBlock({
  storeName = 'My Store',
  bgColor = '#ffffff',
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
        borderBottom: '1px solid rgba(17,17,20,0.08)',
        cursor: 'move',
      }}
    >
      <span style={{ fontWeight: 800, fontSize: 18, color: '#111' }}>{storeName}</span>
      <div style={{ display: 'flex', gap: 24 }}>
        {['Shop', 'About', 'Contact'].map(l => (
          <span key={l} style={{ color: '#555', fontSize: 13 }}>{l}</span>
        ))}
      </div>
      <span style={{ fontSize: 22, cursor: 'pointer' }}>🛒</span>
    </nav>
  )
}

HeaderMinimalBlock.craft = {
  displayName: 'Header — Minimal',
  props: { storeName: 'My Store', bgColor: '#ffffff' },
  related: { settings: HeaderMinimalSettings },
}

function HeaderMinimalSettings() {
  const { props }: { props: Props } = useNode() as any as { props: Props }
  const { setProp }: { setProp: (cb: (p: Props) => void) => void } = (useNode() as any).actions as any
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Field label="Store name" value={props.storeName ?? ''} onChange={v => setProp((p: Props) => { p.storeName = v })} />
    </div>
  )
}

export const HeaderMinimal: Variant = {
  label: 'Minimal',

  Thumb: () => (
    <div style={{ background: 'white', padding: '8px 12px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontWeight: 800, fontSize: 11, color: '#111' }}>LOGO</span>
      <div style={{ display: 'flex', gap: 8 }}>
        {['Shop', 'About'].map(l => (
          <span key={l} style={{ fontSize: 8, color: '#888' }}>{l}</span>
        ))}
      </div>
      <span style={{ fontSize: 12 }}>🛒</span>
    </div>
  ),

  Preview: ({ storeName }) => (
    <nav style={{ background: 'white', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(17,17,20,0.08)' }}>
      <span style={{ fontWeight: 800, fontSize: 18, color: '#111' }}>{storeName || 'My Store'}</span>
      <div style={{ display: 'flex', gap: 24 }}>
        {['Shop', 'About', 'Contact'].map(l => (
          <span key={l} style={{ color: '#555', fontSize: 13 }}>{l}</span>
        ))}
      </div>
      <span style={{ fontSize: 22 }}>🛒</span>
    </nav>
  ),

  craftJson: () => ({
    type: { resolvedName: 'HeaderMinimalBlock' },
    props: { storeName: 'My Store', bgColor: '#ffffff' },
    displayName: 'Header — Minimal',
    custom: {},
    isCanvas: false,
  }),
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 3 }}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '6px 8px', fontSize: 11, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, fontFamily: 'inherit' }} />
    </div>
  )
}
