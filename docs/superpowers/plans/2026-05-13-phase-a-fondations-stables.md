# Phase A — Fondations stables — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger les bugs critiques : auth instable → OTP, IndexedDB partagée → isolation par userId, logout inerte → fonctionnel, getSession() non sécurisé → getUser().

**Architecture:** La DB Dexie devient dynamique (initialisée après auth avec le userId comme préfixe). Un `AuthProvider` client monte dans le layout principal et orchestre l'initialisation au boot et les transitions de session. L'auth passe de magic link à OTP 2 écrans.

**Tech Stack:** Next.js 16 App Router · Supabase SSR (`@supabase/ssr`) · Dexie.js · Zustand · TypeScript strict

---

## Carte des fichiers

| Action | Fichier | Rôle |
|--------|---------|------|
| Modifié | `src/lib/db/basileia.db.ts` | DB dynamique : initDb / getDb / closeDb |
| Modifié | `src/lib/db/notes.repo.ts` | Utilise getDb() au lieu de db |
| Modifié | `src/lib/db/secrets.repo.ts` | Utilise getDb() au lieu de db |
| Modifié | `src/lib/db/verses.repo.ts` | Utilise getDb() au lieu de db |
| Modifié | `src/lib/stores/notes.store.ts` | Ajoute reset() |
| Modifié | `src/lib/stores/secrets.store.ts` | Ajoute reset() |
| Modifié | `src/lib/stores/verses.store.ts` | Ajoute reset() |
| Modifié | `src/lib/supabase/sync.ts` | getSession() → getUser() |
| Modifié | `src/app/(auth)/login/LoginForm.tsx` | OTP step 1 (envoyer code) |
| Modifié | `src/app/(main)/layout.tsx` | Monte AuthProvider |
| Modifié | `src/app/(main)/profil/page.tsx` | Branche LogoutButton |
| Nouveau | `src/features/auth/AuthProvider.tsx` | Init DB au boot + écoute auth state |
| Nouveau | `src/app/(auth)/login/verify/page.tsx` | Page OTP step 2 |
| Nouveau | `src/features/auth/OtpForm.tsx` | Saisie code 6 chiffres + verifyOtp |
| Nouveau | `src/features/profil/LogoutButton.tsx` | Déconnexion complète |

---

## Task 1 : DB dynamique — initDb / getDb / closeDb

**Fichiers :**
- Modifié : `src/lib/db/basileia.db.ts`

- [ ] **Remplacer le contenu complet du fichier**

```ts
import Dexie, { type EntityTable } from 'dexie'
import type { Note } from '@/features/journal/mock-notes'
import type { DomainId } from '@/features/carte/domain-constants'

export interface Secret {
  id: string
  text: string
  domainId?: DomainId
  createdAt: string
}

export interface Verse {
  id: string
  reference: string
  text: string
  domain: DomainId | null
  createdAt: string
}

class BasileiaDB extends Dexie {
  notes!: EntityTable<Note, 'id'>
  secrets!: EntityTable<Secret, 'id'>
  verses!: EntityTable<Verse, 'id'>

  constructor(userId: string) {
    super(`basileia_${userId}`)
    this.version(1).stores({
      notes:   'id, createdAt, domain',
      secrets: 'id, createdAt, domainId',
      verses:  'id, createdAt',
    })
    this.on('blocked', () => {
      console.warn('[BasileiaDB] upgrade blocked — close other tabs')
    })
  }
}

let _db: BasileiaDB | null = null

export function initDb(userId: string): void {
  if (_db) {
    _db.close()
  }
  _db = new BasileiaDB(userId)
  _db.open().catch((err) => {
    console.error('[BasileiaDB] open failed', err)
  })
}

export function getDb(): BasileiaDB {
  if (!_db) throw new Error('[BasileiaDB] not initialized — call initDb(userId) first')
  return _db
}

export async function closeDb(): Promise<void> {
  if (_db) {
    _db.close()
    _db = null
  }
}
```

> Note : le numéro de version repart à 1 car chaque DB porte un nom distinct — pas de migration entre l'ancienne `'basileia'` et `'basileia_<userId>'`.

- [ ] **Vérifier que TypeScript compile**

```bash
cd /home/obeds/Dev/perso/citoyen-du-royaume
npx tsc --noEmit 2>&1 | head -30
```

Attendu : erreurs uniquement sur les repos qui importent encore `db` (sera corrigé en Task 2).

- [ ] **Commit**

```bash
git add src/lib/db/basileia.db.ts
git commit -m "refactor(db): dynamic Dexie DB isolated by userId"
```

---

## Task 2 : Repos — utiliser getDb()

**Fichiers :**
- Modifié : `src/lib/db/notes.repo.ts`
- Modifié : `src/lib/db/secrets.repo.ts`
- Modifié : `src/lib/db/verses.repo.ts`

- [ ] **Remplacer `src/lib/db/notes.repo.ts`**

```ts
import { getDb } from './basileia.db'
import type { Note } from '@/features/journal/mock-notes'

export const NotesRepo = {
  async getAll(): Promise<Note[]> {
    return getDb().notes.orderBy('createdAt').reverse().toArray()
  },

  async add(note: Note): Promise<void> {
    await getDb().notes.put(note)
  },

  async update(id: string, patch: Partial<Note>): Promise<void> {
    await getDb().notes.update(id, patch)
  },

  async remove(id: string): Promise<void> {
    await getDb().notes.delete(id)
  },
}
```

- [ ] **Remplacer `src/lib/db/secrets.repo.ts`**

```ts
import { getDb } from './basileia.db'
import type { Secret } from './basileia.db'

export const SecretsRepo = {
  async getAll(): Promise<Secret[]> {
    return getDb().secrets.orderBy('createdAt').reverse().toArray()
  },

  async add(secret: Secret): Promise<void> {
    await getDb().secrets.put(secret)
  },

  async remove(id: string): Promise<void> {
    await getDb().secrets.delete(id)
  },
}
```

- [ ] **Remplacer `src/lib/db/verses.repo.ts`**

```ts
import { getDb } from './basileia.db'
import type { Verse } from './basileia.db'

export const VersesRepo = {
  async getAll(): Promise<Verse[]> {
    return getDb().verses.orderBy('createdAt').reverse().toArray()
  },

  async add(verse: Verse): Promise<void> {
    await getDb().verses.put(verse)
  },

  async remove(id: string): Promise<void> {
    await getDb().verses.delete(id)
  },
}
```

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Attendu : les erreurs de repos disparaissent.

- [ ] **Commit**

```bash
git add src/lib/db/notes.repo.ts src/lib/db/secrets.repo.ts src/lib/db/verses.repo.ts
git commit -m "refactor(repos): use getDb() instead of module-level db singleton"
```

---

## Task 3 : Stores — ajouter reset()

**Fichiers :**
- Modifié : `src/lib/stores/notes.store.ts`
- Modifié : `src/lib/stores/secrets.store.ts`
- Modifié : `src/lib/stores/verses.store.ts`

- [ ] **Ajouter `reset` dans `notes.store.ts`**

Ajouter dans l'interface `NotesStore` :
```ts
reset: () => void
```

Ajouter dans l'objet Zustand, après `getNoteById` :
```ts
reset: () => set({ notes: [], isLoaded: false }),
```

- [ ] **Ajouter `reset` dans `secrets.store.ts`**

Ajouter dans l'interface `SecretsStore` :
```ts
reset: () => void
```

Ajouter dans l'objet Zustand, après `addSecret` :
```ts
reset: () => set({ secrets: [], isLoaded: false }),
```

- [ ] **Ajouter `reset` dans `verses.store.ts`**

Ajouter dans l'interface `VersesStore` :
```ts
reset: () => void
```

Ajouter dans l'objet Zustand, après `removeVerse` :
```ts
reset: () => set({ verses: [], isLoaded: false }),
```

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Attendu : 0 erreur sur ces 3 fichiers.

- [ ] **Commit**

```bash
git add src/lib/stores/notes.store.ts src/lib/stores/secrets.store.ts src/lib/stores/verses.store.ts
git commit -m "feat(stores): add reset() action to notes, secrets, verses stores"
```

---

## Task 4 : Fix sécurité sync.ts

**Fichiers :**
- Modifié : `src/lib/supabase/sync.ts`

- [ ] **Remplacer la fonction `getUserId`**

```ts
async function getUserId(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}
```

Supprimer l'import `session` implicite (il n'y en a pas — c'est destructuré inline).

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add src/lib/supabase/sync.ts
git commit -m "fix(sync): replace getSession() with getUser() for server-side validation"
```

---

## Task 5 : AuthProvider

**Fichiers :**
- Nouveau : `src/features/auth/AuthProvider.tsx`

- [ ] **Créer `src/features/auth/AuthProvider.tsx`**

```tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { initDb, closeDb } from '@/lib/db/basileia.db'
import { useNotesStore } from '@/lib/stores/notes.store'
import { useSecretsStore } from '@/lib/stores/secrets.store'
import { useVersesStore } from '@/lib/stores/verses.store'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function initSession(userId: string): Promise<void> {
      initDb(userId)
      await Promise.all([
        useNotesStore.getState().loadFromDb(),
        useSecretsStore.getState().loadFromDb(),
        useVersesStore.getState().loadFromDb(),
      ])
    }

    function resetSession(): void {
      closeDb()
      useNotesStore.getState().reset()
      useSecretsStore.getState().reset()
      useVersesStore.getState().reset()
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) void initSession(user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        void initSession(session.user.id)
      }
      if (event === 'SIGNED_OUT') {
        resetSession()
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return <>{children}</>
}
```

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add src/features/auth/AuthProvider.tsx
git commit -m "feat(auth): AuthProvider — init DB and stores on session boot"
```

---

## Task 6 : Monter AuthProvider dans le layout principal

**Fichiers :**
- Modifié : `src/app/(main)/layout.tsx`

- [ ] **Remplacer le contenu du fichier**

```tsx
import Sidebar from '@/features/nav/Sidebar'
import BottomNav from '@/features/nav/BottomNav'
import { AuthProvider } from '@/features/auth/AuthProvider'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex h-screen bg-[var(--color-bg-base)] overflow-hidden">
        <div className="hidden md:flex h-full relative z-[var(--z-sidebar)]">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </AuthProvider>
  )
}
```

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add src/app/(main)/layout.tsx
git commit -m "feat(layout): mount AuthProvider in main layout"
```

---

## Task 7 : LoginForm — passer en mode OTP

**Fichiers :**
- Modifié : `src/app/(auth)/login/LoginForm.tsx`

- [ ] **Remplacer le contenu complet**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: sbError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })
      if (sbError) {
        setError('Impossible d\'envoyer le code. Réessayez.')
      } else {
        router.push(`/login/verify?email=${encodeURIComponent(email)}`)
      }
    } catch {
      setError('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
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
        disabled={loading}
        className={cn(
          'w-full py-3 rounded-lg text-sm font-medium',
          'bg-[var(--color-accent)] text-[var(--color-bg-base)]',
          'transition-opacity duration-150',
          loading && 'opacity-50 cursor-not-allowed'
        )}
      >
        {loading ? 'Envoi…' : 'Recevoir un code'}
      </button>
    </form>
  )
}
```

> Changements clés : suppression de `emailRedirectTo` (Supabase envoie un code à 6 chiffres au lieu d'un magic link), redirection vers `/login/verify` au lieu d'afficher "vérifiez votre email".

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add src/app/(auth)/login/LoginForm.tsx
git commit -m "feat(auth): switch login from magic link to OTP code"
```

---

## Task 8 : Page /login/verify + OtpForm

**Fichiers :**
- Nouveau : `src/app/(auth)/login/verify/page.tsx`
- Nouveau : `src/features/auth/OtpForm.tsx`

- [ ] **Créer `src/app/(auth)/login/verify/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { OtpForm } from '@/features/auth/OtpForm'

export const metadata: Metadata = { title: 'Vérification — BASILEIA' }

interface Props {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyPage({ searchParams }: Props) {
  const { email } = await searchParams
  if (!email) redirect('/login')

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
          Entrez le code reçu par email
        </p>
      </div>
      <OtpForm email={email} />
    </div>
  )
}
```

- [ ] **Créer `src/features/auth/OtpForm.tsx`**

```tsx
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
      initDb(data.user.id)
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
```

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add src/app/(auth)/login/verify/page.tsx src/features/auth/OtpForm.tsx
git commit -m "feat(auth): OTP verify page and OtpForm with resend countdown"
```

---

## Task 9 : LogoutButton

**Fichiers :**
- Nouveau : `src/features/profil/LogoutButton.tsx`

- [ ] **Créer `src/features/profil/LogoutButton.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const BTN_STYLE = {
  fontSize:     '11px',
  color:        'var(--color-text-secondary)',
  background:   'rgba(255,255,255,0.05)',
  border:       '1px solid rgba(255,255,255,0.08)',
  borderRadius: '6px',
  padding:      '4px 10px',
} as const

export function LogoutButton() {
  const [loading, setLoading] = useState(false)

  async function handleLogout(): Promise<void> {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    // AuthProvider écoute SIGNED_OUT et s'occupe du reset + redirect
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={BTN_STYLE}
      className={cn('transition-opacity hover:opacity-70', loading && 'opacity-40 cursor-not-allowed')}
    >
      {loading ? 'Déconnexion…' : 'Déconnecter'}
    </button>
  )
}
```

> Le LogoutButton appelle uniquement `signOut()`. Le reset des stores et la redirection sont gérés par `AuthProvider` via `onAuthStateChange('SIGNED_OUT')` — pas de duplication de logique.

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Commit**

```bash
git add src/features/profil/LogoutButton.tsx
git commit -m "feat(profil): LogoutButton — triggers signOut, AuthProvider handles cleanup"
```

---

## Task 10 : Brancher LogoutButton dans le profil

**Fichiers :**
- Modifié : `src/app/(main)/profil/page.tsx`

- [ ] **Ajouter l'import en haut du fichier (après les imports existants)**

```tsx
import { LogoutButton } from '@/features/profil/LogoutButton'
```

- [ ] **Remplacer le bouton "Déconnecter" inerte** (ligne 107-108)

```tsx
// Avant
<button className="transition-opacity hover:opacity-70" style={BTN_STYLE}>Déconnecter</button>

// Après
<LogoutButton />
```

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Attendu : 0 erreur.

- [ ] **Vérifier le build complet**

```bash
npm run build 2>&1 | tail -20
```

Attendu : `✓ Compiled successfully` sans erreurs.

- [ ] **Commit**

```bash
git add src/app/(main)/profil/page.tsx
git commit -m "feat(profil): wire LogoutButton — logout now functional"
```

---

## Task 11 : Test manuel complet

- [ ] **Démarrer le serveur de dev**

```bash
npm run dev
```

- [ ] **Test 1 — OTP flow**
  1. Aller sur `/login`
  2. Entrer ton email → cliquer "Recevoir un code"
  3. Vérifier que tu arrives sur `/login/verify?email=...`
  4. Entrer le code reçu par email → cliquer "Entrer dans le Royaume"
  5. Vérifier redirection vers `/`

- [ ] **Test 2 — Isolation IndexedDB**
  1. Connecté en compte A → créer une note
  2. Ouvrir DevTools → Application → IndexedDB → vérifier qu'il existe `basileia_<userIdA>`
  3. Se déconnecter (profil → Déconnecter)
  4. Se connecter avec compte B (email différent)
  5. Vérifier que les notes de A ne sont pas visibles
  6. Vérifier dans IndexedDB qu'une nouvelle DB `basileia_<userIdB>` a été créée

- [ ] **Test 3 — Logout**
  1. Connecté → aller sur `/profil`
  2. Cliquer "Déconnecter"
  3. Vérifier redirection vers `/login`
  4. Vérifier qu'accéder à `/` redirige vers `/login`

- [ ] **Test 4 — Resend OTP**
  1. Sur `/login/verify`, le bouton "Renvoyer" doit être grisé 60s
  2. Après 60s, cliquer "Renvoyer le code" → vérifier réception d'un nouveau code

---

## Prérequis Supabase Dashboard

Avant de tester, vérifier dans le Dashboard Supabase :
- **Authentication > Providers > Email** : "Enable Email OTP" doit être activé
- **Authentication > Email Templates** : le template OTP doit inclure `{{ .Token }}` (code 6 chiffres)

Si le Dashboard envoie encore un magic link au lieu d'un code, c'est que "Email OTP" n'est pas activé.
