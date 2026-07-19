import { useState, useRef, useEffect } from 'react'
import { useI18n } from '../i18n/index.jsx'

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div ref={ref} style={{position:'relative'}}>
      <button className='lang-btn' onClick={() => setOpen(!open)}>{lang === 'zh' ? '中' : 'EN'}</button>
      {open && (
        <div className='lang-dropdown'>
          <button className={'lang-option' + (lang === 'zh' ? ' active' : '')} onClick={() => { setLang('zh'); setOpen(false) }}>中文</button>
          <button className={'lang-option' + (lang === 'en' ? ' active' : '')} onClick={() => { setLang('en'); setOpen(false) }}>English</button>
        </div>
      )}
    </div>
  )
}