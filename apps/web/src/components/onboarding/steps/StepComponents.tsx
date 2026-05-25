'use client'
// ─────────────────────────────────────────────────────────────
// STEP COMPONENTS
// StepPick  — section + variant selection
// StepInfo  — store name + tagline
// StepDone  — success screen
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { SectionNav, VariantPicker, LivePreview } from '../picker/PickerComponents'
import { ALL_SECTIONS } from '../sections'
import type { Selections, StoreInfo, SectionKey } from '../types'

// ── StepPick ──────────────────────────────────────────────────
export function StepPick({
  selections,
  storeInfo,
  onSelect,
  onContinue,
  onBack,
}: {
  selections: Selections
  storeInfo: StoreInfo
  onSelect: (key: SectionKey, index: number) => void
  onContinue: () => void
  onBack: () => void
}) {
  const [activeSection, setActiveSection] = useState<SectionKey>('header')
  const currentIdx = ALL_SECTIONS.findIndex(s => s.key === activeSection)
  const currentSection = ALL_SECTIONS[currentIdx]

  const goNext = () => {
    if (currentIdx < ALL_SECTIONS.length - 1) {
      setActiveSection(ALL_SECTIONS[currentIdx + 1].key)
    } else {
      onContinue()
    }
  }

  const goPrev = () => {
    if (currentIdx > 0) setActiveSection(ALL_SECTIONS[currentIdx - 1].key)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Syne, sans-serif' }}>

      {/* Topbar */}
      <div style={{
        background: '#111114', height: 52, flexShrink: 0,
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16,
      }}>
        <button onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer' }}>
          ← Dashboard
        </button>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>|</span>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 13, flex: 1 }}>
          Build your store — choose your sections
        </span>
        <SectionNav
          sections={ALL_SECTIONS}
          active={activeSection}
          selections={selections}
          onSelect={setActiveSection}
        />
        <button onClick={onContinue}
          style={{ background: '#2d5be3', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Continue →
        </button>
      </div>

      {/* Main content: picker left, preview right */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '300px 1fr', overflow: 'hidden' }}>
        <VariantPicker
          section={currentSection}
          selectedIndex={selections[activeSection]}
          onSelect={i => onSelect(activeSection, i)}
          onPrev={goPrev}
          onNext={goNext}
          hasPrev={currentIdx > 0}
          hasNext={currentIdx < ALL_SECTIONS.length - 1}
          isLast={currentIdx === ALL_SECTIONS.length - 1}
        />
        <LivePreview
          sections={ALL_SECTIONS}
          selections={selections}
          storeInfo={storeInfo}
        />
      </div>
    </div>
  )
}

// ── StepInfo ──────────────────────────────────────────────────
export function StepInfo({
  storeInfo,
  selections,
  onInfoChange,
  onSubmit,
  onBack,
  loading,
  error,
}: {
  storeInfo: StoreInfo
  selections: Selections
  onInfoChange: (info: StoreInfo) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
  error: string | null
}) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520, background: 'white', borderRadius: 16, padding: 40, border: '1px solid rgba(17,17,20,0.08)' }}>
        <button onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', marginBottom: 24, padding: 0 }}>
          ← Back to design
        </button>

        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, color: '#111' }}>Name your store</h2>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 28 }}>
          Just two details — you can always change them later.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 6 }}>
              Store name *
            </label>
            <input
              value={storeInfo.name}
              onChange={e => onInfoChange({ ...storeInfo, name: e.target.value })}
              placeholder="Sara's Candles"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(17,17,20,0.12)', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: 6 }}>
              Tagline <span style={{ opacity: 0.5 }}>(optional)</span>
            </label>
            <input
              value={storeInfo.tagline}
              onChange={e => onInfoChange({ ...storeInfo, tagline: e.target.value })}
              placeholder="Hand-poured with love, in Tunis"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid rgba(17,17,20,0.12)', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Selections summary */}
        <div style={{ background: '#f8f5ef', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>
            Your design choices
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ALL_SECTIONS.map(s => (
              <span key={s.key} style={{ fontSize: 11, background: '#2d5be3', color: 'white', padding: '3px 10px', borderRadius: 99, fontWeight: 700 }}>
                {s.label}: {s.variants[selections[s.key]]?.label}
              </span>
            ))}
          </div>
        </div>

        {error && (
          <p style={{ color: '#e8601a', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <button
          onClick={onSubmit}
          disabled={loading || !storeInfo.name.trim()}
          style={{
            width: '100%', padding: '14px',
            background: '#2d5be3', color: 'white',
            border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700,
            cursor: loading || !storeInfo.name.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !storeInfo.name.trim() ? 0.7 : 1,
          }}
        >
          {loading ? 'Creating your store...' : 'Create store & open builder →'}
        </button>
      </div>
    </div>
  )
}

// ── StepDone ──────────────────────────────────────────────────
export function StepDone({ storeName }: { storeName: string }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f5ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 24, animation: 'bounce 1s infinite' }}>🚀</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#111' }}>
          {storeName || 'Your store'} is ready!
        </h2>
        <p style={{ color: '#888', fontSize: 15 }}>Opening the builder...</p>
      </div>
    </div>
  )
}
