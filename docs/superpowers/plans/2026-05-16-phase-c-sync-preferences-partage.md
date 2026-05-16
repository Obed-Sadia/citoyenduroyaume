# Phase C — Sync bidirectionnel, Préférences DB, TerritoireAtlas toggle

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre la restauration des données sur un nouvel appareil (pull Supabase au login), persister les préférences en DB, et ajouter un toggle "Partager mon territoire avec mes Alliés".

**Architecture:** Le pull s'intègre dans `initSession` de `AuthProvider` — après `initDb()` (Dexie ouverte) et avant `loadFromDb()` (stores chargés). Les préférences sont poussées vers `citizen_profiles.preferences` JSONB à chaque changement, et tirées au login. Aucune migration DB nécessaire.

**Tech Stack:** Dexie.js · Supabase JS client · Zustand · Next.js App Router

---

## Fichiers touchés

| Fichier | Action | Rôle |
|---|---|---|
| `src/features/journal/mock-notes.ts` | Modifier | Ajouter `updatedAt?: string` à `Note` |
| `src/lib/supabase/sync.ts` | Modifier | Ajouter `syncPreferences`, `pullNotes`, `pullSecrets`, `pullVerses` |
| `src/lib/stores/profil.store.ts` | Modifier | Ajouter `share_territoire`, `hydrateFromRemote`, appels `syncPreferences` dans les setters |
| `src/features/auth/AuthProvider.tsx` | Modifier | Intégrer pull dans `initSession` |
| `src/features/profil/PreferencesForm.tsx` | Modifier | Ajouter toggle `share_territoire` |

---

## Task 1 : Ajouter `updatedAt` à l'interface `Note`

**Files:**
- Modify: `src/features/journal/mock-notes.ts`
- Modify: `src/lib/stores/notes.store.ts`

Nécessaire pour la stratégie last-write-wins : comparer `supabase.updated_at` vs `local.updatedAt`.

- [ ] **Step 1 : Ajouter `updatedAt` à l'interface Note**

Dans `src/features/journal/mock-notes.ts`, modifier l'interface `Note` :

```typescript
export interface Note {
  id: string
  title: string
  excerpt: string
  content: string
  domain: DomainId | null
  createdAt: string
  updatedAt?: string   // ← ajouter cette ligne
  wordCount: number
  visibility?: 'private' | 'allies' | 'tribe'
  tribe_id?:   string | null
}
```

- [ ] **Step 2 : Peupler `updatedAt` lors d'une mise à jour locale**

Dans `src/lib/stores/notes.store.ts`, modifier `updateNote` pour tracer `updatedAt` :

```typescript
updateNote: async (id, patch) => {
  const now = new Date().toISOString()
  const patchWithDate = { ...patch, updatedAt: now }
  set((state) => ({
    notes: state.notes.map((n) => (n.id === id ? { ...n, ...patchWithDate } : n)),
  }))
  try {
    await NotesRepo.update(id, patchWithDate)
    const updated = get().notes.find((n) => n.id === id)
    if (updated) void syncNote(updated)
  } catch (err) {
    console.error('[NotesStore] updateNote failed', err)
  }
},
```

- [ ] **Step 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Step 4 : Commit**

```bash
git add src/features/journal/mock-notes.ts src/lib/stores/notes.store.ts
git commit -m "feat(note): add updatedAt field for last-write-wins sync"
```

---

## Task 2 : `syncPreferences` dans `sync.ts`

**Files:**
- Modify: `src/lib/supabase/sync.ts`

- [ ] **Step 1 : Ajouter `syncPreferences` à la fin de `sync.ts`**

```typescript
export async function syncPreferences(patch: Record<string, unknown>): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      const { data: existing } = await supabase
        .from('citizen_profiles')
        .select('preferences')
        .eq('id', userId)
        .single()
      const merged = { ...(existing?.preferences as Record<string, unknown> ?? {}), ...patch }
      await supabase
        .from('citizen_profiles')
        .update({ preferences: merged })
        .eq('id', userId)
    } catch {
      // silent — fire-and-forget
    }
  })
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add src/lib/supabase/sync.ts
git commit -m "feat(sync): add syncPreferences to persist prefs in citizen_profiles"
```

---

## Task 3 : Mettre à jour `profil.store.ts`

**Files:**
- Modify: `src/lib/stores/profil.store.ts`

Trois changements : (1) ajouter `share_territoire`, (2) chaque setter public appelle `syncPreferences`, (3) ajouter `hydrateFromRemote` sans déclencher de push.

- [ ] **Step 1 : Réécrire `profil.store.ts` au complet**

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { syncPreferences } from '@/lib/supabase/sync'

type Theme = 'dark' | 'light' | 'system'
type EditorFont = 'cormorant' | 'dm-sans' | 'literata'
type FontSize = 'sm' | 'md' | 'lg'

interface ProfilState {
  theme:             Theme
  editor_font:       EditorFont
  font_size:         FontSize
  bible_translation: string
  locale:            string
  share_territoire:  boolean
  setTheme:             (theme: Theme)      => void
  setEditorFont:        (font: EditorFont)  => void
  setFontSize:          (size: FontSize)    => void
  setBibleTranslation:  (t: string)         => void
  setLocale:            (locale: string)    => void
  setShareTerritoire:   (v: boolean)        => void
  hydrateFromRemote:    (prefs: Record<string, unknown>) => void
}

export const useProfilStore = create<ProfilState>()(
  persist(
    (set) => ({
      theme:             'dark',
      editor_font:       'cormorant',
      font_size:         'md',
      bible_translation: 'LSG',
      locale:            'fr',
      share_territoire:  false,

      setTheme: (theme) => {
        set({ theme })
        void syncPreferences({ theme })
      },
      setEditorFont: (editor_font) => {
        set({ editor_font })
        void syncPreferences({ editor_font })
      },
      setFontSize: (font_size) => {
        set({ font_size })
        void syncPreferences({ font_size })
      },
      setBibleTranslation: (bible_translation) => {
        set({ bible_translation })
        void syncPreferences({ bible_translation })
      },
      setLocale: (locale) => {
        set({ locale })
        void syncPreferences({ locale })
      },
      setShareTerritoire: (share_territoire) => {
        set({ share_territoire })
        void syncPreferences({ share_territoire })
      },

      // Hydrate depuis Supabase sans déclencher un re-push
      hydrateFromRemote: (prefs) => {
        const allowed: Partial<ProfilState> = {}
        if (typeof prefs.theme === 'string')
          allowed.theme = prefs.theme as Theme
        if (typeof prefs.editor_font === 'string')
          allowed.editor_font = prefs.editor_font as EditorFont
        if (typeof prefs.font_size === 'string')
          allowed.font_size = prefs.font_size as FontSize
        if (typeof prefs.bible_translation === 'string')
          allowed.bible_translation = prefs.bible_translation
        if (typeof prefs.locale === 'string')
          allowed.locale = prefs.locale
        if (typeof prefs.share_territoire === 'boolean')
          allowed.share_territoire = prefs.share_territoire
        set(allowed)   // setState direct — pas de syncPreferences appelé
      },
    }),
    {
      name:    'basileia-profil',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add src/lib/stores/profil.store.ts
git commit -m "feat(profil): persist preferences to Supabase + share_territoire toggle"
```

---

## Task 4 : Pull functions dans `sync.ts`

**Files:**
- Modify: `src/lib/supabase/sync.ts`

Trois pullers : `pullNotes` (last-write-wins via `updatedAt`), `pullSecrets` (insert-if-missing), `pullVerses` (insert-if-missing).

- [ ] **Step 1 : Ajouter les imports manquants en tête de `sync.ts`**

Ajouter après les imports existants :

```typescript
import { NotesRepo } from '@/lib/db/notes.repo'
import { SecretsRepo } from '@/lib/db/secrets.repo'
import { VersesRepo } from '@/lib/db/verses.repo'
import type { DomainId } from '@/features/carte/domain-constants'
```

- [ ] **Step 2 : Ajouter `pullNotes` à la fin de `sync.ts`**

```typescript
export async function pullNotes(): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      const { data: rows } = await supabase
        .from('notes')
        .select('id, title, content, domain_id, created_at, updated_at, visibility, tribe_id')
        .eq('user_id', userId)
      if (!rows) return
      for (const row of rows) {
        const local = await NotesRepo.getById(row.id)
        const remoteTs = row.updated_at ?? row.created_at
        const localTs  = local?.updatedAt ?? local?.createdAt ?? ''
        if (!local || remoteTs > localTs) {
          await NotesRepo.add({
            id:         row.id,
            title:      row.title ?? '',
            excerpt:    local?.excerpt ?? '',
            content:    row.content as string ?? '',
            domain:     (row.domain_id ?? null) as DomainId | null,
            createdAt:  row.created_at,
            updatedAt:  row.updated_at ?? undefined,
            wordCount:  local?.wordCount ?? 0,
            visibility: row.visibility ?? 'private',
            tribe_id:   row.tribe_id ?? null,
          })
        }
      }
    } catch {
      // silent — offline-first
    }
  })
}
```

- [ ] **Step 3 : Ajouter `getById` à `NotesRepo`**

Dans `src/lib/db/notes.repo.ts`, ajouter :

```typescript
async getById(id: string): Promise<Note | undefined> {
  return getDb().notes.get(id)
},
```

Le fichier complet devient :

```typescript
import { getDb } from './basileia.db'
import type { Note } from '@/features/journal/mock-notes'

export const NotesRepo = {
  async getAll(): Promise<Note[]> {
    return getDb().notes.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<Note | undefined> {
    return getDb().notes.get(id)
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

- [ ] **Step 4 : Ajouter `pullSecrets` à la fin de `sync.ts`**

```typescript
export async function pullSecrets(): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      const { data: rows } = await supabase
        .from('secrets')
        .select('id, text, domain_id, created_at')
        .eq('user_id', userId)
      if (!rows) return
      for (const row of rows) {
        const existing = await SecretsRepo.getById(row.id)
        if (!existing) {
          await SecretsRepo.add({
            id:        row.id,
            text:      row.text,
            domainId:  (row.domain_id ?? undefined) as DomainId | undefined,
            createdAt: row.created_at,
          })
        }
      }
    } catch {
      // silent
    }
  })
}
```

- [ ] **Step 5 : Ajouter `getById` à `SecretsRepo`**

Dans `src/lib/db/secrets.repo.ts` :

```typescript
import { getDb } from './basileia.db'
import type { Secret } from './basileia.db'

export const SecretsRepo = {
  async getAll(): Promise<Secret[]> {
    return getDb().secrets.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<Secret | undefined> {
    return getDb().secrets.get(id)
  },

  async add(secret: Secret): Promise<void> {
    await getDb().secrets.put(secret)
  },

  async remove(id: string): Promise<void> {
    await getDb().secrets.delete(id)
  },
}
```

- [ ] **Step 6 : Ajouter `pullVerses` à la fin de `sync.ts`**

```typescript
export async function pullVerses(): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      const { data: rows } = await supabase
        .from('verses')
        .select('id, reference, text, domain, created_at')
        .eq('user_id', userId)
      if (!rows) return
      for (const row of rows) {
        const existing = await VersesRepo.getById(row.id)
        if (!existing) {
          await VersesRepo.add({
            id:        row.id,
            reference: row.reference,
            text:      row.text,
            domain:    (row.domain ?? null) as DomainId | null,
            createdAt: row.created_at,
          })
        }
      }
    } catch {
      // silent
    }
  })
}
```

- [ ] **Step 7 : Ajouter `getById` à `VersesRepo`**

Dans `src/lib/db/verses.repo.ts` :

```typescript
import { getDb } from './basileia.db'
import type { Verse } from './basileia.db'

export const VersesRepo = {
  async getAll(): Promise<Verse[]> {
    return getDb().verses.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<Verse | undefined> {
    return getDb().verses.get(id)
  },

  async add(verse: Verse): Promise<void> {
    await getDb().verses.put(verse)
  },

  async remove(id: string): Promise<void> {
    await getDb().verses.delete(id)
  },
}
```

- [ ] **Step 8 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Step 9 : Commit**

```bash
git add src/lib/supabase/sync.ts src/lib/db/notes.repo.ts src/lib/db/secrets.repo.ts src/lib/db/verses.repo.ts
git commit -m "feat(sync): add pullNotes/Secrets/Verses for bidirectional sync"
```

---

## Task 5 : Mettre à jour `AuthProvider` — pull au login

**Files:**
- Modify: `src/features/auth/AuthProvider.tsx`

- [ ] **Step 1 : Réécrire `AuthProvider.tsx`**

```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { initDb, closeDb } from '@/lib/db/basileia.db'
import { useNotesStore } from '@/lib/stores/notes.store'
import { useSecretsStore } from '@/lib/stores/secrets.store'
import { useVersesStore } from '@/lib/stores/verses.store'
import { useProfilStore } from '@/lib/stores/profil.store'
import { pullNotes, pullSecrets, pullVerses } from '@/lib/supabase/sync'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function initSession(userId: string): Promise<void> {
      await initDb(userId)

      // Pull depuis Supabase → Dexie (last-write-wins / insert-if-missing)
      await Promise.all([pullNotes(), pullSecrets(), pullVerses()])

      // Pull préférences
      const { data: profile } = await supabase
        .from('citizen_profiles')
        .select('preferences')
        .eq('id', userId)
        .single()
      if (profile?.preferences) {
        useProfilStore.getState().hydrateFromRemote(
          profile.preferences as Record<string, unknown>
        )
      }

      // Charger les stores depuis Dexie (maintenant à jour)
      await Promise.all([
        useNotesStore.getState().loadFromDb(),
        useSecretsStore.getState().loadFromDb(),
        useVersesStore.getState().loadFromDb(),
      ])
    }

    function resetSession(): void {
      void closeDb()
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

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Attendu : aucune erreur.

- [ ] **Step 3 : Commit**

```bash
git add src/features/auth/AuthProvider.tsx
git commit -m "feat(auth): pull Supabase data and prefs on login in initSession"
```

---

## Task 6 : Toggle `share_territoire` dans `PreferencesForm`

**Files:**
- Modify: `src/features/profil/PreferencesForm.tsx`

- [ ] **Step 1 : Réécrire `PreferencesForm.tsx`**

```typescript
"use client"

import type { CSSProperties, ReactNode } from 'react'
import { useProfilStore } from '@/lib/stores/profil.store'

const SELECT_STYLE: CSSProperties = {
  fontSize:     '11px',
  color:        'var(--color-text-secondary)',
  background:   'rgba(255,255,255,0.05)',
  border:       '1px solid rgba(255,255,255,0.08)',
  borderRadius: '6px',
  padding:      '4px 10px',
  appearance:   'none',
  cursor:       'pointer',
  outline:      'none',
}

const TOGGLE_TRACK: CSSProperties = {
  display:       'inline-flex',
  alignItems:    'center',
  width:         '32px',
  height:        '18px',
  borderRadius:  '9999px',
  border:        '1px solid rgba(255,255,255,0.15)',
  padding:       '2px',
  cursor:        'pointer',
  transition:    'background 200ms',
  flexShrink:    0,
}

function PreferenceRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}
    >
      <span className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      {children}
    </div>
  )
}

export function PreferencesForm() {
  const {
    locale,            setLocale,
    bible_translation, setBibleTranslation,
    theme,             setTheme,
    editor_font,       setEditorFont,
    font_size,         setFontSize,
    share_territoire,  setShareTerritoire,
  } = useProfilStore()

  return (
    <div>
      <PreferenceRow label="Langue">
        <select value={locale} onChange={(e) => setLocale(e.target.value)} style={SELECT_STYLE}>
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="pt">Português</option>
          <option value="es">Español</option>
        </select>
      </PreferenceRow>

      <PreferenceRow label="Traduction biblique">
        <select
          value={bible_translation}
          onChange={(e) => setBibleTranslation(e.target.value)}
          style={SELECT_STYLE}
        >
          {['LSG', 'NEG', 'NBS', 'KJV', 'NVI'].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </PreferenceRow>

      <PreferenceRow label="Thème">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'dark' | 'light' | 'system')}
          style={SELECT_STYLE}
        >
          <option value="dark">Sombre</option>
          <option value="light">Clair</option>
          <option value="system">Système</option>
        </select>
      </PreferenceRow>

      <PreferenceRow label="Police éditoriale">
        <select
          value={editor_font}
          onChange={(e) => setEditorFont(e.target.value as 'cormorant' | 'dm-sans' | 'literata')}
          style={SELECT_STYLE}
        >
          <option value="cormorant">Cormorant</option>
          <option value="dm-sans">DM Sans</option>
          <option value="literata">Literata</option>
        </select>
      </PreferenceRow>

      <PreferenceRow label="Taille du texte">
        <select
          value={font_size}
          onChange={(e) => setFontSize(e.target.value as 'sm' | 'md' | 'lg')}
          style={SELECT_STYLE}
        >
          <option value="sm">Petite</option>
          <option value="md">Normale</option>
          <option value="lg">Grande</option>
        </select>
      </PreferenceRow>

      <PreferenceRow label="Partager mon Territoire avec mes Alliés">
        <button
          role="switch"
          aria-checked={share_territoire}
          onClick={() => setShareTerritoire(!share_territoire)}
          style={{
            ...TOGGLE_TRACK,
            background: share_territoire
              ? 'rgba(239,159,39,0.55)'
              : 'rgba(255,255,255,0.06)',
          }}
        >
          <span
            style={{
              display:       'block',
              width:         '12px',
              height:        '12px',
              borderRadius:  '9999px',
              background:    share_territoire ? '#EF9F27' : 'rgba(255,255,255,0.30)',
              transform:     share_territoire ? 'translateX(14px)' : 'translateX(0)',
              transition:    'transform 200ms, background 200ms',
            }}
          />
        </button>
      </PreferenceRow>
    </div>
  )
}
```

- [ ] **Step 2 : Vérifier TypeScript + build**

```bash
npx tsc --noEmit && npm run build
```

Attendu : build réussi, aucune erreur.

- [ ] **Step 3 : Vérification manuelle**

1. `npm run dev` → naviguer vers `/profil`
2. Le toggle "Partager mon Territoire" est visible en bas des préférences
3. Cliquer le toggle → il s'anime (ambre = activé, gris = désactivé)
4. Recharger la page → l'état est conservé (localStorage + Supabase)
5. Ouvrir les DevTools Supabase ou Network → vérifier le PATCH sur `citizen_profiles` avec `preferences.share_territoire: true`

- [ ] **Step 4 : Commit**

```bash
git add src/features/profil/PreferencesForm.tsx
git commit -m "feat(profil): add share_territoire toggle in PreferencesForm"
```

---

## Vérification finale

- [ ] Se déconnecter puis se reconnecter → vérifier que les notes/secrets/verses du compte sont restaurés dans les stores
- [ ] Changer une préférence (ex. thème) → vérifier la colonne `preferences` en Supabase Dashboard
- [ ] Ouvrir un second onglet ou appareil connecté → vérifier que les préférences sont cohérentes après login
