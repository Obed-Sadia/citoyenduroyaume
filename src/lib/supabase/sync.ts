import { createClient } from './client'
import { useSyncStore } from '@/lib/stores/sync.store'
import type { Note } from '@/features/journal/mock-notes'
import type { Secret, Verse } from '@/lib/db/basileia.db'
import { NotesRepo } from '@/lib/db/notes.repo'
import { SecretsRepo } from '@/lib/db/secrets.repo'
import { VersesRepo } from '@/lib/db/verses.repo'
import type { DomainId } from '@/features/carte/domain-constants'

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

export async function pullNotes(): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      const { data: rows } = await supabase
        .from('notes')
        .select('id, title, content, domain_id, created_at, updated_at, visibility, tribe_id')
        .eq('user_id', userId)
      if (!rows) return
      for (const row of rows) {
        const local = await NotesRepo.getById(row.id)
        const remoteTs = row.updated_at ?? row.created_at
        const localTs  = local?.updatedAt ?? local?.createdAt ?? ''
        if (!local || remoteTs > localTs) {
          await NotesRepo.add({
            id:         row.id,
            title:      row.title ?? '',
            excerpt:    local?.excerpt ?? '',
            content:    row.content as string ?? '',
            domain:     (row.domain_id ?? null) as DomainId | null,
            createdAt:  row.created_at,
            updatedAt:  row.updated_at ?? undefined,
            wordCount:  local?.wordCount ?? 0,
            visibility: row.visibility ?? 'private',
            tribe_id:   row.tribe_id ?? null,
          })
        }
      }
    } catch {
      // silent — offline-first
    }
  })
}

export async function pullSecrets(): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      const { data: rows } = await supabase
        .from('secrets')
        .select('id, text, domain_id, created_at')
        .eq('user_id', userId)
      if (!rows) return
      for (const row of rows) {
        const existing = await SecretsRepo.getById(row.id)
        if (!existing) {
          await SecretsRepo.add({
            id:        row.id,
            text:      row.text,
            domainId:  (row.domain_id ?? undefined) as DomainId | undefined,
            createdAt: row.created_at,
          })
        }
      }
    } catch {
      // silent
    }
  })
}

export async function pullVerses(): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      const { data: rows } = await supabase
        .from('verses')
        .select('id, reference, text, domain, created_at')
        .eq('user_id', userId)
      if (!rows) return
      for (const row of rows) {
        const existing = await VersesRepo.getById(row.id)
        if (!existing) {
          await VersesRepo.add({
            id:        row.id,
            reference: row.reference,
            text:      row.text,
            domain:    (row.domain ?? null) as DomainId | null,
            createdAt: row.created_at,
          })
        }
      }
    } catch {
      // silent
    }
  })
}

export async function syncPreferences(patch: Record<string, unknown>): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      const { data: existing } = await supabase
        .from('citizen_profiles')
        .select('preferences')
        .eq('id', userId)
        .single()
      const merged = { ...(existing?.preferences as Record<string, unknown> ?? {}), ...patch }
      await supabase
        .from('citizen_profiles')
        .update({ preferences: merged })
        .eq('id', userId)
    } catch {
      // silent — fire-and-forget
    }
  })
}
