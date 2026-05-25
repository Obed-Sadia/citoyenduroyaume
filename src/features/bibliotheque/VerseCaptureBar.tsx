"use client"

import { useRef, useState } from 'react'
import { useVersesStore } from '@/lib/stores/verses.store'
import { classifyDomain } from '@/lib/ai/classify-domain'
import { DOMAIN_META, type DomainId } from '@/features/carte/domain-constants'
import { cn } from '@/lib/utils'

export function VerseCaptureBar() {
  const [reference, setReference] = useState('')
  const [text, setText] = useState('')
  const [suggestedDomain, setSuggestedDomain] = useState<DomainId | null>(null)
  const [classifying, setClassifying] = useState(false)
  const [visibility, setVisibility] = useState<'private' | 'allies'>('private')
  const textRef = useRef<HTMLInputElement>(null)
  const addVerse = useVersesStore((s) => s.addVerse)

  function reset() {
    setReference('')
    setText('')
    setSuggestedDomain(null)
    setVisibility('private')
    textRef.current?.focus()
  }

  function handleTextKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && reference.trim() && text.trim()) {
      addVerse(reference.trim(), text.trim(), suggestedDomain ?? undefined, visibility)
      reset()
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
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Jean 3:16"
          className="w-[140px] shrink-0 bg-transparent text-[13px] outline-none placeholder:text-[var(--color-text-disabled)] border-r border-[var(--color-border)] pr-2"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}
          suppressHydrationWarning
        />
        <input
          ref={textRef}
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); setSuggestedDomain(null) }}
          onKeyDown={handleTextKeyDown}
          placeholder="Texte du verset…"
          className="flex-1 bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-[var(--color-text-disabled)]"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-editorial)' }}
          suppressHydrationWarning
        />
      </div>

      {showDomainRow && (
        <div className="mt-2 flex h-6 items-center justify-between">
          {/* Domaine — côté gauche */}
          <div className="flex items-center gap-1.5">
            {suggestedDomain ? (
              <>
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
              </>
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

          {/* Toggle visibility — côté droit */}
          <button
            onClick={() => setVisibility(v => v === 'private' ? 'allies' : 'private')}
            className={cn(
              'flex items-center gap-1 text-[10px] font-medium tracking-[.06em] uppercase transition-colors',
              visibility === 'allies'
                ? 'text-[var(--color-amber-400)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            )}
          >
            {visibility === 'allies' ? '⬡ Alliés' : '⬡ Privé'}
          </button>
        </div>
      )}
    </div>
  )
}
