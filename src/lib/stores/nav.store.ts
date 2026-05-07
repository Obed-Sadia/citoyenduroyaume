import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface NavState {
  isLocked:       boolean
  unreadCount:    number
  toggleLock:     () => void
  setUnreadCount: (n: number) => void
  clearUnread:    () => void
}

export const useNavStore = create<NavState>()(
  persist(
    (set) => ({
      isLocked:       false,
      unreadCount:    0,
      toggleLock:     () => set((s) => ({ isLocked: !s.isLocked })),
      setUnreadCount: (n) => set({ unreadCount: n }),
      clearUnread:    () => set({ unreadCount: 0 }),
    }),
    {
      name:       'basileia-nav',
      storage:    createJSONStorage(() => localStorage),
      partialize: (s) => ({ isLocked: s.isLocked }),
    }
  )
)
