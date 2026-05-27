import Sidebar from '@/features/nav/Sidebar'
import BottomNav from '@/features/nav/BottomNav'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { SyncDot } from '@/features/nav/SyncDot'
import { BackgroundCanvas } from '@/components/ui/BackgroundCanvas'
import { BibleFAB } from '@/features/bible/BibleFAB'
import { BibleDrawer } from '@/features/bible/BibleDrawer'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BackgroundCanvas />
      <SyncDot />
      <div className="flex h-screen overflow-hidden relative">
        <div className="hidden md:flex h-full relative z-[var(--z-sidebar)]">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
      <BibleFAB />
      <BibleDrawer />
    </AuthProvider>
  )
}
