import { useState } from 'react'
import { signIn } from '../lib/supabase'

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      onLogin()
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? '邮箱或密码错误' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <h2>后台管理</h2>
        <p className="admin-login-sub">Kai V Portfolio</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="admin-error">{error}</div>}
          <input type="email" placeholder="邮箱" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading} className="admin-btn-primary">{loading ? "登录中..." : "登录"}</button>
        </form>
      </div>
    </div>
  )
}