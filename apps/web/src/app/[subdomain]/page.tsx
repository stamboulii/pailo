import StoreClientShell from './StoreClientShell'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface Product {
  stock: number
  id: string
  name: string
  price: number
  emoji: string
  images: string[]
  is_available: boolean
}

interface StoreRecord {
  id: string
  name: string
  config_json: {
    canvas?: string | Record<string, any>
  }
  published_at: string | null
}

export default async function PublishedStorePage({
  params,
}: {
  params: Promise<{ subdomain: string }>
}) {
  const { subdomain } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('id, name, config_json, published_at')
    .eq('subdomain', subdomain)
    .not('published_at', 'is', null)
    .single()

  if (!store) notFound()

  const s = store as StoreRecord

  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, emoji, images, is_available, stock')
    .eq('store_id', s.id)
    .eq('is_available', true)
    .order('sort_order', { ascending: true })

  const dbProducts = (products ?? []) as Product[]

  let canvas =
    typeof s.config_json?.canvas === 'string'
      ? s.config_json.canvas
      : s.config_json?.canvas
        ? JSON.stringify(s.config_json.canvas)
        : null

  if (dbProducts.length > 0 && canvas) {
    try {
      const parsed = typeof canvas === 'string' ? JSON.parse(canvas) : canvas
      const nodes = parsed as Record<string, any>

      for (const [, node] of Object.entries(nodes)) {
        const resolvedName = node?.type?.resolvedName ?? node?.data?.type?.resolvedName ?? ''
        if (
          resolvedName.includes('ProductsGridBlock') ||
          resolvedName.includes('ProductsListBlock') ||
          resolvedName.includes('ProductsMasonryBlock')
        ) {
          const props = node?.props ?? node?.data?.props ?? {}
          const mapped = dbProducts.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            emoji: p.emoji,
            imageUrl: p.images?.[0] ?? '',
            stock: p.stock ?? 0,
            available: p.is_available,
          }))
          if (Array.isArray(props.products)) {
            props.products = mapped
          }
          break
        }
      }

      canvas = JSON.stringify(parsed)
    } catch {
      // keep original canvas if parsing fails
    }
  }

  return (
    <StoreClientShell
      canvas={canvas}
      storeName={s.name}
      products={dbProducts}
    />
  )
}
