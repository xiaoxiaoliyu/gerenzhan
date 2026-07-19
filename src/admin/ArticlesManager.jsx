import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function ArticlesManager() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', cover_url: '', tags: '', published: false })

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false })
    setArticles(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNew = () => {
    setForm({ title: '', slug: '', excerpt: '', content: '', cover_url: '', tags: '', published: false })
    setEdit('new')
  }

  const openEdit = (a) => {
    setForm({ title: a.title, slug: a.slug, excerpt: a.excerpt || '', content: a.content || '', cover_url: a.cover_url || '', tags: (a.tags || []).join(', '), published: a.published })
    setEdit(a.id)
  }

  const handleSave = async () => {
    if (!form.title || !form.slug) return
    const data = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] }
    if (edit === 'new') {
      await supabase.from('articles').insert([{ ...data, created_at: new Date().toISOString() }])
    } else {
      await supabase.from('articles').update({ ...data, updated_at: new Date().toISOString() }).eq('id', edit)
    }
    setEdit(null)
    await load()
  }

  const handleDelete = async (id) => {
    if (!confirm('确定删除？')) return
    await supabase.from('articles').delete().eq('id', id)
    await load()
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>文章管理</h2>
        <button className="admin-btn-primary" onClick={openNew}>+ 写文章</button>
      </div>
      {loading ? <div className="admin-empty">加载中...</div> : articles.length === 0
        ? <div className="admin-empty">还没有文章</div>
        : <table className="admin-table"><thead><tr><th>标题</th><th>状态</th><th>日期</th><th>操作</th></tr></thead><tbody>{articles.map(a => (
          <tr key={a.id}><td>{a.title}</td><td>{a.published ? <span className="tag" style={{background:"rgba(26,194,217,0.08)",color:"#1AC2D9"}}>已发布</span> : <span className="tag" style={{background:"rgba(255,255,255,0.05)",color:"#888"}}>草稿</span>}</td><td style={{fontSize:"0.78rem",color:"#555"}}>{new Date(a.created_at).toLocaleDateString()}</td>
          <td><div className="actions"><button className="admin-btn admin-btn-sm" onClick={() => openEdit(a)}>编辑</button><button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDelete(a.id)}>删除</button></div></td></tr>
        ))}</tbody></table>}

      {edit && (
        <div className="admin-modal-overlay" onClick={() => setEdit(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()} style={{maxWidth:"700px"}}>
            <h3>{edit === 'new' ? '写文章' : '编辑文章'}</h3>
            <div className="form-group"><label>标题</label><input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} /></div>
            <div className="form-row"><div className="form-group"><label>URL 标识 (slug)</label><input value={form.slug} onChange={e => setForm(p => ({...p, slug: e.target.value}))} placeholder="my-article" /></div>
            <div className="form-group"><label>标签 (逗号分隔)</label><input value={form.tags} onChange={e => setForm(p => ({...p, tags: e.target.value}))} placeholder="设计, AI, 案例" /></div></div>
            <div className="form-group"><label>摘要</label><textarea value={form.excerpt} onChange={e => setForm(p => ({...p, excerpt: e.target.value}))} rows={2} /></div>
            <div className="form-group"><label>内容 (Markdown)</label><textarea value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))} rows={8} style={{fontFamily:"monospace"}} /></div>
            <div className="form-group"><label>封面图 URL</label><input value={form.cover_url} onChange={e => setForm(p => ({...p, cover_url: e.target.value}))} /></div>
            <div className="form-group"><label><input type="checkbox" checked={form.published} onChange={e => setForm(p => ({...p, published: e.target.checked}))} /> 发布</label></div>
            <div className="modal-actions">
              <button className="admin-btn" onClick={() => setEdit(null)}>取消</button>
              <button className="admin-btn-primary" onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}