'use client'

import { useNode } from '@craftjs/core'
import { useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Variant } from '../../types'

// ─────────────────────────────────────────────────────────────
// SHARED: MediaUploader
// Handles image AND video upload to Supabase Storage
// Used inside hero blocks as a background or side image
// ─────────────────────────────────────────────────────────────
function MediaUploader({
  value,
  onChange,
  label = 'Background media',
  accept = 'image/*,video/*',
}: {
  value?: string
  onChange: (url: string, type: 'image' | 'video') => void
  label?: string
  accept?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFile = async (file: File) => {
    const isVideo = file.type.startsWith('video/')
    const ext = file.name.split('.').pop()
    const path = `media/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from('store-media')             // your Supabase bucket name
      .upload(path, file, { upsert: true })

    if (error) { console.error('Upload failed:', error); return }

    const { data: { publicUrl } } = supabase.storage
      .from('store-media')
      .getPublicUrl(data.path)

    onChange(publicUrl, isVideo ? 'video' : 'image')
  }

  return (
    <div>
      <div style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 5 }}>
        {label}
      </div>
      {value && (
        <div style={{ marginBottom: 6, borderRadius: 6, overflow: 'hidden', maxHeight: 80 }}>
          {value.match(/\.(mp4|webm|ogg)$/i)
            ? <video src={value} style={{ width: '100%', height: 80, objectFit: 'cover' }} muted />
            : <img src={value} alt="" style={{ width: '100%', height: 80, objectFit: 'cover' }} />
          }
        </div>
      )}
      <button
        onClick={() => inputRef.current?.click()}
        style={{ width: '100%', padding: '8px', background: 'rgba(45,91,227,0.15)', border: '1px dashed rgba(45,91,227,0.4)', borderRadius: 5, color: '#2d5be3', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}
      >
        {value ? '↑ Replace' : '↑ Upload image / video'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// HERO VARIANT 1 — Dark gradient centered
// ─────────────────────────────────────────────────────────────
interface HeroDarkProps {
  headline?: string
  subtext?: string
  ctaText?: string
  bgColor?: string
  bgImage?: string
  bgType?: 'color' | 'image' | 'video'
}

export function HeroDarkBlock({
  headline = 'Welcome to our store',
  subtext = 'Quality products made with care and delivered to your door.',
  ctaText = 'Shop now',
  bgColor = '#1a1a2e',
  bgImage,
  bgType = 'color',
}: HeroDarkProps) {
  const { connectors: { connect, drag } } = useNode()

  const bg = bgType === 'color'
    ? bgColor
    : `url(${bgImage}) center/cover`

  return (
    <div
      ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: bg, padding: '88px 40px', textAlign: 'center', position: 'relative', cursor: 'move', minHeight: 280 }}
    >
      {bgType !== 'color' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      )}
      {bgType === 'video' && bgImage && (
        <video autoPlay muted loop playsInline
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
          src={bgImage}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ color: 'white', fontSize: 48, fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>{headline}</h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>{subtext}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button style={{ background: '#2d5be3', color: 'white', border: 'none', padding: '14px 36px', borderRadius: 6, fontSize: 15, fontWeight: 700 }}>{ctaText} →</button>
          <button style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '14px 28px', borderRadius: 6, fontSize: 15 }}>Learn more</button>
        </div>
      </div>
    </div>
  )
}

HeroDarkBlock.craft = {
  displayName: 'Hero — Dark',
  props: { headline: 'Welcome to our store', subtext: 'Quality products made with care.', ctaText: 'Shop now', bgColor: '#1a1a2e', bgImage: '', bgType: 'color' },
  related: { settings: HeroDarkSettings },
}

function HeroDarkSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props as HeroDarkProps }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <PropField label="Headline" value={props.headline ?? ''} onChange={v => setProp((p: HeroDarkProps) => { p.headline = v })} />
      <PropField label="Subtext" value={props.subtext ?? ''} onChange={v => setProp((p: HeroDarkProps) => { p.subtext = v })} />
      <PropField label="CTA text" value={props.ctaText ?? ''} onChange={v => setProp((p: HeroDarkProps) => { p.ctaText = v })} />
      <div>
        <div style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 5 }}>Background type</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['color', 'image', 'video'] as const).map(t => (
            <button key={t} onClick={() => setProp((p: HeroDarkProps) => { p.bgType = t })}
              style={{ flex: 1, padding: '5px', fontSize: 9, borderRadius: 4, border: 'none', cursor: 'pointer', background: props.bgType === t ? '#2d5be3' : 'rgba(255,255,255,0.08)', color: props.bgType === t ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {props.bgType === 'color' && (
        <PropField label="BG color" value={props.bgColor ?? '#1a1a2e'} onChange={v => setProp((p: HeroDarkProps) => { p.bgColor = v })} type="color" />
      )}
      {(props.bgType === 'image' || props.bgType === 'video') && (
        <MediaUploader
          value={props.bgImage}
          accept={props.bgType === 'video' ? 'video/*' : 'image/*'}
          onChange={(url, type) => setProp((p: HeroDarkProps) => { p.bgImage = url; p.bgType = type })}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// HERO VARIANT 2 — Light split with side image/video
// ─────────────────────────────────────────────────────────────
interface HeroSplitProps {
  headline?: string
  subtext?: string
  ctaText?: string
  mediaUrl?: string
  mediaType?: 'image' | 'video' | 'placeholder'
}

export function HeroSplitBlock({
  headline = 'Welcome to our store',
  subtext = 'Handcrafted with love. Delivered to your door.',
  ctaText = 'Explore now',
  mediaUrl,
  mediaType = 'placeholder',
}: HeroSplitProps) {
  const { connectors: { connect, drag } } = useNode()

  return (
    <div ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: '#f8f5ef', padding: '60px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', cursor: 'move' }}>
      <div>
        <p style={{ color: '#2d5be3', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>New arrivals</p>
        <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1, color: '#111', marginBottom: 16 }}>{headline}</h1>
        <p style={{ color: '#666', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>{subtext}</p>
        <button style={{ background: '#111', color: 'white', border: 'none', padding: '14px 32px', borderRadius: 6, fontSize: 15, fontWeight: 700 }}>{ctaText} →</button>
      </div>
      <div style={{ borderRadius: 12, overflow: 'hidden', height: 280, background: '#eee9df', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {mediaType === 'video' && mediaUrl
          ? <video src={mediaUrl} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : mediaType === 'image' && mediaUrl
          ? <img src={mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 64 }}>🛍</span>
        }
      </div>
    </div>
  )
}

HeroSplitBlock.craft = {
  displayName: 'Hero — Split',
  props: { headline: 'Welcome to our store', subtext: 'Handcrafted with love.', ctaText: 'Explore now', mediaUrl: '', mediaType: 'placeholder' },
  related: { settings: HeroSplitSettings },
}

function HeroSplitSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props as HeroSplitProps }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <PropField label="Headline" value={props.headline ?? ''} onChange={v => setProp((p: HeroSplitProps) => { p.headline = v })} />
      <PropField label="Subtext" value={props.subtext ?? ''} onChange={v => setProp((p: HeroSplitProps) => { p.subtext = v })} />
      <PropField label="CTA text" value={props.ctaText ?? ''} onChange={v => setProp((p: HeroSplitProps) => { p.ctaText = v })} />
      <MediaUploader
        label="Side image / video"
        value={props.mediaUrl}
        onChange={(url, type) => setProp((p: HeroSplitProps) => { p.mediaUrl = url; p.mediaType = type })}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// HERO VARIANT 3 — Full-width with overlay
// ─────────────────────────────────────────────────────────────
interface HeroFullwidthProps {
  headline?: string
  subtext?: string
  ctaText?: string
  bgColor?: string
  bgImage?: string
  bgType?: 'color' | 'image' | 'video'
  overlayOpacity?: number
}

export function HeroFullwidthBlock({
  headline = 'The best products.',
  subtext = 'Fast delivery. Quality guaranteed.',
  ctaText = 'Get started',
  bgColor = '#e8601a',
  bgImage,
  bgType = 'color',
  overlayOpacity = 0.3,
}: HeroFullwidthProps) {
  const { connectors: { connect, drag } } = useNode()

  return (
    <div ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ position: 'relative', padding: '96px 40px', textAlign: 'center', cursor: 'move', minHeight: 300, background: bgType === 'color' ? bgColor : '#000', overflow: 'hidden' }}>
      {bgType === 'image' && bgImage && (
        <img src={bgImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
      )}
      {bgType === 'video' && bgImage && (
        <video autoPlay muted loop playsInline src={bgImage}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${overlayOpacity})`, zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h1 style={{ color: 'white', fontSize: 52, fontWeight: 800, lineHeight: 1, marginBottom: 20 }}>{headline}</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 36 }}>{subtext}</p>
        <button style={{ background: 'white', color: bgType === 'color' ? bgColor : '#111', border: 'none', padding: '16px 48px', borderRadius: 6, fontSize: 16, fontWeight: 800 }}>{ctaText}</button>
      </div>
    </div>
  )
}

HeroFullwidthBlock.craft = {
  displayName: 'Hero — Fullwidth',
  props: { headline: 'The best products.', subtext: 'Fast delivery. Quality guaranteed.', ctaText: 'Get started', bgColor: '#e8601a', bgImage: '', bgType: 'color', overlayOpacity: 0.3 },
  related: { settings: HeroFullwidthSettings },
}

function HeroFullwidthSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props as HeroFullwidthProps }))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <PropField label="Headline" value={props.headline ?? ''} onChange={v => setProp((p: HeroFullwidthProps) => { p.headline = v })} />
      <PropField label="Subtext" value={props.subtext ?? ''} onChange={v => setProp((p: HeroFullwidthProps) => { p.subtext = v })} />
      <PropField label="CTA text" value={props.ctaText ?? ''} onChange={v => setProp((p: HeroFullwidthProps) => { p.ctaText = v })} />
      <div>
        <div style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 5 }}>Background</div>
        <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
          {(['color', 'image', 'video'] as const).map(t => (
            <button key={t} onClick={() => setProp((p: HeroFullwidthProps) => { p.bgType = t })}
              style={{ flex: 1, padding: '5px', fontSize: 9, borderRadius: 4, border: 'none', cursor: 'pointer', background: props.bgType === t ? '#2d5be3' : 'rgba(255,255,255,0.08)', color: props.bgType === t ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
              {t}
            </button>
          ))}
        </div>
        {props.bgType === 'color' && (
          <PropField label="Color" value={props.bgColor ?? '#e8601a'} onChange={v => setProp((p: HeroFullwidthProps) => { p.bgColor = v })} type="color" />
        )}
        {(props.bgType === 'image' || props.bgType === 'video') && (
          <MediaUploader
            value={props.bgImage}
            accept={props.bgType === 'video' ? 'video/*' : 'image/*'}
            onChange={(url, type) => setProp((p: HeroFullwidthProps) => { p.bgImage = url; p.bgType = type })}
          />
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// VARIANT DEFINITIONS
// ─────────────────────────────────────────────────────────────
export const HeroDark: Variant = {
  label: 'Dark Centered',
  Thumb: () => (
    <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#2d2d4e)', padding: '14px 12px', textAlign: 'center' }}>
      <div style={{ color: 'white', fontWeight: 800, fontSize: 10, marginBottom: 3 }}>Big Headline</div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 7, marginBottom: 7 }}>Subtitle text</div>
      <div style={{ background: '#2d5be3', color: 'white', fontSize: 7, padding: '2px 10px', borderRadius: 3, display: 'inline-block' }}>Shop now</div>
    </div>
  ),
  Preview: ({ storeName, tagline }) => (
    <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#2d2d4e)', padding: '72px 40px', textAlign: 'center' }}>
      <h1 style={{ color: 'white', fontSize: 48, fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>{tagline || `Welcome to ${storeName || 'My Store'}`}</h1>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>Quality products made with care and delivered to your door.</p>
      <button style={{ background: '#2d5be3', color: 'white', border: 'none', padding: '14px 36px', borderRadius: 6, fontSize: 15, fontWeight: 700 }}>Shop now →</button>
    </div>
  ),
  craftJson: () => ({ type: { resolvedName: 'HeroDarkBlock' }, props: { headline: 'Welcome to our store', subtext: 'Quality products made with care.', ctaText: 'Shop now', bgColor: '#1a1a2e', bgType: 'color' }, displayName: 'Hero — Dark', custom: {}, isCanvas: false }),
}

export const HeroSplit: Variant = {
  label: 'Light Split',
  Thumb: () => (
    <div style={{ background: '#f8f5ef', padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, alignItems: 'center' }}>
      <div>
        <div style={{ fontWeight: 800, fontSize: 9, marginBottom: 2, color: '#111' }}>Headline</div>
        <div style={{ fontSize: 7, color: '#888', marginBottom: 5 }}>Subtitle</div>
        <div style={{ background: '#111', color: 'white', fontSize: 7, padding: '2px 7px', borderRadius: 3, display: 'inline-block' }}>CTA</div>
      </div>
      <div style={{ background: '#ddd', borderRadius: 4, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🛍</div>
    </div>
  ),
  Preview: ({ storeName, tagline }) => (
    <div style={{ background: '#f8f5ef', padding: '60px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
      <div>
        <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1, color: '#111', marginBottom: 16 }}>{tagline || `Welcome to ${storeName || 'My Store'}`}</h1>
        <p style={{ color: '#666', fontSize: 15, marginBottom: 28 }}>Handcrafted with love. Delivered to your door.</p>
        <button style={{ background: '#111', color: 'white', border: 'none', padding: '14px 32px', borderRadius: 6, fontSize: 15, fontWeight: 700 }}>Explore now →</button>
      </div>
      <div style={{ background: 'linear-gradient(135deg,#eee9df,#ddd8ce)', borderRadius: 12, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>🛍</div>
    </div>
  ),
  craftJson: () => ({ type: { resolvedName: 'HeroSplitBlock' }, props: { headline: 'Welcome to our store', subtext: 'Handcrafted with love.', ctaText: 'Explore now', mediaType: 'placeholder' }, displayName: 'Hero — Split', custom: {}, isCanvas: false }),
}

export const HeroFullwidth: Variant = {
  label: 'Full-width Overlay',
  Thumb: () => (
    <div style={{ background: 'linear-gradient(135deg,#e8601a,#c44a00)', padding: '14px 12px', textAlign: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
      <div style={{ position: 'relative', color: 'white', fontWeight: 800, fontSize: 10, marginBottom: 3 }}>Bold Statement</div>
      <div style={{ position: 'relative', color: 'rgba(255,255,255,0.7)', fontSize: 7, marginBottom: 7 }}>Tagline</div>
      <div style={{ position: 'relative', background: 'white', color: '#e8601a', fontSize: 7, padding: '2px 10px', borderRadius: 3, display: 'inline-block', fontWeight: 700 }}>Get started</div>
    </div>
  ),
  Preview: ({ storeName, tagline }) => (
    <div style={{ background: 'linear-gradient(135deg,#e8601a,#b83a00)', padding: '88px 40px', textAlign: 'center', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />
      <div style={{ position: 'relative' }}>
        <h1 style={{ color: 'white', fontSize: 52, fontWeight: 800, lineHeight: 1, marginBottom: 20 }}>{tagline || `Welcome to ${storeName || 'My Store'}`}</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 36 }}>The best products. Delivered fast.</p>
        <button style={{ background: 'white', color: '#e8601a', border: 'none', padding: '16px 48px', borderRadius: 6, fontSize: 16, fontWeight: 800 }}>Get started</button>
      </div>
    </div>
  ),
  craftJson: () => ({ type: { resolvedName: 'HeroFullwidthBlock' }, props: { headline: 'The best products.', subtext: 'Fast delivery. Quality guaranteed.', ctaText: 'Get started', bgColor: '#e8601a', bgType: 'color', overlayOpacity: 0.3 }, displayName: 'Hero — Fullwidth', custom: {}, isCanvas: false }),
}

function PropField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <div style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 3 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '6px 8px', fontSize: 11, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, fontFamily: 'inherit' }} />
    </div>
  )
}
