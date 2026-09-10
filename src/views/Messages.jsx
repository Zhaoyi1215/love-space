import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { supabase } from '../lib/supabase.js'
import { useCollection, NOTE_COLORS, formatDateTime } from '../lib/hooks.js'
import { Button, Modal, TextArea, EmptyState, Spinner, SectionTitle, ConfirmModal } from '../components/ui.jsx'
import { Avatar } from '../components/Avatar.jsx'

// 根据 id 稳定地选一个便利贴颜色和倾斜角度
function noteStyle(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  const color = NOTE_COLORS[h % NOTE_COLORS.length]
  const tilt = (h % 7) - 3
  return { color, tilt }
}

export default function Messages() {
  const { coupleId, user, members } = useStore()
  const { rows, loading, reload } = useCollection('messages', coupleId, { orderBy: 'created_at', ascending: false })
  const [open, setOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const memberMap = Object.fromEntries(members.map((m) => [m.user_id, m]))

  const submit = async () => {
    if (!content.trim()) return
    setSaving(true)
    const { error } = await supabase.from('messages').insert({
      couple_id: coupleId,
      author_user_id: user.id,
      content: content.trim(),
    })
    setSaving(false)
    if (!error) {
      setContent('')
      setOpen(false)
      reload()
    }
  }

  const remove = async (id) => {
    const { error } = await supabase.from('messages').delete().eq('id', id)
    if (error) console.error('删除纸条失败：', error.message)
    else reload()
    setPendingDelete(null)
  }

  return (
    <div>
      <SectionTitle right={<Button onClick={() => setOpen(true)}>💌 写纸条</Button>}>
        💌 留言板
      </SectionTitle>
      <p className="mb-4 -mt-1 text-xs text-cocoaSoft">给 TA 留一句悄悄话，会贴在这面墙上</p>

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState emoji="💌" text="还没有小纸条，写一句甜甜的话贴上来吧" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {rows.map((m) => {
            const { color, tilt } = noteStyle(m.id)
            const author = memberMap[m.author_user_id]
            return (
              <div
                key={m.id}
                className="note animate-floatIn relative rounded-xl p-4 shadow-soft"
                style={{ background: color.bg, border: `1px solid ${color.border}`, '--tilt': `${tilt}deg` }}
              >
                <p className="whitespace-pre-wrap break-words text-sm text-cocoa">{m.content}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs font-bold text-cocoaSoft/80">
                    <Avatar member={author} size="sm" /> {author?.nickname}
                  </span>
                  <span className="text-[10px] text-cocoaSoft/60">{formatDateTime(m.created_at).slice(5, 16)}</span>
                </div>
                <button
                  onClick={() => setPendingDelete(m.id)}
                  className="absolute right-2 top-1 text-xs text-cocoaSoft/50 hover:text-rosy"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="写张小纸条">
        <div className="space-y-4">
          <TextArea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="想对 TA 说什么悄悄话？"
            maxLength={200}
          />
          <Button className="w-full" onClick={submit} disabled={saving || !content.trim()}>
            {saving ? '粘贴中…' : '贴上去'}
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => remove(pendingDelete)}
        message="删除后无法恢复，确定删除这张小纸条吗？"
      />
    </div>
  )
}
