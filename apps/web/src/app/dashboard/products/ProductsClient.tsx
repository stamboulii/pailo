'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  emoji: string
  imageUrl: string
  stock: number
  sku: string
  is_available: boolean
}

export default function ProductsClient({ storeId, initialProducts }: { storeId: string, initialProducts: Product[] }) {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', description: '', price: '', emoji: '📦',
    imageUrl: '', stock: 10, sku: '', is_available: true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const resetForm = () => setForm({ name: '', description: '', price: '', emoji: '📦', imageUrl: '', stock: 10, sku: '', is_available: true })
  const resetState = () => { setError(null); setSuccess(false); setEditingId(null) }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price.trim()) { setError('Name and price are required'); return }
    setSaving(true); resetState()

    const payload: any = {
      store_id: storeId,
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      emoji: form.emoji,
      stock: form.stock,
      is_available: form.is_available,
      sort_order: products.length,
    }

    if (form.imageUrl && form.imageUrl.trim()) {
      payload.images = [form.imageUrl.trim()]
    }
    if (form.sku && form.sku.trim()) {
      payload.sku = form.sku.trim()
    } else {
      payload.sku = null
    }

    let saved: Product | null = null
    if (editingId) {
      const result = await supabase.from('products').update(payload).eq('id', editingId).select().single()
      if (result.error) throw result.error
      saved = result.data as Product
    } else {
      const result = await supabase.from('products').insert(payload).select().single()
      if (result.error) throw result.error
      saved = result.data as Product
    }

    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    resetForm()
    setEditingId(null)
    setProducts((prev) => editingId ? prev.map((p) => p.id === editingId ? saved! : p) : [...prev, saved!])
    setSaving(false)
  }

  const handleRemove = async (id: string) => {
    if (!confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) { setError(error.message); return }
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setForm({
      name: product.name, description: product.description || '', price: String(product.price),
      emoji: product.emoji || '📦', imageUrl: product.images?.[0] || '', stock: product.stock,
      sku: product.sku || '', is_available: product.is_available,
    })
  }

  if (!products.length) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#111' }}>Products</h1>
        <p style={{ color: '#888' }}>No products yet.</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#111' }}>Products</h1>
        <p style={{ color: '#888', fontSize: 14, margin: 0 }}>{products.length} items</p>
      </div>

      {success && <div style={{ background: 'rgba(24,185,106,0.1)', border: '1px solid rgba(24,185,106,0.3)', color: '#18b96a', padding: '10px 16px', borderRadius: 8, marginBottom: 20 }}>✓ Saved</div>}
      {error && <div style={{ background: 'rgba(232,96,26,0.1)', border: '1px solid rgba(232,96,26,0.3)', color: '#e8601a', padding: '10px 16px', borderRadius: 8, marginBottom: 20 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {products.map((p) => (
          <div key={p.id} style={{ background: 'white', border: '1px solid rgba(17,17,20,0.06)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ height: 120, background: '#f8f5ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 48 }}>{p.emoji}</span>}
            </div>
            <div style={{ padding: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{p.name}</h3>
              <p style={{ color: '#888', fontSize: 12, margin: '4px 0 12px' }}>{p.description || 'No description'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#2d5be3' }}>{p.price.toFixed(2)} TND</span>
                <span style={{ background: p.is_available ? '#18b96a20' : '#e8601a20', color: p.is_available ? '#18b96a' : '#e8601a', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                  {p.is_available ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 12, display: 'flex', gap: 12 }}>
                {p.sku && <span>SKU: {p.sku}</span>}
                <span>Stock: {p.stock}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(17,17,20,0.06)' }}>
                <button onClick={() => startEdit(p)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid rgba(45,91,227,0.2)', background: 'rgba(45,91,227,0.06)', color: '#2d5be3', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                <button onClick={() => handleRemove(p.id)} style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid rgba(232,96,26,0.2)', background: 'rgba(232,96,26,0.06)', color: '#e8601a', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, padding: 24, background: 'white', border: '1px solid rgba(17,17,20,0.06)', borderRadius: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: '#111' }}>{editingId ? 'Edit Product' : 'Add Product'}</h2>
        {error && <div style={{ color: '#e8601a', marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: '#18b96a', marginBottom: 12 }}>✓ Saved</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 6 }}>Name *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 6 }}>Price (TND) *</label>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 6 }}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ddd', height: 60 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 6 }}>Emoji</label>
            <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ddd', textAlign: 'center' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 6 }}>Image URL</label>
            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 6 }}>Stock</label>
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#333', marginBottom: 6 }}>SKU</label>
            <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #ddd' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 24 }}>
            <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
            <label style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>Available for purchase</label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {editingId && <button onClick={() => { setEditingId(null); resetForm() }} style={{ padding: '10px 20px', borderRadius: 6, border: '1px solid #ddd', background: 'white', color: '#666', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>}
          <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', borderRadius: 6, border: 'none', background: '#2d5be3', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : editingId ? 'Update' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  )
}
