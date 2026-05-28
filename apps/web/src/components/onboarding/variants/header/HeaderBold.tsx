'use client'

import { useNode } from '@craftjs/core'
import type { Variant } from '../../types'

interface Props { storeName?: string; bgColor?: string }

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <div style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 3 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '6px 8px', fontSize: 11, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, fontFamily: 'inherit' }} />
    </div>
  )
}

export function HeaderBoldBlock({ storeName = 'My Store', bgColor = '#2d5be3' }: Props) {
  const { connectors: { connect, drag } } = useNode()
  return (
    <nav ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: bgColor, padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'move' }}>
      <span style={{ color: 'white', fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>{storeName}</span>
      <div style={{ display: 'flex', gap: 20 }}>
        {['Shop', 'Collections', 'About', 'Contact'].map(l => (
          <span key={l} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{l}</span>
        ))}
      </div>
      <button style={{ background: 'white', color: bgColor, border: 'none', padding: '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>Shop now</button>
    </nav>
  )
}

function HeaderBoldSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props as Props }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Field label="Store name" value={props.storeName ?? ''} onChange={v => setProp((p: Props) => { p.storeName = v })} />
      <Field label="Color" value={props.bgColor ?? '#2d5be3'} onChange={v => setProp((p: Props) => { p.bgColor = v })} type="color" />
    </div>
  )
}

HeaderBoldBlock.craft = {
  displayName: 'Header — Bold',
  props: { storeName: 'My Store', bgColor: '#2d5be3' },
  related: { settings: HeaderBoldSettings },
}

export const HeaderBold: Variant = {
  label: 'Bold Split',
  Thumb: () => (
    <div style={{ background: '#2d5be3', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ color: 'white', fontWeight: 800, fontSize: 11 }}>LOGO</span>
      <div style={{ display: 'flex', gap: 6 }}>
        {['Shop', 'About'].map(l => (<span key={l} style={{ color: 'rgba(255,255,255,0.7)', fontSize: 8 }}>{l}</span>))}
      </div>
      <span style={{ background: 'white', color: '#2d5be3', fontSize: 7, padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>Shop</span>
    </div>
  ),
  Preview: ({ storeName }) => (
    <nav style={{ background: '#2d5be3', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ color: 'white', fontWeight: 800, fontSize: 20 }}>{storeName || 'My Store'}</span>
      <div style={{ display: 'flex', gap: 20 }}>
        {['Shop', 'Collections', 'About', 'Contact'].map(l => (
          <span key={l} style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{l}</span>
        ))}
      </div>
      <button style={{ background: 'white', color: '#2d5be3', border: 'none', padding: '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>Shop now</button>
    </nav>
  ),
  craftJson: () => ({
    type: { resolvedName: 'HeaderBoldBlock' },
    props: { storeName: 'My Store', bgColor: '#2d5be3' },
    displayName: 'Header — Bold',
    custom: {},
    isCanvas: false,
  }),
}
