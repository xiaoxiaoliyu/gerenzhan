import { createContext, useContext, useState, useEffect } from 'react'
import all from './translations'
const Ctx = createContext(null)
export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'zh')
  useEffect(() => { localStorage.setItem('lang', lang); document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en' }, [lang])
  const t = (path) => { const keys = path.split('.'); let val = all[lang]; for (const k of keys) if (val) val = val[k]; return val || path }
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}
export function useI18n() { const ctx = useContext(Ctx); if (!ctx) throw new Error('useI18n needs I18nProvider'); return ctx }