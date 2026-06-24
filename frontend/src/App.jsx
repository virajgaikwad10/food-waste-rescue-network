import React, { useEffect, useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  if (!token || !user) {
    return <Login onAuth={(t, u) => { setToken(t); setUser(u); }} />
  }

  return <Dashboard token={token} user={user} onLogout={() => { setToken(null); setUser(null); }} />
}

export default App
