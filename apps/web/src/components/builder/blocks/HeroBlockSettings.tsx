'use client'

import { useNode } from '@craftjs/core'

export default function HeroBlockSettings() {
  const { setProp, props } = useNode(node => ({
    props: node.data.props as Record<string, string>
  }))

  const COLORS = [
    '#1a1a2e', '#2d5be3', '#e8601a',
    '#f8f5ef', '#18b96a', '#111114',
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {[
        { label: 'Headline',  key: 'headline'  },
        { label: 'Subtext',   key: 'subtext'   },
        { label: 'CTA text',  key: 'ctaText'   },
      ].map(({ label, key }) => (
        <div key={key}>
          <div style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5,
                        textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                        marginBottom: 3 }}>{label}</div>
          <input
            value={props[key] ?? ''}
            onChange={e =>
              setProp((p: Record<string, string>) => { p[key] = e.target.value })
            }
            style={{ width: '100%', padding: '6px 8px', fontSize: 11,
                     background: 'rgba(255,255,255,0.05)',
                     color: 'rgba(255,255,255,0.7)',
                     border: '1px solid rgba(255,255,255,0.08)',
                     borderRadius: 4, fontFamily: 'inherit' }}
          />
        </div>
      ))}

      <div>
        <div style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5,
                      textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                      marginBottom: 5 }}>Background</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {COLORS.map(color => (
            <div key={color}
              onClick={() =>
                setProp((p: Record<string, string>) => { p.bgColor = color })
              }
              style={{
                width: 22, height: 22, borderRadius: 4,
                background: color, cursor: 'pointer',
                outline: props.bgColor === color
                  ? '2px solid white' : 'none',
                outlineOffset: 2,
              }} />
          ))}
        </div>
      </div>
    </div>
  )
}