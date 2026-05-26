"use client"

import { useEffect, useRef, useState } from 'react'
import { useSecretsStore } from '@/lib/stores/secrets.store'
import { classifyDomain } from '@/lib/ai/classify-domain'
import { DOMAIN_META, type DomainId } from '@/features/carte/domain-constants'
import { cn } from '@/lib/utils'

export function CaptureBar() {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const addSecret = useSecretsStore((s) => s.addSecret)
  const [suggestedDomain, setSuggestedDomain] = useState<DomainId | null>(null)
  const [classifying, setClassifying]         = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && text.trim()) {
      addSecret(text.trim(), suggestedDomain ?? undefined)
      setText('')
      setSuggestedDomain(null)
    }
  }

  async function handleClassify() {
    if (classifying || text.trim().length < 3) return
    setClassifying(true)
    try {
      const domain = await classifyDomain(text.trim())
      setSuggestedDomain(domain)
    } catch {
      // silent — App-Effacement
    } finally {
      setClassifying(false)
    }
  }

  const showDomainRow = text.trim().length >= 3

  return (
    <div className="flex-shrink-0 p-[12px_26px] border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <div className="flex items-center gap-2.5 bg-[var(--color-bg-base)] border border-[var(--color-border-mid)] rounded-[7px] px-3.5 py-[9px] focus-within:border-[var(--color-accent-border)] transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); setSuggestedDomain(null) }}
          onKeyDown={handleKeyDown}
          placeholder="Une fulgurance…"
          className="flex-1 bg-transparent outline-none font-[family-name:var(--font-editorial)] italic text-[13px] text-[var(--color-text-secondary)] placeholder:text-[var(--color-text-muted)]"
          suppressHydrationWarning
        />

        {showDomainRow && suggestedDomain ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium tracking-[.06em] uppercase px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)]">
              {DOMAIN_META.find((d) => d.id === suggestedDomain)?.abbr}
            </span>
            <button
              onClick={() => setSuggestedDomain(null)}
              className="text-[10px] text-[var(--color-text-muted)] transition-opacity hover:opacity-70"
              aria-label="Retirer le domaine"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={handleClassify}
            disabled={!text.trim() || classifying}
            className="text-[8px] font-medium tracking-[.08em] uppercase px-3 py-[5px] rounded-[5px] border border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] text-[var(--color-accent)] disabled:opacity-40 transition-colors hover:bg-[rgba(107,159,212,0.14)]"
          >
            {classifying ? '…' : '◈ Domaine'}
          </button>
        )}
      </div>
    </div>
  )
}
