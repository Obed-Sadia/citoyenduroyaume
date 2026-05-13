'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export type Enluminure = {
  id:                  string
  author_id:           string
  author_name:         string
  type:                'text' | 'verse'
  highlighted_passage: string | null
  content:             string
  verse_text:          string | null
  created_at:          string
}

export async function addEnluminure(payload: {
  note_id:              string
  type:                 'text' | 'verse'
  highlighted_passage?: string
  content:              string
  verse_text?:          string
}): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { error } = await supabase.from('enluminures').insert({
      note_id:             payload.note_id,
      author_id:           user.id,
      type:                payload.type,
      highlighted_passage: payload.highlighted_passage ?? null,
      content:             payload.content,
      verse_text:          payload.verse_text ?? null,
    })

    if (error) return { error: 'Erreur lors de l\'envoi' }
    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}

export async function getEnluminuresForNote(noteId: string): Promise<Enluminure[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('enluminures')
      .select('id, author_id, type, highlighted_passage, content, verse_text, created_at, citizen_profiles!enluminures_author_id_fkey(display_name)')
      .eq('note_id', noteId)
      .order('created_at', { ascending: true })

    if (!data) return []
    return (data as Record<string, unknown>[]).map((r) => ({
      id:                  r.id as string,
      author_id:           r.author_id as string,
      author_name:         (r.citizen_profiles as { display_name: string } | null)?.display_name ?? '?',
      type:                r.type as 'text' | 'verse',
      highlighted_passage: r.highlighted_passage as string | null,
      content:             r.content as string,
      verse_text:          r.verse_text as string | null,
      created_at:          r.created_at as string,
    }))
  } catch {
    return []
  }
}

export async function getEnluminureCountForNote(noteId: string): Promise<number> {
  try {
    const supabase = await createServerSupabaseClient()
    const { count } = await supabase
      .from('enluminures')
      .select('*', { count: 'exact', head: true })
      .eq('note_id', noteId)
    return count ?? 0
  } catch {
    return 0
  }
}
