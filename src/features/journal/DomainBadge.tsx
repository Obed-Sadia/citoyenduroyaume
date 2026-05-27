// src/features/journal/DomainBadge.tsx
import { DOMAIN_META } from '@/features/carte/domain-constants'
import type { DomainId } from '@/features/carte/domain-constants'

interface DomainBadgeProps {
  domain: DomainId
}

export function DomainBadge({ domain }: DomainBadgeProps) {
  const meta = DOMAIN_META.find((d) => d.id === domain)
  if (!meta) return null

  return (
    <span
      className="shrink-0 rounded-[var(--radius-xs)] border border-[var(--color-border-mid)] bg-[rgba(255,255,255,0.04)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[.06em]"
      style={{ color: 'var(--color-text-primary)' }}
    >
      {meta.abbr}
    </span>
  )
}
