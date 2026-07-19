import React, { useState, useEffect } from 'react'
import { supabase, signOut, onAuthChange, getVisitSummary } from '../lib/supabase'
import AdminLogin from './AdminLogin'
import ProjectsManager from './ProjectsManager'
import MessagesManager from './MessagesManager'
import ArticlesManager from './ArticlesManager'
import SettingsManager from './SettingsManager'
import './admin.css'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const s = await getVisitSummary(days)
        setStats(s)
      } catch(e) { console.error(e) }
      finally { setLoading(false) }
    })()
  }, [days])

  if (loading) return <div className="admin-empty">加载中...</div>
  if (!stats) return <div className="admin-empty">暂无数据</div>

  const dayFilters = [
    { label: "7天", value: 7 },
    { label: "30天", value: 30 },
    { label: "90天", value: 90 },
  ]

  return (
    <div className="admin-section">
      <h2>数据概览</h2>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {dayFilters.map(f => (
          <button key={f.value} className={`admin-btn${days === f.value ? " admin-btn-primary" : ""}`} onClick={() => setDays(f.value)}>{f.label}</button>
        ))}
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="number">{stats.today}</div><div className="label">今日访问</div></div>
        <div className="stat-card"><div className="number">{stats.unique}</div><div className="label">独立访客</div></div>
        <div className="stat-card"><div className="number">{stats.total}</div><div className="label">{days}天总访问</div></div>
        <div className="stat-card"><div className="number">{Math.round(stats.total / Math.max(days, 1))}</div><div className="label">日均访问</div></div>
      </div>
      {stats.dailyChart.length > 0 && (
        <div className="stat-chart">
          <h3>访问趋势</h3>
          {(() => {
            const max = Math.max(...stats.dailyChart.map(d => d[1]), 1)
            return stats.dailyChart.map(([date, count]) => (
            <div className="chart-bar" key={date}>
              <span className="label">{date.substring(5)}</span>
              <div className="fill" style={{width: (count / max * 100) + '%'}} />
              <span className="count">{count}</span>
            </div>
            ))
          })()}</div>
      )}
      {stats.dailyChart.length > 7 && (function() {
        var weekly = {};
        stats.dailyChart.forEach(function(d) {
          var w = d[0].substring(0, 7);
          weekly[w] = (weekly[w] || 0) + d[1];
        });
        var wd = Object.entries(weekly);
        var maxW = Math.max.apply(null, wd.map(function(d) { return d[1] }), 1);
        return (
          React.createElement('div', {className:'stat-chart',key:'weekly'},
            React.createElement('h3', null, '\u5468\u5ea6\u8d8b\u52bf'),
            wd.map(function(d) {
              return React.createElement('div', {className:'chart-bar',key:d[0]},
                React.createElement('span', {className:'label'}, d[0]),
                React.createElement('div', {className:'fill',style:{width:(d[1]/maxW*100)+'%',background:'linear-gradient(90deg,var(--primary),var(--primary-light))'}}),
                React.createElement('span', {className:'count'}, String(d[1]))
              );
            })
          )
        );
      })()}
      {stats.topPaths.length > 0 && (
        <div className="top-paths">
          <h3>热门页面</h3>
          {stats.topPaths.map(([p, c]) => (
            <div className="path-row" key={p}><span className="path">{p || "/"}</span><span className="count">{c}</span></div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminPanel({ onExit }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [view, setView] = useState('dashboard')
  const [user, setUser] = useState(null)

  useEffect(() => {
    const { data: listener } = onAuthChange((authed) => {
      setAuthenticated(authed)
      if (authed) {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
      }
    })
        supabase.auth.getSession()
          .then(({ data }) => {
            if (data?.session) {
              setAuthenticated(true)
              setUser(data.session.user)
            }
          })
          .catch(() => { console.warn("Supabase not configured") })
          .finally(() => {
            setChecking(false)
          })
        return () => listener?.subscription?.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await signOut()
    setAuthenticated(false)
    setUser(null)
    onExit()
  }

  if (checking) return <div className="admin-panel"><div className="admin-empty">加载中...</div></div>
  if (!authenticated) return <AdminLogin onLogin={() => setAuthenticated(true)} />

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Kai V <span>Admin</span></h1>
        <div className="admin-header-right">
          {user && <span>{user.email}</span>}
          <button className={`admin-btn${view === "dashboard" ? " admin-btn-primary" : ""}`} onClick={() => setView("dashboard")}>数据报表</button>
          <button className={`admin-btn${view === "projects" ? " admin-btn-primary" : ""}`} onClick={() => setView("projects")}>作品管理</button>
          <button className={`admin-btn${view === "messages" ? " admin-btn-primary" : ""}`} onClick={() => setView("messages")}>留言管理</button>
          <button className={`admin-btn${view === "articles" ? " admin-btn-primary" : ""}`} onClick={() => setView("articles")}>文章管理</button>
          <button className={`admin-btn${view === "settings" ? " admin-btn-primary" : ""}`} onClick={() => setView("settings")}>网站设置</button>
          <button className="admin-btn admin-btn-danger" onClick={handleLogout}>退出</button>
          <a href="/" onClick={e => { e.preventDefault(); onExit() }} className="admin-back-link">← 返回网站</a>
        </div>
      </div>
      <div className="admin-body">
        {view === 'dashboard' && <Dashboard />}
        {view === 'projects' && <ProjectsManager />}
        {view === 'messages' && <MessagesManager />}
        {view === 'articles' && <ArticlesManager />}
        {view === 'settings' && <SettingsManager />}
      </div>
    </div>
  )
}