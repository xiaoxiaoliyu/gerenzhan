import { useState, useEffect } from 'react'
import BorderGlow from './BorderGlow'
import useAnimations from './hooks/useAnimations'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight - 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <a href="#" className="navbar-logo">Kai V</a>
        <div className="navbar-links">
          <a href="#about">关于我</a>
          <a href="#projects">作品</a>
          <a href="#skills">能力</a>
          <a href="#contact">联系</a>
        </div>
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg">
        <div className="hero-glow-core" />
        <div className="hero-glow-ring" />
        <div className="hero-glow-ring-2" />
        <div className="hero-grid" />
      </div>

      <div className="hero-content">
        <h1 className="hero-title">
          <span className="hero-line hero-line-top">视觉</span>
          <span className="hero-ampersand-wrapper">
            <span className="hero-ampersand">&</span>
          </span>
          <span className="hero-line hero-line-bottom">AI 设计师</span>
        </h1>
        <p className="hero-desc">
          在创意与技术的交汇处，打造品牌形象、数字体验与 AI 驱动的视觉系统
        </p>
        <div className="hero-actions">
          <a href="#projects" className="btn-primary">查看作品</a>
          <a href="#contact" className="btn-outline">联系我</a>
        </div>
      </div>

      <div className="scroll-indicator">SCROLL</div>
    </section>
  )
}

function About() {
  const stats = [
    { number: '5+', label: '年从业经验' },
    { number: '40+', label: '完成项目' },
    { number: '20+', label: '合作客户' },
  ]
  return (
    <section className="section" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-avatar-wrapper">
            <div className="about-avatar">
              <span className="about-avatar-placeholder">KV</span>
            </div>
            <div className="about-avatar-ring" />
          </div>
          <div className="about-content">
            <p className="section-label">关于我</p>
            <h2>
              你好，我是 <span className="accent-gradient">Kai V</span>
            </h2>
            <p className="about-role">视觉设计师 / AI 设计师 / 品牌设计师</p>
            <p className="about-text">
              我是一位跨学科设计师，热衷于创造有意义的视觉体验。
              凭借在品牌设计、数字设计和新兴 AI 技术领域的深厚背景，
              我帮助品牌和产品以清晰的视觉语言、情感共鸣和设计目的传递其故事。
            </p>
            <div className="about-stats">
              {stats.map((s, i) => (
                <BorderGlow
                  key={i}
                  edgeSensitivity={30}
                  glowColor="160 60 45"
                  backgroundColor="#0a0a0a"
                  borderRadius={16}
                  glowRadius={40}
                  glowIntensity={0.8}
                  coneSpread={25}
                  animated={false}
                  colors={['#6ee7b7', '#22d3ee', '#818cf8']}
                  fillOpacity={0.3}
                >
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

const projects = [
  {
    tag: '品牌设计',
    title: 'NEURA — AI 品牌识别系统',
    desc: '为 AI 初创公司打造完整的品牌识别设计，涵盖标志、色彩系统、字体排印及应用规范。',
    placeholder: 'NEURA',
  },
  {
    tag: '数字设计',
    title: 'LUMINA — 互动展览体验',
    desc: '沉浸式数字展览体验，将生成式视觉与实体空间交互融为一体。',
    placeholder: 'LUMINA',
  },
  {
    tag: 'AI 设计',
    title: 'SYNAPSE — AI 产品界面',
    desc: '为 AI 驱动的创意助手提供端到端产品设计，从用户研究到高保真原型。',
    placeholder: 'SYNAPSE',
  },
  {
    tag: '视觉设计',
    title: 'AETHER — 视觉识别系统',
    desc: '为一家进入亚洲市场的科技奢侈品牌打造视觉识别与活动设计。',
    placeholder: 'AETHER',
  },
  {
    tag: '品牌设计',
    title: 'VERIDIAN — 品牌焕新项目',
    desc: '为可持续材料企业进行全面的品牌重塑，包括策略、识别系统与环境空间设计。',
    placeholder: 'VERIDIAN',
  },
]

function Projects() {
  return (
    <section className="section" id="projects">
      <div className="container">
        <p className="section-label">精选作品</p>
        <h2 className="section-title">代表 <span className="accent-gradient">项目</span></h2>
        <p className="section-subtitle">
          精选了一系列涵盖品牌识别、数字体验和 AI 驱动设计系统的代表作品。
        </p>
        <div className="projects-grid">
          {projects.map((p, i) => (
            <div className="project-card" key={i}>
              <div className="project-image">
                <div className="project-image-placeholder">{p.placeholder}</div>
              </div>
              <div className="project-info">
                <span className="project-tag">{p.tag}</span>
                <h3 className="project-title">{p.title}</h3>
                <p className="project-desc">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const skills = [
  {
    icon: '+',
    title: '品牌设计',
    desc: '从品牌定位到视觉系统的战略性品牌开发，打造在每个触点上都能产生共鸣的品牌形象。',
    tags: ['标志设计', '视觉识别', '品牌规范', '字体排印'],
  },
  {
    icon: '*',
    title: '视觉设计',
    desc: '通过布局、色彩、图像和动效打造高冲击力的视觉叙事，以精准的美学提升品牌质感。',
    tags: ['版式设计', '海报设计', '动态图形', '插画'],
  },
  {
    icon: '#',
    title: 'AI 设计',
    desc: '面向 AI 时代的设计——为智能产品和生成式工具打造直观的界面与视觉语言。',
    tags: ['AI 产品设计', '提示工程', '生成式艺术', 'UI/UX'],
  },
  {
    icon: '@',
    title: '数字产品',
    desc: '面向网页和移动平台的端到端产品设计，关注可用性、可访问性和愉悦的交互体验。',
    tags: ['UI 设计', 'UX 研究', '原型设计', '设计系统'],
  },
  {
    icon: '%',
    title: '设计策略',
    desc: '通过策略性设计思维将创意愿景与商业目标对齐，以设计驱动可衡量的影响力。',
    tags: ['设计思维', '工作坊引导', '创意指导', '艺术指导'],
  },
  {
    icon: '>',
    title: '新兴技术',
    desc: '探索设计技术的前沿——从 AR/VR 到生成式 AI 界面和计算设计。',
    tags: ['AR/VR 设计', '生成式设计', '创意编程', '3D 设计'],
  },
]

function Skills() {
  return (
    <section className="section" id="skills">
      <div className="container">
        <p className="section-label">专业能力</p>
        <h2 className="section-title">我的 <span className="accent-gradient">优势</span></h2>
        <p className="section-subtitle">
          将设计工艺与新兴技术相融合，在 AI 日益增强的世界中创造脱颖而出的作品。
        </p>
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

function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-bg">
        <div className="contact-gradient" />
        <div className="hero-grid" style={{ maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)' }} />
      </div>
      <div className="contact-content">
        <p className="section-label">联系我</p>
        <h2 className="section-title">
          一起创造 <span className="accent-gradient">非凡</span> 的作品
        </h2>
        <p className="section-subtitle">
          我始终对新的合作机会和创意挑战保持开放。
          无论你有项目想要讨论，还是只是想打个招呼——我都很期待收到你的消息。
        </p>
        <div className="contact-buttons">
          <a href="mailto:busyyd@gmail.com" className="btn-primary">发送邮件</a>
          <a href="#" className="btn-outline">下载简历</a>
        </div>
        <div className="contact-links">
          <a href="#" className="contact-link">Behance</a>
          <span className="contact-divider" />
          <a href="#" className="contact-link">Dribbble</a>
          <span className="contact-divider" />
          <a href="#" className="contact-link">LinkedIn</a>
          <span className="contact-divider" />
          <a href="#" className="contact-link">Instagram</a>
          <span className="contact-divider" />
          <a href="#" className="contact-link">GitHub</a>
        </div>
      </div>
      <p className="contact-footer">&copy; 2026 Kai V. All rights reserved.</p>
    </section>
  )
}

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <div className="section-divider" />
      <About />
      <div className="section-divider" />
      <Projects />
      <div className="section-divider" />
      <Skills />
      <div className="section-divider" />
      <Contact />
    </>
  )
}

export default App