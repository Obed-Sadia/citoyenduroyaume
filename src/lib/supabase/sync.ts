import { createClient } from './client'
import { useSyncStore } from '@/lib/stores/sync.store'
import type { Note } from '@/features/journal/mock-notes'
import type { Secret, Verse } from '@/lib/db/basileia.db'

async function getUserId(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

function track<T>(fn: () => Promise<T>): Promise<T> {
  const { increment, decrement } = useSyncStore.getState()
  increment()
  return fn().finally(decrement)
}

export async function syncNote(note: Note): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      await supabase.from('notes').upsert({
        id:         note.id,
        user_id:    userId,
        title:      note.title || null,
        content:    note.content,
        domain_id:  note.domain ?? null,
        created_at: note.createdAt,
        updated_at: note.updatedAt ?? new Date().toISOString(),
        visibility: note.visibility ?? 'private',
        tribe_id:   note.tribe_id ?? null,
      })
    } catch {
      // silent — offline-first
    }
  })
}

export async function syncSecret(secret: Secret): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      await supabase.from('secrets').upsert({
        id:        secret.id,
        user_id:   userId,
        text:      secret.text,
        domain_id: secret.domainId ?? null,
      })
    } catch {
      // silent — offline-first
    }
  })
}

export async function syncVerse(verse: Verse): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      await supabase.from('verses').upsert({
        id:        verse.id,
        user_id:   userId,
        reference: verse.reference,
        text:      verse.text,
        domain:    verse.domain ?? null,
      })
    } catch {
      // silent — offline-first
    }
  })
}

export async function deleteNote(id: string): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      await supabase.from('notes').delete().eq('id', id).eq('user_id', userId)
    } catch {
      // silent
    }
  })
}

export async function deleteSecret(id: string): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      await supabase.from('secrets').delete().eq('id', id).eq('user_id', userId)
    } catch {
      // silent
    }
  })
}

export async function deleteVerse(id: string): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      await supabase.from('verses').delete().eq('id', id).eq('user_id', userId)
    } catch {
      // silent
    }
  })
}
