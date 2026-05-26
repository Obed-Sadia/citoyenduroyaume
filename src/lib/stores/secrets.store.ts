import { create } from 'zustand'
import { SecretsRepo } from '@/lib/db/secrets.repo'
import { syncSecret, deleteSecret } from '@/lib/supabase/sync'
import type { Secret } from '@/lib/db/basileia.db'
import type { DomainId } from '@/features/carte/domain-constants'

export type { Secret }

interface SecretsStore {
  secrets: Secret[]
  isLoaded: boolean
  loadFromDb: () => Promise<void>
  addSecret: (text: string, domainId?: DomainId) => Promise<void>
  removeSecret: (id: string) => Promise<void>
  reset: () => void
}

export const useSecretsStore = create<SecretsStore>((set, get) => ({
  secrets: [],
  isLoaded: false,

  loadFromDb: async () => {
    if (get().isLoaded) return
    try {
      const secrets = await SecretsRepo.getAll()
      set({ secrets, isLoaded: true })
    } catch (err) {
      console.error('[SecretsStore] loadFromDb failed', err)
      set({ isLoaded: true })
    }
  },

  addSecret: async (text, domainId) => {
    const secret: Secret = {
      id: crypto.randomUUID(),
      text,
      domainId,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({ secrets: [secret, ...state.secrets] }))
    try {
      await SecretsRepo.add(secret)
      void syncSecret(secret)
    } catch (err) {
      set((state) => ({ secrets: state.secrets.filter((s) => s.id !== secret.id) }))
      console.error('[SecretsStore] addSecret failed', err)
    }
  },

  removeSecret: async (id) => {
    const prev = get().secrets
    set((state) => ({ secrets: state.secrets.filter((s) => s.id !== id) }))
    try {
      await SecretsRepo.remove(id)
      void deleteSecret(id)
    } catch (err) {
      set({ secrets: prev })
      console.error('[SecretsStore] removeSecret failed', err)
    }
  },

  reset: () => set({ secrets: [], isLoaded: false }),
}))
