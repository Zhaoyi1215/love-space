import { supabase } from './supabase.js'

// 匿名登录：每个设备/浏览器获得一个稳定身份，无需邮箱
export async function ensureAnonymousUser() {
  const { data: session } = await supabase.auth.getSession()
  if (session?.session?.user) return session.session.user

  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  return data.user
}

// 查询当前用户所属空间（用于"清空缓存后仍能自动进入"）
export async function fetchMyMember() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .maybeSingle()
  if (error) throw error
  return data
}

// 创建空间
export async function createCouple({ nickname, emoji, city, timezone, anniversaryDate }) {
  const { data, error } = await supabase.rpc('create_couple', {
    p_my_nickname: nickname,
    p_my_emoji: emoji,
    p_my_city: city || null,
    p_my_timezone: timezone || null,
    p_anniversary_date: anniversaryDate || null,
  })
  if (error) throw error
  return data
}

// 加入空间
export async function joinCouple({ code, nickname, emoji, city, timezone }) {
  const { data, error } = await supabase.rpc('join_couple', {
    p_code: code,
    p_nickname: nickname,
    p_emoji: emoji,
    p_city: city || null,
    p_timezone: timezone || null,
  })
  if (error) throw error
  return data
}

// 读取情侣空间基本信息（含情侣码）
export async function fetchCouple(coupleId) {
  const { data, error } = await supabase.from('couples').select('*').eq('id', coupleId).maybeSingle()
  if (error) throw error
  return data
}

// 读取空间成员
export async function fetchMembers(coupleId) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

// 读取纪念日/见面节点
export async function fetchMilestones(coupleId) {
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('couple_id', coupleId)
    .order('date', { ascending: true })
  if (error) throw error
  return data
}

// 更新自己的资料
export async function updateMyProfile({ nickname, emoji, city, timezone }) {
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return
  const { error } = await supabase
    .from('members')
    .update({ nickname, emoji, city, timezone })
    .eq('user_id', user.user.id)
  if (error) throw error
}
