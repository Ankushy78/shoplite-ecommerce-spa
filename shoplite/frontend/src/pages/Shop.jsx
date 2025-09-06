import React, { useEffect, useMemo, useState } from 'react'
import api from '../state/api'
import useAuth from '../state/useAuth'

function Filters({ onChange, values, categories }) {
  return (
    <div className="card mb-4 grid md:grid-cols-4 gap-3">
      <input className="input" placeholder="Search..." value={values.q} onChange={e=>onChange({ ...values, q: e.target.value })}/>
      <select className="input" value={values.category} onChange={e=>onChange({ ...values, category: e.target.value })}>
        <option value="">All categories</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <input className="input" type="number" placeholder="Min price" value={values.minPrice} onChange={e=>onChange({ ...values, minPrice: e.target.value })} />
      <input className="input" type="number" placeholder="Max price" value={values.maxPrice} onChange={e=>onChange({ ...values, maxPrice: e.target.value })} />
    </div>
  )
}

export default function Shop() {
  const [filters, setFilters] = useState({ q:'', category:'', minPrice:'', maxPrice:'' })
  const [data, setData] = useState({ items: [], total: 0 })
  const [page, setPage] = useState(1)
  const limit = 12
  const { user } = useAuth()

  const categories = useMemo(()=>{
    const set = new Set(data.items.map(i=>i.category).filter(Boolean))
    return Array.from(set)
  }, [data])

  useEffect(()=>{
    const params = new URLSearchParams({ ...filters, page, limit })
    api.get('/api/items?'+params.toString()).then(({data})=> setData(data))
  }, [filters, page])

  async function addToCart(id) {
    if (!user) { alert('Please log in first.'); return; }
    await api.post('/api/cart/add', { itemId: id, qty: 1 })
    alert('Added to cart')
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-semibold">Discover products</h1>
        <p className="text-gray-600">Filter by category or price range</p>
      </div>
      <Filters onChange={setFilters} values={filters} categories={categories}/>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.items.map(it => (
          <div key={it.id} className="card flex flex-col">
            <img src={it.image || 'https://picsum.photos/seed/'+it.id+'/600/400'} alt={it.title} className="rounded-xl mb-3 h-40 object-cover"/>
            <div className="font-medium">{it.title}</div>
            <div className="text-sm text-gray-500 mb-2">{it.category}</div>
            <div className="mt-auto flex items-center justify-between">
              <div className="text-lg font-semibold">₹{it.price}</div>
              <button className="btn bg-indigo-600 text-white" onClick={()=>addToCart(it.id)}>Add</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 mt-6">
        <button className="btn border" onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
        <div className="px-3 py-2">{page}</div>
        <button className="btn border" onClick={()=>setPage(p=>p+1)}>Next</button>
      </div>
    </div>
  )
}
