'use client'

import { useSyncStore } from '@/lib/stores/sync.store'

export function SyncDot() {
  const pending = useSyncStore((s) => s.pending)
  if (pending === 0) return null

  return (
    <div
      aria-hidden
      className="fixed top-3 right-3 z-50 w-2 h-2 rounded-full"
      style={{
        background: 'var(--color-accent)',
        animation: 'pulse 1.4s ease-in-out infinite',
        opacity: 0.85,
      }}
    />
  )
}
