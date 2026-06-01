'use client'

import { useEditor } from '@craftjs/core'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function BuilderTopbar({ storeId }: { storeId: string | null }) {
  const { query } = useEditor()
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const supabase = createClient()

  const handlePublish = async () => {
    if (!storeId) {
      alert('No store found. Create a store first from the dashboard.')
      return
    }
    setStatus('saving')

    try {
      const canvas = query.serialize()
      const canvasObj = typeof canvas === 'string' ? JSON.parse(canvas) : canvas

      const productsArray: any[] = []
      let foundProductNode = false

      for (const [nodeId, node] of Object.entries(canvasObj as Record<string, any>)) {
        const n = node as any
        const resolvedName = n?.type?.resolvedName ?? n?.data?.type?.resolvedName ?? ''
        const nodeDisplayName = n?.displayName ?? n?.data?.displayName ?? ''
        const props = n?.props ?? n?.data?.props ?? {}
        const hasProducts = Array.isArray(props?.products)

        console.debug('Publish canvas node', {
          nodeId,
          resolvedName,
          nodeDisplayName,
          hasProducts,
          productsLength: Array.isArray(props?.products) ? props.products.length : undefined,
        })

        if (
          resolvedName.includes('Products') ||
          nodeDisplayName.toLowerCase().includes('product')
        ) {
          foundProductNode = true
          const list = props?.products ?? []

          for (const p of list as any[]) {
            productsArray.push({
              id: String(p.id ?? ''),
              name: String(p.name ?? 'Produit'),
              price: parseFloat(String(p.price ?? '0')) || 0,
              emoji: String(p.emoji ?? '📦'),
              imageUrl: p.imageUrl ? String(p.imageUrl) : null,
              stock: typeof p.stock === 'number' ? p.stock : parseInt(String(p.stock ?? '0'), 10) || 0,
              sku: p.sku ? String(p.sku) : null,
              available: typeof p.available === 'boolean' ? p.available : true,
              desc: p.desc ? String(p.desc) : null,
            })
          }
          break
        }
      }

      if (!foundProductNode) {
        console.warn('No product node found in canvas. Keys first 10:', Object.keys(canvasObj as Record<string, any>).slice(0, 10))
      }

      const { error } = await supabase
        .from('stores')
        .update({
          config_json: { canvas },
          published_at: new Date().toISOString(),
        })
        .eq('id', storeId)

      console.log('PATCH stores update result:', {
        error,
        storeId,
        productsArrayLength: productsArray.length,
        foundProductNode,
        canvasKeys: Object.keys(canvasObj as Record<string, any>).slice(0, 5),
      })

      if (error) {
        console.error('Publish failed:', error)
        setStatus('error')
        return
      }

      if (productsArray.length > 0) {
        const { error: syncError } = await supabase.rpc('sync_craft_to_products', {
          p_store_id: storeId,
          p_products: productsArray,
        })

        console.log('sync_craft_to_products result:', {
          syncError,
          productsSynced: productsArray.length,
        })

        if (syncError) {
          console.error('Products sync failed:', syncError)
        }
      }

      setStatus('saved')
      console.log('Publish success: status is now saved')

      setTimeout(() => setStatus('idle'), 2500)
    } catch (e: any) {
      console.error('Publish error:', e)
      setStatus('error')
    }
  }

  const btnBg =
    status === 'saved'  ? '#18b96a' :
    status === 'saving' ? '#1a3ab0' :
    status === 'error'  ? '#e8601a' : '#2d5be3'

  const btnLabel =
    status === 'saving' ? 'Publishing...' :
    status === 'saved'  ? '✓ Published!'  :
    status === 'error'  ? 'Error — retry' : 'Publish →'

  return (
    <div style={{
      background: '#111114', height: 48, flexShrink: 0,
      display: 'flex', alignItems: 'center', padding: '0 16px',
      gap: 12, borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>

      <Link href="/dashboard"
        style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
        ← Dashboard
      </Link>

      <span style={{ flex: 1, color: 'white', fontSize: 13, fontWeight: 700 }}>
        Store Builder
      </span>

      <button
        onClick={handlePublish}
        disabled={status === 'saving'}
        style={{
          background: btnBg, color: 'white', border: 'none',
          padding: '8px 20px', borderRadius: 6, fontSize: 13,
          fontWeight: 700,
          cursor: status === 'saving' ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
        }}
      >
        {btnLabel}
      </button>
    </div>
  )
}