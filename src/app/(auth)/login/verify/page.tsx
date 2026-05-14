import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { OtpForm } from '@/features/auth/OtpForm'

export const metadata: Metadata = { title: 'Vérification — BASILEIA' }

interface Props {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyPage({ searchParams }: Props) {
  const { email } = await searchParams
  if (!email) redirect('/login')

  return (
    <div className="w-full max-w-sm px-6">
      <div className="mb-10 text-center">
        <h1
          className="text-3xl text-[var(--color-text-primary)] mb-2"
          style={{ fontFamily: 'var(--font-editorial)' }}
        >
          BASILEIA
        </h1>
        <p className="text-xs tracking-widest uppercase text-[var(--color-text-muted)]">
          Entrez le code reçu par email
        </p>
      </div>
      <OtpForm email={email} />
    </div>
  )
}
