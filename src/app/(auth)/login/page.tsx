import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = { title: 'Connexion — BASILEIA' }

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm px-6">
      <div className="mb-10 text-center">
        <h1
          className="text-3xl text-[var(--color-text-primary)] mb-2"
          style={{ fontFamily: 'var(--font-editorial)' }}
        >
          BASILEIA
        </h1>
        <p className="text-xs tracking-widest uppercase text-[var(--color-text-muted)]">
          Entrez dans le Royaume
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
