import { useEffect, useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { supabase } from '../lib/supabase.js'
import { Card, Button, Modal, Field, TextInput } from '../components/ui.jsx'
import { Avatar } from '../components/Avatar.jsx'
import EditProfileModal from '../components/EditProfileModal.jsx'
import ManageMembersModal from '../components/ManageMembersModal.jsx'
import { timeInZone } from '../lib/hooks.js'

function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), interval)
    return () => clearInterval(t)
  }, [interval])
  return now
}

function diffParts(from, to) {
  let diff = Math.max(0, to - from)
  const days = Math.floor(diff / 86400000)
  diff -= days * 86400000
  const hours = Math.floor(diff / 3600000)
  diff -= hours * 3600000
  const mins = Math.floor(diff / 60000)
  diff -= mins * 60000
  const secs = Math.floor(diff / 1000)
  return { days, hours, mins, secs }
}

const pad = (n) => String(n).padStart(2, '0')

export default function Home() {
  const { couple, members, milestones, myMember, partner, refresh } = useStore()
  const now = useNow()
  const [showMeetup, setShowMeetup] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [meetupTitle, setMeetupTitle] = useState('见面')
  const [meetupDate, setMeetupDate] = useState('')
  const [saving, setSaving] = useState(false)

  const anniversary = milestones.find((m) => m.type === 'anniversary')
  const futureMeetups = milestones
    .filter((m) => m.type === 'meetup' && new Date(m.date) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  const nextMeetup = futureMeetups[0]

  const together = anniversary ? diffParts(new Date(anniversary.date), now) : null

  let progress = 0
  if (anniversary && nextMeetup) {
    const start = new Date(anniversary.date).getTime()
    const end = new Date(nextMeetup.date).getTime()
    progress = Math.min(1, Math.max(0, (now - start) / (end - start)))
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(couple?.code || '')
    } catch {
      /* ignore */
    }
  }

  const saveMeetup = async () => {
    if (!meetupDate) return
    setSaving(true)
    // 更新最近的见面节点（存在则改日期，不存在则新建）
    const { error } = await supabase.from('milestones').upsert(
      {
        id: nextMeetup?.id,
        couple_id: couple.id,
        type: 'meetup',
        title: meetupTitle || '见面',
        date: meetupDate,
      },
      { onConflict: 'id' },
    )
    setSaving(false)
    if (!error) {
      setShowMeetup(false)
      await refresh()
    }
  }

  return (
    <div className="space-y-4">
      {/* 顶部：两人 + 情侣码 */}
      <Card className="text-center">
        <div className="flex items-center justify-center gap-3">
          <Avatar member={myMember} size="lg" />
          <h1 className="font-display text-2xl text-cocoa">
            {myMember?.nickname || '我'} <span className="text-blush">❤</span> {partner?.nickname || 'TA'}
          </h1>
          <Avatar member={partner} size="lg" />
        </div>
        <button
          onClick={copyCode}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blush/10 px-4 py-1.5 text-sm font-bold text-rosy"
        >
          情侣码 <span className="font-display tracking-[0.2em]">{couple?.code}</span> 📋
        </button>
        <p className="mt-1 text-xs text-cocoaSoft/70">点一下复制，发给 TA 加入这个空间</p>
        <button
          onClick={() => setShowProfile(true)}
          className="mt-2 inline-flex items-center gap-1 rounded-full bg-cream px-4 py-1.5 text-sm font-bold text-cocoaSoft"
        >
          ✏️ 编辑我的资料
        </button>
      </Card>

      {/* 在一起天数 */}
      <Card className="text-center">
        <p className="text-sm font-bold text-cocoaSoft">我们已经在一起</p>
        {together ? (
          <>
            <div className="my-2 flex items-end justify-center gap-1">
              <span className="font-display text-6xl leading-none text-rosy">{together.days}</span>
              <span className="mb-1 text-xl font-bold text-cocoa">天</span>
            </div>
            <div className="font-display text-xl text-cocoaSoft">
              {pad(together.hours)} 时 {pad(together.mins)} 分 {pad(together.secs)} 秒
            </div>
          </>
        ) : (
          <p className="py-6 text-sm text-cocoaSoft">在首页设置纪念日后，这里会每天为你倒数 ❤</p>
        )}
      </Card>

      {/* 下次见面倒计时 */}
      <Card className="text-center">
        <p className="text-sm font-bold text-cocoaSoft">距离下次见面还有</p>
        {nextMeetup ? (
          <>
            <div className="my-2 flex items-end justify-center gap-1">
              <span className="font-display text-6xl leading-none text-blush">
                {Math.max(0, Math.floor((new Date(nextMeetup.date) - now) / 86400000))}
              </span>
              <span className="mb-1 text-xl font-bold text-cocoa">天</span>
            </div>
            <p className="mb-3 text-sm text-cocoaSoft">
              {nextMeetup.title} · {nextMeetup.date}
            </p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-peach/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blush to-rosy transition-all duration-1000"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-cocoaSoft/70">见面倒计时进行中，越来越近啦 🎉</p>
          </>
        ) : (
          <p className="py-4 text-sm text-cocoaSoft">还没定下次见面的日子，定一个给自己打气吧</p>
        )}
        <Button variant="ghost" className="mt-3 w-full" onClick={() => setShowMeetup(true)}>
          {nextMeetup ? '📅 修改下次见面' : '📅 设置下次见面'}
        </Button>
      </Card>

      {/* 两人时区 */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-cocoaSoft">我们此刻的时间</p>
          <button onClick={() => setShowMembers(true)} className="text-xs font-bold text-rosy">
            管理成员
          </button>
        </div>
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-2xl bg-cream px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar member={m} size="md" />
                <div>
                  <div className="font-bold text-cocoa">{m.nickname}</div>
                  <div className="text-xs text-cocoaSoft">{m.city || '未填写城市'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl text-rosy">{m.timezone ? timeInZone(m.timezone) : '--:--'}</div>
                <div className="text-xs text-cocoaSoft/70">{m.timezone ? m.timezone.split('/').pop().replace('_', ' ') : ''}</div>
              </div>
            </div>
          ))}
          {members.length < 2 && (
            <p className="text-center text-sm text-cocoaSoft">把情侣码发给 TA，这里会显示 TA 的时间 💌</p>
          )}
        </div>
      </Card>

      {/* 设置见面弹窗 */}
      <Modal open={showMeetup} onClose={() => setShowMeetup(false)} title="设置下次见面">
        <div className="space-y-4">
          <Field label="见面标签">
            <TextInput value={meetupTitle} onChange={(e) => setMeetupTitle(e.target.value)} placeholder="见面 / 一起去旅行…" />
          </Field>
          <Field label="见面日期">
            <TextInput type="date" value={meetupDate} onChange={(e) => setMeetupDate(e.target.value)} />
          </Field>
          <Button className="w-full" onClick={saveMeetup} disabled={saving || !meetupDate}>
            {saving ? '保存中…' : '保存'}
          </Button>
        </div>
      </Modal>

      {/* 编辑资料弹窗 */}
      <EditProfileModal open={showProfile} onClose={() => setShowProfile(false)} />

      {/* 管理成员弹窗 */}
      <ManageMembersModal open={showMembers} onClose={() => setShowMembers(false)} />
    </div>
  )
}
