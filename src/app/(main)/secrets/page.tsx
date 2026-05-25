import type { Metadata } from 'next'
import { SecretFeed } from '@/features/secrets/SecretFeed'
import { CaptureBar } from '@/features/secrets/CaptureBar'
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid'
import { GlassPanel } from '@/components/ui/GlassPanel'

export const metadata: Metadata = { title: 'Les Secrets — BASILEIA' }

export default function SecretsPage() {
  return (
    <div className="flex flex-col min-h-full px-4 pt-4 md:px-5 md:pt-5 pb-20 space-y-3">

      <BentoGrid cols={3}>
        <BentoCell span={3} variant="strong" className="px-4 py-3">
          <p
            className="text-[9px] font-medium tracking-[0.11em] uppercase mb-0.5"
            style={{ color: 'var(--color-amber-400)' }}
          >
            Les Secrets · Fulgurances
          </p>
          <p
            className="text-[15px] font-[family-name:var(--font-editorial)]"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Révélations captées
          </p>
        </BentoCell>
      </BentoGrid>

      <GlassPanel variant="base" className="flex-1">
        <SecretFeed />
      </GlassPanel>

      <CaptureBar />
    </div>
  )
}
