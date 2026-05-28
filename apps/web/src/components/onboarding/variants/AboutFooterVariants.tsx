'use client'
// ─────────────────────────────────────────────────────────────
// ABOUT + FOOTER VARIANTS
// ─────────────────────────────────────────────────────────────

import { useNode } from '@craftjs/core'
import { createClient } from '@/lib/supabase/client'
import type { Variant } from '../../types'

// ── SHARED ────────────────────────────────────
function PropField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <div style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 3 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '6px 8px', fontSize: 11, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, fontFamily: 'inherit' }} />
    </div>
  )
}

function ImageUploadField({ label, value, onChange }: { label: string; value?: string; onChange: (url: string) => void }) {
  const supabase = createClient()
  const upload = async (file: File) => {
    const path = `about/${Date.now()}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage.from('store-media').upload(path, file, { upsert: true })
    if (error || !data) return
    const { data: { publicUrl } } = supabase.storage.from('store-media').getPublicUrl(data.path)
    onChange(publicUrl)
  }
  return (
    <div>
      <div style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 5 }}>{label}</div>
      {value && <img src={value} alt="" style={{ width: '100%', height: 64, objectFit: 'cover', borderRadius: 4, marginBottom: 4 }} />}
      <label style={{ display: 'block', padding: '6px', background: 'rgba(45,91,227,0.15)', border: '1px dashed rgba(45,91,227,0.4)', borderRadius: 4, color: '#2d5be3', fontSize: 10, cursor: 'pointer', textAlign: 'center', fontWeight: 700 }}>
        {value ? '↑ Replace image' : '↑ Upload image'}
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }} />
      </label>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ABOUT VARIANT 1 — Text + side image
// ─────────────────────────────────────────────────────────────
interface AboutSplitProps { storeName?: string; body?: string; imageUrl?: string }

export function AboutSplitBlock({ storeName = 'Our Brand', body = 'We believe in quality over quantity. Every item we create is made by hand with the finest materials.', imageUrl }: AboutSplitProps) {
  const { connectors: { connect, drag } } = useNode()
  return (
    <div ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: 'white', padding: '60px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', cursor: 'move' }}>
      <div>
        <p style={{ color: '#2d5be3', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>Our story</p>
        <h2 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1, marginBottom: 16, color: '#111' }}>Made with love,<br />delivered with care.</h2>
        <p style={{ color: '#666', fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>{body}</p>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['500+', 'Customers'], ['100%', 'Natural'], ['3yr', 'In business']].map(([v, l]) => (
            <div key={l}><div style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>{v}</div><div style={{ fontSize: 11, color: '#888' }}>{l}</div></div>
          ))}
        </div>
      </div>
      <div style={{ borderRadius: 16, overflow: 'hidden', height: 300, background: '#f8f5ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {imageUrl ? <img src={imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 72 }}>✨</span>}
      </div>
    </div>
  )
}

function AboutSplitSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props as AboutSplitProps }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <PropField label="Brand name" value={props.storeName ?? ''} onChange={v => setProp((p: AboutSplitProps) => { p.storeName = v })} />
      <PropField label="Body text" value={props.body ?? ''} onChange={v => setProp((p: AboutSplitProps) => { p.body = v })} />
      <ImageUploadField label="Side image" value={props.imageUrl} onChange={url => setProp((p: AboutSplitProps) => { p.imageUrl = url })} />
    </div>
  )
}
AboutSplitBlock.craft = { displayName: 'About — Split', props: { storeName: 'Our Brand', body: 'We believe in quality over quantity.', imageUrl: '' }, related: { settings: AboutSplitSettings } }

// ─────────────────────────────────────────────────────────────
// ABOUT VARIANT 2 — Centered with icons
// ─────────────────────────────────────────────────────────────
interface AboutCenteredProps { storeName?: string; body?: string }

export function AboutCenteredBlock({ storeName = 'Our Brand', body = 'We believe in quality over quantity. Every item we create is designed to last.' }: AboutCenteredProps) {
  const { connectors: { connect, drag } } = useNode()
  return (
    <div ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: '#f8f5ef', padding: '72px 32px', textAlign: 'center', cursor: 'move' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>💛</div>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, color: '#111' }}>Why {storeName}?</h2>
        <p style={{ color: '#666', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>{body}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          {[['🌿','Natural'],['🤝','Handmade'],['📦','Fast shipping'],['⭐','Top rated']].map(([icon, lbl]) => (
            <div key={lbl} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AboutCenteredSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props as AboutCenteredProps }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <PropField label="Brand name" value={props.storeName ?? ''} onChange={v => setProp((p: AboutCenteredProps) => { p.storeName = v })} />
      <PropField label="Body" value={props.body ?? ''} onChange={v => setProp((p: AboutCenteredProps) => { p.body = v })} />
    </div>
  )
}
AboutCenteredBlock.craft = { displayName: 'About — Centered', props: { storeName: 'Our Brand', body: 'We believe in quality over quantity.' }, related: { settings: AboutCenteredSettings } }

// ─────────────────────────────────────────────────────────────
// ABOUT VARIANT 3 — Dark stats banner
// ─────────────────────────────────────────────────────────────
interface AboutDarkProps { storeName?: string; body?: string }

export function AboutDarkBlock({ storeName = 'Our Brand', body = 'Started as a small home project and grew into something we are proud of.' }: AboutDarkProps) {
  const { connectors: { connect, drag } } = useNode()
  return (
    <div ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: '#2d5be3', padding: '64px 32px', cursor: 'move' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 16, lineHeight: 1.1 }}>We're not just a store.<br />We're a community.</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.7 }}>{body}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[['1200+','Orders'],['4.9','Avg rating'],['3yr','Active'],['100%','Natural']].map(([v, l]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: 24, fontWeight: 800 }}>{v}</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AboutDarkSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props as AboutDarkProps }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <PropField label="Brand name" value={props.storeName ?? ''} onChange={v => setProp((p: AboutDarkProps) => { p.storeName = v })} />
      <PropField label="Body" value={props.body ?? ''} onChange={v => setProp((p: AboutDarkProps) => { p.body = v })} />
    </div>
  )
}
AboutDarkBlock.craft = { displayName: 'About — Dark', props: { storeName: 'Our Brand', body: 'Started as a small home project.' }, related: { settings: AboutDarkSettings } }

// ─────────────────────────────────────────────────────────────
// FOOTER VARIANT 1 — Simple dark
// ─────────────────────────────────────────────────────────────
interface FooterDarkProps { storeName?: string }

export function FooterDarkBlock({ storeName = 'My Store' }: FooterDarkProps) {
  const { connectors: { connect, drag } } = useNode()
  return (
    <footer ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: '#111114', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, cursor: 'move' }}>
      <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>{storeName}</span>
      <div style={{ display: 'flex', gap: 20 }}>
        {['Privacy', 'Terms', 'Contact'].map(l => (<span key={l} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, cursor: 'pointer' }}>{l}</span>))}
      </div>
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>© 2025 {storeName}. All rights reserved.</span>
    </footer>
  )
}

function FooterDarkSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props as FooterDarkProps }))
  return <PropField label="Store name" value={props.storeName ?? ''} onChange={v => setProp((p: FooterDarkProps) => { p.storeName = v })} />
}
FooterDarkBlock.craft = { displayName: 'Footer — Dark', props: { storeName: 'My Store' }, related: { settings: FooterDarkSettings } }

// ─────────────────────────────────────────────────────────────
// FOOTER VARIANT 2 — 4-column
// ─────────────────────────────────────────────────────────────
interface FooterColumnsProps { storeName?: string; tagline?: string }

export function FooterColumnsBlock({ storeName = 'My Store', tagline = 'Quality products, delivered fast.' }: FooterColumnsProps) {
  const { connectors: { connect, drag } } = useNode()
  return (
    <footer ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: '#1a1a2e', padding: '48px 32px 24px', cursor: 'move' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32, marginBottom: 40 }}>
        <div>
          <div style={{ color: 'white', fontWeight: 800, fontSize: 18, marginBottom: 12 }}>{storeName}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.6 }}>{tagline}</div>
        </div>
        {[{ title: 'Shop', links: ['All products', 'New arrivals', 'Best sellers'] }, { title: 'Info', links: ['About us', 'Contact', 'FAQ'] }, { title: 'Follow', links: ['Instagram', 'Facebook', 'WhatsApp'] }].map(col => (
          <div key={col.title}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>{col.title}</div>
            {col.links.map(l => (<div key={l} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 8, cursor: 'pointer' }}>{l}</div>))}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>© 2025 {storeName}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Made with Pailo</span>
      </div>
    </footer>
  )
}

function FooterColumnsSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props as FooterColumnsProps }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <PropField label="Store name" value={props.storeName ?? ''} onChange={v => setProp((p: FooterColumnsProps) => { p.storeName = v })} />
      <PropField label="Tagline" value={props.tagline ?? ''} onChange={v => setProp((p: FooterColumnsProps) => { p.tagline = v })} />
    </div>
  )
}
FooterColumnsBlock.craft = { displayName: 'Footer — Columns', props: { storeName: 'My Store', tagline: 'Quality products, delivered fast.' }, related: { settings: FooterColumnsSettings } }

// ─────────────────────────────────────────────────────────────
// FOOTER VARIANT 3 — Minimal light
// ─────────────────────────────────────────────────────────────
interface FooterMinimalProps { storeName?: string }

export function FooterMinimalBlock({ storeName = 'My Store' }: FooterMinimalProps) {
  const { connectors: { connect, drag } } = useNode()
  return (
    <footer ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: '#f8f5ef', padding: '32px', borderTop: '1px solid rgba(17,17,20,0.08)', textAlign: 'center', cursor: 'move' }}>
      <span style={{ fontWeight: 800, fontSize: 18, color: '#111', display: 'block', marginBottom: 16 }}>{storeName}</span>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
        {['Home', 'Shop', 'About', 'Contact'].map(l => (<span key={l} style={{ color: '#666', fontSize: 13, cursor: 'pointer' }}>{l}</span>))}
      </div>
      <span style={{ color: '#aaa', fontSize: 12 }}>© 2025 {storeName} · Made with Pailo</span>
    </footer>
  )
}

function FooterMinimalSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props as FooterMinimalProps }))
  return <PropField label="Store name" value={props.storeName ?? ''} onChange={v => setProp((p: FooterMinimalProps) => { p.storeName = v })} />
}
FooterMinimalBlock.craft = { displayName: 'Footer — Minimal', props: { storeName: 'My Store' }, related: { settings: FooterMinimalSettings } }

// ─────────────────────────────────────────────────────────────
// ABOUT VARIANT DEFINITIONS
// ─────────────────────────────────────────────────────────────
export const AboutSplit: Variant = {
  label: 'Text + Image',
  Thumb: () => (
    <div style={{ background: 'white', padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'center' }}>
      <div><div style={{ fontWeight: 700, fontSize: 9, marginBottom: 3 }}>Our Story</div><div style={{ fontSize: 7, color: '#888', lineHeight: 1.5 }}>A short brand description here.</div></div>
      <div style={{ background: '#f8f5ef', borderRadius: 4, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
    </div>
  ),
  Preview: ({ storeName }) => (
    <div style={{ background: 'white', padding: '48px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, marginBottom: 12 }}>Made with love.</h2>
        <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7 }}>{storeName || 'Our brand'} was born out of a passion for quality and craftsmanship.</p>
      </div>
      <div style={{ background: '#f8f5ef', borderRadius: 12, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>✨</div>
    </div>
  ),
  craftJson: () => ({ type: { resolvedName: 'AboutSplitBlock' }, props: { storeName: 'Our Brand', body: 'We believe in quality over quantity.', imageUrl: '' }, displayName: 'About — Split', custom: {}, isCanvas: false }),
}

export const AboutCentered: Variant = {
  label: 'Centered',
  Thumb: () => (
    <div style={{ background: '#f8f5ef', padding: '10px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 14, marginBottom: 3 }}>💛</div>
      <div style={{ fontWeight: 700, fontSize: 9, marginBottom: 2 }}>About Us</div>
      <div style={{ fontSize: 7, color: '#888' }}>Centered brand story</div>
    </div>
  ),
  Preview: ({ storeName }) => (
    <div style={{ background: '#f8f5ef', padding: '48px 32px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>💛</div>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Why {storeName || 'us'}?</h2>
      <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7 }}>We believe in quality over quantity. Every item is designed to last.</p>
    </div>
  ),
  craftJson: () => ({ type: { resolvedName: 'AboutCenteredBlock' }, props: { storeName: 'Our Brand', body: 'We believe in quality over quantity.' }, displayName: 'About — Centered', custom: {}, isCanvas: false }),
}

export const AboutDark: Variant = {
  label: 'Dark Stats',
  Thumb: () => (
    <div style={{ background: '#2d5be3', padding: '10px 12px', textAlign: 'center' }}>
      <div style={{ color: 'white', fontWeight: 700, fontSize: 9, marginBottom: 3 }}>Who We Are</div>
      <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 7 }}>Stats + brand story</div>
    </div>
  ),
  Preview: ({ storeName }) => (
    <div style={{ background: '#2d5be3', padding: '48px 32px' }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, color: 'white', marginBottom: 12 }}>We're a community.</h2>
      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 20 }}>{storeName || 'Our brand'} started small and grew through customer love.</p>
    </div>
  ),
  craftJson: () => ({ type: { resolvedName: 'AboutDarkBlock' }, props: { storeName: 'Our Brand', body: 'Started as a small home project.' }, displayName: 'About — Dark', custom: {}, isCanvas: false }),
}

// ─────────────────────────────────────────────────────────────
// FOOTER VARIANT DEFINITIONS
// ─────────────────────────────────────────────────────────────
export const FooterDark: Variant = {
  label: 'Simple Dark',
  Thumb: () => (
    <div style={{ background: '#111', padding: '7px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'white', fontWeight: 700, fontSize: 9 }}>LOGO</span>
      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 7 }}>© 2025</span>
    </div>
  ),
  Preview: ({ storeName }) => (
    <footer style={{ background: '#111114', padding: '28px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>{storeName || 'My Store'}</span>
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>© 2025 {storeName || 'My Store'}</span>
    </footer>
  ),
  craftJson: () => ({ type: { resolvedName: 'FooterDarkBlock' }, props: { storeName: 'My Store' }, displayName: 'Footer — Dark', custom: {}, isCanvas: false }),
}

export const FooterColumns: Variant = {
  label: '4-column',
  Thumb: () => (
    <div style={{ background: '#1a1a2e', padding: '7px 12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4, marginBottom: 4 }}>
        {['LOGO','Shop','Info','Social'].map(l => (<div key={l} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 6, fontWeight: 700 }}>{l}</div>))}
      </div>
      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 6 }}>© 2025</span>
    </div>
  ),
  Preview: ({ storeName }) => (
    <footer style={{ background: '#1a1a2e', padding: '40px 32px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginBottom: 32 }}>
        <div><div style={{ color: 'white', fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{storeName || 'My Store'}</div><div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Quality products.</div></div>
        {['Shop','Info','Follow'].map(t => (<div key={t}><div style={{ color: 'white', fontWeight: 700, fontSize: 12, marginBottom: 8 }}>{t}</div><div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Links here</div></div>))}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>© 2025 {storeName}</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Made with Pailo</span>
      </div>
    </footer>
  ),
  craftJson: () => ({ type: { resolvedName: 'FooterColumnsBlock' }, props: { storeName: 'My Store', tagline: 'Quality products, delivered fast.' }, displayName: 'Footer — Columns', custom: {}, isCanvas: false }),
}

export const FooterMinimal: Variant = {
  label: 'Minimal Light',
  Thumb: () => (
    <div style={{ background: '#f8f5ef', padding: '7px 12px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center', gap: 10 }}>
      {['Home','Shop','© 2025'].map(l => (<span key={l} style={{ fontSize: 7, color: '#888' }}>{l}</span>))}
    </div>
  ),
  Preview: ({ storeName }) => (
    <footer style={{ background: '#f8f5ef', padding: '28px 32px', borderTop: '1px solid rgba(17,17,20,0.08)', textAlign: 'center' }}>
      <span style={{ fontWeight: 800, fontSize: 16, color: '#111', display: 'block', marginBottom: 12 }}>{storeName || 'My Store'}</span>
      <span style={{ color: '#aaa', fontSize: 12 }}>© 2025 {storeName} · Made with Pailo</span>
    </footer>
  ),
  craftJson: () => ({ type: { resolvedName: 'FooterMinimalBlock' }, props: { storeName: 'My Store' }, displayName: 'Footer — Minimal', custom: {}, isCanvas: false }),
}
