'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { DomainId, ExplorationLevel } from '@/features/carte/domain-constants'

export async function sendAllyRequest(shortCode: string): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { data: profile, error: profileError } = await supabase
      .from('citizen_profiles')
      .select('id')
      .eq('short_code', shortCode.toUpperCase())
      .single()

    if (profileError || !profile) return { error: 'Code invalide — aucun Citoyen trouvé' }
    if (profile.id === user.id) return { error: 'Tu ne peux pas t\'ajouter toi-même' }

    const { error } = await supabase.from('allies').insert({
      requester_id: user.id,
      receiver_id:  profile.id,
    })

    if (error?.code === '23505') return { error: 'Demande déjà envoyée' }
    if (error) return { error: 'Erreur lors de l\'envoi' }
    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}

export async function respondToAllyRequest(
  allyId: string,
  response: 'accepted' | 'rejected'
): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { error } = await supabase
      .from('allies')
      .update({ status: response })
      .eq('id', allyId)
      .eq('receiver_id', user.id)

    if (error) return { error: 'Erreur lors de la réponse' }
    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}

export type AllyWithProfile = {
  id:          string
  status:      'pending' | 'accepted' | 'rejected'
  isRequester: boolean
  ally: {
    id:           string
    display_name: string
    short_code:   string | null
  }
}

export async function getMyAllies(): Promise<AllyWithProfile[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from('allies')
      .select(`
        id, status, requester_id, receiver_id,
        requester:citizen_profiles!allies_requester_id_fkey(id, display_name, short_code),
        receiver:citizen_profiles!allies_receiver_id_fkey(id, display_name, short_code)
      `)
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!data) return []

    return data
      .map((row: Record<string, unknown>) => {
        const isRequester = row.requester_id === user.id
        const ally = isRequester ? row.receiver : row.requester
        return {
          id:          row.id as string,
          status:      row.status as AllyWithProfile['status'],
          isRequester,
          ally:        ally as AllyWithProfile['ally'],
        }
      })
      .filter((r): r is AllyWithProfile => r.ally != null)
  } catch {
    return []
  }
}

export async function getPendingRequests(): Promise<AllyWithProfile[]> {
  const all = await getMyAllies()
  return all.filter((a) => a.status === 'pending' && !a.isRequester)
}

export async function getAllyTerritoire(
  allyId: string
): Promise<Partial<Record<DomainId, ExplorationLevel>> | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: alliance } = await supabase
      .from('allies')
      .select('id')
      .eq('status', 'accepted')
      .or(
        `and(requester_id.eq.${user.id},receiver_id.eq.${allyId}),and(requester_id.eq.${allyId},receiver_id.eq.${user.id})`
      )
      .maybeSingle()

    if (!alliance) return null

    const { data } = await supabase
      .from('citizen_profiles')
      .select('preferences')
      .eq('id', allyId)
      .single()

    if (!data) return null
    const prefs = data.preferences as Record<string, unknown>
    if (!prefs?.territoire || typeof prefs.territoire !== 'object') return null

    const VALID_LEVELS = new Set([0, 1, 2, 3, 4, 5])
    const raw = prefs.territoire as Record<string, unknown>
    const safe: Partial<Record<DomainId, ExplorationLevel>> = {}
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === 'number' && VALID_LEVELS.has(v))
        safe[k as DomainId] = v as ExplorationLevel
    }
    return safe
  } catch {
    return null
  }
}

export async function searchCitizenByEmail(
  email: string
): Promise<{ id: string; display_name: string; avatar_url: string | null } | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase.rpc('search_citizen_by_email', { search_email: email })
    if (!data || data.length === 0) return null
    return data[0] as { id: string; display_name: string; avatar_url: string | null }
  } catch {
    return null
  }
}

export async function getMyShortCode(): Promise<string | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('citizen_profiles')
      .select('short_code')
      .eq('id', user.id)
      .single()
    return data?.short_code ?? null
  } catch {
    return null
  }
}

export async function resolveShortCode(
  code: string
): Promise<{ id: string; display_name: string; avatar_url: string | null } | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('citizen_profiles')
      .select('id, display_name, avatar_url')
      .eq('short_code', code.toUpperCase())
      .single()
    return data ?? null
  } catch {
    return null
  }
}

export async function sendAllianceRequest(
  receiverId: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }
    if (user.id === receiverId) return { error: 'Tu ne peux pas t\'ajouter toi-même' }

    const { data: existing } = await supabase
      .from('allies')
      .select('id')
      .or(
        `and(requester_id.eq.${user.id},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${user.id})`
      )
      .maybeSingle()
    if (existing) return { error: 'Alliance déjà existante ou en attente' }

    const { error: allyError } = await supabase.from('allies').insert({
      requester_id: user.id,
      receiver_id:  receiverId,
      status:       'pending',
    })
    if (allyError) return { error: 'Erreur lors de l\'envoi' }

    await supabase.from('notifications').insert({
      user_id:      receiverId,
      type:         'invitation_received',
      from_user_id: user.id,
      payload:      {},
    })

    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}

export async function acceptAllianceRequest(
  allyRecordId: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { data: ally, error: fetchError } = await supabase
      .from('allies')
      .select('requester_id')
      .eq('id', allyRecordId)
      .eq('receiver_id', user.id)
      .single()
    if (fetchError || !ally) return { error: 'Demande introuvable' }

    const { error } = await supabase
      .from('allies')
      .update({ status: 'accepted' })
      .eq('id', allyRecordId)
    if (error) return { error: 'Erreur lors de l\'acceptation' }

    await supabase.from('notifications').insert({
      user_id:      ally.requester_id,
      type:         'invitation_accepted',
      from_user_id: user.id,
      payload:      {},
    })

    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}

export async function rejectAllianceRequest(
  allyRecordId: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { error } = await supabase
      .from('allies')
      .update({ status: 'rejected' })
      .eq('id', allyRecordId)
      .eq('receiver_id', user.id)
    if (error) return { error: 'Erreur lors du refus' }
    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}

export type NotificationWithSender = {
  id:           string
  type:         'invitation_received' | 'invitation_accepted' | 'territory_updated' | 'verse_shared'
  from_user_id: string
  payload:      Record<string, unknown>
  read_at:      string | null
  created_at:   string
  sender: {
    display_name: string
    avatar_url:   string | null
  }
}

export async function getNotifications(): Promise<NotificationWithSender[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from('notifications')
      .select(`
        id, type, from_user_id, payload, read_at, created_at,
        sender:citizen_profiles!notifications_from_user_id_fkey(display_name, avatar_url)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!data) return []
    return data.map((row: Record<string, unknown>) => ({
      id:           row.id as string,
      type:         row.type as NotificationWithSender['type'],
      from_user_id: row.from_user_id as string,
      payload:      (row.payload ?? {}) as Record<string, unknown>,
      read_at:      row.read_at as string | null,
      created_at:   row.created_at as string,
      sender:       row.sender as NotificationWithSender['sender'],
    }))
  } catch {
    return []
  }
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', ids)
      .eq('user_id', user.id)
      .is('read_at', null)
  } catch {
    // silent
  }
}

export async function getUnreadCount(): Promise<number> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 0
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null)
    return count ?? 0
  } catch {
    return 0
  }
}

export type AllyVerse = {
  id:         string
  reference:  string
  text:       string
  domain:     string | null
  created_at: string
  author: {
    id:           string
    display_name: string
    avatar_url:   string | null
  }
}

export async function getAllyVerses(): Promise<AllyVerse[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from('verses')
      .select(`
        id, reference, text, domain, created_at,
        author:citizen_profiles!verses_user_id_fkey(id, display_name, avatar_url)
      `)
      .eq('visibility', 'allies')
      .order('created_at', { ascending: false })

    if (!data) return []
    return data
      .map((row: Record<string, unknown>) => ({
        id:         row.id as string,
        reference:  row.reference as string,
        text:       row.text as string,
        domain:     row.domain as string | null,
        created_at: row.created_at as string,
        author:     row.author as AllyVerse['author'],
      }))
      .filter((v): v is AllyVerse => v.author != null)
  } catch {
    return []
  }
}

export async function acceptLinkInvitation(
  shortCode: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { data: inviter } = await supabase
      .from('citizen_profiles')
      .select('id')
      .eq('short_code', shortCode.toUpperCase())
      .single()
    if (!inviter) return { error: 'Lien invalide' }
    if (inviter.id === user.id) return { error: 'Tu ne peux pas t\'allier à toi-même' }

    const { data: existing } = await supabase
      .from('allies')
      .select('id, status')
      .or(
        `and(requester_id.eq.${user.id},receiver_id.eq.${inviter.id}),and(requester_id.eq.${inviter.id},receiver_id.eq.${user.id})`
      )
      .maybeSingle()
    if (existing?.status === 'accepted') return { error: 'Vous êtes déjà alliés' }
    if (existing) return { error: 'Alliance déjà existante ou en attente' }

    const { error: allyError } = await supabase.from('allies').insert({
      requester_id: inviter.id,
      receiver_id:  user.id,
      status:       'accepted',
    })
    if (allyError) return { error: 'Erreur lors de l\'acceptation' }

    await supabase.from('notifications').insert({
      user_id:      inviter.id,
      type:         'invitation_accepted',
      from_user_id: user.id,
      payload:      {},
    })

    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}
