# Phase 3 — Les Enluminures : Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter la couche sociale complète de BASILEIA — Alliés (connexion bilatérale), Tribus (groupes thématiques avec approbation), et Enluminures (annotations sur le Journal d'un Allié).

**Architecture:** Deux blocs livrables indépendants. Bloc 1 = schema Supabase complet + système Alliés. Bloc 2 = Tribus + Enluminures (dépend du Bloc 1). Les Server Actions Supabase remplacent les API Routes. Pas de realtime — pull à l'ouverture de l'app, cohérent avec la philosophie App-Effacement.

**Tech Stack:** Next.js 16 App Router · Supabase (Server Actions) · Zustand · Tailwind v4 · Framer Motion · TypeScript strict

---

## Fichiers créés / modifiés

### Bloc 1 — Schema + Alliés
| Fichier | Action | Rôle |
|---------|--------|------|
| Supabase Dashboard | SQL | 4 nouvelles tables + modifs notes + profiles |
| `src/lib/supabase/types.ts` | Modifier | Ajouter types allies, tribes, tribe_members, enluminures |
| `src/lib/actions/allies.ts` | Créer | Server Actions CRUD Alliés |
| `src/lib/actions/short-code.ts` | Créer | Génération et lookup du code court |
| `src/features/alliances/InviteBlock.tsx` | Créer | Code court + copier lien (dans /profil) |
| `src/features/alliances/ConnectForm.tsx` | Créer | Saisie code court → demande Allié |
| `src/features/alliances/AllyRequest.tsx` | Créer | Carte demande entrante — Accepter/Refuser |
| `src/features/alliances/AllyCard.tsx` | Créer | Fiche Allié + TerritoireAtlas miniature |
| `src/features/alliances/AllyJournalFeed.tsx` | Créer | Journals partagés d'un Allié |
| `src/features/alliances/AlliesList.tsx` | Créer | Liste Alliés acceptés |
| `src/app/(main)/alliances/page.tsx` | Modifier | Onglets Alliés / Tribus (stub) / Demandes |
| `src/app/invite/[short_code]/page.tsx` | Créer | Page pré-remplie depuis lien d'invitation |
| `src/features/journal/JournalEditor.tsx` | Modifier | Toggle visibilité Privé / Alliés |
| `src/lib/supabase/sync.ts` | Modifier | syncNote inclut visibility |
| `src/features/nav/BottomNav.tsx` | Modifier | Badge pending count |

### Bloc 2 — Tribus + Enluminures
| Fichier | Action | Rôle |
|---------|--------|------|
| `src/lib/actions/tribes.ts` | Créer | Server Actions CRUD Tribus |
| `src/lib/actions/enluminures.ts` | Créer | Server Actions Enluminures |
| `src/features/alliances/TribeCard.tsx` | Créer | Nom + thème + nb membres + rôle |
| `src/features/alliances/TribeCreateForm.tsx` | Créer | Créer une Tribu |
| `src/features/alliances/TribeMemberList.tsx` | Créer | Membres + demandes pending (admin) |
| `src/features/alliances/TribeJournalFeed.tsx` | Créer | Journals publiés dans la Tribu |
| `src/app/tribu/[invite_code]/page.tsx` | Créer | Aperçu Tribu + demande rejoindre |
| `src/features/journal/JournalEditor.tsx` | Modifier | Toggle visibilité étendu à Tribu |
| `src/lib/supabase/sync.ts` | Modifier | syncNote inclut tribe_id |
| `src/features/enluminures/EnluminureComposer.tsx` | Créer | Mode texte / mode verset |
| `src/features/enluminures/EnluminureMargin.tsx` | Créer | Affichage en marge (auteur seulement) |
| `src/features/enluminures/EnluminureBadge.tsx` | Créer | Indicateur discret sur JournalCard |
| `src/features/journal/JournalCard.tsx` | Modifier | Afficher EnluminureBadge |
| `src/app/(main)/alliances/page.tsx` | Modifier | Onglet Mes Tribus complet |

---

## ═══════════════════════════════════
## BLOC 1 — SCHEMA SUPABASE + ALLIÉS
## ═══════════════════════════════════

---

### Task 1 : Schema SQL dans Supabase Dashboard

**Fichiers :** Supabase Dashboard → SQL Editor

- [ ] **Étape 1 : Exécuter le SQL des nouvelles tables**

Dans Supabase Dashboard → SQL Editor → New query, coller et exécuter :

```sql
-- Table allies
CREATE TABLE public.allies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status        text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','accepted','rejected')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (requester_id, receiver_id)
);

-- Table tribes
CREATE TABLE public.tribes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  theme       text NOT NULL,
  creator_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Table tribe_members
CREATE TABLE public.tribe_members (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tribe_id  uuid NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role      text NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  status    text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','member')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tribe_id, user_id)
);

-- Table enluminures
CREATE TABLE public.enluminures (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id             uuid NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  author_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type                text NOT NULL CHECK (type IN ('text','verse')),
  highlighted_passage text CHECK (char_length(highlighted_passage) <= 300),
  content             text NOT NULL CHECK (char_length(content) <= 50),
  verse_text          text,
  created_at          timestamptz NOT NULL DEFAULT now()
);
```

- [ ] **Étape 2 : Modifier les tables existantes**

```sql
-- Ajouter visibility + tribe_id à notes
ALTER TABLE public.notes
  ADD COLUMN visibility text NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private','allies','tribe')),
  ADD COLUMN tribe_id uuid REFERENCES public.tribes(id) ON DELETE SET NULL;

-- Ajouter short_code à citizen_profiles
ALTER TABLE public.citizen_profiles
  ADD COLUMN short_code text UNIQUE;

-- Créer une fonction pour générer le short_code à l'inscription
CREATE OR REPLACE FUNCTION public.generate_short_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger : short_code auto à la création du profil
CREATE OR REPLACE FUNCTION public.set_short_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.short_code IS NULL THEN
    LOOP
      NEW.short_code := public.generate_short_code();
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.citizen_profiles WHERE short_code = NEW.short_code
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_profile_short_code
  BEFORE INSERT ON public.citizen_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_short_code();
```

- [ ] **Étape 3 : RLS policies**

```sql
-- allies : chaque Citoyen voit ses propres lignes
ALTER TABLE public.allies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allies_select" ON public.allies FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "allies_insert" ON public.allies FOR INSERT
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "allies_update" ON public.allies FOR UPDATE
  USING (auth.uid() = receiver_id);

-- tribes : membres voient leur Tribu ; tous voient nom+thème via invite_code
ALTER TABLE public.tribes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tribes_select_member" ON public.tribes FOR SELECT
  USING (
    auth.uid() = creator_id OR
    EXISTS (
      SELECT 1 FROM public.tribe_members
      WHERE tribe_id = tribes.id AND user_id = auth.uid() AND status = 'member'
    )
  );
CREATE POLICY "tribes_select_preview" ON public.tribes FOR SELECT
  USING (invite_code IS NOT NULL); -- aperçu public via invite_code
CREATE POLICY "tribes_insert" ON public.tribes FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- tribe_members
ALTER TABLE public.tribe_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tribe_members_select" ON public.tribe_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.tribe_members tm2
      WHERE tm2.tribe_id = tribe_members.tribe_id
        AND tm2.user_id = auth.uid()
        AND tm2.status = 'member'
    )
  );
CREATE POLICY "tribe_members_insert" ON public.tribe_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tribe_members_update" ON public.tribe_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tribe_members
      WHERE tribe_id = tribe_members.tribe_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- notes : partage avec Alliés et Tribus
CREATE POLICY "notes_select_allies" ON public.notes FOR SELECT
  USING (
    user_id = auth.uid() OR
    (visibility = 'allies' AND EXISTS (
      SELECT 1 FROM public.allies
      WHERE status = 'accepted'
        AND ((requester_id = auth.uid() AND receiver_id = notes.user_id)
          OR (receiver_id = auth.uid() AND requester_id = notes.user_id))
    )) OR
    (visibility = 'tribe' AND tribe_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.tribe_members
      WHERE tribe_id = notes.tribe_id AND user_id = auth.uid() AND status = 'member'
    ))
  );

-- enluminures : auteur du Journal voit toutes + auteur de l'enluminure voit les siennes
ALTER TABLE public.enluminures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enluminures_select" ON public.enluminures FOR SELECT
  USING (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.notes WHERE id = enluminures.note_id AND user_id = auth.uid()
    )
  );
CREATE POLICY "enluminures_insert" ON public.enluminures FOR INSERT
  WITH CHECK (auth.uid() = author_id);
```

- [ ] **Étape 4 : Vérifier dans Table Editor**

Dans Supabase Dashboard → Table Editor, confirmer que les 4 tables apparaissent et que `notes` a les colonnes `visibility` et `tribe_id`.

- [ ] **Étape 5 : Committer note de migration**

```bash
git add -A
git commit -m "chore(db): Phase 3 schema — allies, tribes, tribe_members, enluminures + RLS"
```

---

### Task 2 : Mettre à jour `src/lib/supabase/types.ts`

**Fichiers :**
- Modifier : `src/lib/supabase/types.ts`

- [ ] **Étape 1 : Ajouter les nouveaux types**

Ajouter dans le bloc `Tables` de `Database`, après `verses` :

```typescript
      allies: {
        Row: {
          id:           string
          requester_id: string
          receiver_id:  string
          status:       'pending' | 'accepted' | 'rejected'
          created_at:   string
        }
        Insert: {
          id?:          string
          requester_id: string
          receiver_id:  string
          status?:      'pending' | 'accepted' | 'rejected'
        }
        Update: {
          status?: 'pending' | 'accepted' | 'rejected'
        }
        Relationships: []
      }
      tribes: {
        Row: {
          id:          string
          name:        string
          theme:       string
          creator_id:  string
          invite_code: string
          created_at:  string
        }
        Insert: {
          id?:         string
          name:        string
          theme:       string
          creator_id:  string
          invite_code: string
        }
        Update: {
          name?:  string
          theme?: string
        }
        Relationships: []
      }
      tribe_members: {
        Row: {
          id:        string
          tribe_id:  string
          user_id:   string
          role:      'admin' | 'member'
          status:    'pending' | 'member'
          joined_at: string
        }
        Insert: {
          id?:       string
          tribe_id:  string
          user_id:   string
          role?:     'admin' | 'member'
          status?:   'pending' | 'member'
        }
        Update: {
          role?:   'admin' | 'member'
          status?: 'pending' | 'member'
        }
        Relationships: []
      }
      enluminures: {
        Row: {
          id:                  string
          note_id:             string
          author_id:           string
          type:                'text' | 'verse'
          highlighted_passage: string | null
          content:             string
          verse_text:          string | null
          created_at:          string
        }
        Insert: {
          id?:                  string
          note_id:              string
          author_id:            string
          type:                 'text' | 'verse'
          highlighted_passage?: string | null
          content:              string
          verse_text?:          string | null
        }
        Update: never
        Relationships: []
      }
```

Modifier également le type `notes.Row` pour ajouter :
```typescript
          visibility: 'private' | 'allies' | 'tribe'
          tribe_id:   string | null
```
Et `notes.Insert` / `notes.Update` :
```typescript
          visibility?: 'private' | 'allies' | 'tribe'
          tribe_id?:   string | null
```

Modifier `citizen_profiles.Row` :
```typescript
          short_code: string | null
```

- [ ] **Étape 2 : Committer**

```bash
git add src/lib/supabase/types.ts
git commit -m "feat(types): add Phase 3 Supabase types — allies, tribes, tribe_members, enluminures"
```

---

### Task 3 : Server Actions — Alliés

**Fichiers :**
- Créer : `src/lib/actions/allies.ts`

- [ ] **Étape 1 : Créer le fichier**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendAllyRequest(shortCode: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { data: profile, error: profileError } = await supabase
      .from('citizen_profiles')
      .select('id')
      .eq('short_code', shortCode.toUpperCase())
      .single()

    if (profileError || !profile) return { error: 'Code invalide — aucun Citoyen trouvé' }
    if (profile.id === user.id) return { error: 'Tu ne peux pas t\'ajouter toi-même' }

    const { error } = await supabase.from('allies').insert({
      requester_id: user.id,
      receiver_id:  profile.id,
    })

    if (error?.code === '23505') return { error: 'Demande déjà envoyée' }
    if (error) return { error: 'Erreur lors de l\'envoi' }
    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}

export async function respondToAllyRequest(
  allyId: string,
  response: 'accepted' | 'rejected'
): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.from('allies').update({ status: response }).eq('id', allyId)
  } catch {
    // silent
  }
}

export type AllyWithProfile = {
  id:          string
  status:      'pending' | 'accepted' | 'rejected'
  isRequester: boolean
  ally: {
    id:           string
    display_name: string
    short_code:   string | null
  }
}

export async function getMyAllies(): Promise<AllyWithProfile[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from('allies')
      .select(`
        id, status, requester_id, receiver_id,
        requester:citizen_profiles!allies_requester_id_fkey(id, display_name, short_code),
        receiver:citizen_profiles!allies_receiver_id_fkey(id, display_name, short_code)
      `)
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!data) return []

    return data.map((row: Record<string, unknown>) => {
      const isRequester = row.requester_id === user.id
      const ally = isRequester ? row.receiver : row.requester
      return {
        id:          row.id as string,
        status:      row.status as AllyWithProfile['status'],
        isRequester,
        ally:        ally as AllyWithProfile['ally'],
      }
    })
  } catch {
    return []
  }
}

export async function getPendingRequests(): Promise<AllyWithProfile[]> {
  const all = await getMyAllies()
  return all.filter((a) => a.status === 'pending' && !a.isRequester)
}
```

- [ ] **Étape 2 : Committer**

```bash
git add src/lib/actions/allies.ts
git commit -m "feat(allies): add Server Actions — sendAllyRequest, respondToAllyRequest, getMyAllies"
```

---

### Task 4 : InviteBlock dans `/profil`

**Fichiers :**
- Créer : `src/features/alliances/InviteBlock.tsx`
- Modifier : `src/app/(main)/profil/page.tsx`

- [ ] **Étape 1 : Créer InviteBlock**

```typescript
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface InviteBlockProps {
  shortCode: string
}

export function InviteBlock({ shortCode }: InviteBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = `${window.location.origin}/invite/${shortCode}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center justify-between py-3"
      style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
      <div>
        <p className="text-[12.5px]" style={{ color: 'var(--color-text-secondary)' }}>
          Mon code Allié
        </p>
        <p className="text-[18px] font-medium tracking-[.12em] mt-0.5"
          style={{ color: 'var(--color-amber-400)', fontFamily: 'var(--font-editorial)' }}>
          {shortCode}
        </p>
      </div>
      <button
        onClick={handleCopy}
        className={cn(
          'text-[11px] font-medium tracking-[.06em] uppercase px-3 py-1.5 rounded-[var(--radius-sm)]',
          'border transition-all',
          copied
            ? 'border-[var(--color-amber-border)] text-[var(--color-amber-400)] bg-[var(--color-amber-bg)]'
            : 'border-[rgba(255,255,255,0.08)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
        )}
      >
        {copied ? 'Copié ✓' : 'Copier le lien'}
      </button>
    </div>
  )
}
```

- [ ] **Étape 2 : Ajouter InviteBlock dans la page Profil**

Dans `src/app/(main)/profil/page.tsx`, importer et lire le `short_code` depuis Supabase, puis afficher `<InviteBlock shortCode={profile.short_code ?? ''} />` dans la section Compte.

Récupérer le profil (pattern Server Component existant) :
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
const { data: profile } = await supabase
  .from('citizen_profiles')
  .select('display_name, short_code, created_at, locale, bible_translation')
  .eq('id', user?.id ?? '')
  .single()
```

- [ ] **Étape 3 : Vérifier manuellement**

Lancer `npm run dev`, aller sur `/profil`. Le code court (6 chars ambre) apparaît. Cliquer "Copier le lien" → le bouton passe en état copié pendant 2s.

- [ ] **Étape 4 : Committer**

```bash
git add src/features/alliances/InviteBlock.tsx src/app/(main)/profil/page.tsx
git commit -m "feat(allies): add InviteBlock — short code display + copy invite link"
```

---

### Task 5 : ConnectForm + AllyRequest

**Fichiers :**
- Créer : `src/features/alliances/ConnectForm.tsx`
- Créer : `src/features/alliances/AllyRequest.tsx`

- [ ] **Étape 1 : ConnectForm**

```typescript
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
      setMessage('Demande envoyée — en attente d\'acceptation')
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
```

- [ ] **Étape 2 : AllyRequest**

```typescript
'use client'

import { useState } from 'react'
import { respondToAllyRequest } from '@/lib/actions/allies'
import { getInitials, nameToHsl } from '@/lib/utils'

interface AllyRequestProps {
  id:          string
  displayName: string
  onRespond:   () => void
}

export function AllyRequest({ id, displayName, onRespond }: AllyRequestProps) {
  const [loading, setLoading] = useState(false)

  async function respond(status: 'accepted' | 'rejected') {
    setLoading(true)
    await respondToAllyRequest(id, status)
    onRespond()
  }

  return (
    <div className="flex items-center justify-between py-4"
      style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-medium"
          style={{
            background: nameToHsl(displayName),
            color: 'var(--color-amber-400)',
            border: '1.5px solid rgba(239,159,39,0.3)',
          }}
        >
          {getInitials(displayName)}
        </div>
        <div>
          <p className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
            {displayName}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            demande à devenir Allié
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => respond('accepted')}
          disabled={loading}
          className="text-[11px] font-medium tracking-[.06em] uppercase px-3 py-1 rounded-[var(--radius-sm)] border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)] disabled:opacity-30"
        >
          Accepter
        </button>
        <button
          onClick={() => respond('rejected')}
          disabled={loading}
          className="text-[11px] tracking-[.06em] uppercase px-3 py-1 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)] disabled:opacity-30"
        >
          Refuser
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Étape 3 : Committer**

```bash
git add src/features/alliances/ConnectForm.tsx src/features/alliances/AllyRequest.tsx
git commit -m "feat(allies): add ConnectForm + AllyRequest components"
```

---

### Task 6 : AllyCard + AlliesList

**Fichiers :**
- Créer : `src/features/alliances/AllyCard.tsx`
- Créer : `src/features/alliances/AlliesList.tsx`

- [ ] **Étape 1 : AllyCard**

```typescript
'use client'

import { useState } from 'react'
import { getInitials, nameToHsl } from '@/lib/utils'
import { AllyJournalFeed } from './AllyJournalFeed'
import type { AllyWithProfile } from '@/lib/actions/allies'

interface AllyCardProps {
  ally: AllyWithProfile
}

export function AllyCard({ ally }: AllyCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setExpanded((v) => !v)}
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
        <span className="text-[10px] tracking-[.06em] uppercase"
          style={{ color: 'var(--color-text-muted)' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div className="pb-4">
          <AllyJournalFeed allyId={ally.ally.id} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Étape 2 : AllyJournalFeed**

Créer `src/features/alliances/AllyJournalFeed.tsx` :

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { relativeTime } from '@/lib/utils'

interface SharedNote {
  id:         string
  title:      string | null
  excerpt:    string | null
  domain_id:  string | null
  created_at: string
}

export function AllyJournalFeed({ allyId }: { allyId: string }) {
  const [notes, setNotes] = useState<SharedNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('notes')
        .select('id, title, excerpt, domain_id, created_at')
        .eq('user_id', allyId)
        .eq('visibility', 'allies')
        .order('created_at', { ascending: false })
        .limit(10)
      setNotes(data ?? [])
      setLoading(false)
    }
    void load()
  }, [allyId])

  if (loading) return (
    <p className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>
      Chargement…
    </p>
  )

  if (!notes.length) return (
    <p className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>
      Aucun Journal partagé pour l'instant.
    </p>
  )

  return (
    <div className="flex flex-col gap-2">
      {notes.map((note) => (
        <div key={note.id} className="rounded-[var(--radius-md)] px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-[13px]" style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-editorial)',
          }}>
            {note.title ?? 'Sans titre'}
          </p>
          {note.excerpt && (
            <p className="text-[11px] mt-0.5 line-clamp-2"
              style={{ color: 'var(--color-text-muted)' }}>
              {note.excerpt}
            </p>
          )}
          <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-disabled)' }}>
            {relativeTime(note.created_at)}
          </p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Étape 3 : AlliesList**

```typescript
'use client'

import { useEffect, useState, useTransition } from 'react'
import { getMyAllies, getPendingRequests, type AllyWithProfile } from '@/lib/actions/allies'
import { AllyCard } from './AllyCard'
import { AllyRequest } from './AllyRequest'

export function AlliesList() {
  const [allies, setAllies]     = useState<AllyWithProfile[]>([])
  const [pending, setPending]   = useState<AllyWithProfile[]>([])
  const [, startTransition]     = useTransition()

  function refresh() {
    startTransition(async () => {
      const [a, p] = await Promise.all([getMyAllies(), getPendingRequests()])
      setAllies(a.filter((x) => x.status === 'accepted'))
      setPending(p)
    })
  }

  useEffect(() => { refresh() }, [])

  return (
    <div className="flex flex-col">
      {pending.map((req) => (
        <AllyRequest key={req.id} id={req.id}
          displayName={req.ally.display_name} onRespond={refresh} />
      ))}
      {allies.length === 0 && pending.length === 0 && (
        <p className="py-8 text-center text-[12px]"
          style={{ color: 'var(--color-text-muted)' }}>
          Aucun Allié pour l'instant.<br />
          Partage ton code pour commencer.
        </p>
      )}
      {allies.map((a) => <AllyCard key={a.id} ally={a} />)}
    </div>
  )
}
```

- [ ] **Étape 4 : Committer**

```bash
git add src/features/alliances/AllyCard.tsx src/features/alliances/AllyJournalFeed.tsx src/features/alliances/AlliesList.tsx
git commit -m "feat(allies): add AllyCard, AllyJournalFeed, AlliesList"
```

---

### Task 7 : Page `/alliances` — Onglets

**Fichiers :**
- Modifier : `src/app/(main)/alliances/page.tsx`

- [ ] **Étape 1 : Réécrire la page**

```typescript
import type { Metadata } from 'next'
import { AlliesList } from '@/features/alliances/AlliesList'
import { ConnectForm } from '@/features/alliances/ConnectForm'

export const metadata: Metadata = { title: 'Alliances — BASILEIA' }

export default function AlliancesPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="px-6 py-5 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-medium tracking-[.09em] uppercase text-[var(--color-text-muted)] mb-1">
          Alliances & Tribus
        </p>
      </header>

      <div className="px-6 py-5 flex flex-col gap-8 overflow-y-auto pb-16 md:pb-6">
        <ConnectForm />
        <AlliesList />
      </div>
    </div>
  )
}
```

- [ ] **Étape 2 : Vérifier manuellement**

Aller sur `/alliances`. Le ConnectForm est visible. Entrer un code de 6 chars → bouton Envoyer actif. Envoyer → message de succès ou d'erreur. Les demandes pending d'un autre compte apparaissent dans AlliesList.

- [ ] **Étape 3 : Committer**

```bash
git add src/app/(main)/alliances/page.tsx
git commit -m "feat(alliances): wire up /alliances page with ConnectForm + AlliesList"
```

---

### Task 8 : Route `/invite/[short_code]`

**Fichiers :**
- Créer : `src/app/invite/[short_code]/page.tsx`

- [ ] **Étape 1 : Créer la page**

```typescript
import type { Metadata } from 'next'
import { ConnectForm } from '@/features/alliances/ConnectForm'

export const metadata: Metadata = { title: 'Invitation — BASILEIA' }

interface Props {
  params: Promise<{ short_code: string }>
}

export default async function InvitePage({ params }: Props) {
  const { short_code } = await params

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div>
          <p className="text-[10px] font-medium tracking-[.09em] uppercase mb-2"
            style={{ color: 'var(--color-text-muted)' }}>
            Invitation Alliance
          </p>
          <p className="text-[15px]" style={{ color: 'var(--color-text-secondary)' }}>
            Un Citoyen t'invite à rejoindre son Alliance.
          </p>
        </div>
        <ConnectForm prefilled={short_code} />
      </div>
    </div>
  )
}
```

- [ ] **Étape 2 : Committer**

```bash
git add src/app/invite/
git commit -m "feat(allies): add /invite/[short_code] page — prefilled ConnectForm"
```

---

### Task 9 : Toggle visibilité Journal + syncNote

**Fichiers :**
- Modifier : `src/features/journal/JournalEditor.tsx`
- Modifier : `src/lib/supabase/sync.ts`

- [ ] **Étape 1 : Ajouter `visibility` au type Note**

Dans `src/features/journal/mock-notes.ts`, ajouter dans l'interface `Note` :

```typescript
visibility?: 'private' | 'allies' | 'tribe'
tribe_id?:   string | null
```

- [ ] **Étape 2 : Ajouter le toggle dans JournalEditor**

Dans `JournalEditor.tsx`, ajouter un state et un bouton discret en bas de l'éditeur (après le compteur de mots) :

```typescript
const [visibility, setVisibility] = useState<'private' | 'allies'>(
  (note?.visibility as 'private' | 'allies') ?? 'private'
)

function cycleVisibility() {
  const next = visibility === 'private' ? 'allies' : 'private'
  setVisibility(next)
  updateNote(id, { visibility: next })
}
```

Bouton dans le footer de l'éditeur :

```typescript
<button
  onClick={cycleVisibility}
  className="text-[10px] font-medium tracking-[.06em] uppercase transition-opacity hover:opacity-70"
  style={{
    color: visibility === 'allies'
      ? 'var(--color-amber-400)'
      : 'var(--color-text-disabled)',
  }}
  aria-label="Visibilité du Journal"
>
  {visibility === 'allies' ? '◈ Alliés' : '◈ Privé'}
</button>
```

- [ ] **Étape 3 : Mettre à jour syncNote**

Dans `src/lib/supabase/sync.ts`, modifier `syncNote` pour inclure `visibility` :

```typescript
await supabase.from('notes').upsert({
  id:         note.id,
  user_id:    userId,
  title:      note.title || null,
  content:    note.content,
  domain_id:  note.domain ?? null,
  visibility: note.visibility ?? 'private',
  tribe_id:   note.tribe_id ?? null,
  updated_at: new Date().toISOString(),
})
```

- [ ] **Étape 4 : Vérifier manuellement**

Ouvrir un Journal → le bouton `◈ Privé` apparaît en bas. Cliquer → passe en `◈ Alliés` ambre. Le changement est sauvegardé.

- [ ] **Étape 5 : Committer**

```bash
git add src/features/journal/JournalEditor.tsx src/lib/supabase/sync.ts src/features/journal/mock-notes.ts
git commit -m "feat(journal): add visibility toggle Privé/Alliés + sync to Supabase"
```

---

## ════════════════════════════════════════
## BLOC 2 — TRIBUS + ENLUMINURES
## ════════════════════════════════════════

> **Prérequis :** Bloc 1 complètement livré et fonctionnel.

---

### Task 10 : Server Actions — Tribus

**Fichiers :**
- Créer : `src/lib/actions/tribes.ts`

- [ ] **Étape 1 : Créer le fichier**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export type TribeWithRole = {
  id:          string
  name:        string
  theme:       string
  invite_code: string
  role:        'admin' | 'member'
  memberCount: number
}

export async function createTribe(name: string, theme: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const invite_code = generateInviteCode()
    const { data: tribe, error } = await supabase
      .from('tribes')
      .insert({ name, theme, creator_id: user.id, invite_code })
      .select('id')
      .single()

    if (error || !tribe) return { error: 'Erreur lors de la création' }

    await supabase.from('tribe_members').insert({
      tribe_id: tribe.id,
      user_id:  user.id,
      role:     'admin',
      status:   'member',
    })
    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}

export async function requestToJoinTribe(inviteCode: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { data: tribe } = await supabase
      .from('tribes')
      .select('id')
      .eq('invite_code', inviteCode)
      .single()

    if (!tribe) return { error: 'Tribu introuvable' }

    const { error } = await supabase.from('tribe_members').insert({
      tribe_id: tribe.id,
      user_id:  user.id,
    })

    if (error?.code === '23505') return { error: 'Demande déjà envoyée' }
    if (error) return { error: 'Erreur lors de la demande' }
    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}

export async function approveTribeMember(memberId: string): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.from('tribe_members').update({ status: 'member' }).eq('id', memberId)
  } catch { /* silent */ }
}

export async function rejectTribeMember(memberId: string): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.from('tribe_members').delete().eq('id', memberId)
  } catch { /* silent */ }
}

export async function getMyTribes(): Promise<TribeWithRole[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from('tribe_members')
      .select('role, tribes(id, name, theme, invite_code)')
      .eq('user_id', user.id)
      .eq('status', 'member')

    if (!data) return []

    const tribes = await Promise.all(
      data.map(async (row) => {
        const tribe = row.tribes as { id: string; name: string; theme: string; invite_code: string }
        const { count } = await supabase
          .from('tribe_members')
          .select('*', { count: 'exact', head: true })
          .eq('tribe_id', tribe.id)
          .eq('status', 'member')
        return {
          id:          tribe.id,
          name:        tribe.name,
          theme:       tribe.theme,
          invite_code: tribe.invite_code,
          role:        row.role as 'admin' | 'member',
          memberCount: count ?? 0,
        }
      })
    )
    return tribes
  } catch {
    return []
  }
}

export async function getTribePreview(inviteCode: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('tribes')
      .select('id, name, theme')
      .eq('invite_code', inviteCode)
      .single()
    return data
  } catch {
    return null
  }
}
```

- [ ] **Étape 2 : Committer**

```bash
git add src/lib/actions/tribes.ts
git commit -m "feat(tribes): add Server Actions — createTribe, requestToJoinTribe, approve/reject, getMyTribes"
```

---

### Task 11 : TribeCard + TribeCreateForm + TribeMemberList

**Fichiers :**
- Créer : `src/features/alliances/TribeCard.tsx`
- Créer : `src/features/alliances/TribeCreateForm.tsx`
- Créer : `src/features/alliances/TribeMemberList.tsx`

- [ ] **Étape 1 : TribeCard**

```typescript
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { TribeWithRole } from '@/lib/actions/tribes'
import { TribeMemberList } from './TribeMemberList'
import { TribeJournalFeed } from './TribeJournalFeed'

interface TribeCardProps {
  tribe: TribeWithRole
}

export function TribeCard({ tribe }: TribeCardProps) {
  const [tab, setTab] = useState<'journals' | 'members' | null>(null)

  function copyLink() {
    void navigator.clipboard.writeText(`${window.location.origin}/tribu/${tribe.invite_code}`)
  }

  return (
    <div style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-start justify-between py-4">
        <div>
          <p className="text-[14px]" style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-editorial)',
          }}>
            {tribe.name}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {tribe.theme} · {tribe.memberCount} membre{tribe.memberCount > 1 ? 's' : ''}
            {tribe.role === 'admin' && (
              <span className="ml-2 text-[var(--color-amber-400)]">admin</span>
            )}
          </p>
        </div>
        <button onClick={copyLink}
          className="text-[10px] tracking-[.06em] uppercase px-2 py-1 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
          Lien
        </button>
      </div>

      <div className="flex gap-4 mb-2">
        {(['journals', tribe.role === 'admin' ? 'members' : null] as const).filter(Boolean).map((t) => (
          <button key={t!} onClick={() => setTab(tab === t ? null : t!)}
            className={cn('text-[10px] tracking-[.06em] uppercase pb-1 border-b',
              tab === t
                ? 'border-[var(--color-amber-400)] text-[var(--color-amber-400)]'
                : 'border-transparent text-[var(--color-text-muted)]'
            )}>
            {t === 'journals' ? 'Journals' : 'Membres'}
          </button>
        ))}
      </div>

      {tab === 'journals' && <div className="pb-4"><TribeJournalFeed tribeId={tribe.id} /></div>}
      {tab === 'members' && tribe.role === 'admin' && (
        <div className="pb-4"><TribeMemberList tribeId={tribe.id} /></div>
      )}
    </div>
  )
}
```

- [ ] **Étape 2 : TribeCreateForm**

```typescript
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
          className="text-[11px] font-medium tracking-[.06em] uppercase px-3 py-1 rounded-[var(--radius-sm)] border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)] disabled:opacity-30">
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
```

- [ ] **Étape 3 : TribeMemberList**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { approveTribeMember, rejectTribeMember } from '@/lib/actions/tribes'
import { getInitials, nameToHsl } from '@/lib/utils'

interface Member {
  id:           string
  status:       'pending' | 'member'
  display_name: string
}

export function TribeMemberList({ tribeId }: { tribeId: string }) {
  const [members, setMembers] = useState<Member[]>([])

  async function load() {
    const supabase = createClient()
    const { data } = await supabase
      .from('tribe_members')
      .select('id, status, citizen_profiles(display_name)')
      .eq('tribe_id', tribeId)
      .order('joined_at', { ascending: true })
    if (data) setMembers(data.map((r) => ({
      id:           r.id,
      status:       r.status as 'pending' | 'member',
      display_name: (r.citizen_profiles as { display_name: string })?.display_name ?? '?',
    })))
  }

  useEffect(() => { void load() }, [tribeId])

  return (
    <div className="flex flex-col gap-2">
      {members.map((m) => (
        <div key={m.id} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px]"
              style={{ background: nameToHsl(m.display_name), color: 'var(--color-amber-400)' }}>
              {getInitials(m.display_name)}
            </div>
            <span className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
              {m.display_name}
            </span>
            {m.status === 'pending' && (
              <span className="text-[10px] tracking-[.06em] uppercase"
                style={{ color: 'var(--color-text-muted)' }}>en attente</span>
            )}
          </div>
          {m.status === 'pending' && (
            <div className="flex gap-1">
              <button onClick={async () => { await approveTribeMember(m.id); void load() }}
                className="text-[10px] px-2 py-0.5 rounded border border-[var(--color-amber-border)] text-[var(--color-amber-400)]">
                Approuver
              </button>
              <button onClick={async () => { await rejectTribeMember(m.id); void load() }}
                className="text-[10px] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.06)] text-[var(--color-text-muted)]">
                Refuser
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Étape 4 : Committer**

```bash
git add src/features/alliances/TribeCard.tsx src/features/alliances/TribeCreateForm.tsx src/features/alliances/TribeMemberList.tsx
git commit -m "feat(tribes): add TribeCard, TribeCreateForm, TribeMemberList"
```

---

### Task 12 : TribeJournalFeed + Route `/tribu/[invite_code]`

**Fichiers :**
- Créer : `src/features/alliances/TribeJournalFeed.tsx`
- Créer : `src/app/tribu/[invite_code]/page.tsx`

- [ ] **Étape 1 : TribeJournalFeed**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { relativeTime } from '@/lib/utils'

interface TribeNote {
  id:         string
  title:      string | null
  excerpt:    string | null
  created_at: string
  user_id:    string
}

export function TribeJournalFeed({ tribeId }: { tribeId: string }) {
  const [notes, setNotes] = useState<TribeNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('notes')
        .select('id, title, excerpt, created_at, user_id')
        .eq('visibility', 'tribe')
        .eq('tribe_id', tribeId)
        .order('created_at', { ascending: false })
        .limit(20)
      setNotes(data ?? [])
      setLoading(false)
    }
    void load()
  }, [tribeId])

  if (loading) return <p className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>Chargement…</p>
  if (!notes.length) return <p className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>Aucun Journal partagé dans cette Tribu.</p>

  return (
    <div className="flex flex-col gap-2">
      {notes.map((note) => (
        <div key={note.id} className="rounded-[var(--radius-md)] px-3 py-2"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-[13px]" style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-editorial)' }}>
            {note.title ?? 'Sans titre'}
          </p>
          {note.excerpt && (
            <p className="text-[11px] mt-0.5 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
              {note.excerpt}
            </p>
          )}
          <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-disabled)' }}>
            {relativeTime(note.created_at)}
          </p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Étape 2 : Page aperçu Tribu**

```typescript
import type { Metadata } from 'next'
import { getTribePreview, requestToJoinTribe } from '@/lib/actions/tribes'
import { notFound } from 'next/navigation'

export const metadata: Metadata = { title: 'Rejoindre une Tribu — BASILEIA' }

interface Props {
  params: Promise<{ invite_code: string }>
}

export default async function TribePreviewPage({ params }: Props) {
  const { invite_code } = await params
  const tribe = await getTribePreview(invite_code)
  if (!tribe) notFound()

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div>
          <p className="text-[10px] font-medium tracking-[.09em] uppercase mb-2"
            style={{ color: 'var(--color-text-muted)' }}>
            Invitation à une Tribu
          </p>
          <p className="text-[22px]" style={{
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-editorial)',
          }}>
            {tribe.name}
          </p>
          <p className="text-[13px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {tribe.theme}
          </p>
        </div>
        <form action={async () => {
          'use server'
          await requestToJoinTribe(invite_code)
        }}>
          <button type="submit"
            className="w-full py-2.5 rounded-[var(--radius-md)] border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)] text-[12px] font-medium tracking-[.06em] uppercase">
            Demander à rejoindre
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Étape 3 : Committer**

```bash
git add src/features/alliances/TribeJournalFeed.tsx src/app/tribu/
git commit -m "feat(tribes): add TribeJournalFeed + /tribu/[invite_code] preview page"
```

---

### Task 13 : Étendre le toggle visibilité à Tribu

**Fichiers :**
- Modifier : `src/features/journal/JournalEditor.tsx`

- [ ] **Étape 1 : Ajouter le state tribe**

Remplacer le state visibility existant (Task 9) par :

```typescript
const [visibility, setVisibility] = useState<'private' | 'allies' | 'tribe'>(
  (note?.visibility as 'private' | 'allies' | 'tribe') ?? 'private'
)
const [tribeId, setTribeId] = useState<string | null>(note?.tribe_id ?? null)
const [myTribes, setMyTribes] = useState<Array<{ id: string; name: string }>>([])
const [showTribePicker, setShowTribePicker] = useState(false)
```

Charger les Tribus au mount :

```typescript
useEffect(() => {
  import('@/lib/actions/tribes').then(({ getMyTribes }) => {
    void getMyTribes().then((t) => setMyTribes(t.map((x) => ({ id: x.id, name: x.name }))))
  })
}, [])
```

- [ ] **Étape 2 : Mettre à jour la fonction cycle**

```typescript
function cycleVisibility() {
  if (visibility === 'private') {
    setVisibility('allies')
    updateNote(id, { visibility: 'allies', tribe_id: null })
  } else if (visibility === 'allies') {
    setShowTribePicker(true)
  } else {
    setVisibility('private')
    setTribeId(null)
    updateNote(id, { visibility: 'private', tribe_id: null })
  }
}

function selectTribe(tid: string) {
  setVisibility('tribe')
  setTribeId(tid)
  setShowTribePicker(false)
  updateNote(id, { visibility: 'tribe', tribe_id: tid })
}
```

- [ ] **Étape 3 : Mettre à jour le bouton + ajouter picker**

```typescript
{/* Bouton toggle */}
<button onClick={cycleVisibility}
  className="text-[10px] font-medium tracking-[.06em] uppercase transition-opacity hover:opacity-70"
  style={{
    color: visibility !== 'private'
      ? 'var(--color-amber-400)'
      : 'var(--color-text-disabled)',
  }}>
  {visibility === 'private' && '◈ Privé'}
  {visibility === 'allies' && '◈ Alliés'}
  {visibility === 'tribe' && '◈ Tribu'}
</button>

{/* Tribe picker inline */}
{showTribePicker && myTribes.length > 0 && (
  <div className="absolute bottom-full mb-1 left-0 rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.08)] py-1"
    style={{ background: 'var(--color-bg-surface)' }}>
    {myTribes.map((t) => (
      <button key={t.id} onClick={() => selectTribe(t.id)}
        className="block w-full text-left px-3 py-1.5 text-[12px] hover:bg-[rgba(255,255,255,0.04)]"
        style={{ color: 'var(--color-text-secondary)' }}>
        {t.name}
      </button>
    ))}
    <button onClick={() => setShowTribePicker(false)}
      className="block w-full text-left px-3 py-1.5 text-[11px]"
      style={{ color: 'var(--color-text-muted)' }}>
      Annuler
    </button>
  </div>
)}
```

- [ ] **Étape 4 : Committer**

```bash
git add src/features/journal/JournalEditor.tsx
git commit -m "feat(journal): extend visibility toggle to Tribu with tribe picker"
```

---

### Task 14 : Server Actions — Enluminures

**Fichiers :**
- Créer : `src/lib/actions/enluminures.ts`

- [ ] **Étape 1 : Créer le fichier**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

export type Enluminure = {
  id:                  string
  author_id:           string
  author_name:         string
  type:                'text' | 'verse'
  highlighted_passage: string | null
  content:             string
  verse_text:          string | null
  created_at:          string
}

export async function addEnluminure(payload: {
  note_id:              string
  type:                 'text' | 'verse'
  highlighted_passage?: string
  content:              string
  verse_text?:          string
}): Promise<{ error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { error } = await supabase.from('enluminures').insert({
      note_id:             payload.note_id,
      author_id:           user.id,
      type:                payload.type,
      highlighted_passage: payload.highlighted_passage ?? null,
      content:             payload.content,
      verse_text:          payload.verse_text ?? null,
    })

    if (error) return { error: 'Erreur lors de l\'envoi' }
    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}

export async function getEnluminuresForNote(noteId: string): Promise<Enluminure[]> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('enluminures')
      .select('id, author_id, type, highlighted_passage, content, verse_text, created_at, citizen_profiles!enluminures_author_id_fkey(display_name)')
      .eq('note_id', noteId)
      .order('created_at', { ascending: true })

    if (!data) return []
    return data.map((r) => ({
      id:                  r.id as string,
      author_id:           r.author_id as string,
      author_name:         (r.citizen_profiles as { display_name: string })?.display_name ?? '?',
      type:                r.type as 'text' | 'verse',
      highlighted_passage: r.highlighted_passage as string | null,
      content:             r.content as string,
      verse_text:          r.verse_text as string | null,
      created_at:          r.created_at as string,
    }))
  } catch {
    return []
  }
}

export async function getEnluminureCountForNote(noteId: string): Promise<number> {
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from('enluminures')
      .select('*', { count: 'exact', head: true })
      .eq('note_id', noteId)
    return count ?? 0
  } catch {
    return 0
  }
}
```

- [ ] **Étape 2 : Committer**

```bash
git add src/lib/actions/enluminures.ts
git commit -m "feat(enluminures): add Server Actions — addEnluminure, getEnluminuresForNote"
```

---

### Task 15 : EnluminureComposer

**Fichiers :**
- Créer : `src/features/enluminures/EnluminureComposer.tsx`

- [ ] **Étape 1 : Créer le fichier**

```typescript
'use client'

import { useState } from 'react'
import { addEnluminure } from '@/lib/actions/enluminures'
import { cn } from '@/lib/utils'

interface EnluminureComposerProps {
  noteId:    string
  onSuccess: () => void
  onCancel:  () => void
}

export function EnluminureComposer({ noteId, onSuccess, onCancel }: EnluminureComposerProps) {
  const [mode, setMode]                 = useState<'text' | 'verse'>('text')
  const [highlighted, setHighlighted]   = useState('')
  const [content, setContent]           = useState('')
  const [verseRef, setVerseRef]         = useState('')
  const [verseText, setVerseText]       = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const canSubmit = mode === 'text'
    ? content.trim().length > 0 && content.trim().length <= 50
    : verseRef.trim().length > 0 && verseText.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    const result = await addEnluminure(
      mode === 'text'
        ? { note_id: noteId, type: 'text', highlighted_passage: highlighted || undefined, content: content.trim() }
        : { note_id: noteId, type: 'verse', content: verseRef.trim(), verse_text: verseText.trim() }
    )
    setLoading(false)
    if (result.error) { setError(result.error); return }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit}
      className="rounded-[var(--radius-md)] border border-[rgba(255,255,255,0.08)] p-4 flex flex-col gap-3"
      style={{ background: 'rgba(255,255,255,0.02)' }}>

      {/* Switcher mode */}
      <div className="flex gap-3">
        {(['text', 'verse'] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={cn('text-[10px] font-medium tracking-[.06em] uppercase pb-0.5 border-b transition-colors',
              mode === m
                ? 'border-[var(--color-amber-400)] text-[var(--color-amber-400)]'
                : 'border-transparent text-[var(--color-text-muted)]'
            )}>
            {m === 'text' ? 'Annotation' : 'Verset'}
          </button>
        ))}
      </div>

      {mode === 'text' && (
        <>
          <input
            value={highlighted}
            onChange={(e) => setHighlighted(e.target.value)}
            placeholder="Passage surligné (optionnel)"
            className="bg-transparent text-[12px] italic outline-none border-b pb-1"
            style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-editorial)' }}
          />
          <div className="relative">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={50}
              placeholder="Ta trace… (50 chars max)"
              className="w-full bg-transparent text-[13px] outline-none border-b pb-1"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--color-text-primary)' }}
            />
            <span className="absolute right-0 bottom-2 text-[10px]"
              style={{ color: 'var(--color-text-disabled)' }}>
              {content.length}/50
            </span>
          </div>
        </>
      )}

      {mode === 'verse' && (
        <>
          <input
            value={verseRef}
            onChange={(e) => setVerseRef(e.target.value)}
            placeholder="Référence · ex: Jean 3:16"
            className="bg-transparent text-[12px] outline-none border-b pb-1"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-editorial)' }}
          />
          <textarea
            value={verseText}
            onChange={(e) => setVerseText(e.target.value)}
            placeholder="Texte du verset…"
            rows={2}
            className="bg-transparent text-[13px] italic outline-none resize-none"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-editorial)' }}
          />
        </>
      )}

      {error && <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={!canSubmit || loading}
          className="text-[11px] font-medium tracking-[.06em] uppercase px-3 py-1 rounded-[var(--radius-sm)] border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)] disabled:opacity-30">
          {loading ? '…' : 'Enluminer'}
        </button>
        <button type="button" onClick={onCancel}
          className="text-[11px] tracking-[.06em] uppercase px-3 py-1 text-[var(--color-text-muted)]">
          Annuler
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Étape 2 : Committer**

```bash
git add src/features/enluminures/EnluminureComposer.tsx
git commit -m "feat(enluminures): add EnluminureComposer — text annotation + verse response"
```

---

### Task 16 : EnluminureMargin + EnluminureBadge

**Fichiers :**
- Créer : `src/features/enluminures/EnluminureMargin.tsx`
- Créer : `src/features/enluminures/EnluminureBadge.tsx`

- [ ] **Étape 1 : EnluminureMargin**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getEnluminuresForNote, type Enluminure } from '@/lib/actions/enluminures'
import { EnluminureComposer } from './EnluminureComposer'

interface EnluminureMarginProps {
  noteId:    string
  isAuthor:  boolean
}

export function EnluminureMargin({ noteId, isAuthor }: EnluminureMarginProps) {
  const [enluminures, setEnluminures] = useState<Enluminure[]>([])
  const [composing, setComposing]     = useState(false)

  async function load() {
    const data = await getEnluminuresForNote(noteId)
    setEnluminures(data)
  }

  useEffect(() => { void load() }, [noteId])

  return (
    <div className="mt-6 flex flex-col gap-3">
      {enluminures.map((e) => (
        <div key={e.id} className="pl-3 border-l border-[rgba(239,159,39,0.25)]">
          {e.highlighted_passage && (
            <p className="text-[11px] italic mb-1 line-clamp-2"
              style={{ color: 'var(--color-text-disabled)', fontFamily: 'var(--font-editorial)' }}>
              « {e.highlighted_passage} »
            </p>
          )}
          {e.type === 'text' ? (
            <p className="text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
              {e.content}
            </p>
          ) : (
            <>
              <p className="text-[10px] tracking-[.06em] uppercase mb-0.5"
                style={{ color: 'var(--color-amber-400)' }}>
                {e.content}
              </p>
              <p className="text-[12px] italic" style={{
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-editorial)',
              }}>
                {e.verse_text}
              </p>
            </>
          )}
          <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-disabled)' }}>
            — {e.author_name}
          </p>
        </div>
      ))}

      {!isAuthor && !composing && (
        <button
          onClick={() => setComposing(true)}
          className="self-start text-[10px] font-medium tracking-[.06em] uppercase transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-muted)' }}
        >
          ◈ Enluminer
        </button>
      )}

      {composing && (
        <EnluminureComposer
          noteId={noteId}
          onSuccess={() => { setComposing(false); void load() }}
          onCancel={() => setComposing(false)}
        />
      )}
    </div>
  )
}
```

- [ ] **Étape 2 : EnluminureBadge**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getEnluminureCountForNote } from '@/lib/actions/enluminures'

export function EnluminureBadge({ noteId }: { noteId: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    void getEnluminureCountForNote(noteId).then(setCount)
  }, [noteId])

  if (count === 0) return null

  return (
    <span className="text-[10px] tracking-[.04em]"
      style={{ color: 'var(--color-amber-400)' }}>
      ◈ {count}
    </span>
  )
}
```

- [ ] **Étape 3 : Committer**

```bash
git add src/features/enluminures/EnluminureMargin.tsx src/features/enluminures/EnluminureBadge.tsx
git commit -m "feat(enluminures): add EnluminureMargin + EnluminureBadge"
```

---

### Task 17 : Intégrer Enluminures dans JournalCard + JournalEditor

**Fichiers :**
- Modifier : `src/features/journal/JournalCard.tsx`
- Modifier : `src/features/journal/JournalEditor.tsx` (ou page détail)

- [ ] **Étape 1 : Ajouter EnluminureBadge à JournalCard**

Dans `JournalCard.tsx`, importer et ajouter dans le footer de la carte (après la date) :

```typescript
import { EnluminureBadge } from '@/features/enluminures/EnluminureBadge'

// Dans le JSX, à côté de la date :
<EnluminureBadge noteId={note.id} />
```

- [ ] **Étape 2 : Ajouter EnluminureMargin dans les deux contextes**

**A) Dans `/journal/[id]` (tes propres notes) :**
`isAuthor={true}` — toujours, car cette route n'affiche que tes propres Journals.
Ajoute sous `<JournalEditor id={id} />` :

```typescript
import { EnluminureMargin } from '@/features/enluminures/EnluminureMargin'

<EnluminureMargin noteId={id} isAuthor={true} />
```

Cela affiche les Enluminures reçues, sans le bouton "Enluminer" (tu ne peux pas t'enluminer toi-même).

**B) Dans `AllyJournalFeed.tsx` (notes d'un Allié) :**
`isAuthor={false}` — toujours, car tu consultes les notes de quelqu'un d'autre.
Dans chaque carte de note, ajouter un état `expanded` et afficher la marge :

```typescript
const [expanded, setExpanded] = useState(false)

// Dans le JSX, après l'extrait :
<button onClick={() => setExpanded((v) => !v)}
  className="text-[10px] tracking-[.06em] uppercase mt-1 transition-opacity hover:opacity-70"
  style={{ color: 'var(--color-text-muted)' }}>
  ◈ Enluminer
</button>
{expanded && (
  <EnluminureMargin noteId={note.id} isAuthor={false} />
)}
```

- [ ] **Étape 3 : Vérifier manuellement**

Depuis un compte Allié, ouvrir un Journal partagé → le bouton `◈ Enluminer` apparaît en bas. L'auteur du Journal voit les Enluminures reçues avec le nom de l'Allié en Cormorant italique.

- [ ] **Étape 4 : Committer**

```bash
git add src/features/journal/JournalCard.tsx src/app/(main)/journal/
git commit -m "feat(enluminures): integrate EnluminureBadge in JournalCard + EnluminureMargin in journal detail"
```

---

### Task 18 : Mettre à jour `/alliances` — onglet Tribus complet

**Fichiers :**
- Modifier : `src/app/(main)/alliances/page.tsx`

- [ ] **Étape 1 : Réécrire la page avec tabs complets**

```typescript
import type { Metadata } from 'next'
import { AllianceTabs } from '@/features/alliances/AllianceTabs'

export const metadata: Metadata = { title: 'Alliances — BASILEIA' }

export default function AlliancesPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="px-6 py-5 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-medium tracking-[.09em] uppercase text-[var(--color-text-muted)]">
          Alliances & Tribus
        </p>
      </header>
      <AllianceTabs />
    </div>
  )
}
```

- [ ] **Étape 2 : Créer `AllianceTabs.tsx`**

Créer `src/features/alliances/AllianceTabs.tsx` :

```typescript
'use client'

import { useState, useEffect, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { AlliesList } from './AlliesList'
import { ConnectForm } from './ConnectForm'
import { TribeCard } from './TribeCard'
import { TribeCreateForm } from './TribeCreateForm'
import { getMyTribes, type TribeWithRole } from '@/lib/actions/tribes'

type Tab = 'allies' | 'tribes'

export function AllianceTabs() {
  const [tab, setTab]           = useState<Tab>('allies')
  const [tribes, setTribes]     = useState<TribeWithRole[]>([])
  const [, startTransition]     = useTransition()

  function refreshTribes() {
    startTransition(async () => {
      setTribes(await getMyTribes())
    })
  }

  useEffect(() => { refreshTribes() }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Tab bar */}
      <div className="flex gap-6 px-6 border-b border-[var(--color-border)]">
        {(['allies', 'tribes'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('py-3 text-[11px] font-medium tracking-[.06em] uppercase border-b-[1.5px] -mb-px transition-colors',
              tab === t
                ? 'border-[var(--color-amber-400)] text-[var(--color-amber-400)]'
                : 'border-transparent text-[var(--color-text-muted)]'
            )}>
            {t === 'allies' ? 'Alliés' : 'Tribus'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 pb-16 md:pb-6 flex flex-col gap-6">
        {tab === 'allies' && (
          <>
            <ConnectForm />
            <AlliesList />
          </>
        )}
        {tab === 'tribes' && (
          <>
            <TribeCreateForm onSuccess={refreshTribes} />
            {tribes.length === 0 && (
              <p className="text-[12px] text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                Aucune Tribu pour l'instant.
              </p>
            )}
            {tribes.map((t) => <TribeCard key={t.id} tribe={t} />)}
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Étape 3 : Vérifier manuellement**

Aller sur `/alliances`. Les deux tabs fonctionnent. Créer une Tribu → apparaît dans l'onglet Tribus. Copier le lien → ouvrir dans un autre navigateur → page aperçu visible.

- [ ] **Étape 4 : Committer**

```bash
git add src/app/(main)/alliances/page.tsx src/features/alliances/AllianceTabs.tsx
git commit -m "feat(alliances): complete /alliances page with tabs — Alliés + Tribus"
```

---

## Vérification finale

- [ ] Connexion Allié bout-en-bout : compte A → code → compte B accepte → Journal partagé visible
- [ ] Enluminure bout-en-bout : compte B enluminure le Journal → compte A voit la trace en marge
- [ ] Tribu bout-en-bout : créer → lien → demander → approuver → Journal publié dans la Tribu visible par tous les membres
- [ ] Pas de feed global — aucun Journal visible sans lien explicite (Allié ou Tribu)
- [ ] Badge BottomNav Alliances apparaît si demandes pending

```bash
git tag phase3-complete
```
