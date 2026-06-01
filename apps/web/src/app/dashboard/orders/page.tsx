'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

type Order = {
  id: string
  store_id: string
  customer_name: string | null
  customer_phone: string | null
  customer_email: string | null
  items_json: { name?: string; quantity?: number; price?: number }[]
  total: number
  status: string
  payment_method: string
  created_at: string
}

export default function OrdersPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [store, setStore] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    if (!user) return
    const fetchStore = async () => {
      const { data: storeData } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .single()
      setStore(storeData)
    }
    fetchStore()
  }, [user, supabase])

  useEffect(() => {
    if (!store) return
    const fetchOrders = async () => {
      setLoading(true)
      let query = supabase
        .from('orders')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data } = await query
      setOrders((data || []) as Order[])
      setLoading(false)
    }
    fetchOrders()
  }, [store, filter, supabase])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      console.error('Failed to update status:', error)
      return
    }

    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ))
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const nextStatus = (current: string): string | null => {
    const flow: Record<string, string> = {
      pending: 'confirmed',
      confirmed: 'shipped',
      shipped: 'delivered',
      delivered: 'delivered'
    }
    return flow[current] || null
  }

  const statusColor: Record<string, string> = {
    pending: '#e8601a',
    confirmed: '#18b96a',
    shipped: '#2d5be3',
    delivered: '#888'
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: '#111', letterSpacing: -0.5 }}>
          Orders
        </h1>
        <p style={{ color: '#888', fontSize: 14, margin: 0 }}>
          {orders.length} total orders
        </p>
      </div>

      <div style={{ marginBottom: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid rgba(17,17,20,0.08)',
              background: filter === status ? '#111' : 'white',
              color: filter === status ? 'white' : '#666',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>Loading...</div>
      ) : orders.length === 0 ? (
        <EmptyState />
      ) : (
        <OrdersTable 
          orders={orders} 
          statusColor={statusColor}
          onRowClick={setSelectedOrder}
          onStatusChange={updateOrderStatus}
          nextStatus={nextStatus}
        />
      )}

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder}
          statusColor={statusColor}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={(newStatus: string) => {
            updateOrderStatus(selectedOrder.id, newStatus)
            setSelectedOrder({ ...selectedOrder, status: newStatus })
          }}
          nextStatus={nextStatus}
        />
      )}
    </div>
  )
}

function OrdersTable({ 
  orders, 
  statusColor, 
  onRowClick, 
  onStatusChange, 
  nextStatus 
}: { 
  orders: Order[]
  statusColor: Record<string, string>
  onRowClick: (order: Order) => void
  onStatusChange: (orderId: string, status: string) => void
  nextStatus: (status: string) => string | null
}) {
  return (
    <div style={{ 
      background: 'white', 
      border: '1px solid rgba(17,17,20,0.06)',
      borderRadius: 16, overflow: 'hidden'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ 
            background: '#fafafa', 
            fontSize: 11, 
            color: '#888',
            textTransform: 'uppercase', 
            letterSpacing: 0.5,
            borderBottom: '1px solid rgba(17,17,20,0.06)'
          }}>
            <th style={{ padding: 16, textAlign: 'left', fontWeight: 600 }}>Customer</th>
            <th style={{ padding: 16, textAlign: 'left', fontWeight: 600 }}>Status</th>
            <th style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>Total</th>
            <th style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>Date</th>
            <th style={{ padding: 16, textAlign: 'right', fontWeight: 600 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr 
              key={order.id} 
              onClick={() => onRowClick(order)}
              style={{ 
                borderBottom: '1px solid rgba(17,17,20,0.04)',
                cursor: 'pointer'
              }}
            >
              <td style={{ padding: 16, fontWeight: 600, fontSize: 14, color: '#111' }}>
                {order.customer_name || '—'}
              </td>
              <td style={{ padding: 16 }}>
                <span style={{ 
                  fontSize: 10, 
                  padding: '4px 10px', 
                  borderRadius: 6,
                  fontWeight: 600, 
                  letterSpacing: 0.5,
                  background: `${statusColor[order.status] ?? '#888'}12`,
                  color: statusColor[order.status] ?? '#888'
                }}>
                  {order.status}
                </span>
              </td>
              <td style={{ padding: 16, fontWeight: 700, fontSize: 14, color: '#111', textAlign: 'right' }}>
                {order.total} TND
              </td>
              <td style={{ padding: 16, fontSize: 12, color: '#888', textAlign: 'right' }}>
                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </td>
              <td style={{ padding: 16, textAlign: 'right' }}>
                {nextStatus(order.status) ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onStatusChange(order.id, nextStatus(order.status)!)
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#111',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      textTransform: 'capitalize'
                    }}
                  >
                    Mark {nextStatus(order.status)}
                  </button>
                ) : (
                  <span style={{ color: '#aaa', fontSize: 12 }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function OrderDetailModal({ 
  order, 
  statusColor, 
  onClose, 
  onStatusChange, 
  nextStatus 
}: { 
  order: Order
  statusColor: Record<string, string>
  onClose: () => void
  onStatusChange: (status: string) => void
  nextStatus: (status: string) => string | null
}) {
  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: 16,
          padding: 32,
          maxWidth: 500,
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', margin: 0 }}>Order Details</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#888'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ 
            fontSize: 10, 
            padding: '4px 10px', 
            borderRadius: 6,
            fontWeight: 600, 
            letterSpacing: 0.5,
            background: `${statusColor[order.status] ?? '#888'}12`,
            color: statusColor[order.status] ?? '#888'
          }}>
            {order.status}
          </span>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 8, textTransform: 'uppercase' }}>Customer</h3>
          <p style={{ color: '#111', fontSize: 14, margin: '0 0 4px' }}>{order.customer_name || '—'}</p>
          {order.customer_phone && <p style={{ color: '#666', fontSize: 13, margin: 0 }}>{order.customer_phone}</p>}
          {order.customer_email && <p style={{ color: '#666', fontSize: 13, margin: 0 }}>{order.customer_email}</p>}
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#888', marginBottom: 8, textTransform: 'uppercase' }}>Items</h3>
          <div style={{ border: '1px solid rgba(17,17,20,0.06)', borderRadius: 12, overflow: 'hidden' }}>
            {order.items_json?.map((item, idx) => (
              <div 
                key={idx}
                style={{ 
                  padding: 12,
                  borderBottom: idx !== (order.items_json?.length ?? 0) - 1 ? '1px solid rgba(17,17,20,0.04)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 14
                }}
              >
                <span style={{ color: '#111', fontWeight: 500 }}>{item.name || 'Product'}</span>
                <span style={{ color: '#666' }}>x{item.quantity || 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '16px 0',
          borderTop: '1px solid rgba(17,17,20,0.06)',
          marginBottom: 24
        }}>
          <span style={{ fontSize: 14, color: '#888' }}>Total</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>{order.total} TND</span>
        </div>

        {nextStatus(order.status) ? (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => onStatusChange(nextStatus(order.status)!)}
              style={{
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                background: '#111',
                color: 'white',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              Mark {nextStatus(order.status)}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ 
      background: 'white', 
      border: '1px solid rgba(17,17,20,0.06)',
      borderRadius: 16, padding: 60, textAlign: 'center',
      maxWidth: 400, margin: '0 auto'
    }}>
      <div style={{ 
        width: 72, height: 72, borderRadius: 16, background: '#f8f5ef',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', fontSize: 32
      }}>
        📭
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#111' }}>
        No orders yet
      </h3>
      <p style={{ color: '#888', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
        Share your store link to receive orders
      </p>
    </div>
  )
}