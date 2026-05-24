'use client'

import { useNode } from '@craftjs/core'

export function CTABlock({
  text    = 'Free delivery in Tunis · Order before 3pm for same-day',
  bgColor = '#e8601a',
}: { text?: string; bgColor?: string }) {
  const { connectors: { connect, drag } } = useNode()

  return (
    <div ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: bgColor, padding: '20px 32px',
               textAlign: 'center', cursor: 'move' }}>
      <p style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{text}</p>
    </div>
  )
}

CTABlock.craft = {
  displayName: 'CTA Banner',
  props: {
    text:    'Free delivery in Tunis · Order before 3pm for same-day',
    bgColor: '#e8601a',
  },
}