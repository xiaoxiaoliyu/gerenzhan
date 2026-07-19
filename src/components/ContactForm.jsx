import { useState } from 'react'
import { submitMessage } from '../lib/supabase'
import all from '../i18n/translations'

export default function ContactForm() {
  const [f, setF] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [errMsg, setErrMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!f.name || !f.email || !f.message) return
    setStatus('sending')
    try {
      await submitMessage(f)
      setStatus('success')
      window.open('mailto:busyyd@gmail.com?subject=Portfolio%20Message%20from%20' + encodeURIComponent(f.name) + '&body=' + encodeURIComponent(f.message), '_blank')
      setF({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus('error')
      setErrMsg(err.message || '发送失败')
    }
  }

  const sentText = status === 'sending' ? '发送中...' : '发送消息'

  return (
    <div className="contact-form-wrapper">
      <h3 className="form-title">{(()=>{try{var l=localStorage.getItem('lang')||'zh';return all[l]?.contact?.formTitle||'给我留言'}catch(e){return '给我留言'}})()}</h3>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <input type="text" placeholder="您的姓名" value={f.name} onChange={e => setF(p => ({...p, name: e.target.value}))} required />
          <input type="email" placeholder="您的邮箱" value={f.email} onChange={e => setF(p => ({...p, email: e.target.value}))} required />
        </div>
        <textarea placeholder="说点什么..." rows={4} value={f.message} onChange={e => setF(p => ({...p, message: e.target.value}))} required />
        <button type="submit" className="form-submit-btn" disabled={status === "sending"}>{sentText}</button>
        {status === 'success' && <p className="form-feedback success">消息已发送，感谢留言！</p>}
        {status === 'error' && <p className="form-feedback error">{errMsg}</p>}
      </form>
    </div>
  )
}