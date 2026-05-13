'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export type TribeWithRole = {
  id:          string
  name:        string
  theme:       string
  invite_code: string
  role:        'admin' | 'member'
  memberCount: number
}

export async function createTribe(name: string, theme: string): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const invite_code = generateInviteCode()
    const { data: tribe, error } = await supabase
      .from('tribes')
      .insert({ name, theme, creator_id: user.id, invite_code })
      .select('id')
      .single()

    if (error || !tribe) return { error: 'Erreur lors de la création' }

    await supabase.from('tribe_members').insert({
      tribe_id: tribe.id,
      user_id:  user.id,
      role:     'admin',
      status:   'member',
    })
    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}

export async function requestToJoinTribe(inviteCode: string): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { data: tribe } = await supabase
      .from('tribes')
      .select('id')
      .eq('invite_code', inviteCode)
      .single()

    if (!tribe) return { error: 'Tribu introuvable' }

    const { error } = await supabase.from('tribe_members').insert({
      tribe_id: tribe.id,
      user_id:  user.id,
    })

    if (error?.code === '23505') return { error: 'Demande déjà envoyée' }
    if (error) return { error: 'Erreur lors de la demande' }
    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}

async function assertTribeAdmin(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  memberId: string,
  userId: string,
): Promise<string | null> {
  const { data: member } = await supabase
    .from('tribe_members').select('tribe_id').eq('id', memberId).single()
  if (!member) return 'Membre introuvable'
  const { data: caller } = await supabase
    .from('tribe_members').select('role')
    .eq('tribe_id', member.tribe_id).eq('user_id', userId).single()
  if (caller?.role !== 'admin') return 'Non autorisé'
  return null
}

export async function approveTribeMember(memberId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const authError = await assertTribeAdmin(supabase, memberId, user.id)
    if (authError) return { error: authError }

    const { error } = await supabase
      .from('tribe_members')
      .update({ status: 'member' })
      .eq('id', memberId)

    if (error) return { error: 'Erreur' }
    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}

export async function rejectTribeMember(memberId: string): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const authError = await assertTribeAdmin(supabase, memberId, user.id)
    if (authError) return { error: authError }

    const { error } = await supabase
      .from('tribe_members')
      .delete()
      .eq('id', memberId)

    if (error) return { error: 'Erreur' }
    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}

export async function getMyTribes(): Promise<TribeWithRole[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from('tribe_members')
      .select('role, tribes(id, name, theme, invite_code)')
      .eq('user_id', user.id)
      .eq('status', 'member')

    if (!data) return []

    const tribes = await Promise.all(
      (data as Record<string, unknown>[]).map(async (row) => {
        const tribe = row.tribes as { id: string; name: string; theme: string; invite_code: string }
        const { count } = await supabase
          .from('tribe_members')
          .select('*', { count: 'exact', head: true })
          .eq('tribe_id', tribe.id)
          .eq('status', 'member')
        return {
          id:          tribe.id,
          name:        tribe.name,
          theme:       tribe.theme,
          invite_code: tribe.invite_code,
          role:        row.role as 'admin' | 'member',
          memberCount: count ?? 0,
        }
      })
    )
    return tribes
  } catch {
    return []
  }
}

export async function getTribePreview(inviteCode: string): Promise<{ id: string; name: string; theme: string } | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('tribes')
      .select('id, name, theme')
      .eq('invite_code', inviteCode)
      .single()
    return data ?? null
  } catch {
    return null
  }
}
