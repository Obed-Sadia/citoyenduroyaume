import { createClient } from './client'
import { useSyncStore } from '@/lib/stores/sync.store'
import type { Note } from '@/features/journal/mock-notes'
import type { Secret, Verse } from '@/lib/db/basileia.db'
import { NotesRepo } from '@/lib/db/notes.repo'
import { SecretsRepo } from '@/lib/db/secrets.repo'
import { VersesRepo } from '@/lib/db/verses.repo'
import type { DomainId, ExplorationLevel } from '@/features/carte/domain-constants'

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

function toExplorationLevel(count: number): ExplorationLevel {
  if (count === 0) return 0
  if (count <= 2)  return 1
  if (count <= 5)  return 2
  if (count <= 10) return 3
  if (count <= 20) return 4
  return 5
}

async function computeExplorationSnapshot(): Promise<Partial<Record<DomainId, ExplorationLevel>>> {
  const [notes, secrets, verses] = await Promise.all([
    NotesRepo.getAll(),
    SecretsRepo.getAll(),
    VersesRepo.getAll(),
  ])

  const counts: Partial<Record<DomainId, number>> = {}

  for (const n of notes) {
    if (n.domain) counts[n.domain] = (counts[n.domain] ?? 0) + 1
  }
  for (const s of secrets) {
    if (s.domainId) counts[s.domainId] = (counts[s.domainId] ?? 0) + 1
  }
  for (const v of verses) {
    if (v.domain) counts[v.domain] = (counts[v.domain] ?? 0) + 1
  }

  const result: Partial<Record<DomainId, ExplorationLevel>> = {}
  for (const [id, count] of Object.entries(counts)) {
    result[id as DomainId] = toExplorationLevel(count ?? 0)
  }
  return result
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

      const { data: existing } = await supabase
        .from('verses')
        .select('id')
        .eq('id', verse.id)
        .maybeSingle()
      const isNew = !existing

      await supabase.from('verses').upsert({
        id:         verse.id,
        user_id:    userId,
        reference:  verse.reference,
        text:       verse.text,
        domain:     verse.domain ?? null,
        visibility: verse.visibility,
      })

      if (isNew && verse.visibility === 'allies') {
        const { data: allyRows } = await supabase
          .from('allies')
          .select('requester_id, receiver_id')
          .eq('status', 'accepted')
          .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)

        const allyIds = (allyRows ?? []).map(row =>
          row.requester_id === userId ? row.receiver_id : row.requester_id
        )

        if (allyIds.length > 0) {
          await supabase.from('notifications').insert(
            allyIds.map(allyId => ({
              user_id:      allyId,
              type:         'verse_shared' as const,
              from_user_id: userId,
              payload:      { reference: verse.reference },
            }))
          )
        }
      }
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
        .select('id, reference, text, domain, visibility, created_at')
        .eq('user_id', userId)
      if (!rows) return
      for (const row of rows) {
        const existing = await VersesRepo.getById(row.id)
        if (!existing) {
          await VersesRepo.add({
            id:         row.id,
            reference:  row.reference,
            text:       row.text,
            domain:     (row.domain ?? null) as DomainId | null,
            visibility: (row.visibility ?? 'private') as 'private' | 'allies',
            createdAt:  row.created_at,
          })
        }
      }
    } catch {
      // silent
    }
  })
}

function hasChanged(
  prev: Record<string, unknown> | undefined,
  next: Record<string, unknown>
): boolean {
  const keys = new Set([...Object.keys(prev ?? {}), ...Object.keys(next)])
  for (const k of keys) {
    if ((prev ?? {})[k] !== next[k]) return true
  }
  return false
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
        .maybeSingle()

      // locale et bible_translation vivent dans leurs colonnes directes, pas dans le JSONB
      const directCols: Record<string, unknown> = {}
      if ('locale' in patch)            directCols.locale            = patch.locale
      if ('bible_translation' in patch) directCols.bible_translation = patch.bible_translation

      const prefspatch = { ...patch }
      delete prefspatch.locale
      delete prefspatch.bible_translation

      const prevPrefs = (existing?.preferences as Record<string, unknown> ?? {})
      const merged = { ...prevPrefs, ...prefspatch }
      // nettoyer d'éventuelles valeurs orphelines dans le JSONB
      delete (merged as Record<string, unknown>).locale
      delete (merged as Record<string, unknown>).bible_translation

      let territoryChanged = false
      if (merged.share_territoire === true) {
        const newTerritoire = await computeExplorationSnapshot()
        const prevTerritoire = prevPrefs.territoire as Record<string, unknown> | undefined
        territoryChanged = hasChanged(prevTerritoire, newTerritoire as Record<string, unknown>)
        merged.territoire = newTerritoire
      } else {
        delete merged.territoire
      }

      await supabase
        .from('citizen_profiles')
        .update({ preferences: merged, ...directCols })
        .eq('id', userId)

      if (territoryChanged) {
        const { data: allyRows } = await supabase
          .from('allies')
          .select('requester_id, receiver_id')
          .eq('status', 'accepted')
          .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)

        const allyIds = (allyRows ?? []).map(row =>
          row.requester_id === userId ? row.receiver_id : row.requester_id
        )

        if (allyIds.length > 0) {
          await supabase.from('notifications').insert(
            allyIds.map(allyId => ({
              user_id:      allyId,
              type:         'territory_updated' as const,
              from_user_id: userId,
              payload:      {},
            }))
          )
        }
      }
    } catch {
      // silent — offline-first
    }
  })
}
