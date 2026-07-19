import React, { useState, useEffect } from 'react'
import { getSiteSettings, saveSiteSettings } from '../lib/supabase'

const DEFAULTS = {
  primaryColor: '#1AC2D9',
  accentColor: '#FFC65D',
  fontFamily: 'Inter',
  sectionSpacing: 'normal',
  cardStyle: 'glow',
  showAbout: true,
  showProjects: true,
  showSkills: true,
  showContact: true,
  showArticles: true,
}

function setVal(k, v, old) {
  var n = {}
  for (var key in old) n[key] = old[key]
  n[k] = v
  return n
}

export default function SettingsManager() {
  var [settings, setSettings] = useState(null)
  var [loading, setLoading] = useState(true)
  var [saving, setSaving] = useState(false)
  var [msg, setMsg] = useState('')

  useEffect(function() {
    (async function() {
      try { var s = await getSiteSettings(); setSettings(Object.assign({}, DEFAULTS, s)) }
      catch(e) { setSettings(Object.assign({}, DEFAULTS)) }
      finally { setLoading(false) }
    })()
  }, [])

  function handleSave() {
    setSaving(true); setMsg('')
    (async function() {
      try {
        await saveSiteSettings(settings)
        setMsg('保存成功')
        if (window.__applySettings) window.__applySettings(settings)
      } catch(e) { setMsg('保存失败: ' + e.message) }
      finally { setSaving(false); setTimeout(function() { setMsg('') }, 3000) }
    })()
  }

  function handleReset() { setSettings(Object.assign({}, DEFAULTS)) }

  if (loading) return React.createElement('div', {className:'admin-empty'}, '加载中...')
  if (!settings) return React.createElement('div', {className:'admin-empty'}, '加载失败')

  var checks = ['showAbout','showProjects','showSkills','showContact','showArticles']

  return React.createElement('div', {className:'admin-section'},
    React.createElement('h2', null, '网站设置'),
    React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,maxWidth:600}},
      React.createElement('div', {className:'form-group'}, React.createElement('label', null, '主色'), React.createElement('input', {type:'color',value:settings.primaryColor,onChange:function(e){setSettings(function(p){return setVal('primaryColor',e.target.value,p)})},style:{width:60,height:40,padding:2,borderRadius:6,background:0,border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer'}})),
      React.createElement('div', {className:'form-group'}, React.createElement('label', null, '强调色'), React.createElement('input', {type:'color',value:settings.accentColor,onChange:function(e){setSettings(function(p){return setVal('accentColor',e.target.value,p)})},style:{width:60,height:40,padding:2,borderRadius:6,background:0,border:'1px solid rgba(255,255,255,0.1)',cursor:'pointer'}})),
    ),
    React.createElement('div', {className:'form-group',style:{marginTop:8}}, React.createElement('label', null, '字体'), React.createElement('select', {value:settings.fontFamily,onChange:function(e){setSettings(function(p){return setVal('fontFamily',e.target.value,p)})},style:{maxWidth:280,padding:'8px 12px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#e8e8e8',fontSize:'0.85rem'}}, React.createElement('option',{value:'Inter'},'Inter'), React.createElement('option',{value:'Georgia'},'Georgia (Serif)'), React.createElement('option',{value:'PingFang SC,Microsoft YaHei'},'中文'))),
    React.createElement('div', {className:'form-group'}, React.createElement('label', null, '卡片风格'), React.createElement('select', {value:settings.cardStyle,onChange:function(e){setSettings(function(p){return setVal('cardStyle',e.target.value,p)})},style:{maxWidth:280,padding:'8px 12px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#e8e8e8',fontSize:'0.85rem'}}, React.createElement('option',{value:'glow'},'发光'), React.createElement('option',{value:'border'},'边框'))),
    React.createElement('div', {className:'form-group'}, React.createElement('label', null, '段落间距'), React.createElement('select', {value:settings.sectionSpacing,onChange:function(e){setSettings(function(p){return setVal('sectionSpacing',e.target.value,p)})},style:{maxWidth:280,padding:'8px 12px',borderRadius:8,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:'#e8e8e8',fontSize:'0.85rem'}}, React.createElement('option',{value:'compact'},'紧凑'), React.createElement('option',{value:'normal'},'标准'), React.createElement('option',{value:'spacious'},'宽敞'))),
    React.createElement('div', {style:{marginTop:20,marginBottom:20}}, '模块可见性'),
    React.createElement('div', {style:{display:'flex',flexWrap:'wrap',gap:16,marginBottom:24}},
      checks.map(function(k) {
        return React.createElement('label', {key:k,style:{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:'0.82rem',color:'#aaa'}},
          React.createElement('input', {type:'checkbox',checked:settings[k],onChange:function(e){setSettings(function(p){return setVal(k,e.target.checked,p)})},style:{accentColor:'#1AC2D9'}}),
          k.replace('show',''))
      })
    ),
    React.createElement('div', {style:{display:'flex',gap:12}},
      React.createElement('button', {className:'admin-btn-primary',onClick:handleSave,disabled:saving}, saving ? '保存中...' : '保存设置'),
      React.createElement('button', {className:'admin-btn',onClick:handleReset}, '恢复默认'),
    ),
    msg ? React.createElement('p', {style:{marginTop:12,fontSize:'0.82rem',color:msg.indexOf('失败')>=0?'#ef4444':'var(--primary)'}}, msg) : null,
  )
}