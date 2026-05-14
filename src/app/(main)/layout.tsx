import Sidebar from '@/features/nav/Sidebar'
import BottomNav from '@/features/nav/BottomNav'
import { AuthProvider } from '@/features/auth/AuthProvider'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen bg-[var(--color-bg-base)] overflow-hidden">
        <div className="hidden md:flex h-full relative z-[var(--z-sidebar)]">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  )
}
