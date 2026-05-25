// ─────────────────────────────────────────────────────────────
// ONBOARDING TYPES
// Shared across all onboarding components
// ─────────────────────────────────────────────────────────────

export type SectionKey = 'header' | 'hero' | 'products' | 'about' | 'footer'
export type OnboardingStep = 'pick' | 'info' | 'done'

export interface Selections {
  header:   number // 0 | 1 | 2
  hero:     number
  products: number
  about:    number
  footer:   number
}

export interface StoreInfo {
  name:    string
  tagline: string
}

// Describes one variant inside a section
export interface Variant {
  label: string
  // Small thumbnail shown in the left panel picker
  Thumb: React.FC
  // Full-size Craft.js block rendered in the live preview
  // Receives storeName and tagline for personalisation
  Preview: React.FC<{ storeName: string; tagline: string }>
  // The Craft.js serialized JSON for this block
  // Used when the user confirms — loaded into the editor canvas
  craftJson: () => object
}

// All sections, in order
export interface SectionDef {
  key:      SectionKey
  label:    string
  variants: Variant[]
}
