import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase.js'

// 通用集合查询 + Realtime 实时刷新；同时暴露 reload 供增删改后手动刷新
export function useCollection(table, coupleId, { orderBy = 'created_at', ascending = false } = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!coupleId) {
      setRows([])
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from(table)
      .select('*')
      .eq('couple_id', coupleId)
      .order(orderBy, { ascending })
    setRows(data || [])
    setLoading(false)
  }, [table, coupleId, orderBy, ascending])

  useEffect(() => {
    load()
    if (!coupleId) return
    const channel = supabase
      .channel(`realtime-${table}-${coupleId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `couple_id=eq.${coupleId}` },
        () => load(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [load, coupleId, table])

  return { rows, loading, reload: load }
}

// ---------- 常量 ----------

export const MOODS = [
  { value: '开心', emoji: '😊' },
  { value: '甜蜜', emoji: '🥰' },
  { value: '平静', emoji: '😌' },
  { value: '想念', emoji: '🥺' },
  { value: '难过', emoji: '😢' },
  { value: '生气', emoji: '😠' },
  { value: '疲惫', emoji: '😴' },
  { value: '元气', emoji: '💪' },
]

export const AVATAR_EMOJIS = ['💕', '🐰', '🐻', '🐱', '🐶', '🌙', '⭐', '🍑', '🌸', '🐣', '🦊', '🐳']

export const NOTE_COLORS = [
  { bg: '#FBE9C8', border: '#F0D3A0' },
  { bg: '#FBD3C4', border: '#F0B49E' },
  { bg: '#F6D6DE', border: '#ECB4C4' },
  { bg: '#DDEBD6', border: '#BFD8B8' },
  { bg: '#DCE8F2', border: '#BED3E5' },
  { bg: '#EFE2F2', border: '#D9BFE2' },
]

export const WISH_CATEGORIES = [
  { key: 'place', label: '想一起去的地方', emoji: '🗺️' },
  { key: 'food', label: '想一起吃的东西', emoji: '🍜' },
  { key: 'thing', label: '想一起做的事', emoji: '🎨' },
]

// ---------- 工具 ----------

export function formatDate(d) {
  if (!d) return ''
  const dt = typeof d === 'string' ? new Date(d) : d
  const pad = (n) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}.${pad(dt.getMonth() + 1)}.${pad(dt.getDate())}`
}

export function formatDateTime(d) {
  if (!d) return ''
  const dt = typeof d === 'string' ? new Date(d) : d
  const pad = (n) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}.${pad(dt.getMonth() + 1)}.${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

// 指定时区的当前本地时间
export function timeInZone(timezone) {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: timezone,
    }).format(new Date())
  } catch {
    return ''
  }
}

export function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'Asia/Shanghai'
  }
}
