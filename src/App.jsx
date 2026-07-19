import { useState, useEffect, lazy, Suspense } from 'react'
import all from './i18n/translations'

function useLang() {
  var r = useState('zh');
  var l = r[0];
  var s = r[1];
  useEffect(function() {
    s(localStorage.getItem('lang') || 'zh');
    var h = function() { s(localStorage.getItem('lang') || 'zh') };
    window.addEventListener('langchange', h);
    return function() { window.removeEventListener('langchange', h) }
  }, []);
  return l
}
import BorderGlow from './BorderGlow'
import useAnimations from './hooks/useAnimations'
import ProjectModal from './components/ProjectModal'
import ProjectDetail from './components/ProjectDetail'
import LanguageSwitcher from './components/LanguageSwitcher'
import ContactForm from './components/ContactForm'
import ArticlesSection from './components/ArticlesSection'
import { getProjects } from './lib/supabase'
const AdminPanel = lazy(() => import('./admin/AdminPanel'))
import { recordVisit } from './lib/supabase'

// ====== App ======
function App() {
  useEffect(function() {
    // Ensure body is scrollable
    function fixScroll() {
      if (getComputedStyle(document.body).overflowY === 'hidden') {
        document.body.style.setProperty('overflow-y', 'auto', 'important')
      }
    }
    fixScroll()
    var mo = new MutationObserver(fixScroll)
    mo.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    setTimeout(function() { mo.disconnect() }, 5000)
    return function() { mo.disconnect() }
  }, [])
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    // Hash-based admin routing
    const checkHash = () => setShowAdmin(window.location.hash === "#/admin")
    checkHash()
    window.addEventListener('hashchange', checkHash)
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  const [projectSlug, setProjectSlug] = useState(null)
  const allProjects = projects

  useEffect(() => {
    const checkHash = () => {
      const m = window.location.hash.match(/^#\/project\/(.+)/)
      setProjectSlug(m ? m[1] : null)
    }
    window.addEventListener('hashchange', checkHash)
    checkHash()
    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  useEffect(() => {
    // Track page visit (only on public site)
    if (!showAdmin) recordVisit(window.location.pathname || "/")
  }, [showAdmin])

  useAnimations()

    if (projectSlug) {
    return <ProjectDetail projects={allProjects} placeholder={projectSlug} onBack={() => { window.location.hash = ''; setProjectSlug(null) }} />
  }

  if (showAdmin) {
      const url = import.meta.env.VITE_SUPABASE_URL
      if (!url) {
        return (
          <div className="admin-panel" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#0a0a0a",color:"#e8e8e8",fontFamily:"'Inter','Noto Sans SC',sans-serif",flexDirection:"column",gap:"20px",padding:"40px",textAlign:"center"}}>
            <h1 style={{fontSize:"1.8rem",fontWeight:700,color:"#fff"}}>设置尚未完成</h1>
            <p style={{color:"#888",maxWidth:500,lineHeight:1.8,fontSize:"0.9rem"}}>请在项目根目录创建 <code style={{background:"rgba(255,255,255,0.08)",padding:"3px 8px",borderRadius:4,fontSize:"0.82rem"}}>.env</code> 文件，设置 Supabase 资源链接。</p>
            <p style={{color:"#666",fontSize:"0.82rem"}}>完成后重新构建项目即可使用管理后台。</p>
            <a href="/" style={{color:"#1AC2D9",fontSize:"0.85rem",marginTop:"12px",transition:"color 0.2s"}}>← 返回网站</a>
          </div>
        )
      }
      return <AdminPanel onExit={() => { window.location.hash = ""; setShowAdmin(false) }} />
    }

  return (
    <>
      <Navbar />
      <Hero />
      <div className="section-divider" />
      <About />
      <div className="section-divider" />
      <Projects />
      <div className="section-divider" />
      <ArticlesSection />
      <Skills />
      <div className="section-divider" />
      <Contact />
    </>
  )
}

export default App

// ====== Navbar ======
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const closeMenu = () => setMenuOpen(false)
  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <a href="#" className="navbar-logo">Kai V</a>
        <div className="navbar-links">
          <a href="#about">关于我</a>
          <a href="#projects">作品</a>
          <a href="#skills">能力</a>
          <a href="#contact" className="nav-cta-btn">联系</a>
          <LanguageSwitcher />
        </div>
        <button
          className={`mobile-menu-btn${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="菜单"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
      <div className={`mobile-overlay${menuOpen ? ' open' : ''}`}>
        <a href="#about" onClick={closeMenu}>关于我</a>
        <a href="#projects" onClick={closeMenu}>作品</a>
        <a href="#skills" onClick={closeMenu}>能力</a>
        <a href="#contact" onClick={closeMenu} className="nav-cta-btn">联系</a>
      </div>
    </nav>
  )
}

// ====== Hero ======
function Hero() {
  const [lang, setLang] = useState('zh')
  useEffect(function() { setLang(localStorage.getItem('lang') || 'zh'); var h = function() { setLang(localStorage.getItem('lang') || 'zh') }; window.addEventListener('langchange', h); return function() { window.removeEventListener('langchange', h) } }, [])
  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="hero-glow-core" />
        <div className="hero-glow-ring" />
        <div className="hero-grid" />
      </div>
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="hero-line hero-line-top">{all[lang]?.hero?.visual || "视觉"}</span>
          <span className="hero-ampersand">&</span>
          <span className="hero-line hero-line-bottom">{all[lang]?.hero?.aiDesigner || "AI 设计师"}</span>
        </h1>
        <p className="hero-desc">在创意与技术的交汇处，打造品牌形象、数字体验与 AI 驱动的视觉系统</p>
        <div className="hero-actions">
          <a href="#projects" className="btn-primary">查看作品</a>
          <a href="#contact" className="btn-outline">联系我</a>
        </div>
      </div>
      <div className="scroll-indicator">SCROLL</div>
    </section>
  )
}

// ====== About ======
function About() {
  var l = useLang()
  return (
    <section className="section" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-avatar-wrapper">
            <div className="about-avatar">
              <img src="/avatar.png" alt="Kai V" className="about-avatar-img" />
            </div>
            <div className="about-avatar-ring" />
          </div>
          <div className="about-content">
            <p className="section-label">{all[l]?.about?.label || "关于我"}</p>
            <h2>{all[l]?.about?.hello || "你好，我是"} <span className="accent-gradient">Kai V</span></h2>
            <p className="about-role">{all[l]?.about?.role || "视觉设计师 / AI 设计师 / 品牌设计师"}</p>
            <p className="about-text">
              我是一位跨学科设计师，热衷于创造有意义的视觉体验。
              凭借在品牌设计、数字设计和新兴 AI 技术领域的深厚背景，
              我帮助品牌和产品以清晰的视觉语言、情感共鸣和设计目的传递其故事。
            </p>
            <div className="about-stats">
              {[
                { number: '5+', label: all[l]?.about?.exp || '年从业经验' },
                { number: '40+', label: all[l]?.about?.projects || '完成项目' },
                { number: '20+', label: all[l]?.about?.clients || '合作客户' },
              ].map((s, i) => (
                <BorderGlow key={i} edgeSensitivity={30} glowColor="186 80 50" backgroundColor="#0a0a0a" borderRadius={14} glowRadius={35} glowIntensity={0.7} coneSpread={25} animated={false} colors={['#1AC2D9', '#0E99AC', '#5FCCDB']} fillOpacity={0.3}>
                  <div className="stat-card-inner">
                    <div className="stat-number">{s.number}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                </BorderGlow>
              ))}
            </div>
            <div className="about-contact-row">
              <span className="contact-chip">busyyd@gmail.com</span>
              <span className="contact-chip">130 1808 9503</span>
              <span className="contact-chip">中国 · 武汉</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ====== Projects Data ======
const projects = [
  { tag: '品牌设计', title: 'NEURA — AI 品牌识别系统', desc: '为 AI 初创公司打造完整的品牌识别设计，涵盖标志、色彩系统、字体排版及应用规范。', image_url: 'https://image.pollinations.ai/prompt/NEURA_AI_brand_identity_system_modern_minimal_corporate_design_concept_800x500?width=800&height=500',
  placeholder: 'NEURA' },
  { tag: '数字设计', title: 'LUMINA — 互动展览体验', desc: '沉浸式数字展览体验，将生成式视觉与实体空间交互融为一体。', image_url: 'https://image.pollinations.ai/prompt/LUMINA_interactive_digital_exhibition_immersive_light_installation_800x500?width=800&height=500',
  placeholder: 'LUMINA' },
  { tag: 'AI 设计', title: 'SYNAPSE — AI 产品界面', desc: '为 AI 驱动的创意助手提供端到端产品设计，从用户研究到高保真原型。', image_url: 'https://image.pollinations.ai/prompt/SYNAPSE_AI_product_interface_modern_ui_design_futuristic_800x500?width=800&height=500',
  placeholder: 'SYNAPSE' },
  { tag: '视觉设计', title: 'AETHER — 视觉识别系统', desc: '为一家进入亚洲市场的科技奢侈品牌打造视觉识别与活动设计。', image_url: 'https://image.pollinations.ai/prompt/AETHER_luxury_technology_brand_visual_identity_elegant_800x500?width=800&height=500',
  placeholder: 'AETHER' },
  { tag: '品牌设计', title: 'VERIDIAN — 品牌焕新项目', desc: '为可持续材料企业进行全面的品牌重塑，包括策略、识别系统与环境空间设计。', image_url: 'https://image.pollinations.ai/prompt/VERIDIAN_sustainable_materials_brand_design_organic_green_800x500?width=800&height=500',
  placeholder: 'VERIDIAN' },
];

// ====== Projects ======
function Projects() {
  var l = useLang()
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeFilter, setActiveFilter] = useState('全部')
  const [supabaseProjects, setSupabaseProjects] = useState([])
  useEffect(() => {
    getProjects().then(setSupabaseProjects).catch(() => {})
  }, [])
  return (
    <section className="section" id="projects">
      <div className="container">
        <p className="section-label">{all[l]?.projects?.label || "精选作品"}</p>
        <h2 className="section-title">{all[l]?.projects?.title || "代表"} <span className="accent-gradient">{all[l]?.projects?.word || "项目"}</span></h2>
        <p className="section-subtitle">精选了一系列涵盖品牌识别、数字体验和 AI 驱动设计系统的代表作品。</p>
        <div className="projects-grid">
          {projects.filter(p => activeFilter === '全部' || p.tag === activeFilter).concat(supabaseProjects.filter(p => activeFilter === '全部' || p.tag === activeFilter)).map((p, i) => (
            <div className="project-card" key={i} onClick={() => setSelectedProject(p)}>
              <div className="project-image">
                <div className="project-image-placeholder">{p.placeholder}</div>
              </div>
              <div className="project-info">
                <span className="project-tag">{p.tag}</span>
                <h3 className="project-title">{p.titlee}</h3>
                <p className="project-desc">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


// ====== Skills Data ======
const skills = [
  { icon: '+', title: '品牌设计', desc: '从品牌定位到视觉系统的战略性品牌开发，打造在每个触点都能产生共鸣的品牌形象。', tags: ['标志设计', '视觉识别', '品牌规范', '字体排版'] },
  { icon: '*', title: '视觉设计', desc: '通过布局、色彩、图像和动效打造高冲击力的视觉叙事，以精准的美学提升品牌质感。', tags: ['版式设计', '海报设计', '动态图形', '插画'] },
  { icon: '#', title: 'AI 设计', desc: '面向 AI 时代的设计——为智能产品和生成式工具打造直观的界面与视觉语言。', tags: ['AI 产品设计', '提示工程', '生成式艺术', 'UI/UX'] },
  { icon: '@', title: '数字产品', desc: '面向网页和移动平台的端到端产品设计，关注可用性、可访问性和愉悦的交互体验。', tags: ['UI 设计', 'UX 研究', '原型设计', '设计系统'] },
  { icon: '%', title: '设计策略', desc: '通过策略性设计思维将创意愿景与商业目标对齐，以设计驱动可衡量的影响力。', tags: ['设计思维', '工作坊引导', '创意指导', '艺术指导'] },
  { icon: '>', title: '新兴技术', desc: '探索设计技术的前沿——从 AR/VR 到生成式 AI 界面和计算设计。', tags: ['AR/VR 设计', '生成式设计', '创意编程', '3D 设计'] },
];

// ====== Skills ======
function Skills() {
  var l = useLang()
  return (
    <section className="section" id="skills">
      <div className="container">
        <p className="section-label">{all[l]?.skills?.label || "专业能力"}</p>
        <h2 className="section-title">{all[l]?.skills?.title || "我的"} <span className="accent-gradient">{all[l]?.skills?.advantage || "优势"}</span></h2>
        <p className="section-subtitle">将设计工艺与新兴技术相融合，在 AI 日益增强的世界中创造脱颖而出的作品。</p>
        <div className="skills-grid">
          {skills.map((s, i) => (
            <div className="skill-card" key={i}>
              <div className="skill-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="skill-tags">
                {s.tags.map((t, j) => (
                  <span className="skill-tag" key={j}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ====== Contact ======
function Contact() {
  var l = useLang()
  return (
    <section className="contact-section" id="contact">
      <div className="contact-bg">
        <div className="contact-gradient" />
        <div className="hero-grid" style={{ maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)' }} />
      </div>
      <div className="contact-content">
        <p className="section-label">{all[l]?.contact?.label || "联系我"}</p>
        <h2 className="section-title">
          {all[l]?.contact?.title1 || "一起创造"} <span className="accent-gradient">{all[l]?.contact?.adjective || "非凡"}</span> 的作品
        </h2>
        <p className="section-subtitle">
          我始终对新的合作机会和创意挑战保持开放。
          无论你有项目想要讨论，还是只想打个招呼——我都很期待收到你的消息。
        </p>
        <div className="contact-buttons">
          <a href="mailto:busyyd@gmail.com" className="btn-primary">{all[l]?.contact?.sendMail || "发送邮件"}</a>
          <a href="./resume.pdf" className="btn-outline" target="_blank" rel="noopener noreferrer">{all[l]?.contact?.downloadResume || "下载简历"}</a>
        </div>
        <ContactForm />
        <div className="contact-links">
          <a href="https://www.instagram.com/" className="contact-link" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            Instagram
          </a>
          <span className="contact-divider" />
          <a href="https://www.douyin.com/" className="contact-link" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            抖音
          </a>
          <span className="contact-divider" />
          <a href="https://www.xiaohongshu.com/" className="contact-link" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><circle cx="12" cy="12" r="10"/><text x="12" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#050505">R</text></svg>
            小红书
          </a>
          <span className="contact-divider" />
          <a href="https://www.youtube.com/" className="contact-link" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            YouTube
          </a>
          <span className="contact-divider" />
          <a href="https://github.com/" className="contact-link" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
        </div>
      </div>
      <p className="contact-footer">&copy; 2026 Kai V. All rights reserved.</p>
    </section>
  )
}
