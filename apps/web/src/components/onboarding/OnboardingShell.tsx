'use client'
// ─────────────────────────────────────────────────────────────
// OnboardingShell
// Owns all state: step, selections, storeInfo.
// Delegates rendering to StepPick / StepInfo / StepDone.
// Handles Supabase store creation and Craft.js canvas generation.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { StepPick, StepInfo, StepDone } from './steps/StepComponents'
import { ALL_SECTIONS } from './sections'
import type { OnboardingStep, Selections, StoreInfo, SectionKey } from './types'

const DEFAULT_SELECTIONS: Selections = {
  header:   0,
  hero:     0,
  products: 0,
  about:    0,
  footer:   0,
}

const DEFAULT_INFO: StoreInfo = { name: '', tagline: '' }

export default function OnboardingShell() {
  const [step, setStep]           = useState<OnboardingStep>('pick')
  const [selections, setSelections] = useState<Selections>(DEFAULT_SELECTIONS)
  const [storeInfo, setStoreInfo]   = useState<StoreInfo>(DEFAULT_INFO)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const router  = useRouter()
  const supabase = createClient()

  // ── Selection update ──────────────────────────────────────
  const handleSelect = (key: SectionKey, index: number) => {
    setSelections(prev => ({ ...prev, [key]: index }))
  }

  // ── Build Craft.js canvas JSON from selections ────────────
  const buildCraftCanvas = (): string => {
    // Each selected variant provides a craftJson() object.
    // We wrap them all in a root canvas container.
    const nodes: Record<string, object> = {
      ROOT: {
        type: { resolvedName: 'div' },
        props: { style: { display: 'flex', flexDirection: 'column' } },
        displayName: 'div',
        custom: {},
        isCanvas: true,
        nodes: [] as string[],
        linkedNodes: {},
      },
    }

    const rootNodes: string[] = []

    ALL_SECTIONS.forEach((section, sectionIndex) => {
      const variant  = section.variants[selections[section.key]]
      const nodeId   = `node-${section.key}`
      const nodeData = variant.craftJson()
      nodes[nodeId]  = { ...nodeData, parent: 'ROOT', nodes: [], linkedNodes: {} }
      rootNodes.push(nodeId)
    })

    ;(nodes['ROOT'] as any).nodes = rootNodes

    return JSON.stringify(nodes)
  }

  // ── Store creation ────────────────────────────────────────
  const handleCreate = async () => {
    if (!storeInfo.name.trim()) return
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Generate a unique subdomain from the store name
      const subdomain =
        storeInfo.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 36) +
        '-' +
        Math.random().toString(36).slice(2, 6)

      const canvas = buildCraftCanvas()

      const { error: dbErr } = await supabase.from('stores').insert({
        user_id:     user.id,
        name:        storeInfo.name,
        subdomain,
        config_json: {
          canvas,              // Craft.js serialized state
          selections,          // which variant was chosen per section
          storeName: storeInfo.name,
          tagline:   storeInfo.tagline,
        },
      })

      if (dbErr) throw new Error(dbErr.message)

      setStep('done')
      // Redirect to the builder after a short success moment
      setTimeout(() => router.push('/editor'), 1400)

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────
  if (step === 'pick') {
    return (
      <StepPick
        selections={selections}
        storeInfo={storeInfo}
        onSelect={handleSelect}
        onContinue={() => setStep('info')}
        onBack={() => router.push('/dashboard')}
      />
    )
  }

  if (step === 'info') {
    return (
      <StepInfo
        storeInfo={storeInfo}
        selections={selections}
        onInfoChange={setStoreInfo}
        onSubmit={handleCreate}
        onBack={() => setStep('pick')}
        loading={loading}
        error={error}
      />
    )
  }

  return <StepDone storeName={storeInfo.name} />
}
