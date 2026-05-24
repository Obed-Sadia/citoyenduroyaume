# Phase D — TerritoireAtlas des Alliés — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher le TerritoireAtlas (SVG 7 hexagones) d'un Allié dans AllyCard quand il a activé share_territoire.

**Architecture:** Snapshot d'exploration stocké dans `citizen_profiles.preferences.territoire` au moment du sync. Un Allié lit ce snapshot via une Server Action protégée par RLS. AllyCard affiche TerritoireAtlas si le snapshot est disponible.

**Tech Stack:** Next.js App Router · Supabase (RLS) · Dexie.js · Framer Motion (TerritoireAtlas existant) · TypeScript strict

---

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `src/lib/supabase/sync.ts` | Modifier — ajouter `computeExplorationSnapshot()` + mettre à jour `syncPreferences` |
| `src/lib/actions/allies.ts` | Modifier — ajouter `getAllyTerritoire(allyId)` |
| `src/features/alliances/AllyCard.tsx` | Modifier — fetch territoire + affichage conditionnel TerritoireAtlas |
| Supabase Dashboard (SQL) | Étape manuelle — ajouter RLS policy `allies_read_shared_territoire` |

---

## Task 1 : Modifier `sync.ts` — snapshot territoire

**Fichiers :**
- Modifier : `src/lib/supabase/sync.ts`

- [ ] **Étape 1 : Mettre à jour l'import existant et ajouter les helpers**

Remplacer la ligne 8 de `sync.ts` (import DomainId seul) :

```typescript
// avant
import type { DomainId } from '@/features/carte/domain-constants'
// après
import type { DomainId, ExplorationLevel } from '@/features/carte/domain-constants'
```

Puis ajouter après la fonction `track()` (ligne 20) :

```typescript
function toExplorationLevel(count: number): ExplorationLevel {
  if (count === 0) return 0
  if (count <= 2)  return 1
  if (count <= 5)  return 2
  if (count <= 10) return 3
  if (count <= 20) return 4
  return 5
}

async function computeExplorationSnapshot(): Promise<Partial<Record<DomainId, ExplorationLevel>>> {
  const [notes, secrets, verses] = await Promise.all([
    NotesRepo.getAll(),
    SecretsRepo.getAll(),
    VersesRepo.getAll(),
  ])

  const counts: Partial<Record<DomainId, number>> = {}

  for (const n of notes) {
    if (n.domain) counts[n.domain] = (counts[n.domain] ?? 0) + 1
  }
  for (const s of secrets) {
    if (s.domainId) counts[s.domainId] = (counts[s.domainId] ?? 0) + 1
  }
  for (const v of verses) {
    if (v.domain) counts[v.domain] = (counts[v.domain] ?? 0) + 1
  }

  const result: Partial<Record<DomainId, ExplorationLevel>> = {}
  for (const [id, count] of Object.entries(counts)) {
    result[id as DomainId] = toExplorationLevel(count ?? 0)
  }
  return result
}
```

- [ ] **Étape 2 : Remplacer `syncPreferences` entièrement**

Remplacer la fonction `syncPreferences` existante (lignes 214–238) par :

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
        .maybeSingle()
      const merged = { ...(existing?.preferences as Record<string, unknown> ?? {}), ...patch }
      if (merged.share_territoire === true) {
        merged.territoire = await computeExplorationSnapshot()
      }
      await supabase
        .from('citizen_profiles')
        .update({ preferences: merged })
        .eq('id', userId)
    } catch {
      // silent — offline-first
    }
  })
}
```

> Note : les `console.error` debug (TODO) sont retirés dans cette réécriture.

- [ ] **Étape 3 : Vérifier que TypeScript compile sans erreur**

```bash
cd /home/obeds/Dev/perso/citoyen-du-royaume
npx tsc --noEmit
```

Résultat attendu : aucune erreur sur `sync.ts`.

- [ ] **Étape 4 : Committer**

```bash
git add src/lib/supabase/sync.ts
git commit -m "feat(sync): push territoire snapshot in syncPreferences when share_territoire=true"
```

---

## Task 2 : RLS Supabase (étape manuelle)

**Fichiers :** Supabase Dashboard — pas de fichier local.

- [ ] **Étape 1 : Ouvrir le Dashboard Supabase**

Navigation : **Authentication → Policies → Table `citizen_profiles` → New Policy → For full customization**

- [ ] **Étape 2 : Coller et exécuter ce SQL**

```sql
CREATE POLICY "allies_read_shared_territoire"
ON public.citizen_profiles
FOR SELECT
USING (
  (preferences->>'share_territoire')::boolean = true
  AND EXISTS (
    SELECT 1 FROM public.allies
    WHERE status = 'accepted'
    AND (
      (requester_id = auth.uid() AND receiver_id = citizen_profiles.id)
      OR
      (receiver_id = auth.uid() AND requester_id = citizen_profiles.id)
    )
  )
);
```

- [ ] **Étape 3 : Vérifier**

La politique `allies_read_shared_territoire` apparaît dans la liste des policies de `citizen_profiles`. La politique existante (`own profile`) est toujours là — Supabase combine les deux SELECT en OR automatiquement.

---

## Task 3 : Ajouter `getAllyTerritoire` dans `allies.ts`

**Fichiers :**
- Modifier : `src/lib/actions/allies.ts`

- [ ] **Étape 1 : Ajouter l'import en haut du fichier**

Ajouter après la ligne 3 (`import { createServerSupabaseClient } from '@/lib/supabase/server'`) :

```typescript
import type { DomainId, ExplorationLevel } from '@/features/carte/domain-constants'
```

- [ ] **Étape 2 : Ajouter la fonction à la fin du fichier**

```typescript
export async function getAllyTerritoire(
  allyId: string
): Promise<Partial<Record<DomainId, ExplorationLevel>> | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
      .from('citizen_profiles')
      .select('preferences')
      .eq('id', allyId)
      .single()

    if (!data) return null
    const prefs = data.preferences as Record<string, unknown>
    if (!prefs?.territoire || typeof prefs.territoire !== 'object') return null
    return prefs.territoire as Partial<Record<DomainId, ExplorationLevel>>
  } catch {
    return null
  }
}
```

- [ ] **Étape 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 4 : Committer**

```bash
git add src/lib/actions/allies.ts
git commit -m "feat(allies): add getAllyTerritoire server action"
```

---

## Task 4 : Modifier `AllyCard.tsx`

**Fichiers :**
- Modifier : `src/features/alliances/AllyCard.tsx`

- [ ] **Étape 1 : Remplacer le contenu entier de `AllyCard.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { getInitials, nameToHsl } from '@/lib/utils'
import { AllyJournalFeed } from './AllyJournalFeed'
import { TerritoireAtlas } from '@/features/profil/stats/TerritoireAtlas'
import { getAllyTerritoire } from '@/lib/actions/allies'
import type { AllyWithProfile } from '@/lib/actions/allies'
import type { DomainId, ExplorationLevel } from '@/features/carte/domain-constants'

interface AllyCardProps {
  ally: AllyWithProfile
}

export function AllyCard({ ally }: AllyCardProps) {
  const [expanded, setExpanded]   = useState(false)
  const [territoire, setTerritoire] = useState<
    Partial<Record<DomainId, ExplorationLevel>> | null | undefined
  >(undefined)

  async function handleExpand(): Promise<void> {
    const next = !expanded
    setExpanded(next)
    if (next && territoire === undefined) {
      const data = await getAllyTerritoire(ally.ally.id)
      setTerritoire(data)
    }
  }

  return (
    <div style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => void handleExpand()}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-medium"
            style={{
              background: nameToHsl(ally.ally.display_name),
              color: 'var(--color-amber-400)',
              border: '1.5px solid rgba(239,159,39,0.3)',
            }}
          >
            {getInitials(ally.ally.display_name)}
          </div>
          <span className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>
            {ally.ally.display_name}
          </span>
        </div>
        <span
          className="text-[10px] tracking-[.06em] uppercase"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div className="pb-4">
          {territoire && (
            <div className="mb-4">
              <p
                className="text-[10px] font-medium tracking-[.09em] uppercase mb-3"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Territoire Intérieur
              </p>
              <TerritoireAtlas exploration={territoire} />
            </div>
          )}
          <AllyJournalFeed allyId={ally.ally.id} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Vérifier visuellement**

Lancer le dev server :

```bash
npm run dev
```

Scénarios à tester :

| Scénario | Résultat attendu |
|----------|-----------------|
| Allié avec share_territoire=true + territoire dans preferences | TerritoireAtlas affiché au-dessus du journal feed |
| Allié avec share_territoire=false | Section territoire absente, journal feed seul |
| Premier expand | Fetch déclenché (réseau visible dans DevTools) |
| Deuxième expand (collapse/re-expand) | Pas de deuxième fetch — données en cache local |

- [ ] **Étape 4 : Committer**

```bash
git add src/features/alliances/AllyCard.tsx
git commit -m "feat(alliances): show ally TerritoireAtlas in AllyCard when shared"
```
