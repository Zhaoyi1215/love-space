import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { supabase } from '../lib/supabase.js'
import { useCollection, formatDate } from '../lib/hooks.js'
import { Button, Modal, Field, TextInput, TextArea, EmptyState, Spinner, SectionTitle, ConfirmModal } from '../components/ui.jsx'

const EMOJIS = ['✨', '💕', '🎂', '🎁', '✈️', '🌊', '🍜', '🎨', '🌙', '📷', '🎉', '💍']

export default function Timeline() {
  const { coupleId, user } = useStore()
  const { rows, loading, reload } = useCollection('timeline_events', coupleId, { orderBy: 'date', ascending: true })
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [desc, setDesc] = useState('')
  const [emoji, setEmoji] = useState('✨')
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const add = async () => {
    if (!title.trim() || !date) return
    setSaving(true)
    const { error } = await supabase.from('timeline_events').insert({
      couple_id: coupleId,
      title: title.trim(),
      description: desc.trim() || null,
      date,
      emoji,
    })
    setSaving(false)
    if (!error) {
      setTitle('')
      setDesc('')
      setDate('')
      setOpen(false)
      reload()
    }
  }

  const remove = async (id) => {
    const { error } = await supabase.from('timeline_events').delete().eq('id', id)
    if (error) console.error('删除时间线失败：', error.message)
    else reload()
    setPendingDelete(null)
  }

  return (
    <div>
      <SectionTitle right={<Button onClick={() => setOpen(true)}>＋ 添加</Button>}>
        📅 我们的时间线
      </SectionTitle>

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState emoji="📅" text="还没有节点，记录你们的重要时刻吧" />
      ) : (
        <div className="relative ml-2 border-l-2 border-blush/30 pl-6">
          {rows.map((e) => (
            <div key={e.id} className="relative mb-5 animate-floatIn">
              <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-blush text-[10px] shadow-card">
                {e.emoji}
              </span>
              <div className="rounded-2xl bg-white p-4 shadow-soft">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-cocoa">{e.title}</h3>
                  <button
                    onClick={() => setPendingDelete(e.id)}
                    className="text-xs text-cocoaSoft/50 hover:text-rosy"
                  >
                    删除
                  </button>
                </div>
                {e.description && <p className="mt-1 text-sm text-cocoaSoft">{e.description}</p>}
                <div className="mt-2 text-xs font-bold text-blush">{formatDate(e.date)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="添加时间节点">
        <div className="space-y-4">
          <div>
            <span className="mb-1.5 block text-sm font-bold text-cocoaSoft">选个图标</span>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
                    emoji === e ? 'bg-blush/20 ring-2 ring-blush' : 'bg-cream'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <Field label="标题">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：第一次见面" maxLength={30} />
          </Field>
          <Field label="日期">
            <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="描述（可选）">
            <TextArea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="那天发生了什么？" />
          </Field>
          <Button className="w-full" onClick={add} disabled={saving || !title.trim() || !date}>
            {saving ? '保存中…' : '保存'}
          </Button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => remove(pendingDelete)}
        message="确定删除这个时间节点吗？"
      />
    </div>
  )
}
