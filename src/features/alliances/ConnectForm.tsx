'use client'

import { useState } from 'react'
import { sendAllyRequest } from '@/lib/actions/allies'
import { cn } from '@/lib/utils'

interface ConnectFormProps {
  prefilled?: string
  onSuccess?: () => void
}

export function ConnectForm({ prefilled = '', onSuccess }: ConnectFormProps) {
  const [code, setCode]       = useState(prefilled.toUpperCase())
  const [status, setStatus]   = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (code.trim().length !== 6) return
    setStatus('loading')
    const result = await sendAllyRequest(code.trim())
    if (result.error) {
      setStatus('error')
      setMessage(result.error)
    } else {
      setStatus('success')
      setMessage("Demande envoyée — en attente d'acceptation")
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-[10px] font-medium tracking-[.09em] uppercase"
        style={{ color: 'var(--color-text-muted)' }}>
        Ajouter un Allié
      </p>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus('idle') }}
          maxLength={6}
          placeholder="Code · ex: R4K9XM"
          className="flex-1 bg-transparent text-[14px] outline-none border-b pb-1"
          style={{
            borderColor: 'rgba(255,255,255,0.1)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-editorial)',
            letterSpacing: '.1em',
          }}
        />
        <button
          type="submit"
          disabled={code.trim().length !== 6 || status === 'loading'}
          className={cn(
            'text-[11px] font-medium tracking-[.06em] uppercase px-3 py-1 rounded-[var(--radius-sm)]',
            'border border-[rgba(255,255,255,0.08)] transition-opacity',
            'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            (code.trim().length !== 6 || status === 'loading') && 'opacity-30 cursor-not-allowed'
          )}
        >
          {status === 'loading' ? '…' : 'Envoyer'}
        </button>
      </div>
      {message && (
        <p className="text-[11px]"
          style={{ color: status === 'error' ? 'var(--color-text-muted)' : 'var(--color-amber-400)' }}>
          {message}
        </p>
      )}
    </form>
  )
}
