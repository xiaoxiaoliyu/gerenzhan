import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// ── Projects API ──
export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getProject(id) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createProject(project) {
  const { data, error } = await supabase
    .from('projects')
    .insert([{ ...project, updated_at: new Date().toISOString() }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProject(id, updates) {
  const { data, error } = await supabase
    .from('projects')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteProject(id) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}

// ── Image Upload ──
export async function uploadImage(file, bucket = 'project-images') {
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })
  if (error) throw error
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)
  return { path: data.path, url: publicUrl }
}

// ── Page Visits (Analytics) ──
export async function recordVisit(path) {
  try {
    await supabase.from('page_visits').insert([{
      path,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent?.substring(0, 255) || null,
      session_id: sessionStorage.getItem('session_id') || (() => {
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)
        sessionStorage.setItem('session_id', id)
        return id
      })(),
    }])
  } catch (e) {
    // silently fail - analytics shouldn't break the site
  }
}

export async function getVisitStats(days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data, error } = await supabase
    .from('page_visits')
    .select('*')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getVisitSummary() {
  const all = await getVisitStats(30)
  const total = all.length
  const unique = new Set(all.map(v => v.session_id)).size
  const today = all.filter(v => new Date(v.created_at).toDateString() === new Date().toDateString()).length
  const byPath = {}
  all.forEach(v => { byPath[v.path] = (byPath[v.path] || 0) + 1 })
  const topPaths = Object.entries(byPath).sort((a, b) => b[1] - a[1]).slice(0, 10)
  const daily = {}
  all.forEach(v => {
    const d = v.created_at?.substring(0, 10)
    if (d) daily[d] = (daily[d] || 0) + 1
  })
  const dailyChart = Object.entries(daily).sort((a, b) => a[0].localeCompare(b[0])).slice(-14)
  return { total, unique, today, topPaths, dailyChart }
}

// ── Auth ──
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(!!session)
  })
}
// ── Messages (Contact Form) ──
export async function submitMessage({ name, email, message }) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{ name, email, message }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getMessages() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function markMessageRead(id) {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', id)
  if (error) throw error
}

export async function deleteMessage(id) {
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', id)
  if (error) throw error
}
// ── Articles (Blog) ──
export async function getArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getArticle(slug) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error) throw error
  return data
}

// ── Site Settings ──
export async function getSiteSettings() {
  const { data, error } = await supabase.from('site_settings').select('settings').eq('id', 1).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.settings || {}
}

export async function saveSiteSettings(settings) {
  const { data, error } = await supabase.from('site_settings').upsert({ id: 1, settings, updated_at: new Date().toISOString() }).select().single();
  if (error) throw error;
  return data
}
