import { create } from 'zustand'

interface SyncStore {
  pending: number
  increment: () => void
  decrement: () => void
}

export const useSyncStore = create<SyncStore>((set) => ({
  pending: 0,
  increment: () => set((s) => ({ pending: s.pending + 1 })),
  decrement: () => set((s) => ({ pending: Math.max(0, s.pending - 1) })),
}))
