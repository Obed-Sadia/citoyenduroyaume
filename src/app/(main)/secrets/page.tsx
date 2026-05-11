import type { Metadata } from 'next'
import { SecretFeed } from '@/features/secrets/SecretFeed'
import { CaptureBar } from '@/features/secrets/CaptureBar'

export const metadata: Metadata = { title: 'Les Secrets — BASILEIA' }

export default function SecretsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-5 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-medium tracking-[.09em] uppercase text-[var(--color-text-muted)]">
          Les Secrets · Fulgurances
        </p>
      </header>

      <div className="flex-1 pt-4">
        <SecretFeed />
      </div>

      <CaptureBar />
    </div>
  )
}
