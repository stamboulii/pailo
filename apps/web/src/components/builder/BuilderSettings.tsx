'use client'

import { useEditor } from '@craftjs/core'
import { useState } from 'react'
import React from 'react'

// ─────────────────────────────────────────────────────────────
// BLOCK CATALOGUE — every block the user can drag into canvas
// Each entry has:
//   label     — display name
//   icon      — emoji shown in the card
//   desc      — one-line description
//   element   — React element to inject when clicked/dragged
// ─────────────────────────────────────────────────────────────

// We import lazily to avoid circular deps — the block components
// are already registered in RESOLVER in sections.ts
const BLOCK_CATALOGUE = [
  {
    group: 'Header',
    blocks: [
      { label: 'Dark Header',    icon: '🌑', desc: 'Dark navbar with cart button',       resolvedName: 'HeaderDarkBlock'    },
      { label: 'Minimal Header', icon: '⬜', desc: 'Clean white header, simple links',   resolvedName: 'HeaderMinimalBlock' },
      { label: 'Bold Header',    icon: '🔵', desc: 'Coloured header with pill CTA',      resolvedName: 'HeaderBoldBlock'    },
    ],
  },
  {
    group: 'Hero',
    blocks: [
      { label: 'Dark Hero',       icon: '🌌', desc: 'Dark gradient, centered text',       resolvedName: 'HeroDarkBlock'       },
      { label: 'Split Hero',      icon: '🪟', desc: 'Text left, image/video right',       resolvedName: 'HeroSplitBlock'      },
      { label: 'Fullwidth Hero',  icon: '🎬', desc: 'Full-width with overlay & video',    resolvedName: 'HeroFullwidthBlock'  },
    ],
  },
  {
    group: 'Products',
    blocks: [
      { label: '3-col Grid',      icon: '⊞',  desc: 'Classic 3-column product cards',    resolvedName: 'ProductsGridBlock'    },
      { label: 'List view',       icon: '☰',  desc: 'Horizontal product list with desc',  resolvedName: 'ProductsListBlock'    },
      { label: 'Dark Masonry',    icon: '⬛', desc: 'Dark 2-column masonry layout',       resolvedName: 'ProductsMasonryBlock' },
    ],
  },
  {
    group: 'About',
    blocks: [
      { label: 'Split About',     icon: '🖼', desc: 'Text + side image, with stats',      resolvedName: 'AboutSplitBlock'     },
      { label: 'Centered About',  icon: '💛', desc: 'Centered story with icon badges',    resolvedName: 'AboutCenteredBlock'  },
      { label: 'Dark Stats',      icon: '📊', desc: 'Blue banner with stat numbers',      resolvedName: 'AboutDarkBlock'      },
    ],
  },
  {
    group: 'Footer',
    blocks: [
      { label: 'Simple Footer',   icon: '—',  desc: 'Minimal one-line dark footer',       resolvedName: 'FooterDarkBlock'    },
      { label: '4-col Footer',    icon: '⋮⋮', desc: 'Four columns with links',            resolvedName: 'FooterColumnsBlock' },
      { label: 'Light Footer',    icon: '☀️', desc: 'Clean light footer with links',      resolvedName: 'FooterMinimalBlock' },
    ],
  },
  {
    group: 'CTA',
    blocks: [
      { label: 'CTA Banner',      icon: '📢', desc: 'Coloured banner with a message',     resolvedName: 'CTABlock'           },
    ],
  },
]

// ─────────────────────────────────────────────────────────────
// BLOCK GROUPS — which resolvedNames are "singleton" per group
// If the user drops a Header, any existing Header variant is removed first.
// Same for Hero, Footer. Products/About/CTA can stack.
// ─────────────────────────────────────────────────────────────
const SINGLETON_GROUPS: Record<string, string[]> = {
  HeaderDarkBlock:    ['HeaderDarkBlock', 'HeaderMinimalBlock', 'HeaderBoldBlock'],
  HeaderMinimalBlock: ['HeaderDarkBlock', 'HeaderMinimalBlock', 'HeaderBoldBlock'],
  HeaderBoldBlock:    ['HeaderDarkBlock', 'HeaderMinimalBlock', 'HeaderBoldBlock'],
  HeroDarkBlock:      ['HeroDarkBlock', 'HeroSplitBlock', 'HeroFullwidthBlock'],
  HeroSplitBlock:     ['HeroDarkBlock', 'HeroSplitBlock', 'HeroFullwidthBlock'],
  HeroFullwidthBlock: ['HeroDarkBlock', 'HeroSplitBlock', 'HeroFullwidthBlock'],
  FooterDarkBlock:    ['FooterDarkBlock', 'FooterColumnsBlock', 'FooterMinimalBlock'],
  FooterColumnsBlock: ['FooterDarkBlock', 'FooterColumnsBlock', 'FooterMinimalBlock'],
  FooterMinimalBlock: ['FooterDarkBlock', 'FooterColumnsBlock', 'FooterMinimalBlock'],
}

// ─────────────────────────────────────────────────────────────
// DRAGGABLE BLOCK CARD
// Uses Craft.js `connectors.create` to register a drag source.
// On drop OR click: removes existing same-group block first,
// then adds the new one — so headers/heroes/footers always replace.
// ─────────────────────────────────────────────────────────────
function BlockCard({
  label, icon, desc, resolvedName,
}: {
  label: string
  icon: string
  desc: string
  resolvedName: string
}) {
  const { connectors, query, actions } = useEditor()

  // Remove any existing node that belongs to the same singleton group
  const removeExistingInGroup = () => {
    const siblings = SINGLETON_GROUPS[resolvedName]
    if (!siblings) return
    const nodes = query.getNodes()
    Object.entries(nodes).forEach(([nodeId, node]) => {
      const name = (node as any).data?.type?.resolvedName
        ?? (node as any).data?.displayName
        ?? ''
      if (siblings.includes(name) && nodeId !== 'ROOT') {
        try { actions.delete(nodeId) } catch { /* already gone */ }
      }
    })
  }

  // Register as a drag source
  // We wrap the create callback to remove existing blocks first
  const setRef = (el: HTMLDivElement | null) => {
    if (!el) return
    try {
      const resolver = query.getOptions().resolver
      const Component = resolver[resolvedName]
      if (!Component) return
      connectors.create(
        el,
        React.createElement(Component),
        {
          onCreate: () => {
            // Called after the node is dropped — remove duplicate
            removeExistingInGroup()
          },
        }
      )
    } catch {
      // resolver not ready yet
    }
  }

  // Click to add (with duplicate removal)
  const handleClick = () => {
    try {
      const resolver = query.getOptions().resolver
      const Component = resolver[resolvedName]
      if (!Component) return

      // Remove existing singleton first
      removeExistingInGroup()

      // Add new block to ROOT canvas
      const nodeTree = query
        .parseReactElement(React.createElement(Component))
        .toNodeTree()
      actions.addNodeTree(nodeTree, 'ROOT')
    } catch (e) {
      console.warn('Could not add block:', e)
    }
  }

  return (
    <div
      ref={setRef}
      onClick={handleClick}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        padding: '10px 12px',
        marginBottom: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'grab',
        transition: 'background 0.15s, border-color 0.15s',
        userSelect: 'none',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(45,91,227,0.12)'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(45,91,227,0.35)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'
      }}
      title={`Drag onto canvas to add ${label}`}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 7, flexShrink: 0,
        background: 'rgba(45,91,227,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'white', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
          {label}
        </div>
        <div style={{
          color: 'rgba(255,255,255,0.35)', fontSize: 10,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {desc}
        </div>
      </div>
      {/* Drag handle indicator */}
      <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, flexShrink: 0 }}>
        ⠿
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// BLOCKS TAB CONTENT
// ─────────────────────────────────────────────────────────────
export  function BlocksTab() {
  const [search, setSearch] = useState('')
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(
    // all groups open by default
    Object.fromEntries(BLOCK_CATALOGUE.map(g => [g.group, true]))
  )

  const toggleGroup = (group: string) =>
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }))

  const filtered = search.trim()
    ? BLOCK_CATALOGUE.map(g => ({
        ...g,
        blocks: g.blocks.filter(
          b =>
            b.label.toLowerCase().includes(search.toLowerCase()) ||
            b.desc.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(g => g.blocks.length > 0)
    : BLOCK_CATALOGUE

  return (
    <div style={{ padding: 12 }}>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <span style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.25)', fontSize: 12,
        }}>
          🔍
        </span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search blocks..."
          style={{
            width: '100%', padding: '8px 10px 8px 30px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6, color: 'white', fontSize: 12,
            fontFamily: 'inherit', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{
        fontSize: 9, fontFamily: 'monospace', letterSpacing: 2,
        color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
        marginBottom: 12,
      }}>
        Drag onto canvas to add
      </div>

      {/* Groups */}
      {filtered.map(group => (
        <div key={group.group} style={{ marginBottom: 8 }}>
          {/* Group header */}
          <div
            onClick={() => toggleGroup(group.group)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '6px 8px', borderRadius: 6, cursor: 'pointer',
              background: 'rgba(255,255,255,0.03)',
              marginBottom: openGroups[group.group] ? 6 : 0,
            }}
          >
            <span style={{
              fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase', letterSpacing: 1,
            }}>
              {group.group}
            </span>
            <span style={{
              color: 'rgba(255,255,255,0.25)', fontSize: 10,
              transition: 'transform 0.15s',
              transform: openGroups[group.group] ? 'rotate(0deg)' : 'rotate(-90deg)',
              display: 'inline-block',
            }}>
              ▾
            </span>
          </div>

          {/* Block cards */}
          {openGroups[group.group] && group.blocks.map(block => (
            <BlockCard key={block.resolvedName} {...block} />
          ))}
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center', color: 'rgba(255,255,255,0.2)',
          fontSize: 12, marginTop: 32,
        }}>
          No blocks found
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN BUILDER SETTINGS COMPONENT
// ─────────────────────────────────────────────────────────────
export default function BuilderSettings() {
  const { selected, actions } = useEditor((state) => {
    const nodeId = state.events.selected
      ? [...state.events.selected][0]
      : null

    if (!nodeId || !state.nodes[nodeId]) {
      return { selected: null }
    }

    const node = state.nodes[nodeId]
    return {
      selected: {
        nodeId,
        name:     node.data.displayName,
        Settings: node.related?.settings as React.ComponentType | undefined,
        props:    node.data.props as Record<string, any>,
      },
    }
  })

  const [activeTab, setActiveTab] = useState<'properties' | 'blocks' | 'ai'>('properties')

  const [productModal, setProductModal] = useState(false)
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null)
  const [newProduct, setNewProduct] = useState({
    name: '', desc: '', price: '', emoji: '📦',
    imageUrl: '', stock: 0, sku: '', available: true,
  })

  const resetProduct = () => ({
    name: '', desc: '', price: '', emoji: '📦',
    imageUrl: '', stock: 0, sku: '', available: true,
  })

  // Switch to Properties tab automatically when a block is selected
  // (keeps context — user clicks block, panel shows its props)

  // ── Product handlers ──────────────────────────────────────

  const handleSaveProduct = () => {
    if (!selected?.nodeId) return
    const products: any[] = Array.isArray(selected.props?.products)
      ? selected.props.products : []
    const updated = editingProductIndex !== null
      ? products.map((p, i) => (i === editingProductIndex ? newProduct : p))
      : [...products, newProduct]
    actions.setProp(selected.nodeId, (p: any) => { p.products = updated })
    setProductModal(false)
    setNewProduct(resetProduct())
    setEditingProductIndex(null)
  }

  const handleCancelProduct = () => {
    setProductModal(false)
    setNewProduct(resetProduct())
    setEditingProductIndex(null)
  }

  const handleEditProduct = (index: number) => {
    const products: any[] = selected?.props?.products ?? []
    if (!products[index]) return
    setNewProduct(products[index])
    setEditingProductIndex(index)
    setProductModal(true)
  }

  const handleRemoveProduct = (index: number) => {
    if (!selected?.nodeId) return
    const products: any[] = selected?.props?.products ?? []
    const updated = products.filter((_, i) => i !== index)
    actions.setProp(selected.nodeId, (p: any) => { p.products = updated })
  }

  // ── Tab labels ────────────────────────────────────────────

  const TABS = [
    { id: 'properties' as const, label: 'Properties' },
    // { id: 'blocks'     as const, label: 'Blocks'     },
    { id: 'ai'         as const, label: '✦ AI'       },
  ]

  return (
    <div style={{
      background: '#13131d',
      borderLeft: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
    }}>

      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        {TABS.map(tab => (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: '9px', textAlign: 'center',
              fontSize: 10, fontWeight: 700, cursor: 'pointer',
              color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.25)',
              borderBottom: activeTab === tab.id
                ? '2px solid #2d5be3' : '2px solid transparent',
              transition: 'color 0.15s',
            }}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* ── PROPERTIES TAB ── */}
      {activeTab === 'properties' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {selected ? (
            <>
              {/* Block name badge */}
              <div style={{
                fontSize: 8, fontFamily: 'monospace', letterSpacing: 1.5,
                color: '#2d5be3', textTransform: 'uppercase', marginBottom: 12,
              }}>
                {selected.name}
              </div>

              {/* Block's own settings (HeroDarkSettings, etc.) */}
              {selected.Settings && <selected.Settings />}

              {/* Products section */}
              {Array.isArray(selected.props?.products) && (
                <div style={{
                  marginTop: 24, paddingTop: 16,
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
                    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
                  }}>
                    Products
                  </div>

                  <button
                    onClick={() => { setNewProduct(resetProduct()); setEditingProductIndex(null); setProductModal(true) }}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 6,
                      background: '#2d5be3', color: 'white', border: 'none',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', marginBottom: 10,
                    }}
                  >
                    + Add Product
                  </button>

                  {(selected.props.products as any[]).map((prod: any, index: number) => (
                    <div key={index} style={{
                      background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                      padding: '10px 12px', marginBottom: 6,
                      display: 'flex', alignItems: 'center', gap: 10,
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}>
                      <div style={{ fontSize: 20, flexShrink: 0 }}>{prod.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 700, fontSize: 12, color: 'white',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {prod.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#2d5be3', fontWeight: 700 }}>
                          {prod.price} TND
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => handleEditProduct(index)}
                          style={{ width: 26, height: 26, borderRadius: 5, background: 'rgba(45,91,227,0.15)', color: '#2d5be3', border: 'none', cursor: 'pointer', fontSize: 11 }}>
                          ✏️
                        </button>
                        <button onClick={() => handleRemoveProduct(index)}
                          style={{ width: 26, height: 26, borderRadius: 5, background: 'rgba(232,96,26,0.15)', color: '#e8601a', border: 'none', cursor: 'pointer', fontSize: 11 }}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{
              fontSize: 12, color: 'rgba(255,255,255,0.18)',
              textAlign: 'center', marginTop: 48, lineHeight: 1.6,
            }}>
              Click a block<br />to edit its properties
            </div>
          )}
        </div>
      )}

      {/* ── BLOCKS TAB ── */}
      {activeTab === 'blocks' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <BlocksTab />
        </div>
      )}

      {/* ── AI TAB ── */}
      {activeTab === 'ai' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.6 }}>
              AI suggestions<br />coming soon
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCT MODAL ── */}
      {productModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'white', borderRadius: 12, padding: 24,
            width: '100%', maxWidth: 400,
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, color: '#111' }}>
              {editingProductIndex !== null ? 'Edit Product' : 'Add Product'}
            </h2>

            <Field label="Name *" value={newProduct.name}
              onChange={v => setNewProduct({ ...newProduct, name: v })} />
            <Field label="Description" value={newProduct.desc} textarea
              onChange={v => setNewProduct({ ...newProduct, desc: v })} />
            <Field label="Price (TND) *" value={newProduct.price} type="number"
              onChange={v => setNewProduct({ ...newProduct, price: v })} />
            <Field label="Emoji" value={newProduct.emoji} maxLength={2} center
              onChange={v => setNewProduct({ ...newProduct, emoji: v })} />
            <Field label="Image URL (optional)" value={newProduct.imageUrl}
              onChange={v => setNewProduct({ ...newProduct, imageUrl: v })} />
            <Field label="SKU" value={newProduct.sku}
              onChange={v => setNewProduct({ ...newProduct, sku: v })} />
            <Field label="Stock" value={String(newProduct.stock)} type="number"
              onChange={v => setNewProduct({ ...newProduct, stock: parseInt(v) || 0 })} />

            <label style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, color: '#333', marginBottom: 20, cursor: 'pointer',
            }}>
              <input type="checkbox" checked={newProduct.available}
                onChange={e => setNewProduct({ ...newProduct, available: e.target.checked })} />
              Available for purchase
            </label>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={handleCancelProduct} style={{
                padding: '9px 18px', borderRadius: 6, border: '1px solid #ddd',
                background: 'white', color: '#666', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button onClick={handleSaveProduct}
                disabled={!newProduct.name || !newProduct.price}
                style={{
                  padding: '9px 18px', borderRadius: 6, background: '#2d5be3',
                  color: 'white', border: 'none', fontSize: 13, fontWeight: 700,
                  cursor: !newProduct.name || !newProduct.price ? 'not-allowed' : 'pointer',
                  opacity: !newProduct.name || !newProduct.price ? 0.6 : 1,
                }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Reusable form field ───────────────────────────────────────

function Field({
  label, value, onChange, type = 'text',
  textarea = false, maxLength, center = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  textarea?: boolean
  maxLength?: number
  center?: boolean
}) {
  const base: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 6,
    border: '1px solid #ddd', fontSize: 14,
    fontFamily: 'inherit', boxSizing: 'border-box',
    textAlign: center ? 'center' : 'left',
    marginBottom: 14,
  }
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#555', marginBottom: 5 }}>
        {label}
      </div>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          style={{ ...base, height: 72, resize: 'vertical' }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          maxLength={maxLength} style={base} />
      )}
    </div>
  )
}