'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function ProductsPage() {
  const supabase = createClient()

  const [user, setUser] = useState<any>(null)
  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newProduct, setNewProduct] = useState({
    name: '',
    desc: '',
    price: '',
    emoji: '📦',
    imageUrl: '',
    stock: 0,
    sku: '',
    available: true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [refetchKey, setRefetchKey] = useState(0)

  // Step 1 — get the logged-in user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  // Step 2 — fetch store once user is known
  useEffect(() => {
    if (!user) return
    const fetchStore = async () => {
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setStore(storeData)
      setLoading(false)
    }
    fetchStore()
  }, [user, refetchKey])

  // Step 3 — extract products from canvas JSON
  useEffect(() => {
    if (!store) {
      setProducts([])
      return
    }
    const extracted = store.config_json?.canvas
      ? extractProducts(store.config_json.canvas)
      : []
    setProducts(extracted)
  }, [store])

  // ── Helpers ──────────────────────────────────────────────

  const extractProducts = (canvasStr: string) => {
    try {
      const canvas =
        typeof canvasStr === 'string' ? JSON.parse(canvasStr) : canvasStr
      for (const [, node] of Object.entries(
        canvas as Record<string, any>
      )) {
        const name = (node as any).type?.resolvedName ?? ''
        if (
          name.includes('ProductsGridBlock') ||
          name.includes('ProductsListBlock') ||
          name.includes('ProductsMasonryBlock')
        ) {
          return (node as any).props?.products ?? []
        }
      }
      return []
    } catch {
      return []
    }
  }

  const saveProductsToStore = async (updatedProducts: any[]) => {
    if (!store) return
    try {
      const canvas =
        typeof store.config_json?.canvas === 'string'
          ? JSON.parse(store.config_json.canvas)
          : store.config_json?.canvas

      let productNodeId: string | null = null
      for (const [nodeId, node] of Object.entries(
        canvas as Record<string, any>
      )) {
        const name = (node as any).type?.resolvedName ?? ''
        if (
          name.includes('ProductsGridBlock') ||
          name.includes('ProductsListBlock') ||
          name.includes('ProductsMasonryBlock')
        ) {
          productNodeId = nodeId
          break
        }
      }

      if (!productNodeId) {
        throw new Error(
          'No product block found. Add a products section in the builder first.'
        )
      }

      ;(canvas as Record<string, any>)[productNodeId].props.products =
        updatedProducts

      const { error: updateError } = await supabase
        .from('stores')
        .update({
          config_json: {
            ...store.config_json,
            canvas,
          },
        })
        .eq('id', store.id)

      if (updateError) throw updateError

      setRefetchKey((prev) => prev + 1)
    } catch (err) {
      throw err
    }
  }

  // ── Handlers ─────────────────────────────────────────────

  const handleSaveProduct = async () => {
    if (!newProduct.name.trim() || !newProduct.price.trim()) {
      setError('Name and price are required')
      return
    }
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      let updatedProducts: any[]
      if (editingIndex !== null) {
        updatedProducts = [...products]
        updatedProducts[editingIndex] = newProduct
      } else {
        updatedProducts = [...products, newProduct]
      }

      await saveProductsToStore(updatedProducts)

      setNewProduct({
        name: '',
        desc: '',
        price: '',
        emoji: '📦',
        imageUrl: '',
        stock: 0,
        sku: '',
        available: true,
      })
      setEditingIndex(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message ?? 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelProduct = () => {
    setNewProduct({
      name: '',
      desc: '',
      price: '',
      emoji: '📦',
      imageUrl: '',
      stock: 0,
      sku: '',
      available: true,
    })
    setEditingIndex(null)
  }

  const handleEditProduct = (index: number) => {
    setNewProduct(products[index])
    setEditingIndex(index)
  }

  const handleRemoveProduct = async (index: number) => {
    try {
      const updatedProducts = products.filter((_, i) => i !== index)
      await saveProductsToStore(updatedProducts)
    } catch (err: any) {
      setError(err.message ?? 'Failed to remove product')
    }
  }

  // ── Early returns ─────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ padding: 40, color: '#888', fontSize: 14 }}>
        Loading...
      </div>
    )
  }

  if (!store) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: '#888', marginBottom: 16 }}>
          No store found. Create your store first.
        </p>
        <Link
          href="/dashboard/onboarding"
          style={{
            background: '#2d5be3',
            color: 'white',
            padding: '10px 24px',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 700,
          }}
        >
          Create store →
        </Link>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 4,
            color: '#111',
            letterSpacing: -0.5,
          }}
        >
          Products
        </h1>
        <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
          {products.length} items in your catalog
        </p>
      </div>

      {/* Success / Error banners */}
      {success && (
        <div
          style={{
            background: 'rgba(24,185,106,0.1)',
            border: '1px solid rgba(24,185,106,0.3)',
            color: '#18b96a',
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          ✓ Product saved successfully
        </div>
      )}
      {error && (
        <div
          style={{
            background: 'rgba(232,96,26,0.1)',
            border: '1px solid rgba(232,96,26,0.3)',
            color: '#e8601a',
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Product grid or empty state */}
      {products.length === 0 ? (
        <div
          style={{
            background: 'white',
            border: '1px solid rgba(17,17,20,0.06)',
            borderRadius: 16,
            padding: 60,
            textAlign: 'center',
            maxWidth: 400,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: '#f8f5ef',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: 32,
            }}
          >
            📦
          </div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 8,
              color: '#111',
            }}
          >
            No products yet
          </h3>
          <p
            style={{
              color: '#888',
              fontSize: 14,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Add your first product using the builder, or edit directly here.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {products.map((p: any, i: number) => (
            <div
              key={i}
              style={{
                background: 'white',
                border: '1px solid rgba(17,17,20,0.06)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              {/* Product image / emoji */}
              <div
                style={{
                  height: 120,
                  background: '#f8f5ef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : p.emoji ? (
                  <span style={{ fontSize: 48 }}>{p.emoji}</span>
                ) : (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#bbb"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                )}
              </div>

              {/* Product info */}
              <div style={{ padding: 16 }}>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 4,
                    color: '#111',
                  }}
                >
                  {p.name}
                </h3>
                <p
                  style={{
                    color: '#888',
                    fontSize: 12,
                    margin: '0 0 12px 0',
                    lineHeight: 1.4,
                  }}
                >
                  {p.desc || 'No description'}
                </p>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: '#2d5be3',
                    }}
                  >
                    {p.price} TND
                  </span>
                  <span
                    style={{
                      background: p.available ? '#18b96a20' : '#e8601a20',
                      color: p.available ? '#18b96a' : '#e8601a',
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {p.available ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                {p.stock !== undefined && (
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>
                    Stock: {p.stock}
                  </div>
                )}
                {p.sku && (
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                    SKU: {p.sku}
                  </div>
                )}

                {/* Edit / Remove buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: '1px solid rgba(17,17,20,0.06)',
                  }}
                >
                  <button
                    onClick={() => handleEditProduct(i)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 6,
                      border: '1px solid rgba(45,91,227,0.2)',
                      background: 'rgba(45,91,227,0.06)',
                      color: '#2d5be3',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveProduct(i)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 6,
                      border: '1px solid rgba(232,96,26,0.2)',
                      background: 'rgba(232,96,26,0.06)',
                      color: '#e8601a',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Open builder link */}
      <Link
        href="/editor"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 32,
          background: '#2d5be3',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 8,
          fontWeight: 600,
          textDecoration: 'none',
          fontSize: 14,
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Manage in builder
      </Link>

      {/* Edit Product Modal */}
      {editingIndex !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              width: '100%',
              maxWidth: 480,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            }}
          >
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 24,
                color: '#111',
              }}
            >
              Edit Product
            </h2>

            {/* Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Name *</label>
              <input
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                placeholder="Product name"
                style={inputStyle}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Description</label>
              <textarea
                value={newProduct.desc}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, desc: e.target.value })
                }
                placeholder="Short description"
                style={{ ...inputStyle, height: 80, resize: 'vertical' }}
              />
            </div>

            {/* Price */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Price (TND) *</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                placeholder="0.00"
                style={inputStyle}
              />
            </div>

            {/* Emoji */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Emoji</label>
              <input
                value={newProduct.emoji}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, emoji: e.target.value })
                }
                placeholder="📦"
                maxLength={2}
                style={{ ...inputStyle, textAlign: 'center', fontSize: 20 }}
              />
            </div>

            {/* Image URL */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Image URL (optional)</label>
              <input
                value={newProduct.imageUrl}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, imageUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                style={inputStyle}
              />
            </div>

            {/* SKU */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>SKU</label>
              <input
                value={newProduct.sku}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, sku: e.target.value })
                }
                placeholder="ABC-123"
                style={inputStyle}
              />
            </div>

            {/* Stock */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Stock</label>
              <input
                type="number"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
                min={0}
                style={inputStyle}
              />
            </div>

            {/* Available */}
            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#333',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={newProduct.available}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      available: e.target.checked,
                    })
                  }
                />
                Available for purchase
              </label>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={handleCancelProduct} style={cancelBtnStyle}>
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={saving || !newProduct.name || !newProduct.price}
                style={{
                  ...saveBtnStyle,
                  opacity:
                    saving || !newProduct.name || !newProduct.price ? 0.6 : 1,
                  cursor:
                    saving || !newProduct.name || !newProduct.price
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#333',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #ddd',
  fontSize: 14,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

const cancelBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 6,
  border: '1px solid #ddd',
  background: 'white',
  color: '#666',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}

const saveBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 6,
  background: '#2d5be3',
  color: 'white',
  border: 'none',
  fontSize: 13,
  fontWeight: 600,
}