import { useRef, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { supabase } from '../lib/supabase.js'
import { useCollection, formatDateTime } from '../lib/hooks.js'
import { Button, Modal, TextInput, EmptyState, Spinner, SectionTitle } from '../components/ui.jsx'

const photoUrl = (path) => supabase.storage.from('photos').getPublicUrl(path).data.publicUrl

export default function Photos() {
  const { coupleId, user, members } = useStore()
  const { rows, loading } = useCollection('photos', coupleId, { orderBy: 'created_at', ascending: false })
  const fileRef = useRef(null)
  const [pending, setPending] = useState(null) // { url, file }
  const [caption, setCaption] = useState('')
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState(null)

  const memberMap = Object.fromEntries(members.map((m) => [m.user_id, m]))

  const pickFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPending({ file, url: URL.createObjectURL(file) })
    setCaption('')
    e.target.value = ''
  }

  const upload = async () => {
    if (!pending) return
    setSaving(true)
    const ext = pending.file.name.split('.').pop() || 'jpg'
    const path = `${coupleId}/${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await supabase.storage.from('photos').upload(path, pending.file)
    if (!upErr) {
      await supabase.from('photos').insert({
        couple_id: coupleId,
        author_user_id: user.id,
        storage_path: path,
        caption: caption.trim() || null,
      })
    }
    setSaving(false)
    setPending(null)
  }

  const remove = async (p) => {
    await supabase.from('photos').delete().eq('id', p.id)
    await supabase.storage.from('photos').remove([p.storage_path])
  }

  return (
    <div>
      <SectionTitle right={<Button onClick={() => fileRef.current?.click()}>📷 上传照片</Button>}>
        🖼️ 照片墙
      </SectionTitle>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState emoji="🖼️" text="还没有照片，上传你们的合影或日常吧" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {rows.map((p) => {
            const author = memberMap[p.author_user_id]
            return (
              <div key={p.id} className="group relative animate-floatIn">
                <button onClick={() => setView(p)} className="block w-full overflow-hidden rounded-2xl shadow-soft">
                  <img src={photoUrl(p.storage_path)} alt={p.caption || '照片'} className="aspect-square w-full object-cover transition group-hover:scale-105" loading="lazy" />
                </button>
                {p.caption && <p className="mt-1 truncate px-1 text-xs text-cocoaSoft">{p.caption}</p>}
                {p.author_user_id === user.id && (
                  <button
                    onClick={() => remove(p)}
                    className="absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  >
                    删除
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 上传确认弹窗 */}
      <Modal open={!!pending} onClose={() => setPending(null)} title="上传照片">
        {pending && (
          <div className="space-y-4">
            <img src={pending.url} alt="预览" className="max-h-72 w-full rounded-2xl object-contain" />
            <TextInput value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="写一句备注（可选）" maxLength={60} />
            <Button className="w-full" onClick={upload} disabled={saving}>
              {saving ? '上传中…' : '确认上传'}
            </Button>
          </div>
        )}
      </Modal>

      {/* 大图查看 */}
      <Modal open={!!view} onClose={() => setView(null)} title={view?.caption || '照片'}>
        {view && (
          <div>
            <img src={photoUrl(view.storage_path)} alt={view.caption || '照片'} className="w-full rounded-2xl" />
            <p className="mt-3 text-center text-xs text-cocoaSoft">
              {memberMap[view.author_user_id]?.emoji} {memberMap[view.author_user_id]?.nickname} · {formatDateTime(view.created_at)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  )
}
