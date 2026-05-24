'use client'

import { useNode } from '@craftjs/core'
import HeroBlockSettings from './HeroBlockSettings'

interface HeroProps {
  headline:  string
  subtext:   string
  ctaText:   string
  bgColor:   string
  textColor: string
}

export function HeroBlock({
  headline  = 'Your headline here',
  subtext   = 'Describe your business in one line',
  ctaText   = 'Shop now',
  bgColor   = '#1a1a2e',
  textColor = '#ffffff',
}: Partial<HeroProps>) {
  const { connectors: { connect, drag } } = useNode()

  return (
    <div
      ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: bgColor, padding: '60px 40px',
               textAlign: 'center', cursor: 'move' }}>
      <h1 style={{ color: textColor, fontSize: 36, fontWeight: 800,
                   lineHeight: 1.1, marginBottom: 12 }}>{headline}</h1>
      <p style={{ color: textColor, opacity: 0.65, fontSize: 16,
                  marginBottom: 28 }}>{subtext}</p>
      <button style={{ background: '#2d5be3', color: 'white', border: 'none',
                       padding: '12px 32px', borderRadius: 6, fontSize: 15,
                       fontWeight: 700, cursor: 'pointer' }}>
        {ctaText}
      </button>
    </div>
  )
}

HeroBlock.craft = {
  displayName: 'Hero Section',
  props: {
    headline:  'Your headline here',
    subtext:   'Describe your business in one line',
    ctaText:   'Shop now',
    bgColor:   '#1a1a2e',
    textColor: '#ffffff',
  },
  related: { settings: HeroBlockSettings },
}