import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../state/useAuth'
import api from '../state/api'

export default function Login() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value })
  async function onSubmit(e) {
    e.preventDefault()
    setErr('')
    try {
      const { data } = await api.post('/api/auth/login', form)
      login(data.token)
      nav('/')
    } catch (e) {
      setErr(e?.response?.data?.error || 'Login failed')
    }
  }
  return (
    <div className="max-w-md mx-auto mt-10 card">
      <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
      <p className="text-sm text-gray-600 mb-4">Log in to continue</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <div className="label">Email</div>
          <input className="input" name="email" type="email" value={form.email} onChange={onChange} required />
        </div>
        <div>
          <div className="label">Password</div>
          <input className="input" name="password" type="password" value={form.password} onChange={onChange} required />
        </div>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <button className="btn bg-gray-900 text-white w-full">Log in</button>
      </form>
      <p className="text-sm text-gray-600 mt-4">New here? <Link to="/signup" className="link">Create an account</Link></p>
    </div>
  )
}
