import { createClient } from './client'
import type { Note } from '@/features/journal/mock-notes'
import type { Secret } from '@/lib/db/basileia.db'

export async function syncNote(note: Note): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('notes').upsert({
      id:         note.id,
      user_id:    user.id,
      title:      note.title || null,
      content:    note.content,
      domain_id:  note.domain ?? null,
      updated_at: new Date().toISOString(),
    })
  } catch {
    // silent — offline-first
  }
}

export async function syncSecret(secret: Secret): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('secrets').upsert({
      id:        secret.id,
      user_id:   user.id,
      text:      secret.text,
      domain_id: secret.domainId ?? null,
    })
  } catch {
    // silent — offline-first
  }
}
