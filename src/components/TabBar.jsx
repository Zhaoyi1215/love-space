const TABS = [
  { key: 'home', label: '首页', emoji: '💕' },
  { key: 'diary', label: '日记', emoji: '📔' },
  { key: 'photos', label: '照片', emoji: '🖼️' },
  { key: 'wishes', label: '愿望', emoji: '✅' },
  { key: 'messages', label: '留言', emoji: '💌' },
  { key: 'timeline', label: '时间线', emoji: '📅' },
]

export default function TabBar({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-peach/40 bg-white/90 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="flex justify-between">
        {TABS.map((t) => {
          const on = active === t.key
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-bold transition ${
                on ? 'text-rosy' : 'text-cocoaSoft/70'
              }`}
            >
              <span className={`text-xl transition ${on ? 'scale-110' : ''}`}>{t.emoji}</span>
              {t.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
