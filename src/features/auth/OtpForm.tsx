'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { initDb } from '@/lib/db/basileia.db'
import { useNotesStore } from '@/lib/stores/notes.store'
import { useSecretsStore } from '@/lib/stores/secrets.store'
import { useVersesStore } from '@/lib/stores/verses.store'
import { cn } from '@/lib/utils'

interface Props {
  email: string
}

const RESEND_DELAY = 60

export function OtpForm({ email }: Props) {
  const router = useRouter()
  const [token, setToken]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [resending, setResending]   = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [countdown, setCountdown]   = useState(RESEND_DELAY)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  async function handleVerify(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: sbError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })
      if (sbError || !data.user) {
        setError('Code invalide ou expiré. Réessayez.')
        return
      }
      await initDb(data.user.id)
      await Promise.all([
        useNotesStore.getState().loadFromDb(),
        useSecretsStore.getState().loadFromDb(),
        useVersesStore.getState().loadFromDb(),
      ])
      router.push('/')
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend(): Promise<void> {
    setResending(true)
    setError(null)
    try {
      const supabase = createClient()
      await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      setCountdown(RESEND_DELAY)
    } catch {
      setError('Impossible de renvoyer. Réessayez.')
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={handleVerify} className="space-y-4">
      <p className="text-xs text-center text-[var(--color-text-muted)]">
        Code envoyé à <span className="text-[var(--color-text-secondary)]">{email}</span>
      </p>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]{6}"
        maxLength={6}
        placeholder="123456"
        value={token}
        onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
        required
        autoFocus
        className={cn(
          'w-full px-4 py-3 rounded-lg text-sm text-center tracking-[0.4em]',
          'bg-[var(--color-bg-surface)] border border-[var(--color-border)]',
          'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
          'focus:outline-none focus:border-[var(--color-accent)]',
          'transition-colors duration-150'
        )}
      />
      {error && (
        <p className="text-xs text-[var(--color-text-secondary)]">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || token.length !== 6}
        className={cn(
          'w-full py-3 rounded-lg text-sm font-medium',
          'bg-[var(--color-accent)] text-[var(--color-bg-base)]',
          'transition-opacity duration-150',
          (loading || token.length !== 6) && 'opacity-50 cursor-not-allowed'
        )}
      >
        {loading ? 'Vérification…' : 'Entrer dans le Royaume'}
      </button>
      <div className="text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={countdown > 0 || resending}
          className={cn(
            'text-xs text-[var(--color-text-muted)] transition-opacity',
            (countdown > 0 || resending) && 'opacity-40 cursor-not-allowed'
          )}
        >
          {countdown > 0 ? `Renvoyer dans ${countdown}s` : resending ? 'Envoi…' : 'Renvoyer le code'}
        </button>
      </div>
    </form>
  )
}
