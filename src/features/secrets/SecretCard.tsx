"use client"

import { relativeTime } from '@/lib/utils'
import { DomainBadge } from '@/features/journal/DomainBadge'
import type { Secret } from '@/lib/stores/secrets.store'

interface SecretCardProps {
  secret: Secret
}

export function SecretCard({ secret }: SecretCardProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <p
          className="text-[15px] leading-relaxed"
          style={{ fontFamily: 'var(--font-editorial)', color: 'var(--color-text-primary)' }}
        >
          {secret.text}
        </p>
        {secret.domainId && <DomainBadge domain={secret.domainId} />}
      </div>

      <span
        className="text-[11px]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {relativeTime(secret.createdAt)}
      </span>
    </div>
  )
}
