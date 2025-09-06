import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import './styles.css'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import Shop from './pages/Shop.jsx'
import Cart from './pages/Cart.jsx'
import useAuth from './state/useAuth.js'

function Nav() {
  const { user, logout } = useAuth()
  return (
    <nav className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-3">
        <Link to="/" className="text-xl font-semibold">ShopLite</Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="link">Shop</Link>
          <Link to="/cart" className="link">Cart</Link>
          {user ? (
            <>
              <span className="text-sm text-gray-600">Hi, {user.name}</span>
              <button onClick={logout} className="btn bg-gray-900 text-white">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn border">Login</Link>
              <Link to="/signup" className="btn bg-gray-900 text-white">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <footer className="text-center text-xs text-gray-500 py-6">© {new Date().getFullYear()} ShopLite</footer>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
