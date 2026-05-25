import { create } from 'zustand'
import { VersesRepo } from '@/lib/db/verses.repo'
import { syncVerse, deleteVerse } from '@/lib/supabase/sync'
import type { Verse } from '@/lib/db/basileia.db'
import type { DomainId } from '@/features/carte/domain-constants'

export type { Verse }

interface VersesStore {
  verses: Verse[]
  isLoaded: boolean
  loadFromDb: () => Promise<void>
  addVerse: (reference: string, text: string, domain?: DomainId, visibility?: 'private' | 'allies') => Promise<void>
  removeVerse: (id: string) => Promise<void>
  reset: () => void
}

export const useVersesStore = create<VersesStore>((set, get) => ({
  verses: [],
  isLoaded: false,

  loadFromDb: async () => {
    if (get().isLoaded) return
    try {
      const verses = await VersesRepo.getAll()
      set({ verses, isLoaded: true })
    } catch (err) {
      console.error('[VersesStore] loadFromDb failed', err)
      set({ isLoaded: true })
    }
  },

  addVerse: async (reference, text, domain, visibility) => {
    const verse: Verse = {
      id: crypto.randomUUID(),
      reference,
      text,
      domain: domain ?? null,
      visibility: visibility ?? 'private',
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ verses: [verse, ...state.verses] }))
    try {
      await VersesRepo.add(verse)
      void syncVerse(verse)
    } catch (err) {
      set((state) => ({ verses: state.verses.filter((v) => v.id !== verse.id) }))
      console.error('[VersesStore] addVerse failed', err)
    }
  },

  removeVerse: async (id) => {
    const prev = get().verses
    set((state) => ({ verses: state.verses.filter((v) => v.id !== id) }))
    try {
      await VersesRepo.remove(id)
      void deleteVerse(id)
    } catch (err) {
      set({ verses: prev })
      console.error('[VersesStore] removeVerse failed', err)
    }
  },

  reset: () => set({ verses: [], isLoaded: false }),
}))
