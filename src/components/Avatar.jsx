import { supabase } from '../lib/supabase.js'

const SIZES = {
  sm: 'h-6 w-6 text-base',
  md: 'h-10 w-10 text-xl',
  lg: 'h-14 w-14 text-2xl',
}

// 统一头像渲染：有 avatar_path 显示图片，否则回退到 emoji
export function Avatar({ member, size = 'md', className = '' }) {
  const emoji = member?.emoji || '💕'
  const url = member?.avatar_path
    ? supabase.storage.from('avatars').getPublicUrl(member.avatar_path).data.publicUrl
    : null
  const cls = `${SIZES[size] || SIZES.md} ${className}`

  if (url) {
    return <img src={url} alt="" className={`${cls} shrink-0 rounded-full object-cover`} />
  }
  return <span className={`${cls} inline-flex shrink-0 items-center justify-center`}>{emoji}</span>
}
