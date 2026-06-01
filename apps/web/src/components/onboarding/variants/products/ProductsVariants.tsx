'use client'

import { useNode, useEditor } from '@craftjs/core'
import { useRef } from 'react'
import { useCart } from '@/components/store/CartContext'
import type { Variant } from '../../types'

// ─────────────────────────────────────────────────────────────
// PRODUCTS VARIANT 1 — 3-column card grid
// ─────────────────────────────────────────────────────────────
interface ProductsGridProps {
  title?: string
  bgColor?: string
  products?: {
    name: string
    price: string
    emoji: string
    imageUrl?: string
    stock?: number
    sku?: string
    available?: boolean
    desc?: string
  }[]
}

const DEFAULT_PRODUCTS = [
  { name: 'Product 1', price: '29', emoji: '📦', imageUrl: '', stock: 10, sku: 'PROD-001', available: true, desc: '' },
  { name: 'Product 2', price: '39', emoji: '📦', imageUrl: '', stock: 5, sku: 'PROD-002', available: true, desc: '' },
  { name: 'Product 3', price: '49', emoji: '📦', imageUrl: '', stock: 0, sku: 'PROD-003', available: false, desc: '' },
]

export function ProductsGridBlock({
  title = 'Our Products',
  bgColor = '#ffffff',
  products = DEFAULT_PRODUCTS,
}: ProductsGridProps) {
  const { connectors: { connect, drag } } = useNode()
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }))
  const { addItem, toggleCart } = useCart()

  const handleAddToCart = (p: any, index: number) => {
    if (!p.available || (p.stock ?? 0) <= 0) return
    addItem({
      id: String(p.id ?? `product-${index}`),
      name: String(p.name ?? 'Produit'),
      price: typeof p.price === 'number' ? p.price : Number.parseFloat(String(p.price ?? '0')) || 0,
      emoji: String(p.emoji ?? '📦'),
    })
    toggleCart()
  }

  return (
    <div ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: bgColor, padding: '48px 32px', cursor: enabled ? 'move' : 'default' }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>{title}</h2>
      <p style={{ color: '#888', textAlign: 'center', marginBottom: 32 }}>Handpicked just for you</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {products.map((p, i) => {
          const price = typeof p.price === 'number' ? p.price.toFixed(2) : Number.parseFloat(String(p.price ?? '0')).toFixed(2)
          const canAdd = p.available !== false && (p.stock ?? 0) > 0

          return (
            <div key={i} style={{ background: '#f8f5ef', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ height: 140, background: '#eee9df', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                {p.imageUrl
                  ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  : <span style={{ fontSize: 48 }}>{p.emoji}</span>
                }
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                <div style={{ color: '#2d5be3', fontWeight: 700, fontSize: 16 }}>{price} TND</div>
                {!enabled && (
                  <button
                    type="button"
                    onClick={() => handleAddToCart(p, i)}
                    style={{
                      marginTop: 10,
                      width: '100%',
                      background: canAdd ? '#111' : '#999',
                      color: 'white',
                      border: 'none',
                      padding: '8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: canAdd ? 'pointer' : 'not-allowed',
                      opacity: canAdd ? 1 : 0.6,
                    }}
                    disabled={!canAdd}
                  >
                    {canAdd ? 'Add to cart' : 'Out of stock'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProductsGridSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props as ProductsGridProps }))
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const uploadImage = async (file: File, index: number) => {
    const ext = file.name.split('.').pop()
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage.from('store-media').upload(path, file, { upsert: true })
    if (error || !data) return
    const { data: { publicUrl } } = await supabase.storage.from('store-media').getPublicUrl(data.path)
    setProp((p: ProductsGridProps) => {
      if (!p.products) return
      p.products[index] = { ...p.products[index], imageUrl: publicUrl }
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <PropField label="Section title" value={props.title ?? ''} onChange={v => setProp((p: ProductsGridProps) => { p.title = v })} />
      {(props.products ?? []).map((prod, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: 10 }}>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Product {i + 1}</div>
          <PropField label="Name" value={prod.name} onChange={v => setProp((p: ProductsGridProps) => { if (p.products) p.products[i].name = v })} />
          <div style={{ marginTop: 6 }}>
            <PropField label="Price (TND)" value={prod.price} onChange={v => setProp((p: ProductsGridProps) => { if (p.products) p.products[i].price = v })} />
          </div>
          <div style={{ marginTop: 6 }}>
            <PropField label="Description" value={prod.desc ?? ''} onChange={v => setProp((p: ProductsGridProps) => { if (p.products) p.products[i].desc = v })} />
          </div>
          <div style={{ marginTop: 6 }}>
            <PropField label="Stock" value={(prod.stock ?? 0).toString()} onChange={v => setProp((p: ProductsGridProps) => { if (p.products) p.products[i].stock = parseInt(v) || 0 })} />
          </div>
          <div style={{ marginTop: 6 }}>
            <PropField label="SKU" value={prod.sku ?? ''} onChange={v => setProp((p: ProductsGridProps) => { if (p.products) p.products[i].sku = v })} />
          </div>
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#333' }}>
              <input
                type="checkbox"
                checked={prod.available ?? true}
                onChange={(e) => setProp((p: ProductsGridProps) => { if (p.products) p.products[i].available = e.target.checked })}
              />
              Available for purchase
            </div>
          </div>
          <div style={{ marginTop: 6 }}>
            {prod.imageUrl && <img src={prod.imageUrl} alt="" style={{ width: '100%', height: 48, objectFit: 'cover', borderRadius: 4, marginBottom: 4 }} />}
            <label style={{ display: 'block', padding: '5px', background: 'rgba(45,91,227,0.15)', border: '1px dashed rgba(45,91,227,0.4)', borderRadius: 4, color: '#2d5be3', fontSize: 10, cursor: 'pointer', textAlign: 'center', fontWeight: 700 }}>
              {prod.imageUrl ? '↑ Replace' : '↑ Upload'}
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, i) }} />
            </label>
          </div>
        </div>
      ))}
    </div>
  )
}

ProductsGridBlock.craft = {
  displayName: 'Products — Grid',
  props: { title: 'Our Products', bgColor: '#ffffff', products: DEFAULT_PRODUCTS },
  related: { settings: ProductsGridSettings },
}

// ─────────────────────────────────────────────────────────────
// PRODUCTS VARIANT 2 — Horizontal list
// ─────────────────────────────────────────────────────────────
interface ProductsListProps {
  title?: string
  products?: {
    name: string
    desc: string
    price: string
    emoji: string
    imageUrl?: string
    stock?: number
    sku?: string
    available?: boolean
  }[]
}

const DEFAULT_LIST_PRODUCTS = [
  { name: 'Vanilla Amber Candle', desc: 'Hand-poured with 100% natural soy wax', price: '32', emoji: '🕯', imageUrl: '', stock: 10, sku: 'VANILLA-001', available: true },
  { name: 'Lavender Gift Set', desc: 'The perfect gift for someone special', price: '38', emoji: '🌸', imageUrl: '', stock: 5, sku: 'LAVENDER-001', available: true },
  { name: 'Premium Gift Box', desc: '3 candles + custom packaging', price: '55', emoji: '🎁', imageUrl: '', stock: 0, sku: 'GIFT-001', available: false },
]

export function ProductsListBlock({
  title = 'Featured Items',
  products = DEFAULT_LIST_PRODUCTS,
}: ProductsListProps) {
  const { connectors: { connect, drag } } = useNode()
  return (
    <div ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: '#f8f5ef', padding: '48px 32px', cursor: 'move' }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{title}</h2>
      <p style={{ color: '#888', marginBottom: 32 }}>Our most popular picks</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {products.map((p, i) => (
          <div key={i} style={{ background: 'white', borderRadius: 10, padding: '16px', display: 'flex', gap: 16, alignItems: 'center', border: '1px solid rgba(17,17,20,0.06)' }}>
            <div style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#eee9df', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {p.imageUrl
                ? <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 32 }}>{p.emoji}</span>
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.name}</div>
              <div style={{ color: '#888', fontSize: 13 }}>{p.desc}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#2d5be3', fontWeight: 800, fontSize: 18 }}>{p.price} TND</div>
              <button style={{ marginTop: 6, background: '#111', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductsListSettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props as ProductsListProps }))
  const supabase = createClient()

  const uploadImage = async (file: File, index: number) => {
    const path = `products/${Date.now()}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage.from('store-media').upload(path, file, { upsert: true })
    if (error || !data) return
    const { data: { publicUrl } } = await supabase.storage.from('store-media').getPublicUrl(data.path)
    setProp((p: ProductsListProps) => { if (p.products) p.products[index].imageUrl = publicUrl })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <PropField label="Section title" value={props.title ?? ''} onChange={v => setProp((p: ProductsListProps) => { p.title = v })} />
      {(props.products ?? []).map((prod, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: 10 }}>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Product {i + 1}</div>
          <PropField label="Name" value={prod.name} onChange={v => setProp((p: ProductsListProps) => { if (p.products) p.products[i].name = v })} />
          <div style={{ marginTop: 6 }}><PropField label="Description" value={prod.desc} onChange={v => setProp((p: ProductsListProps) => { if (p.products) p.products[i].desc = v })} /></div>
          <div style={{ marginTop: 6 }}><PropField label="Price" value={prod.price} onChange={v => setProp((p: ProductsListProps) => { if (p.products) p.products[i].price = v })} /></div>
          <div style={{ marginTop: 6 }}>
            <PropField label="Stock" value={(prod.stock ?? 0).toString()} onChange={v => setProp((p: ProductsListProps) => { if (p.products) p.products[i].stock = parseInt(v) || 0 })} />
          </div>
          <div style={{ marginTop: 6 }}>
            <PropField label="SKU" value={prod.sku ?? ''} onChange={v => setProp((p: ProductsListProps) => { if (p.products) p.products[i].sku = v })} />
          </div>
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#333' }}>
              <input
                type="checkbox"
                checked={prod.available ?? true}
                onChange={(e) => setProp((p: ProductsListProps) => { if (p.products) p.products[i].available = e.target.checked })}
              />
              Available for purchase
            </div>
          </div>
          <div style={{ marginTop: 6 }}>
            {prod.imageUrl && <img src={prod.imageUrl} alt="" style={{ width: '100%', height: 48, objectFit: 'cover', borderRadius: 4, marginBottom: 4 }} />}
            <label style={{ display: 'block', padding: '5px', background: 'rgba(45,91,227,0.15)', border: '1px dashed rgba(45,91,227,0.4)', borderRadius: 4, color: '#2d5be3', fontSize: 10, cursor: 'pointer', textAlign: 'center', fontWeight: 700 }}>
              {prod.imageUrl ? '↑ Replace image' : '↑ Upload image'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, i) }} />
            </label>
          </div>
        </div>
      ))}
    </div>
  )
}

ProductsListBlock.craft = {
  displayName: 'Products — List',
  props: { title: 'Featured Items', products: DEFAULT_LIST_PRODUCTS },
  related: { settings: ProductsListSettings },
}

// ─────────────────────────────────────────────────────────────
// PRODUCTS VARIANT 3 — Dark masonry
// ─────────────────────────────────────────────────────────────
interface ProductsMasonryProps {
  title?: string
  products?: {
    name: string
    price: string
    emoji: string
    imageUrl?: string
    tall?: boolean
    stock?: number
    sku?: string
    available?: boolean
    desc?: string
  }[]
}

const DEFAULT_MASONRY = [
  { name: 'Vanilla Amber', price: '32', emoji: '🕯', imageUrl: '', tall: true, stock: 10, sku: 'VANILLA-002', available: true, desc: '' },
  { name: 'Lavender Set', price: '38', emoji: '🌸', imageUrl: '', tall: false, stock: 5, sku: 'LAVENDER-002', available: true, desc: '' },
  { name: 'Cedar & Musk', price: '28', emoji: '🌲', imageUrl: '', tall: false, stock: 0, sku: 'CEDAR-001', available: false, desc: '' },
  { name: 'Gift Box', price: '55', emoji: '🎁', imageUrl: '', tall: true, stock: 8, sku: 'GIFT-002', available: true, desc: '' },
]

export function ProductsMasonryBlock({
  title = 'The Collection',
  products = DEFAULT_MASONRY,
}: ProductsMasonryProps) {
  const { connectors: { connect, drag } } = useNode()
  return (
    <div ref={ref => { if (ref) connect(drag(ref)) }}
      style={{ background: '#111114', padding: '48px 32px', cursor: 'move' }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', color: 'white', marginBottom: 8 }}>{title}</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 32 }}>Explore everything</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
        {products.map((p, i) => (
          <div key={i} style={{ background: '#1a1a24', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ height: p.tall ? 180 : 130, background: '#2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {p.imageUrl
                ? <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                : <span style={{ fontSize: 48 }}>{p.emoji}</span>
              }
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>{p.name}</span>
              <span style={{ color: '#2d5be3', fontWeight: 700 }}>{p.price} TND</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductsMasonrySettings() {
  const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props as ProductsMasonryProps }))
  const supabase = createClient()
  const uploadImage = async (file: File, index: number) => {
    const path = `products/${Date.now()}.${file.name.split('.').pop()}`
    const { data, error } = await supabase.storage.from('store-media').upload(path, file, { upsert: true })
    if (error || !data) return
    const { data: { publicUrl } } = await supabase.storage.from('store-media').getPublicUrl(data.path)
    setProp((p: ProductsMasonryProps) => { if (p.products) p.products[index].imageUrl = publicUrl })
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <PropField label="Section title" value={props.title ?? ''} onChange={v => setProp((p: ProductsMasonryProps) => { p.title = v })} />
      {(props.products ?? []).map((prod, i) => (
        <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: 10 }}>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Item {i + 1}</div>
          <PropField label="Name" value={prod.name} onChange={v => setProp((p: ProductsMasonryProps) => { if (p.products) p.products[i].name = v })} />
          <div style={{ marginTop: 6 }}><PropField label="Description" value={prod.desc ?? ''} onChange={v => setProp((p: ProductsMasonryProps) => { if (p.products) p.products[i].desc = v })} /></div>
          <div style={{ marginTop: 6 }}><PropField label="Price" value={prod.price} onChange={v => setProp((p: ProductsMasonryProps) => { if (p.products) p.products[i].price = v })} /></div>
          <div style={{ marginTop: 6 }}>
            <PropField label="Stock" value={(prod.stock ?? 0).toString()} onChange={v => setProp((p: ProductsMasonryProps) => { if (p.products) p.products[i].stock = parseInt(v) || 0 })} />
          </div>
          <div style={{ marginTop: 6 }}>
            <PropField label="SKU" value={prod.sku ?? ''} onChange={v => setProp((p: ProductsMasonryProps) => { if (p.products) p.products[i].sku = v })} />
          </div>
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#333' }}>
              <input
                type="checkbox"
                checked={prod.available ?? true}
                onChange={(e) => setProp((p: ProductsMasonryProps) => { if (p.products) p.products[i].available = e.target.checked })}
              />
              Available for purchase
            </div>
          </div>
          <div style={{ marginTop: 6 }}>
            {prod.imageUrl && <img src={prod.imageUrl} alt="" style={{ width: '100%', height: 48, objectFit: 'cover', borderRadius: 4, marginBottom: 4 }} />}
            <label style={{ display: 'block', padding: '5px', background: 'rgba(45,91,227,0.15)', border: '1px dashed rgba(45,91,227,0.4)', borderRadius: 4, color: '#2d5be3', fontSize: 10, cursor: 'pointer', textAlign: 'center', fontWeight: 700 }}>
              {prod.imageUrl ? '↑ Replace' : '↑ Upload'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, i) }} />
            </label>
          </div>
        </div>
      ))}
    </div>
  )
}

ProductsMasonryBlock.craft = {
  displayName: 'Products — Masonry',
  props: { title: 'The Collection', products: DEFAULT_MASONRY },
  related: { settings: ProductsMasonrySettings },
}

// ─────────────────────────────────────────────────────────────
// VARIANT DEFINITIONS
// ─────────────────────────────────────────────────────────────
export const ProductsGrid: Variant = {
  label: '3-col Grid',
  Thumb: () => (
    <div style={{ background: 'white', padding: '10px 12px' }}>
      <div style={{ fontWeight: 700, fontSize: 9, textAlign: 'center', marginBottom: 6 }}>Products</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ background: '#f8f5ef', borderRadius: 3 }}>
            <div style={{ height: 22, background: '#eee9df', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>📦</div>
            <div style={{ padding: '2px 4px' }}>
              <div style={{ fontSize: 7, fontWeight: 700 }}>Item {i}</div>
              <div style={{ fontSize: 7, color: '#2d5be3', fontWeight: 700 }}>29 TND</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  Preview: () => (
    <div style={{ background: 'white', padding: '40px 32px' }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 24 }}>Our Products</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {['Vanilla Amber', 'Lavender Set', 'Gift Box'].map((name, i) => (
          <div key={i} style={{ background: '#f8f5ef', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ height: 120, background: '#eee9df', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>{['🕯','🌸','🎁'][i]}</div>
            <div style={{ padding: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{name}</div>
              <div style={{ color: '#2d5be3', fontWeight: 700 }}>{[32, 38, 55][i]} TND</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
  craftJson: () => ({ type: { resolvedName: 'ProductsGridBlock' }, props: { title: 'Our Products', bgColor: '#ffffff', products: DEFAULT_PRODUCTS }, displayName: 'Products — Grid', custom: {}, isCanvas: false }),
}

export const ProductsList: Variant = {
  label: 'Horizontal List',
  Thumb: () => (
    <div style={{ background: '#f8f5ef', padding: '10px 12px' }}>
      <div style={{ fontWeight: 700, fontSize: 9, marginBottom: 6 }}>Featured</div>
      {[1,2].map(i => (
        <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 4, alignItems: 'center' }}>
          <div style={{ width: 22, height: 22, background: '#eee9df', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>📦</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 7, fontWeight: 700 }}>Product {i}</div>
            <div style={{ fontSize: 6, color: '#888' }}>Short desc</div>
          </div>
          <div style={{ fontSize: 7, color: '#2d5be3', fontWeight: 700 }}>29 TND</div>
        </div>
      ))}
    </div>
  ),
  Preview: () => (
    <div style={{ background: '#f8f5ef', padding: '40px 32px' }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Featured Items</h2>
      {DEFAULT_LIST_PRODUCTS.map((p, i) => (
        <div key={i} style={{ background: 'white', borderRadius: 10, padding: '14px', display: 'flex', gap: 14, alignItems: 'center', marginBottom: 10, border: '1px solid rgba(17,17,20,0.06)' }}>
          <div style={{ width: 60, height: 60, borderRadius: 8, background: '#eee9df', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>{p.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
            <div style={{ color: '#888', fontSize: 12 }}>{p.desc}</div>
          </div>
          <div style={{ color: '#2d5be3', fontWeight: 800, fontSize: 16 }}>{p.price} TND</div>
        </div>
      ))}
    </div>
  ),
  craftJson: () => ({ type: { resolvedName: 'ProductsListBlock' }, props: { title: 'Featured Items', products: DEFAULT_LIST_PRODUCTS }, displayName: 'Products — List', custom: {}, isCanvas: false }),
}

export const ProductsMasonry: Variant = {
  label: 'Dark Masonry',
  Thumb: () => (
    <div style={{ background: '#111', padding: '10px 12px' }}>
      <div style={{ color: 'white', fontWeight: 700, fontSize: 9, textAlign: 'center', marginBottom: 6 }}>Collection</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        {['🕯','🌸','🌲','🎁'].map((e, i) => (
          <div key={i} style={{ background: '#222', borderRadius: 3, height: i % 2 === 0 ? 22 : 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>{e}</div>
        ))}
      </div>
    </div>
  ),
  Preview: () => (
    <div style={{ background: '#111114', padding: '40px 32px' }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', color: 'white', marginBottom: 24 }}>The Collection</h2>
      {DEFAULT_MASONRY.map((p, i) => (
        <div key={i} style={{ background: '#1a1a24', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: 150, background: '#2a2a3e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>{p.emoji}</div>
          <div style={{ padding: '10px 12px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{p.name}</span>
            <span style={{ color: '#2d5be3', fontWeight: 700 }}>{p.price} TND</span>
          </div>
        </div>
      ))}
    </div>
  ),
  craftJson: () => ({ type: { resolvedName: 'ProductsMasonryBlock' }, props: { title: 'The Collection', products: DEFAULT_MASONRY }, displayName: 'Products — Masonry', custom: {}, isCanvas: false }),
}

function PropField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <div style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 3 }}>{label}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', padding: '6px 8px', fontSize: 11, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, fontFamily: 'inherit' }} />
    </div>
  )
}
