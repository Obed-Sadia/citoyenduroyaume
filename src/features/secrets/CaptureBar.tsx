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
    <div className="sticky bottom-16 md:bottom-0 z-10 border-t border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 pt-3 pb-2">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => { setText(e.target.value); setSuggestedDomain(null) }}
        onKeyDown={handleKeyDown}
        placeholder="Une fulgurance… Entrée pour capturer"
        className="w-full bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-[var(--color-text-disabled)]"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-editorial)' }}
        suppressHydrationWarning
      />

      {showDomainRow && (
        <div className="mt-2 flex h-6 items-center">
          {suggestedDomain ? (
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
              disabled={classifying}
              className={cn(
                'flex items-center gap-1 text-[10px] font-medium tracking-[.06em] uppercase transition-opacity',
                'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
                classifying && 'opacity-40 cursor-not-allowed'
              )}
            >
              <span aria-hidden="true">{classifying ? '…' : '◈'}</span>
              {!classifying && 'Domaine'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
