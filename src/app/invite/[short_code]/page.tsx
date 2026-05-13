import type { Metadata } from 'next'
import { ConnectForm } from '@/features/alliances/ConnectForm'

export const metadata: Metadata = { title: 'Invitation — BASILEIA' }

interface Props {
  params: Promise<{ short_code: string }>
}

export default async function InvitePage({ params }: Props) {
  const { short_code } = await params

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div>
          <p className="text-[10px] font-medium tracking-[.09em] uppercase mb-2"
            style={{ color: 'var(--color-text-muted)' }}>
            Invitation Alliance
          </p>
          <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>
            Un Citoyen t'invite à rejoindre son Alliance.
          </p>
        </div>
        <ConnectForm prefilled={short_code} />
      </div>
    </div>
  )
}
