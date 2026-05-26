import type { Metadata } from 'next'
import { SecretFeed } from '@/features/secrets/SecretFeed'
import { CaptureBar } from '@/features/secrets/CaptureBar'
import { BentoCard } from '@/components/bento/BentoCard'

export const metadata: Metadata = { title: 'Secrets — BASILEIA' }

export default function SecretsPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Hero */}
      <div className="flex-shrink-0 px-[26px] pt-[22px] pb-[20px] border-b border-[var(--color-border)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-accent)] opacity-65 mb-2">
              Les Secrets
            </p>
            <h1 className="font-[family-name:var(--font-editorial)] text-[22px] font-[500] text-[var(--color-text-primary)] leading-[1.25] tracking-[-0.01em]">
              Fulgurances
            </h1>
            <p className="font-[family-name:var(--font-editorial)] italic text-[14px] text-[var(--color-text-secondary)] leading-[1.8] mt-1">
              {'Intuitions soudaines. Capturées avant qu\'elles ne s\'évanouissent.'}
            </p>
          </div>
        </div>
      </div>

      {/* Bento */}
      <div
        className="flex-shrink-0 grid gap-[var(--bento-gap)] p-[16px_26px] border-b border-[var(--color-border)]"
        style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
      >
        <BentoCard label="Dernier secret" wide accent>
          <p className="font-[family-name:var(--font-editorial)] italic text-[12px] text-[var(--color-text-secondary)] leading-[1.7]">
            Capture ta première fulgurance ci-dessous.
          </p>
        </BentoCard>
        <BentoCard label="Total">
          <span className="text-[20px] font-normal text-[var(--color-accent)] leading-none">—</span>
        </BentoCard>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <SecretFeed />
      </div>

      <CaptureBar />
    </div>
  )
}
