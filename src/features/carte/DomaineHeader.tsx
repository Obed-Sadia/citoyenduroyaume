"use client"

import { DOMAIN_META, FILL } from '@/features/carte/domain-constants'
import type { DomainId } from '@/features/carte/domain-constants'

interface DomaineHeaderProps {
  domainId: DomainId
  noteCount: number
  secretCount: number
  verseCount: number
}

const R    = 28
const S3O2 = parseFloat((R * Math.sqrt(3) / 2).toFixed(2))
const RH   = R / 2
const CX   = 32
const CY   = 32

function hexPoints(): string {
  return [
    [CX,        CY - R ],
    [CX + S3O2, CY - RH],
    [CX + S3O2, CY + RH],
    [CX,        CY + R ],
    [CX - S3O2, CY + RH],
    [CX - S3O2, CY - RH],
  ].map(([x, y]) => `${x},${y}`).join(' ')
}

export function DomaineHeader({ domainId, noteCount, secretCount, verseCount }: DomaineHeaderProps) {
  const meta = DOMAIN_META.find((d) => d.id === domainId)!

  return (
    <div className="flex items-center gap-4 mb-6">
      <svg width={64} height={64} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="shrink-0">
        <polygon
          points={hexPoints()}
          fill={FILL[5]}
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={0.8}
        />
        <text
          x={CX}
          y={CY + 3}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fill="rgba(255,252,245,0.65)"
          fontFamily="var(--font-sans)"
          letterSpacing="0.06em"
          style={{ userSelect: 'none' }}
        >
          {meta.abbr}
        </text>
      </svg>

      <div>
        <p className="text-[9px] font-medium tracking-[.14em] uppercase text-[var(--color-text-primary)] opacity-65 mb-2">
          {meta.label}
        </p>
        <h1
          className="text-[28px] leading-tight"
          style={{ fontFamily: 'var(--font-editorial)', color: 'var(--color-text-primary)' }}
        >
          {meta.label}
        </h1>
        <p
          className="mt-1 text-[12px]"
          style={{ fontFamily: 'var(--font-sans)', color: 'var(--color-text-muted)' }}
        >
          {noteCount} note{noteCount !== 1 ? 's' : ''}
          <span className="mx-1.5" style={{ color: 'var(--color-text-disabled)' }}>·</span>
          {secretCount} secret{secretCount !== 1 ? 's' : ''}
          <span className="mx-1.5" style={{ color: 'var(--color-text-disabled)' }}>·</span>
          {verseCount} verset{verseCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
