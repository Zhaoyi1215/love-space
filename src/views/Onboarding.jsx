import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { createCouple, joinCouple } from '../lib/couple.js'
import { Button, Field, TextInput } from '../components/ui.jsx'
import { AVATAR_EMOJIS, detectTimezone } from '../lib/hooks.js'

export default function Onboarding() {
  const { enterSpace } = useStore()
  const [mode, setMode] = useState('create')
  const [code, setCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [emoji, setEmoji] = useState('💕')
  const [city, setCity] = useState('')
  const [anniversary, setAnniversary] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const timezone = detectTimezone()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!nickname.trim()) {
      setError('先告诉我你的昵称吧～')
      return
    }
    setBusy(true)
    try {
      const payload = { nickname: nickname.trim(), emoji, city: city.trim(), timezone }
      const result =
        mode === 'create'
          ? await createCouple({ ...payload, anniversaryDate: anniversary || null })
          : await joinCouple({ ...payload, code })
      await enterSpace(result.id)
    } catch (err) {
      setError(err?.message || '出了点小问题，再试一次吧')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-paper flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-2 text-5xl">💕</div>
          <h1 className="font-display text-3xl text-cocoa">我们的恋爱手账</h1>
          <p className="mt-2 text-sm font-semibold text-cocoaSoft">异地也能好好谈恋爱的小天地</p>
        </div>

        <div className="mb-5 flex rounded-full bg-white p-1 shadow-soft">
          {[
            { key: 'create', label: '创建空间' },
            { key: 'join', label: '加入空间' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setMode(t.key)
                setError('')
              }}
              className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
                mode === t.key ? 'bg-blush text-white shadow-card' : 'text-cocoaSoft'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="rounded-card bg-white p-5 shadow-card">
          {mode === 'join' && (
            <div className="mb-4">
              <Field label="情侣码（对方在首页分享给你）">
                <TextInput
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="如 K7P3QX"
                  maxLength={6}
                  className="text-center font-display text-xl tracking-[0.3em]"
                />
              </Field>
            </div>
          )}

          <div className="mb-4">
            <Field label="你的昵称">
              <TextInput
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="宝宝 / 猪猪 / 宝贝…"
                maxLength={12}
              />
            </Field>
          </div>

          <div className="mb-4">
            <span className="mb-1.5 block text-sm font-bold text-cocoaSoft">选个头像</span>
            <div className="flex flex-wrap gap-2">
              {AVATAR_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-xl transition ${
                    emoji === e ? 'bg-blush/20 ring-2 ring-blush' : 'bg-cream'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <Field label="所在城市（可选，用于展示时区）">
              <TextInput
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="如 北京 / 上海 / 伦敦…"
                maxLength={20}
              />
            </Field>
          </div>

          {mode === 'create' && (
            <div className="mb-4">
              <Field label="在一起的纪念日（可选）">
                <TextInput type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} />
              </Field>
            </div>
          )}

          <p className="mb-4 text-xs text-cocoaSoft/70">
            时区已自动识别：<span className="font-bold">{timezone}</span>
          </p>

          {error && (
            <p className="mb-3 rounded-xl bg-peach/30 px-4 py-2 text-sm font-semibold text-rosy">{error}</p>
          )}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? '处理中…' : mode === 'create' ? '✨ 创建我们的空间' : '💕 加入TA的空间'}
          </Button>
        </form>
      </div>
    </div>
  )
}
