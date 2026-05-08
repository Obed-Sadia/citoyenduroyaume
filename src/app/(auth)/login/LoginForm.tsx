'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function LoginForm() {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: sbError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (sbError) {
      setError(sbError.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center space-y-2">
        <p className="text-[var(--color-text)] text-sm">
          Lien envoyé à <strong>{email}</strong>
        </p>
        <p className="text-[var(--color-text-muted)] text-xs">
          Vérifiez votre boîte mail et cliquez sur le lien.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="votre@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className={cn(
          'w-full px-4 py-3 rounded-lg text-sm',
          'bg-[var(--color-surface)] border border-[var(--color-border)]',
          'text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]',
          'focus:outline-none focus:border-[var(--color-accent)]',
          'transition-colors duration-150'
        )}
      />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className={cn(
          'w-full py-3 rounded-lg text-sm font-medium',
          'bg-[var(--color-accent)] text-[var(--color-bg)]',
          'transition-opacity duration-150',
          loading && 'opacity-50 cursor-not-allowed'
        )}
      >
        {loading ? 'Envoi…' : 'Recevoir un lien magique'}
      </button>
    </form>
  )
}
