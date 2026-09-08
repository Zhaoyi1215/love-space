import { useState } from 'react'
import { useStore } from '../lib/store.jsx'
import { supabase } from '../lib/supabase.js'
import { Modal, Button } from './ui.jsx'
import { Avatar } from './Avatar.jsx'

export default function ManageMembersModal({ open, onClose }) {
  const { members, user, refresh } = useStore()
  const [confirmId, setConfirmId] = useState(null)
  const [busy, setBusy] = useState(false)

  const remove = async (member) => {
    // 两段确认：第一次点击进入确认态，再点一次才真正移除
    if (confirmId !== member.id) {
      setConfirmId(member.id)
      return
    }
    setBusy(true)
    const { error } = await supabase.from('members').delete().eq('id', member.id)
    setBusy(false)
    setConfirmId(null)
    if (!error) await refresh()
  }

  return (
    <Modal open={open} onClose={onClose} title="管理成员">
      <div className="space-y-3">
        {members.map((m) => {
          const isSelf = m.user_id === user?.id
          return (
            <div key={m.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-soft">
              <div className="flex items-center gap-3">
                <Avatar member={m} size="md" />
                <div>
                  <div className="font-bold text-cocoa">
                    {m.nickname}
                    {isSelf && <span className="ml-1 text-xs font-normal text-cocoaSoft">（我）</span>}
                  </div>
                  <div className="text-xs text-cocoaSoft">{m.city || '未填写城市'}</div>
                </div>
              </div>
              {isSelf ? (
                <span className="text-xs text-cocoaSoft/60">这是你</span>
              ) : (
                <Button
                  variant={confirmId === m.id ? 'primary' : 'ghost'}
                  onClick={() => remove(m)}
                  disabled={busy}
                  className="px-3 py-1.5 text-sm"
                >
                  {confirmId === m.id ? '确认移除？' : '移除'}
                </Button>
              )}
            </div>
          )
        })}
        <p className="text-xs text-cocoaSoft/70">移除后对方会回到引导页；空间里的日记、照片等数据仍保留。</p>
      </div>
    </Modal>
  )
}
