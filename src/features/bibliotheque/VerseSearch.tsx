"use client"

import { useCallback, useRef, useState } from 'react'

interface VerseSearchProps {
  onSearch: (query: string) => void
}

export function VerseSearch({ onSearch }: VerseSearchProps) {
  const [value, setValue] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value
      setValue(q)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => onSearch(q), 300)
    },
    [onSearch]
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setValue('')
      onSearch('')
    }
  }

  return (
    <div className="flex items-center gap-2 px-6 py-3 border-b border-[var(--color-border)]">
      <span className="text-[13px]" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true">
        ⌕
      </span>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Référence ou mot-clé…"
        className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[var(--color-text-disabled)]"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}
        aria-label="Rechercher un verset"
        suppressHydrationWarning
      />
      {value && (
        <button
          onClick={() => { setValue(''); onSearch('') }}
          className="text-[11px] transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Effacer la recherche"
        >
          ✕
        </button>
      )}
    </div>
  )
}
