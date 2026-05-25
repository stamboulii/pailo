'use client'
// ─────────────────────────────────────────────────────────────
// PICKER COMPONENTS
// SectionNav    — pills at top to jump between sections
// VariantPicker — left panel showing 3 variants for current section
// LivePreview   — right panel rendering full store preview
// ─────────────────────────────────────────────────────────────

import type { SectionKey, Selections, StoreInfo, SectionDef } from '../types'

// ── SectionNav ────────────────────────────────────────────────
export function SectionNav({
  sections,
  active,
  selections,
  onSelect,
}: {
  sections: SectionDef[]
  active: SectionKey
  selections: Selections
  onSelect: (key: SectionKey) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {sections.map((s, i) => {
        const isActive = s.key === active
        const variantLabel = s.variants[selections[s.key]]?.label ?? '—'
        return (
          <button
            key={s.key}
            onClick={() => onSelect(s.key)}
            style={{
              padding: '5px 12px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: isActive ? '#2d5be3' : 'rgba(255,255,255,0.1)',
              color: isActive ? 'white' : 'rgba(255,255,255,0.45)',
            }}
          >
            <span style={{ opacity: 0.6 }}>{i + 1}.</span>
            {s.label}
            {!isActive && (
              <span style={{ fontSize: 9, opacity: 0.6, maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {variantLabel}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── VariantPicker ─────────────────────────────────────────────
export function VariantPicker({
  section,
  selectedIndex,
  onSelect,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  isLast,
}: {
  section: SectionDef
  selectedIndex: number
  onSelect: (i: number) => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
  isLast: boolean
}) {
  return (
    <div style={{
      background: '#1a1a24',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
          Choosing
        </div>
        <div style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>
          {section.label}
        </div>
      </div>

      {/* Variants */}
      <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
        {section.variants.map((variant, i) => {
          const isSelected = selectedIndex === i
          const { Thumb } = variant
          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              style={{
                background: 'none',
                border: `2px solid ${isSelected ? '#2d5be3' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8,
                cursor: 'pointer',
                overflow: 'hidden',
                transition: 'border-color 0.15s',
                boxShadow: isSelected ? '0 0 0 3px rgba(45,91,227,0.2)' : 'none',
                padding: 0,
              }}
            >
              {/* Thumbnail */}
              <div style={{ pointerEvents: 'none' }}>
                <Thumb />
              </div>
              {/* Label */}
              <div style={{
                background: isSelected ? '#2d5be3' : 'rgba(255,255,255,0.04)',
                padding: '7px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ color: isSelected ? 'white' : 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700 }}>
                  {variant.label}
                </span>
                {isSelected && (
                  <span style={{ color: 'white', fontSize: 9, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 99 }}>
                    ✓ Selected
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Navigation */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          style={{
            flex: 1, padding: '10px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent',
            color: !hasPrev ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
            borderRadius: 6,
            cursor: !hasPrev ? 'not-allowed' : 'pointer',
            fontSize: 13,
          }}
        >
          ← Prev
        </button>
        <button
          onClick={onNext}
          style={{
            flex: 2, padding: '10px',
            background: '#2d5be3', color: 'white',
            border: 'none', borderRadius: 6,
            cursor: 'pointer', fontSize: 13, fontWeight: 700,
          }}
        >
          {isLast ? 'Done →' : 'Next →'}
        </button>
      </div>
    </div>
  )
}

// ── LivePreview ───────────────────────────────────────────────
export function LivePreview({
  sections,
  selections,
  storeInfo,
}: {
  sections: SectionDef[]
  selections: Selections
  storeInfo: StoreInfo
}) {
  return (
    <div style={{ overflow: 'auto', background: '#ede8df' }}>
      <div style={{ background: 'white', minHeight: '100%', boxShadow: '0 0 0 1px rgba(17,17,20,0.08)' }}>
        {sections.map(section => {
          const variant = section.variants[selections[section.key]]
          if (!variant) return null
          const { Preview } = variant
          return (
            <Preview
              key={section.key}
              storeName={storeInfo.name}
              tagline={storeInfo.tagline}
            />
          )
        })}
      </div>
    </div>
  )
}
