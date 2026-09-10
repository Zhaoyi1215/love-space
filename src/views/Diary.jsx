import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { supabase } from '../lib/supabase.js'
import { useCollection, MOODS, formatDateTime } from '../lib/hooks.js'
import { Card, Button, Modal, TextArea, EmptyState, Spinner, SectionTitle, ConfirmModal } from '../components/ui.jsx'
import { Avatar } from '../components/Avatar.jsx'

const moodEmoji = (v) => MOODS.find((m) => m.value === v)?.emoji || '😊'

export default function Diary() {
  const { coupleId, user, members } = useStore()
  const { rows, loading, reload } = useCollection('diary_entries', coupleId, { orderBy: 'created_at', ascending: false })
  const [open, setOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('开心')
  const [saving, setSaving] = useState(false)

  const memberMap = Object.fromEntries(members.map((m) => [m.user_id, m]))

  const submit = async () => {
    if (!content.trim()) return
    setSaving(true)
    const { error } = await supabase.from('diary_entries').insert({
      couple_id: coupleId,
      author_user_id: user.id,
      content: content.trim(),
      mood,
    })
    setSaving(false)
    if (!error) {
      setContent('')
      setOpen(false)
      reload()
    }
  }

  const remove = async (id) => {
    const { error } = await supabase.from('diary_entries').delete().eq('id', id)
    if (error) console.error('删除日记失败：', error.message)
    else reload()
    setPendingDelete(null)
  }

  return (
    <div>
      <SectionTitle
        right={
          <Button onClick={() => setOpen(true)}>✏️ 写日记</Button>
        }
      >
        📔 我们的日记
      </SectionTitle>

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState emoji="📔" text="还没有日记，写下今天想对 TA 说的话吧" />
      ) : (
        <div className="space-y-3">
          {rows.map((d) => {
            const author = memberMap[d.author_user_id]
            return (
              <Card key={d.id} className="animate-floatIn relative">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar member={author} size="md" />
                    <div>
                      <div className="text-sm font-bold text-cocoa">{author?.nickname || 'TA'}</div>
                      <div className="text-xs text-cocoaSoft/70">{formatDateTime(d.created_at)}</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-bold text-cocoaSoft">
                    {moodEmoji(d.mood)} {d.mood}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-cocoa">{d.content}</p>
                <button
                  onClick={() => setPendingDelete(d.id)}
                  className="absolute right-3 top-3 text-xs text-cocoaSoft/50 hover:text-rosy"
                >
                  删除
                </button>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="写日记">
        <div className="space-y-4">
          <div>
            <span className="mb-1.5 block text-sm font-bold text-cocoaSoft">今天的心情</span>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold transition ${
                    mood === m.value ? 'bg-blush text-white shadow-card' : 'bg-cream text-cocoaSoft'
                  }`}
                >
                  <span>{m.emoji}</span>
                  {m.value}
                </button>
              ))}
            </div>
          </div>
          <TextArea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今天发生了什么？想对 TA 说点什么？"
          />
          <Button className="w-full" onClick={submit} disabled={saving || !content.trim()}>
            {saving ? '保存中…' : '保存日记'}
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => remove(pendingDelete)}
        message="删除后无法恢复，确定删除这篇日记吗？"
      />
    </div>
  )
}
