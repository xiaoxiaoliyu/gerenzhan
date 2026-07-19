import { useEffect, useCallback } from 'react'

export default function ProjectModal({ project, onClose, onPrev, onNext, allProjects }) {
  const h = useCallback((e) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft' && onPrev) onPrev()
    if (e.key === 'ArrowRight' && onNext) onNext()
  }, [onClose, onPrev, onNext])

  useEffect(() => {
    document.addEventListener('keydown', h)
    
    return () => {
      document.removeEventListener('keydown', h)
      
    }
  }, [h])

  if (!project) return null

  const currentIdx = allProjects ? allProjects.findIndex(p => p.title === project.title) : -1
  const total = allProjects ? allProjects.length : 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        {onPrev && <button className="modal-nav modal-prev" onClick={onPrev}>&lsaquo;</button>}
        {onNext && <button className="modal-nav modal-next" onClick={onNext}>&rsaquo;</button>}
        <div className="modal-image">
          {project.image_url
            ? <img src={project.image_url} alt={project.title} />
            : <div className="modal-placeholder">{project.placeholder || project.title}</div>}
        </div>
        <div className="modal-info">
          <div className="modal-meta">
            <span className="project-tag">{project.tag}</span>
            {total > 1 && <span className="modal-counter">{currentIdx + 1} / {total}</span>}
          </div>
          <h2>{project.title}</h2>
          <p>{project.description}</p>
        </div>
      </div>
    </div>
  )
}