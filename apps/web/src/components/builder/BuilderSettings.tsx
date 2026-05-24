'use client'

import { useEditor } from '@craftjs/core'

export default function BuilderSettings() {
  const { selected } = useEditor(state => {
    const [nodeId] = state.events.selected
    if (!nodeId) return { selected: null }
    const node = state.nodes[nodeId]
    return {
      selected: {
        name:     node.data.displayName,
        Settings: node.related?.settings,
      }
    }
  })

  return (
    <div style={{ background: '#13131d', overflow: 'auto',
                  borderLeft: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', flexDirection: 'column' }}>

      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    flexShrink: 0 }}>
        {['Properties', 'Blocks', '✦ AI'].map((tab, i) => (
          <div key={tab} style={{
            flex: 1, padding: '9px', textAlign: 'center',
            fontSize: 10, fontWeight: 700, cursor: 'pointer',
            color: i === 0 ? 'white' : 'rgba(255,255,255,0.25)',
            borderBottom: i === 0
              ? '2px solid #2d5be3' : '2px solid transparent',
          }}>{tab}</div>
        ))}
      </div>

      <div style={{ padding: 12, flex: 1 }}>
        {selected ? (
          <>
            <div style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5,
                          color: '#2d5be3', textTransform: 'uppercase',
                          marginBottom: 12 }}>
              {selected.name}
            </div>
            {selected.Settings && <selected.Settings />}
          </>
        ) : (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)',
                        textAlign: 'center', marginTop: 48, lineHeight: 1.6 }}>
            Click a block<br />to edit it
          </div>
        )}
      </div>
    </div>
  )
}