import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { supabase } from '../lib/supabase.js'
import { useCollection, WISH_CATEGORIES, formatDate } from '../lib/hooks.js'
import { Button, Modal, Field, TextInput, TextArea, EmptyState, Spinner } from '../components/ui.jsx'

export default function Wishes() {
  const { coupleId, user, members } = useStore()
  const { rows, loading } = useCollection('wishes', coupleId, { orderBy: 'created_at', ascending: true })
  const [cat, setCat] = useState('place')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const memberMap = Object.fromEntries(members.map((m) => [m.user_id, m]))

  const list = rows.filter((w) => w.category === cat)
  const todo = list.filter((w) => w.status === 'todo')
  const done = list.filter((w) => w.status === 'done')

  const add = async () => {
    if (!title.trim()) return
    setSaving(true)
    const { error } = await supabase.from('wishes').insert({
      couple_id: coupleId,
      category: cat,
      title: title.trim(),
      note: note.trim() || null,
    })
    setSaving(false)
    if (!error) {
      setTitle('')
      setNote('')
      setOpen(false)
    }
  }

  const toggle = async (w) => {
    if (w.status === 'todo') {
      await supabase.from('wishes').update({ status: 'done', done_by: user.id, done_at: new Date().toISOString() }).eq('id', w.id)
    } else {
      await supabase.from('wishes').update({ status: 'todo', done_by: null, done_at: null }).eq('id', w.id)
    }
  }

  const remove = async (id) => {
    await supabase.from('wishes').delete().eq('id', id)
  }

  return (
    <div>
      {/* 分类标签 */}
      <div className="mb-4 flex gap-2">
        {WISH_CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={`flex-1 rounded-full px-2 py-2 text-xs font-bold transition ${
              cat === c.key ? 'bg-blush text-white shadow-card' : 'bg-white text-cocoaSoft'
            }`}
          >
            {c.emoji} {c.label.replace('想一起', '').replace('的', '')}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg text-cocoa">
          {WISH_CATEGORIES.find((c) => c.key === cat)?.label}
        </h2>
        <Button onClick={() => setOpen(true)}>＋ 添加</Button>
      </div>

      {loading ? (
        <Spinner />
      ) : list.length === 0 ? (
        <EmptyState emoji="🎯" text="还没有愿望，一起想想以后要做什么吧" />
      ) : (
        <div className="space-y-2">
          {todo.map((w) => (
            <div key={w.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft animate-floatIn">
              <button
                onClick={() => toggle(w)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-blush text-transparent transition hover:bg-blush/20"
              >
                ✓
              </button>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-cocoa">{w.title}</div>
                {w.note && <div className="truncate text-xs text-cocoaSoft">{w.note}</div>}
              </div>
              <button onClick={() => remove(w.id)} className="text-xs text-cocoaSoft/50 hover:text-rosy">
                删除
              </button>
            </div>
          ))}

          {done.map((w) => (
            <div key={w.id} className="flex items-center gap-3 rounded-2xl bg-cream/70 p-4 opacity-70">
              <button
                onClick={() => toggle(w)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-matcha text-white"
              >
                ✓
              </button>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-cocoaSoft line-through">{w.title}</div>
                <div className="text-xs text-cocoaSoft/70">
                  {memberMap[w.done_by]?.nickname || 'TA'} 完成于 {formatDate(w.done_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="添加愿望">
        <div className="space-y-4">
          <Field label="愿望标题">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：一起去看海" maxLength={40} />
          </Field>
          <Field label="备注（可选）">
            <TextArea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="想去哪儿、什么时候…" />
          </Field>
          <Button className="w-full" onClick={add} disabled={saving || !title.trim()}>
            {saving ? '添加中…' : '添加愿望'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
