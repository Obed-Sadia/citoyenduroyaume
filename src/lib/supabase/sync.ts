import { createClient } from './client'
import type { Note } from '@/features/journal/mock-notes'
import type { Secret, Verse } from '@/lib/db/basileia.db'

async function getUserId(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function syncNote(note: Note): Promise<void> {
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
      updated_at: new Date().toISOString(),
      visibility: note.visibility ?? 'private',
      tribe_id:   note.tribe_id ?? null,
    })
  } catch {
    // silent — offline-first
  }
}

export async function syncSecret(secret: Secret): Promise<void> {
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
}

export async function syncVerse(verse: Verse): Promise<void> {
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
}
