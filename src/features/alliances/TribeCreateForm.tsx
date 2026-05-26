'use client'

import { useState } from 'react'
import { createTribe } from '@/lib/actions/tribes'

interface TribeCreateFormProps {
  onSuccess?: () => void
}

export function TribeCreateForm({ onSuccess }: TribeCreateFormProps) {
  const [open, setOpen]       = useState(false)
  const [name, setName]       = useState('')
  const [theme, setTheme]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !theme.trim()) return
    setLoading(true)
    const result = await createTribe(name.trim(), theme.trim())
    setLoading(false)
    if (result.error) { setError(result.error); return }
    setOpen(false)
    setName('')
    setTheme('')
    onSuccess?.()
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="text-[11px] font-medium tracking-[.06em] uppercase px-3 py-1.5 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.08)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
      + Nouvelle Tribu
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 py-3">
      <input value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Nom de la Tribu"
        className="bg-transparent text-[14px] outline-none border-b pb-1"
        style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--color-text-primary)' }} />
      <input value={theme} onChange={(e) => setTheme(e.target.value)}
        placeholder="Thème ou texte d'étude"
        className="bg-transparent text-[13px] outline-none border-b pb-1"
        style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-secondary)' }} />
      {error && <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading || !name.trim() || !theme.trim()}
          className="text-[11px] font-medium tracking-[.06em] uppercase px-3 py-1 rounded-[var(--radius-sm)] border border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] text-[var(--color-accent)] disabled:opacity-30">
          {loading ? '…' : 'Créer'}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="text-[11px] tracking-[.06em] uppercase px-3 py-1 text-[var(--color-text-muted)]">
          Annuler
        </button>
      </div>
    </form>
  )
}
