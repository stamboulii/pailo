import StoreRenderer from '@/components/builder/StoreRenderer'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ subdomain: string }>
}

export default async function PublishedStorePage({ params }: Props) {
  // Next.js 15 — params is a Promise
  const { subdomain } = await params

  // Public read — no auth needed, uses anon key
  const supabase = await createClient()
  const { data: store } = await supabase
    .from('stores')
    .select('id, name, config_json, published_at')
    .eq('subdomain', subdomain)
    .not('published_at', 'is', null)  // only published stores
    .single()

  if (!store) notFound()

  const canvas = store.config_json?.canvas ?? null

  return (
    <div>
      {/* StoreRenderer reads the canvas JSON and renders blocks as static HTML */}
      <StoreRenderer canvas={canvas} storeName={store.name} />
    </div>
  )
}