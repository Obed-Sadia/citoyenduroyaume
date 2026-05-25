import type { Metadata } from 'next'
import { AllianceTabs } from '@/features/alliances/AllianceTabs'
import { BentoGrid, BentoCell } from '@/components/ui/BentoGrid'

export const metadata: Metadata = { title: 'Alliances — BASILEIA' }

export default function AlliancesPage() {
  return (
    <div className="flex flex-col h-full">

      <div className="px-4 pt-4 md:px-5 md:pt-5 pb-3">
        <BentoGrid cols={3}>
          <BentoCell span={3} variant="strong" className="px-4 py-3">
            <p
              className="text-[9px] font-medium tracking-[0.11em] uppercase mb-0.5"
              style={{ color: 'var(--color-amber-400)' }}
            >
              Alliances & Tribus
            </p>
            <p
              className="text-[15px] font-[family-name:var(--font-editorial)]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Mes Alliances
            </p>
          </BentoCell>
        </BentoGrid>
      </div>

      <AllianceTabs />
    </div>
  )
}
