  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const order = orders.find((o) => o.id === orderId)
    const isConfirm = newStatus === 'confirmed' && order

    if (isConfirm) {
      const items = (order.items_json ?? []) as any[]
      const stockUpdates = items
        .map((it) => ({ id: it.id, qty: typeof it.quantity === 'number' ? it.quantity : 1 }))
        .filter((it) => it.id)

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, confirmed_at: new Date().toISOString() })
        .eq('id', orderId)

      if (error) {
        console.error('Failed to confirm order:', error)
        return
      }

      if (stockUpdates.length) {
        const promises = stockUpdates.map((it) =>
          (supabase as any).rpc('decrement_stock', {
            p_product_id: it.id,
            p_qty: it.qty,
            p_store_id: order.store_id,
          }),
        )
        const results = await Promise.all(promises)
        const rpcError = results.find((r: any) => r.error)
        if (rpcError?.error) {
          console.error('Failed to decrement stock via RPC, fallback...', rpcError.error)
          const fallback = stockUpdates.map((it) =>
            supabase
              .from('products')
              .update({ stock: Math.max(0, it.qty) })
              .eq('id', it.id)
              .eq('store_id', order.store_id)
              .neq('stock', 0),
          )
          const fbResults = await Promise.all(fallback)
          const fbError = fbResults.find((r: any) => r.error)
          if (fbError?.error) {
            console.error('Fallback stock update failed:', fbError.error)
          }
        }
      }
    } else {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) {
        console.error('Failed to update status:', error)
        return
      }
    }

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }
