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

    const { data } = await supabase
      .from('citizen_profiles')
      .select('preferences')
      .eq('id', allyId)
      .single()

    if (!data) return null
    const prefs = data.preferences as Record<string, unknown>
    if (!prefs?.territoire || typeof prefs.territoire !== 'object') return null
    return prefs.territoire as Partial<Record<DomainId, ExplorationLevel>>
  } catch {
    return null
  }
}
