import { useState, useEffect } from 'react'
import { getProjects, createProject, updateProject, deleteProject } from '../lib/supabase'
import ImageUploader from '../components/ImageUploader'

const TAGS = ['品牌设计', '数字设计', 'AI 设计', '视觉设计']

export default function ProjectsManager() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)
  const [form, setForm] = useState({ title: '', tag: '', description: '', placeholder: '', image_url: '', sort_order: 0 })

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await getProjects()
      setProjects(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadProjects() }, [])

  const openNew = () => {
    setForm({ title: '', tag: TAGS[0], description: '', placeholder: '', image_url: '', sort_order: projects.length })
    setEditing('new')
  }

  const openEdit = (p) => {
    setForm({ title: p.title, tag: p.tag, description: p.description || '', placeholder: p.placeholder || '', image_url: p.image_url || '', sort_order: p.sort_order || 0 })
    setEditing(p.id)
  }

  const handleSave = async () => {
    if (!form.title || !form.tag) return
    setSaving(true)
    try {
      if (editing === 'new') {
        await createProject(form)
      } else {
        await updateProject(editing, form)
      }
      setEditing(null)
      await loadProjects()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDrop = async (fromIdx, toIdx, items, setItems, setDragIdx) => {
    if (fromIdx === null || fromIdx === toIdx) { setDragIdx(null); return }
    const newItems = [...items]
    const [removed] = newItems.splice(fromIdx, 1)
    newItems.splice(toIdx, 0, removed)
    setItems(newItems)
    setDragIdx(null)
    for (let j = 0; j < newItems.length; j++) {
      try { await updateProject(newItems[j].id, { sort_order: j }) } catch(e) {}
    }
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`确定删除「${title}」？`)) return
    try {
      await deleteProject(id)
      await loadProjects()
    } catch (err) { console.error(err) }
  }

  const handleImageUpload = (url) => {
    setForm(prev => ({ ...prev, image_url: url }))
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2>作品管理</h2>
        <button className="admin-btn-primary" onClick={openNew}>+ 新增作品</button>
      </div>

      {loading ? (
        <div className="admin-empty">加载中...</div>
      ) : projects.length === 0 ? (
        <div className="admin-empty">还没有作品，点击上方按钮添加</div>
      ) : (
        <table className="admin-table">
          <thead><tr><th>序号</th><th>标题</th><th>分类</th><th>图片</th><th>操作</th></tr></thead>
          <tbody>
            {projects.map((p, i) => (
              <tr key={p.id} draggable style={{cursor:"grab"}} onDragStart={() => setDragIdx(i)} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(dragIdx, i, projects, setProjects, setDragIdx)}>
                <td style={{color:"#666"}}>{i + 1}</td>
                <td>{p.title}</td>
                <td><span className="tag">{p.tag}</span></td>
                <td>{p.image_url ? <span style={{color:"#1AC2D9",fontSize:"0.78rem"}}>✓ 已上传</span> : <span style={{color:"#666",fontSize:"0.78rem"}}>-未上传</span>}</td>
                <td><div className="actions"><button className="admin-btn admin-btn-sm" onClick={() => openEdit(p)}>编辑</button><button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDelete(p.id, p.title)}>删除</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Edit/New Modal */}
      {editing && (
        <div className="admin-modal-overlay" onClick={() => setEditing(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editing === 'new' ? '新增作品' : '编辑作品'}</h3>
            <div className="form-group"><label>标题</label><input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="项目名称" /></div>
            <div className="form-row">
              <div className="form-group"><label>分类</label><select value={form.tag} onChange={e => setForm(p => ({...p, tag: e.target.value}))}>{TAGS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div className="form-group"><label>展示缩写</label><input value={form.placeholder} onChange={e => setForm(p => ({...p, placeholder: e.target.value}))} placeholder="如 NEURA" /></div>
            </div>
            <div className="form-group"><label>描述</label><textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="项目简介" /></div>
            <div className="form-group"><label>项目图片</label><ImageUploader onUpload={handleImageUpload} currentUrl={form.image_url} /></div>
            <div className="modal-actions">
              <button className="admin-btn" onClick={() => setEditing(null)}>取消</button>
              <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? "保存中..." : "保存"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}