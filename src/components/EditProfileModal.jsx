import { useEffect, useRef, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { updateMyProfile } from '../lib/couple.js'
import { supabase } from '../lib/supabase.js'
import { AVATAR_EMOJIS } from '../lib/hooks.js'
import { Modal, Button, Field, TextInput } from './ui.jsx'
import { Avatar } from './Avatar.jsx'

export default function EditProfileModal({ open, onClose }) {
  const { myMember, refresh } = useStore()
  const fileRef = useRef(null)
  const [nickname, setNickname] = useState('')
  const [city, setCity] = useState('')
  const [emoji, setEmoji] = useState('💕')
  const [avatarFile, setAvatarFile] = useState(null) // { file, url }
  const [mode, setMode] = useState('keep') // 'keep' | 'emoji' | 'image'
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // 打开时用当前资料回填
  useEffect(() => {
    if (!open) return
    setNickname(myMember?.nickname || '')
    setCity(myMember?.city || '')
    setEmoji(myMember?.emoji || '💕')
    setAvatarFile(null)
    setMode('keep')
    setError('')
  }, [open, myMember])

  const pickFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile({ file, url: URL.createObjectURL(file) })
    setMode('image')
    e.target.value = ''
  }

  const pickEmoji = (e) => {
    setEmoji(e)
    setAvatarFile(null)
    setMode('emoji')
  }

  const save = async () => {
    if (!nickname.trim()) {
      setError('先告诉我你的昵称吧～')
      return
    }
    setSaving(true)
    setError('')
    try {
      let avatar_path // undefined=不改；null=清除；string=新路径
      if (mode === 'image' && avatarFile) {
        const ext = avatarFile.file.name.split('.').pop() || 'jpg'
        const path = `${crypto.randomUUID()}.${ext}`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile.file)
        if (upErr) throw upErr
        avatar_path = path
        // 替换时清理旧头像文件
        if (myMember?.avatar_path) {
          await supabase.storage.from('avatars').remove([myMember.avatar_path])
        }
      } else if (mode === 'emoji') {
        avatar_path = null
      }

      await updateMyProfile({
        nickname: nickname.trim(),
        emoji,
        city: city.trim(),
        timezone: myMember?.timezone || null,
        avatar_path,
      })
      await refresh()
      onClose()
    } catch (err) {
      setError(err?.message || '保存失败，再试一次吧')
    } finally {
      setSaving(false)
    }
  }

  const previewMember = { emoji, avatar_path: mode === 'emoji' ? null : myMember?.avatar_path }

  return (
    <Modal open={open} onClose={onClose} title="编辑我的资料">
      <div className="space-y-4">
        {/* 头像预览 */}
        <div className="flex items-center gap-4">
          {avatarFile ? (
            <img src={avatarFile.url} alt="预览" className="h-14 w-14 shrink-0 rounded-full object-cover" />
          ) : (
            <Avatar member={previewMember} size="lg" />
          )}
          <div className="space-y-2">
            <Button variant="ghost" onClick={() => fileRef.current?.click()}>
              📷 上传头像
            </Button>
            <p className="text-xs text-cocoaSoft/70">也可以从下面选一个表情作头像</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
        </div>

        {/* emoji 选择（选表情 = 恢复表情头像） */}
        <div>
          <span className="mb-1.5 block text-sm font-bold text-cocoaSoft">表情头像</span>
          <div className="flex flex-wrap gap-2">
            {AVATAR_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => pickEmoji(e)}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition ${
                  emoji === e && mode !== 'image' ? 'bg-blush/20 ring-2 ring-blush' : 'bg-cream'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <Field label="你的昵称">
          <TextInput value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={12} />
        </Field>

        <Field label="所在城市（可选）">
          <TextInput value={city} onChange={(e) => setCity(e.target.value)} maxLength={20} placeholder="如 北京 / 上海 / 伦敦…" />
        </Field>

        {error && (
          <p className="rounded-xl bg-peach/30 px-4 py-2 text-sm font-semibold text-rosy">{error}</p>
        )}

        <Button className="w-full" onClick={save} disabled={saving}>
          {saving ? '保存中…' : '保存'}
        </Button>
      </div>
    </Modal>
  )
}
