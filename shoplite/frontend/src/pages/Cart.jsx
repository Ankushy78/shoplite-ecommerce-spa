import React, { useEffect, useState } from 'react'
import api from '../state/api'
import useAuth from '../state/useAuth'

export default function Cart() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const load = async () => {
    if (!user) return
    const { data } = await api.get('/api/cart')
    setItems(data)
  }
  useEffect(()=>{ load() }, [user])

  async function changeQty(itemId, qty) {
    await api.post('/api/cart/update', { itemId, qty })
    load()
  }

  const total = items.reduce((s,i)=> s + i.price * i.qty, 0)

  if (!user) return <div className="max-w-3xl mx-auto p-4"><div className="card"><p>Please log in to view your cart.</p></div></div>

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
      <div className="space-y-3">
        {items.length === 0 && <div className="card">Your cart is empty.</div>}
        {items.map(it => (
          <div key={it.itemId} className="card flex gap-3 items-center">
            <img src={it.image || 'https://picsum.photos/seed/'+it.itemId+'/200/150'} className="w-24 h-16 rounded object-cover"/>
            <div className="flex-1">
              <div className="font-medium">{it.title}</div>
              <div className="text-sm text-gray-500">{it.category}</div>
            </div>
            <div className="w-40 flex items-center gap-2">
              <button className="btn border" onClick={()=>changeQty(it.itemId, it.qty-1)}>-</button>
              <div className="px-3">{it.qty}</div>
              <button className="btn border" onClick={()=>changeQty(it.itemId, it.qty+1)}>+</button>
            </div>
            <div className="w-24 text-right font-semibold">₹{it.price * it.qty}</div>
            <button className="btn border" onClick={()=>changeQty(it.itemId, 0)}>Remove</button>
          </div>
        ))}
      </div>
      <div className="card mt-4 flex items-center justify-between">
        <div className="text-gray-600">Subtotal</div>
        <div className="text-xl font-semibold">₹{total}</div>
      </div>
    </div>
  )
}
