import type { Metadata } from 'next'
import { getTribePreview, requestToJoinTribe } from '@/lib/actions/tribes'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'Rejoindre une Tribu — BASILEIA' }

interface Props {
  params: Promise<{ invite_code: string }>
}

export default async function TribePreviewPage({ params }: Props) {
  const { invite_code } = await params
  const tribe = await getTribePreview(invite_code)
  if (!tribe) notFound()

  async function handleJoin() {
    'use server'
    await requestToJoinTribe(invite_code)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div>
          <p className="text-[10px] font-medium tracking-[.09em] uppercase mb-2"
            style={{ color: 'var(--color-text-muted)' }}>
            Invitation à une Tribu
          </p>
          <p className="text-[22px]" style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-editorial)',
          }}>
            {tribe.name}
          </p>
          <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {tribe.theme}
          </p>
        </div>
        <form action={handleJoin}>
          <button type="submit"
            className="w-full py-2.5 rounded-[var(--radius-md)] border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)] text-[12px] font-medium tracking-[.06em] uppercase">
            Demander à rejoindre
          </button>
        </form>
      </div>
    </div>
  )
}
