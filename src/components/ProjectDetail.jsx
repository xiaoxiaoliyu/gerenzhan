import { useEffect, useCallback } from 'react'

export default function ProjectDetail({ projects, placeholder, onBack }) {
  const idx = projects.findIndex(p => p.placeholder === placeholder)
  const project = projects[idx]
  const total = projects.length

  const goTo = useCallback((delta) => {
    const newIdx = (idx + delta + total) % total
    window.location.hash = "#/project/" + projects[newIdx].placeholder
  }, [idx, projects, total])

  const h = useCallback((e) => {
    if (e.key === 'Escape') onBack()
    if (e.key === 'ArrowLeft') goTo(-1)
    if (e.key === 'ArrowRight') goTo(1)
  }, [onBack, goTo])

  useEffect(() => {
    document.addEventListener('keydown', h)
    
    return () => { document.removeEventListener('keydown', h);  }
  }, [h])

  if (!project) return (
    <div className="detail-page" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",color:"#666"}}>
      <p>项目未找到</p>
      <button className="admin-btn" onClick={onBack} style={{marginLeft:12}}>返回</button>
    </div>
  )

  return (
    <div className="detail-page">
      <div className="detail-header">
        <button className="detail-back" onClick={onBack}>&larr; 返回</button>
        <span className="detail-counter">{idx + 1} / {total}</span>
      </div>
      <div className="detail-hero">
        {project.image_url
          ? <img src={project.image_url} alt={project.title} />
          : <div className="detail-placeholder">{project.placeholder}</div>}
        <div className="detail-hero-overlay">
          <span className="project-tag">{project.tag}</span>
          <h1>{project.title}</h1>
        </div>
      </div>
      <div className="detail-body">
        <p>{project.description}</p>
          {project && project.tags && project.tags.length > 0 && <div style={{display:'flex',gap:8,marginTop:20,flexWrap:'wrap'}}>{project.tags.map(function(t,i){return React.createElement('span',{key:i,className:'project-tag'},t)})}</div>}
        <div className="detail-nav">
          <button className="detail-nav-btn" onClick={() => goTo(-1)}>&larr; 上一个</button>
          <button className="detail-nav-btn" onClick={() => goTo(1)}>下一个 &rarr;</button>
        </div>
      </div>
    </div>
  )
}