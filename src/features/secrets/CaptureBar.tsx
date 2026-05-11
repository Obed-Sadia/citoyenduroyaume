"use client"

import { useEffect, useRef, useState } from 'react'
import { useSecretsStore } from '@/lib/stores/secrets.store'

export function CaptureBar() {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const addSecret = useSecretsStore((s) => s.addSecret)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && text.trim()) {
      addSecret(text.trim())
      setText('')
    }
  }

  return (
    <div
      className="sticky bottom-16 md:bottom-0 z-10 border-t border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 py-3"
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Une fulgurance… Entrée pour capturer"
        className="w-full bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-[var(--color-text-disabled)]"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-editorial)' }}
      />
    </div>
  )
}
