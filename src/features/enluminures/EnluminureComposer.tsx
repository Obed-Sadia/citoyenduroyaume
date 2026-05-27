'use client'

import { useState } from 'react'
import { addEnluminure } from '@/lib/actions/enluminures'
import { cn } from '@/lib/utils'

interface EnluminureComposerProps {
  noteId:    string
  onSuccess: () => void
  onCancel:  () => void
}

export function EnluminureComposer({ noteId, onSuccess, onCancel }: EnluminureComposerProps) {
  const [mode, setMode]               = useState<'text' | 'verse'>('text')
  const [highlighted, setHighlighted] = useState('')
  const [content, setContent]         = useState('')
  const [verseRef, setVerseRef]       = useState('')
  const [verseText, setVerseText]     = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const canSubmit = mode === 'text'
    ? content.trim().length > 0 && content.trim().length <= 50
    : verseRef.trim().length > 0 && verseText.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    const result = await addEnluminure(
      mode === 'text'
        ? {
            note_id:             noteId,
            type:                'text',
            highlighted_passage: highlighted.trim() || undefined,
            content:             content.trim(),
          }
        : {
            note_id:    noteId,
            type:       'verse',
            content:    verseRef.trim(),
            verse_text: verseText.trim(),
          }
    )
    setLoading(false)
    if (result.error) { setError(result.error); return }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit}
      className="rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.08)] p-4 flex flex-col gap-3"
      style={{ background: 'rgba(255,255,255,0.02)' }}>

      {/* Switcher mode */}
      <div className="flex gap-3">
        {(['text', 'verse'] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={cn(
              'text-[10px] font-medium tracking-[.06em] uppercase pb-0.5 border-b transition-colors',
              mode === m
                ? 'border-[var(--color-border-mid)] text-[var(--color-text-primary)]'
                : 'border-transparent text-[var(--color-text-muted)]'
            )}>
            {m === 'text' ? 'Annotation' : 'Verset'}
          </button>
        ))}
      </div>

      {mode === 'text' && (
        <>
          <input
            value={highlighted}
            onChange={(e) => setHighlighted(e.target.value)}
            placeholder="Passage surligné (optionnel)"
            className="bg-transparent text-[12px] italic outline-none border-b pb-1"
            style={{
              borderColor: 'rgba(255,255,255,0.06)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-editorial)',
            }}
          />
          <div className="relative">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={50}
              placeholder="Ta trace… (50 chars max)"
              className="w-full bg-transparent text-[13px] outline-none border-b pb-1"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--color-text-primary)' }}
            />
            <span className="absolute right-0 bottom-2 text-[10px]"
              style={{ color: 'var(--color-text-disabled)' }}>
              {content.length}/50
            </span>
          </div>
        </>
      )}

      {mode === 'verse' && (
        <>
          <input
            value={verseRef}
            onChange={(e) => setVerseRef(e.target.value)}
            placeholder="Référence · ex: Jean 3:16"
            className="bg-transparent text-[12px] outline-none border-b pb-1"
            style={{
              borderColor: 'rgba(255,255,255,0.1)',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-editorial)',
            }}
          />
          <textarea
            value={verseText}
            onChange={(e) => setVerseText(e.target.value)}
            placeholder="Texte du verset…"
            rows={2}
            className="bg-transparent text-[13px] italic outline-none resize-none"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-editorial)' }}
          />
        </>
      )}

      {error && (
        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{error}</p>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={!canSubmit || loading}
          className="text-[11px] font-medium tracking-[.06em] uppercase px-3 py-1 rounded-[var(--radius-sm)] border border-[var(--color-border-mid)] bg-[rgba(255,255,255,0.04)] text-[var(--color-text-primary)] disabled:opacity-30">
          {loading ? '…' : 'Enluminer'}
        </button>
        <button type="button" onClick={onCancel}
          className="text-[11px] tracking-[.06em] uppercase px-3 py-1 text-[var(--color-text-muted)]">
          Annuler
        </button>
      </div>
    </form>
  )
}
