import { useState, useEffect } from 'react'
import { getMessages, markMessageRead, deleteMessage } from '../lib/supabase'

export default function MessagesManager() {
  const [msgs, setMsgs] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try { setLoading(true); setMsgs(await getMessages()) }
    catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleRead = async (id) => {
    await markMessageRead(id)
    setMsgs(prev => prev.map(m => m.id === id ? {...m, read: true} : m))
  }

  const handleDel = async (id) => {
    if (!confirm('确定删除？')) return
    await deleteMessage(id)
    setMsgs(prev => prev.filter(m => m.id !== id))
  }

  return (
    <div className="admin-section">
      <h2>留言管理</h2>
      {loading ? <div className="admin-empty">加载中...</div> : msgs.length === 0
        ? <div className="admin-empty">暂无留言</div>
        : <div className="messages-list">{msgs.map(m => (
            <div key={m.id} className={"message-card" + (m.read ? " read" : "")}>
              <div className="message-header">
                <strong>{m.name}</strong>
                <span className="message-email">{m.email}</span>
                <span className="message-date">{new Date(m.created_at).toLocaleDateString("zh-CN")}</span>
              </div>
              <p className="message-body">{m.message}</p>
              <div className="message-actions">
                {!m.read && <button className="admin-btn admin-btn-sm" onClick={() => handleRead(m.id)}>标记已读</button>}
                <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDel(m.id)}>删除</button>
              </div>
            </div>
        ))}</div>}
    </div>
  )
}