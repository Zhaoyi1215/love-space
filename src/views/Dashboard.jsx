import { useState } from 'react'
import TabBar from '../components/TabBar.jsx'
import Home from './Home.jsx'
import Diary from './Diary.jsx'
import Photos from './Photos.jsx'
import Wishes from './Wishes.jsx'
import Messages from './Messages.jsx'
import Timeline from './Timeline.jsx'

export default function Dashboard() {
  const [tab, setTab] = useState('home')

  return (
    <div className="bg-paper min-h-screen pb-24">
      <main className="mx-auto max-w-md px-4 pt-6">
        {tab === 'home' && <Home />}
        {tab === 'diary' && <Diary />}
        {tab === 'photos' && <Photos />}
        {tab === 'wishes' && <Wishes />}
        {tab === 'messages' && <Messages />}
        {tab === 'timeline' && <Timeline />}
      </main>
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
