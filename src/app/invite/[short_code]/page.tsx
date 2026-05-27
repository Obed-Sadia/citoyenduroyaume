import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { resolveShortCode, acceptLinkInvitation } from '@/lib/actions/allies'
import { getInitials, nameToHsl } from '@/lib/utils'

export const metadata: Metadata = { title: 'Invitation — BASILEIA' }

interface Props {
  params: Promise<{ short_code: string }>
}

export default async function InvitePage({ params }: Props) {
  const { short_code } = await params

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/invite/${short_code}`)

  const inviter = await resolveShortCode(short_code)
  if (!inviter) notFound()

  // Vérifier si déjà alliés
  const { data: existing } = await supabase
    .from('allies')
    .select('id, status')
    .or(
      `and(requester_id.eq.${user.id},receiver_id.eq.${inviter.id}),and(requester_id.eq.${inviter.id},receiver_id.eq.${user.id})`
    )
    .maybeSingle()

  const alreadyAllied = existing?.status === 'accepted'
  const isPending = existing && existing.status !== 'accepted'

  async function handleAccept() {
    'use server'
    const result = await acceptLinkInvitation(short_code)
    if (!result.error) redirect('/alliances')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6"
      style={{ background: 'var(--color-bg-base)' }}>
      <div className="w-full max-w-sm flex flex-col gap-6">
        <p className="text-[10px] font-medium tracking-[.09em] uppercase"
          style={{ color: 'var(--color-text-muted)' }}>
          Invitation Alliance
        </p>

        {/* Profil invitant */}
        <div className="flex items-center gap-4 rounded-[var(--radius-xl)] p-4 border border-[var(--color-border)]"
          style={{ background: 'var(--color-bg-elevated)' }}>
          <div className="h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-[14px] font-medium"
            style={{
              background: nameToHsl(inviter.display_name),
              color: 'var(--color-text-primary)',
              border: '1.5px solid var(--color-border-mid)',
            }}>
            {getInitials(inviter.display_name)}
          </div>
          <div>
            <p className="text-[15px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {inviter.display_name}
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              t&apos;invite à rejoindre son Alliance
            </p>
          </div>
        </div>

        {/* État */}
        {alreadyAllied && (
          <p className="text-[13px] text-center" style={{ color: 'var(--color-text-secondary)' }}>
            Vous êtes déjà alliés.
          </p>
        )}

        {isPending && (
          <p className="text-[13px] text-center" style={{ color: 'var(--color-text-secondary)' }}>
            Une demande d&apos;alliance est déjà en attente.
          </p>
        )}

        {!existing && inviter.id !== user.id && (
          <form action={handleAccept}>
            <button
              type="submit"
              className="w-full py-3 rounded-[var(--radius-md)] text-[13px] font-medium tracking-wide"
              style={{ background: 'rgba(255,255,255,0.10)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-mid)' }}>
              Accepter l&apos;alliance
            </button>
          </form>
        )}

        {inviter.id === user.id && (
          <p className="text-[13px] text-center" style={{ color: 'var(--color-text-muted)' }}>
            C&apos;est ton propre lien d&apos;invitation.
          </p>
        )}
      </div>
    </div>
  )
}
