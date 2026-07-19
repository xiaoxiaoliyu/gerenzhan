import { useState, useEffect } from 'react'
import { getArticles } from '../lib/supabase'

function ArticleModal({ article, onClose }) {
  useEffect(() => {
    
    const h = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => {
      
      document.removeEventListener('keydown', h)
    }
  }, [onClose])

  if (!article) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxHeight:"85vh",display:"flex",flexDirection:"column"}}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        <div className="modal-image" style={{aspectRatio:"auto",minHeight:200}}>
          {article.cover_url
            ? <img src={article.cover_url} alt={article.title} style={{objectFit:"cover",width:"100%",height:280}} />
            : <div className="modal-placeholder" style={{height:200,display:"flex",alignItems:"center",justifyContent:"center"}}>{article.title?.substring(0, 2) || "文"}</div>}
        </div>
        <div className="modal-info" style={{overflowY:"auto"}}>
          <div className="modal-meta">
            {article.tags?.map((t, i) => <span key={i} className="project-tag" style={{marginRight:6}}>{t}</span>)}
            <span className="modal-counter" style={{marginLeft:"auto"}}>{new Date(article.created_at).toLocaleDateString("zh-CN")}</span>
          </div>
          <h2>{article.title}</h2>
          {article.content ? (
            <div className="article-body" style={{fontSize:"0.9rem",color:"#999",lineHeight:1.8}}>
              {article.content.split('\n').map((p, i) => p ? <p key={i} style={{marginBottom:12}}>{p}</p> : <br key={i} />)}
            </div>
          ) : (
            <p style={{color:"#777",fontSize:"0.9rem",lineHeight:1.7}}>{article.excerpt || "暂无内容"}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ArticlesSection() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    (async () => {
      try { setArticles(await getArticles()) }
      catch(e) { console.warn('Articles unavailable:', e.message) }
      finally { setLoading(false) }
    })()
  }, [])

  if (loading || articles.length === 0) return null

  return (
    <section className="section" id="articles">
      <div className="container">
        <p className="section-label">文章</p>
        <h2 className="section-title">最新 <span className="accent-gradient">文章</span></h2>
        <div className="projects-grid" style={{marginTop:56}}>
          {articles.map((a, i) => (
            <div key={a.id} className="project-card" onClick={() => setSelected(a)}>
              <div className="project-image">
                {a.cover_url
                  ? <img src={a.cover_url} alt={a.title} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                  : <div className="project-image-placeholder">{a.title?.substring(0, 2)}</div>}
              </div>
              <div className="project-info">
                <h3 className="project-title" style={{fontSize:"1rem",marginBottom:6}}>{a.title}</h3>
                <p className="project-desc">{a.excerpt || a.content?.substring(0, 100) || ""}</p>
                <div style={{display:"flex",gap:6,marginTop:12}}>
                  {a.tags?.slice(0, 3).map((t, j) => <span key={j} className="project-tag">{t}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ArticleModal article={selected} onClose={() => setSelected(null)} />
    </section>
  )
}