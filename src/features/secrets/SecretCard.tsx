'use client'
import { FeedEntry } from '@/components/layout/FeedEntry'
import type { Secret } from '@/lib/stores/secrets.store'
import { relativeTime } from '@/lib/utils'

interface SecretCardProps {
  secret: Secret
}

export function SecretCard({ secret }: SecretCardProps) {
  return (
    <FeedEntry
      verse={secret.text}
      tag={secret.domainId ?? undefined}
      tagAccent={!!secret.domainId}
      date={relativeTime(secret.createdAt)}
    />
  )
}
