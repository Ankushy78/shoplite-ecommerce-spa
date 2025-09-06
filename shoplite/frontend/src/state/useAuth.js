import { useSyncExternalStore } from 'react'
import { jwtDecode } from "jwt-decode";


const store = {
  state: {
    token: localStorage.getItem('token'),
    user: localStorage.getItem('token') ? jwtDecode(localStorage.getItem('token')) : null,
  },
  listeners: new Set(),
}

function setState(partial) {
  store.state = { ...store.state, ...partial }
  store.listeners.forEach(l => l())
}

export default function useAuth() {
  const snapshot = () => store.state
  const subscribe = (l) => { store.listeners.add(l); return () => store.listeners.delete(l) }
  const { token, user } = useSyncExternalStore(subscribe, snapshot, snapshot)

  function login(token) {
    localStorage.setItem('token', token)
    setState({ token, user: jwtDecode(token) })
  }
  function logout() {
    localStorage.removeItem('token')
    setState({ token: null, user: null })
  }
  return { token, user, login, logout }
}
