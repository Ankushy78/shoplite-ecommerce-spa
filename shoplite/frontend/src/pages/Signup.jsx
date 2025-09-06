import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../state/api'

export default function Signup() {
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState('')
  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    try {
      const { data } = await api.post('/api/auth/signup', form)
      localStorage.setItem('token', data.token)
      nav('/')
    } catch (e) {
      setErr(e?.response?.data?.error || 'Signup failed')
    }
  }
  return (
    <div className="max-w-md mx-auto mt-10 card">
      <h1 className="text-2xl font-semibold mb-2">Create an account</h1>
      <p className="text-sm text-gray-600 mb-4">Start shopping with ShopLite</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <div className="label">Name</div>
          <input className="input" name="name" value={form.name} onChange={onChange} required />
        </div>
        <div>
          <div className="label">Email</div>
          <input className="input" name="email" type="email" value={form.email} onChange={onChange} required />
        </div>
        <div>
          <div className="label">Password</div>
          <input className="input" name="password" type="password" value={form.password} onChange={onChange} required />
        </div>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="btn bg-gray-900 text-white w-full">Sign up</button>
      </form>
      <p className="text-sm text-gray-600 mt-4">Already have an account? <Link to="/login" className="link">Log in</Link></p>
    </div>
  )
}
