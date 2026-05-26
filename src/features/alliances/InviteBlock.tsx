'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface InviteBlockProps {
  shortCode: string
}

export function InviteBlock({ shortCode }: InviteBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = `${window.location.origin}/invite/${shortCode}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between py-3"
      style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
      <div>
        <p className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>
          Mon code Allié
        </p>
        <p className="text-[18px] font-medium tracking-[.12em] mt-0.5"
          style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-editorial)' }}>
          {shortCode}
        </p>
      </div>
      <button
        onClick={handleCopy}
        className={cn(
          'text-[11px] font-medium tracking-[.06em] uppercase px-3 py-1.5 rounded-[var(--radius-sm)]',
          'border transition-all',
          copied
            ? 'border-[var(--color-accent-border)] text-[var(--color-accent)] bg-[var(--color-accent-bg)]'
            : 'border-[rgba(255,255,255,0.08)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
        )}
      >
        {copied ? 'Copié ✓' : 'Copier le lien'}
      </button>
    </div>
  )
}
