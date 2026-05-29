'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { initDb, closeDb } from '@/lib/db/basileia.db'
import { useNotesStore } from '@/lib/stores/notes.store'
import { useSecretsStore } from '@/lib/stores/secrets.store'
import { useVersesStore } from '@/lib/stores/verses.store'
import { useProfilStore } from '@/lib/stores/profil.store'
import { useNavStore } from '@/lib/stores/nav.store'
import { pullNotes, pullSecrets, pullVerses } from '@/lib/supabase/sync'
import { getUnreadCount } from '@/lib/actions/allies'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function initSession(userId: string): Promise<void> {
      await initDb(userId)

      await Promise.all([pullNotes(), pullSecrets(), pullVerses()])

      const { data: profile } = await supabase
        .from('citizen_profiles')
        .select('preferences, locale, bible_translation')
        .eq('id', userId)
        .single()
      if (profile) {
        useProfilStore.getState().hydrateFromRemote({
          ...(profile.preferences as Record<string, unknown> ?? {}),
          locale:            profile.locale,
          bible_translation: profile.bible_translation,
        })
      }

      await Promise.all([
        useNotesStore.getState().loadFromDb(),
        useSecretsStore.getState().loadFromDb(),
        useVersesStore.getState().loadFromDb(),
      ])

      const count = await getUnreadCount()
      useNavStore.getState().setUnreadCount(count)
    }

    function resetSession(): void {
      void closeDb()
      useNotesStore.getState().reset()
      useSecretsStore.getState().reset()
      useVersesStore.getState().reset()
      useNavStore.getState().clearUnread()
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
