'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { initDb, closeDb } from '@/lib/db/basileia.db'
import { useNotesStore } from '@/lib/stores/notes.store'
import { useSecretsStore } from '@/lib/stores/secrets.store'
import { useVersesStore } from '@/lib/stores/verses.store'
import { useProfilStore } from '@/lib/stores/profil.store'
import { pullNotes, pullSecrets, pullVerses } from '@/lib/supabase/sync'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function initSession(userId: string): Promise<void> {
      await initDb(userId)

      await Promise.all([pullNotes(), pullSecrets(), pullVerses()])

      const { data: profile } = await supabase
        .from('citizen_profiles')
        .select('preferences')
        .eq('id', userId)
        .single()
      if (profile?.preferences) {
        useProfilStore.getState().hydrateFromRemote(
          profile.preferences as Record<string, unknown>
        )
      }

      await Promise.all([
        useNotesStore.getState().loadFromDb(),
        useSecretsStore.getState().loadFromDb(),
        useVersesStore.getState().loadFromDb(),
      ])
    }

    function resetSession(): void {
      void closeDb()
      useNotesStore.getState().reset()
      useSecretsStore.getState().reset()
      useVersesStore.getState().reset()
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) void initSession(user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        void initSession(session.user.id)
      }
      if (event === 'SIGNED_OUT') {
        resetSession()
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return <>{children}</>
}
