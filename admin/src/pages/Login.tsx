import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const navigate = useNavigate()

  function submit(e: any) {
    e.preventDefault()
    // Minimal auth: set a flag in localStorage
    if (user && pass) {
      localStorage.setItem('oc_auth', '1')
      navigate('/dashboard')
    }
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-serif font-medium text-text-primary mb-2">Admin Login</h1>
      <p className="text-text-secondary mb-4">Sign in to access the Originyx Content Engine</p>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm text-text-primary mb-1">Email</label>
          <input value={user} onChange={e => setUser(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md" />
        </div>
        <div>
          <label className="block text-sm text-text-primary mb-1">Password</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full px-3 py-2 border border-border rounded-md" />
        </div>
        <div className="pt-2">
          <button className="bg-accent text-white px-4 py-2 rounded-md">Sign in</button>
        </div>
      </form>
    </div>
  )
}
