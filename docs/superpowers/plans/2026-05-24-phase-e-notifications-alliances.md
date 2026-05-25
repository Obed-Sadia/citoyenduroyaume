# Phase E — Notifications & Alliances — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre les alliances fonctionnelles depuis l'app : invitations (email + lien), notifications persistantes pour 4 types d'events, et feed de versets partagés par les alliés.

**Architecture:** Les invitations utilisent le `short_code` existant (via lien) ou une recherche email via fonction RPC Postgres. Les notifications sont stockées en table Supabase avec RLS. La visibilité des versets est un champ `visibility` ajouté en DB et en local (Dexie). Les notifications `territory_updated` et `verse_shared` sont créées dans les fonctions de sync existantes.

**Tech Stack:** Next.js 16 App Router · Server Actions · Supabase (PostgreSQL + RLS) · Dexie.js · Zustand · Tailwind CSS v4 · Framer Motion

---

## Fichiers créés / modifiés

| Action | Fichier |
|--------|---------|
| Modify | `src/lib/supabase/types.ts` |
| Modify | `src/lib/db/basileia.db.ts` |
| Modify | `src/lib/stores/verses.store.ts` |
| Modify | `src/lib/actions/allies.ts` |
| Modify | `src/lib/supabase/sync.ts` |
| Modify | `src/features/auth/AuthProvider.tsx` |
| Modify | `src/features/alliances/AlliesList.tsx` |
| Modify | `src/features/alliances/AllianceTabs.tsx` |
| Modify | `src/features/bibliotheque/VerseCaptureBar.tsx` |
| Modify | `src/app/(main)/notifications/page.tsx` |
| Create | `src/features/alliances/InvitationList.tsx` |
| Create | `src/features/alliances/EmailSearchForm.tsx` |
| Create | `src/features/alliances/AllyVerseFeed.tsx` |
| Create | `src/features/notifications/NotificationFeed.tsx` |
| Create | `src/app/invite/[code]/page.tsx` |
| Supabase Dashboard | Exécuter 5 blocs SQL (voir Task 1) |

---

## Task 1 : Supabase Dashboard — setup DB

**Fichiers :** Supabase SQL Editor uniquement (Dashboard → SQL Editor)

- [ ] **Étape 1 : Créer la table `notifications`**

Exécuter dans SQL Editor :

```sql
CREATE TABLE public.notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.citizen_profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN (
                  'invitation_received',
                  'invitation_accepted',
                  'territory_updated',
                  'verse_shared'
                )),
  from_user_id  UUID NOT NULL REFERENCES public.citizen_profiles(id) ON DELETE CASCADE,
  payload       JSONB NOT NULL DEFAULT '{}',
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notifications_insert"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "notifications_update"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE INDEX notifications_user_unread ON public.notifications(user_id, read_at);
```

- [ ] **Étape 2 : Ajouter `visibility` sur `verses`**

```sql
ALTER TABLE public.verses
  ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private'
  CHECK (visibility IN ('private', 'allies'));

-- Policy cross-user : un allié peut lire les versets partagés
CREATE POLICY "allies_read_shared_verses"
  ON public.verses FOR SELECT
  USING (
    user_id = auth.uid()
    OR (
      visibility = 'allies'
      AND EXISTS (
        SELECT 1 FROM public.allies
        WHERE status = 'accepted'
        AND (
          (requester_id = auth.uid() AND receiver_id = verses.user_id)
          OR (receiver_id = auth.uid() AND requester_id = verses.user_id)
        )
      )
    )
  );
```

> Si une policy SELECT existe déjà sur `verses` et utilise `user_id = auth.uid()`, la remplacer par celle ci-dessus (qui la contient + étend aux alliés).

- [ ] **Étape 3 : Ajouter `email` sur `citizen_profiles`**

```sql
ALTER TABLE public.citizen_profiles
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Peupler depuis auth.users pour les comptes existants
UPDATE public.citizen_profiles cp
SET email = u.email
FROM auth.users u
WHERE cp.id = u.id AND cp.email IS NULL;
```

- [ ] **Étape 4 : Modifier le trigger de création de compte pour peupler `email`**

Ouvrir **Database → Functions**, trouver la fonction `handle_new_user` (ou équivalent). Ajouter `email` dans l'INSERT :

```sql
-- Remplacer le corps de la fonction handle_new_user par :
BEGIN
  INSERT INTO public.citizen_profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
```

- [ ] **Étape 5 : Créer la fonction RPC `search_citizen_by_email`**

```sql
CREATE OR REPLACE FUNCTION public.search_citizen_by_email(search_email TEXT)
RETURNS TABLE(id UUID, display_name TEXT, avatar_url TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT cp.id, cp.display_name, cp.avatar_url
  FROM public.citizen_profiles cp
  WHERE cp.email = lower(trim(search_email))
    AND cp.id != auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_citizen_by_email(TEXT) TO authenticated;
```

- [ ] **Étape 6 : Vérifier que citizen_profiles est lisible par les alliés**

Aller dans **Authentication → Policies → citizen_profiles**. Vérifier qu'il existe une policy SELECT permettant à un utilisateur authentifié de lire les profils de base (nécessaire pour les joins Supabase dans `getMyAllies`, `getNotifications`). Si absente, ajouter :

```sql
CREATE POLICY "authenticated_read_profiles"
  ON public.citizen_profiles FOR SELECT
  USING (auth.role() = 'authenticated');
```

---

## Task 2 : Mettre à jour `types.ts`

**Fichiers :**
- Modify: `src/lib/supabase/types.ts`

- [ ] **Étape 1 : Ajouter le type `notifications`**

Dans `src/lib/supabase/types.ts`, dans `Tables`, après `enluminures` :

```typescript
      notifications: {
        Row: {
          id:           string
          user_id:      string
          type:         'invitation_received' | 'invitation_accepted' | 'territory_updated' | 'verse_shared'
          from_user_id: string
          payload:      Record<string, unknown>
          read_at:      string | null
          created_at:   string
        }
        Insert: {
          id?:          string
          user_id:      string
          type:         'invitation_received' | 'invitation_accepted' | 'territory_updated' | 'verse_shared'
          from_user_id: string
          payload?:     Record<string, unknown>
          read_at?:     string | null
        }
        Update: {
          read_at?: string | null
        }
        Relationships: []
      }
```

- [ ] **Étape 2 : Ajouter `visibility` sur `verses`**

Dans la section `verses`, ajouter `visibility` dans Row, Insert et Update :

```typescript
// Dans verses.Row
visibility: 'private' | 'allies'

// Dans verses.Insert
visibility?: 'private' | 'allies'

// Dans verses.Update
visibility?: 'private' | 'allies'
```

- [ ] **Étape 3 : Ajouter `email` sur `citizen_profiles`**

```typescript
// Dans citizen_profiles.Row
email: string | null

// Dans citizen_profiles.Insert
email?: string | null

// Dans citizen_profiles.Update
email?: string | null
```

- [ ] **Étape 4 : Vérifier la compilation**

```bash
cd /home/obeds/Dev/perso/citoyen-du-royaume && npx tsc --noEmit 2>&1 | head -30
```

Attendu : 0 erreurs sur types.ts.

- [ ] **Étape 5 : Commit**

```bash
git add src/lib/supabase/types.ts
git commit -m "feat(types): add notifications table, verses.visibility, citizen_profiles.email"
```

---

## Task 3 : `Verse.visibility` dans Dexie + store

**Fichiers :**
- Modify: `src/lib/db/basileia.db.ts`
- Modify: `src/lib/stores/verses.store.ts`

- [ ] **Étape 1 : Ajouter `visibility` dans l'interface `Verse`**

Dans `src/lib/db/basileia.db.ts`, modifier l'interface `Verse` :

```typescript
export interface Verse {
  id:         string
  reference:  string
  text:       string
  domain:     DomainId | null
  visibility: 'private' | 'allies'
  createdAt:  string
}
```

- [ ] **Étape 2 : Mettre à jour `addVerse` dans le store**

Dans `src/lib/stores/verses.store.ts`, modifier la signature et l'implémentation de `addVerse` :

```typescript
interface VersesStore {
  verses:     Verse[]
  isLoaded:   boolean
  loadFromDb: () => Promise<void>
  addVerse:   (reference: string, text: string, domain?: DomainId, visibility?: 'private' | 'allies') => Promise<void>
  removeVerse:(id: string) => Promise<void>
  reset:      () => void
}
```

```typescript
  addVerse: async (reference, text, domain, visibility = 'private') => {
    const verse: Verse = {
      id:         crypto.randomUUID(),
      reference,
      text,
      domain:     domain ?? null,
      visibility,
      createdAt:  new Date().toISOString(),
    }
    set((state) => ({ verses: [verse, ...state.verses] }))
    try {
      await VersesRepo.add(verse)
      void syncVerse(verse)
    } catch (err) {
      set((state) => ({ verses: state.verses.filter((v) => v.id !== verse.id) }))
      console.error('[VersesStore] addVerse failed', err)
    }
  },
```

- [ ] **Étape 3 : Vérifier la compilation**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Attendu : 0 erreurs nouvelles.

- [ ] **Étape 4 : Commit**

```bash
git add src/lib/db/basileia.db.ts src/lib/stores/verses.store.ts
git commit -m "feat(verses): add visibility field to Verse type and addVerse signature"
```

---

## Task 4 : Nouvelles Server Actions dans `allies.ts`

**Fichiers :**
- Modify: `src/lib/actions/allies.ts`

- [ ] **Étape 1 : Ajouter les types de retour pour notifications**

En tête de `src/lib/actions/allies.ts`, après les imports existants, ajouter :

```typescript
export type NotificationType =
  | 'invitation_received'
  | 'invitation_accepted'
  | 'territory_updated'
  | 'verse_shared'

export type NotificationRow = {
  id:         string
  type:       NotificationType
  payload:    Record<string, unknown>
  read_at:    string | null
  created_at: string
  sender: {
    id:           string
    display_name: string
    avatar_url:   string | null
  }
}

export type AllyVerseRow = {
  id:        string
  reference: string
  text:      string
  domain:    string | null
  created_at:string
  author: {
    id:           string
    display_name: string
    avatar_url:   string | null
  }
}
```

- [ ] **Étape 2 : Ajouter `getNotifications`**

À la fin du fichier, ajouter :

```typescript
export async function getNotifications(): Promise<NotificationRow[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
      .from('notifications')
      .select(`
        id, type, payload, read_at, created_at,
        sender:citizen_profiles!notifications_from_user_id_fkey(id, display_name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!data) return []
    return data as unknown as NotificationRow[]
  } catch {
    return []
  }
}
```

- [ ] **Étape 3 : Ajouter `getUnreadCount`**

```typescript
export async function getUnreadCount(): Promise<number> {
  try {
    const supabase = await createServerSupabaseClient()
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .is('read_at', null)
    return count ?? 0
  } catch {
    return 0
  }
}
```

- [ ] **Étape 4 : Ajouter `markNotificationsRead`**

```typescript
export async function markNotificationsRead(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .in('id', ids)
      .eq('user_id', user.id)
  } catch {
    // silent
  }
}
```

- [ ] **Étape 5 : Ajouter `getAllyVerses`**

```typescript
export async function getAllyVerses(): Promise<AllyVerseRow[]> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: alliances } = await supabase
      .from('allies')
      .select('requester_id, receiver_id')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)

    if (!alliances || alliances.length === 0) return []

    const allyIds = alliances.map((a) =>
      a.requester_id === user.id ? a.receiver_id : a.requester_id
    )

    const { data } = await supabase
      .from('verses')
      .select(`
        id, reference, text, domain, created_at,
        author:citizen_profiles!verses_user_id_fkey(id, display_name, avatar_url)
      `)
      .in('user_id', allyIds)
      .eq('visibility', 'allies')
      .order('created_at', { ascending: false })

    if (!data) return []
    return data as unknown as AllyVerseRow[]
  } catch {
    return []
  }
}
```

- [ ] **Étape 6 : Ajouter `searchCitizenByEmail`**

```typescript
type CandidateProfile = { id: string; display_name: string; avatar_url: string | null }

export async function searchCitizenByEmail(
  email: string
): Promise<CandidateProfile | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .rpc('search_citizen_by_email', { search_email: email.trim().toLowerCase() })
      .maybeSingle()

    if (error || !data) return null
    return data as unknown as CandidateProfile
  } catch {
    return null
  }
}
```

- [ ] **Étape 7 : Ajouter `sendAllianceRequestById`**

(Utilisé par le flux email, prend un `receiverId` directement)

```typescript
export async function sendAllianceRequestById(
  receiverId: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }
    if (receiverId === user.id) return { error: 'Tu ne peux pas t\'ajouter toi-même' }

    const { data: existing } = await supabase
      .from('allies')
      .select('id')
      .or(
        `and(requester_id.eq.${user.id},receiver_id.eq.${receiverId}),` +
        `and(requester_id.eq.${receiverId},receiver_id.eq.${user.id})`
      )
      .maybeSingle()

    if (existing) return { error: 'Une demande existe déjà entre vous' }

    const { error } = await supabase.from('allies').insert({
      requester_id: user.id,
      receiver_id:  receiverId,
    })
    if (error) return { error: 'Erreur lors de l\'envoi' }

    await supabase.from('notifications').insert({
      user_id:      receiverId,
      type:         'invitation_received',
      from_user_id: user.id,
      payload:      {},
    })

    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}
```

- [ ] **Étape 8 : Ajouter `getMyShortCode`**

```typescript
export async function getMyShortCode(): Promise<string | null> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
      .from('citizen_profiles')
      .select('short_code')
      .eq('id', user.id)
      .single()
    return data?.short_code ?? null
  } catch {
    return null
  }
}
```

- [ ] **Étape 9 : Ajouter `acceptLinkInvitation`**

(Utilisé par la page `/invite/[code]` — crée l'alliance directement `accepted` puisque A a explicitement partagé son lien)

```typescript
export async function acceptLinkInvitation(
  shortCode: string
): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { data: inviter } = await supabase
      .from('citizen_profiles')
      .select('id')
      .eq('short_code', shortCode.toUpperCase())
      .single()

    if (!inviter) return { error: 'Code invalide' }
    if (inviter.id === user.id) return { error: 'Impossible de s\'allier à soi-même' }

    const { data: existing } = await supabase
      .from('allies')
      .select('id')
      .or(
        `and(requester_id.eq.${inviter.id},receiver_id.eq.${user.id}),` +
        `and(requester_id.eq.${user.id},receiver_id.eq.${inviter.id})`
      )
      .maybeSingle()

    if (existing) return { error: 'Alliance déjà existante' }

    // A a partagé le lien → A est requester, B (user courant) est receiver, status directement accepted
    const { error } = await supabase.from('allies').insert({
      requester_id: inviter.id,
      receiver_id:  user.id,
      status:       'accepted',
    })
    if (error) return { error: 'Erreur lors de l\'acceptation' }

    await supabase.from('notifications').insert({
      user_id:      inviter.id,
      type:         'invitation_accepted',
      from_user_id: user.id,
      payload:      {},
    })

    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}
```

- [ ] **Étape 9 : Vérifier la compilation**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Étape 10 : Commit**

```bash
git add src/lib/actions/allies.ts
git commit -m "feat(allies): add notification actions, email search, ally verse feed"
```

---

## Task 5 : Modifier `sendAllyRequest` et `respondToAllyRequest` pour créer des notifications

**Fichiers :**
- Modify: `src/lib/actions/allies.ts`

- [ ] **Étape 1 : Modifier `sendAllyRequest` pour créer une notification**

Dans `src/lib/actions/allies.ts`, remplacer la fonction `sendAllyRequest` existante :

```typescript
export async function sendAllyRequest(shortCode: string): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
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

    await supabase.from('notifications').insert({
      user_id:      profile.id,
      type:         'invitation_received',
      from_user_id: user.id,
      payload:      {},
    })

    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}
```

- [ ] **Étape 2 : Modifier `respondToAllyRequest` pour créer une notification sur acceptation**

Remplacer la fonction `respondToAllyRequest` existante :

```typescript
export async function respondToAllyRequest(
  allyId: string,
  response: 'accepted' | 'rejected'
): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Non authentifié' }

    const { data: allyRow, error: fetchError } = await supabase
      .from('allies')
      .select('id, requester_id')
      .eq('id', allyId)
      .eq('receiver_id', user.id)
      .single()

    if (fetchError || !allyRow) return { error: 'Demande introuvable' }

    const { error } = await supabase
      .from('allies')
      .update({ status: response })
      .eq('id', allyId)
      .eq('receiver_id', user.id)

    if (error) return { error: 'Erreur lors de la réponse' }

    if (response === 'accepted') {
      await supabase.from('notifications').insert({
        user_id:      allyRow.requester_id,
        type:         'invitation_accepted',
        from_user_id: user.id,
        payload:      {},
      })
    }

    return {}
  } catch {
    return { error: 'Erreur inattendue' }
  }
}
```

- [ ] **Étape 3 : Vérifier la compilation**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Étape 4 : Commit**

```bash
git add src/lib/actions/allies.ts
git commit -m "feat(allies): create notifications on invite send and accept"
```

---

## Task 6 : Mettre à jour `syncVerse` dans `sync.ts`

**Fichiers :**
- Modify: `src/lib/supabase/sync.ts`

- [ ] **Étape 1 : Modifier `syncVerse` pour inclure `visibility` et créer `verse_shared`**

Remplacer la fonction `syncVerse` dans `src/lib/supabase/sync.ts` :

```typescript
export async function syncVerse(verse: Verse): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()

      const { data: existing } = await supabase
        .from('verses')
        .select('id')
        .eq('id', verse.id)
        .maybeSingle()

      const isNew = !existing

      await supabase.from('verses').upsert({
        id:         verse.id,
        user_id:    userId,
        reference:  verse.reference,
        text:       verse.text,
        domain:     verse.domain ?? null,
        visibility: verse.visibility ?? 'private',
      })

      if (isNew && verse.visibility === 'allies') {
        const { data: alliances } = await supabase
          .from('allies')
          .select('requester_id, receiver_id')
          .eq('status', 'accepted')
          .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)

        if (alliances && alliances.length > 0) {
          const allyIds = alliances.map((a) =>
            a.requester_id === userId ? a.receiver_id : a.requester_id
          )
          await supabase.from('notifications').insert(
            allyIds.map((allyId) => ({
              user_id:      allyId,
              type:         'verse_shared' as const,
              from_user_id: userId,
              payload:      { reference: verse.reference },
            }))
          )
        }
      }
    } catch {
      // silent — offline-first
    }
  })
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Étape 3 : Commit**

```bash
git add src/lib/supabase/sync.ts
git commit -m "feat(sync): syncVerse includes visibility and creates verse_shared notifications"
```

---

## Task 7 : Mettre à jour `syncPreferences` pour détecter les changements de territoire

**Fichiers :**
- Modify: `src/lib/supabase/sync.ts`

- [ ] **Étape 1 : Modifier `syncPreferences` pour créer `territory_updated`**

Remplacer la fonction `syncPreferences` dans `src/lib/supabase/sync.ts` :

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

      const oldPrefs  = (existing?.preferences as Record<string, unknown>) ?? {}
      const merged    = { ...oldPrefs, ...patch }

      if (merged.share_territoire === true) {
        merged.territoire = await computeExplorationSnapshot()
      } else {
        delete merged.territoire
      }

      await supabase
        .from('citizen_profiles')
        .update({ preferences: merged })
        .eq('id', userId)

      const oldTerritoire = oldPrefs.territoire
      const newTerritoire = merged.territoire

      if (
        merged.share_territoire === true &&
        newTerritoire &&
        JSON.stringify(oldTerritoire) !== JSON.stringify(newTerritoire)
      ) {
        const { data: alliances } = await supabase
          .from('allies')
          .select('requester_id, receiver_id')
          .eq('status', 'accepted')
          .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)

        if (alliances && alliances.length > 0) {
          const allyIds = alliances.map((a) =>
            a.requester_id === userId ? a.receiver_id : a.requester_id
          )
          await supabase.from('notifications').insert(
            allyIds.map((allyId) => ({
              user_id:      allyId,
              type:         'territory_updated' as const,
              from_user_id: userId,
              payload:      {},
            }))
          )
        }
      }
    } catch {
      // silent — offline-first
    }
  })
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Étape 3 : Commit**

```bash
git add src/lib/supabase/sync.ts
git commit -m "feat(sync): syncPreferences creates territory_updated notifications on change"
```

---

## Task 8 : Mettre à jour `pullVerses` pour inclure `visibility`

**Fichiers :**
- Modify: `src/lib/supabase/sync.ts`

- [ ] **Étape 1 : Modifier `pullVerses` pour inclure le champ `visibility`**

Remplacer la fonction `pullVerses` dans `src/lib/supabase/sync.ts` :

```typescript
export async function pullVerses(): Promise<void> {
  await track(async () => {
    try {
      const userId = await getUserId()
      if (!userId) return
      const supabase = createClient()
      const { data: rows } = await supabase
        .from('verses')
        .select('id, reference, text, domain, visibility, created_at')
        .eq('user_id', userId)
      if (!rows) return
      for (const row of rows) {
        const existing = await VersesRepo.getById(row.id)
        if (!existing) {
          await VersesRepo.add({
            id:         row.id,
            reference:  row.reference,
            text:       row.text,
            domain:     (row.domain ?? null) as DomainId | null,
            visibility: (row.visibility ?? 'private') as 'private' | 'allies',
            createdAt:  row.created_at,
          })
        }
      }
    } catch {
      // silent
    }
  })
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Étape 3 : Commit**

```bash
git add src/lib/supabase/sync.ts
git commit -m "feat(sync): pullVerses restores visibility field from DB"
```

---

## Task 9 : `AuthProvider` — charger `unreadCount` au login

**Fichiers :**
- Modify: `src/features/auth/AuthProvider.tsx`

- [ ] **Étape 1 : Modifier `AuthProvider` pour appeler `getUnreadCount` dans `initSession`**

Remplacer le contenu de `src/features/auth/AuthProvider.tsx` :

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
import { useNavStore } from '@/lib/stores/nav.store'
import { pullNotes, pullSecrets, pullVerses } from '@/lib/supabase/sync'
import { getUnreadCount } from '@/lib/actions/allies'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function initSession(userId: string): Promise<void> {
      await initDb(userId)

      await Promise.all([pullNotes(), pullSecrets(), pullVerses()])

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

      await Promise.all([
        useNotesStore.getState().loadFromDb(),
        useSecretsStore.getState().loadFromDb(),
        useVersesStore.getState().loadFromDb(),
      ])

      const count = await getUnreadCount()
      useNavStore.getState().setUnreadCount(count)
    }

    function resetSession(): void {
      void closeDb()
      useNotesStore.getState().reset()
      useSecretsStore.getState().reset()
      useVersesStore.getState().reset()
      useNavStore.getState().clearUnread()
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

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Étape 3 : Commit**

```bash
git add src/features/auth/AuthProvider.tsx
git commit -m "feat(auth): load unread notification count on session init"
```

---

## Task 10 : Composant `NotificationFeed` + câblage de `/notifications`

**Fichiers :**
- Create: `src/features/notifications/NotificationFeed.tsx`
- Modify: `src/app/(main)/notifications/page.tsx`

- [ ] **Étape 1 : Créer `src/features/notifications/NotificationFeed.tsx`**

```typescript
'use client'

import { useEffect, useState, useTransition } from 'react'
import { getNotifications, markNotificationsRead, type NotificationRow } from '@/lib/actions/allies'
import { useNavStore } from '@/lib/stores/nav.store'
import { relativeTime, getInitials, nameToHsl } from '@/lib/utils'

const TYPE_LABELS: Record<NotificationRow['type'], (n: NotificationRow) => string> = {
  invitation_received: () => "t'a envoyé une invitation d'alliance",
  invitation_accepted: () => 'a accepté ton invitation',
  territory_updated:   () => 'a mis à jour son Territoire',
  verse_shared:        (n) => `a ancré ${(n.payload as Record<string, string>).reference ?? 'un verset'}`,
}

const TYPE_ICONS: Record<NotificationRow['type'], string> = {
  invitation_received: '✉',
  invitation_accepted: '✓',
  territory_updated:   '⬡',
  verse_shared:        '◈',
}

export function NotificationFeed() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [, startTransition]               = useTransition()
  const clearUnread                       = useNavStore((s) => s.clearUnread)

  useEffect(() => {
    startTransition(async () => {
      const data = await getNotifications()
      setNotifications(data)

      const unreadIds = data.filter((n) => !n.read_at).map((n) => n.id)
      if (unreadIds.length > 0) {
        void markNotificationsRead(unreadIds)
        clearUnread()
      }
    })
  }, [clearUnread])

  if (notifications.length === 0) {
    return (
      <p className="py-12 text-center text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
        Aucune notification pour l'instant.
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="flex items-start gap-3 py-4"
          style={{
            borderBottom: '0.5px solid rgba(255,255,255,0.06)',
            background: n.read_at ? 'transparent' : 'rgba(239,159,39,0.03)',
          }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-medium"
            style={{
              background: nameToHsl(n.sender.display_name),
              color: 'var(--color-amber-400)',
              border: '1.5px solid rgba(239,159,39,0.3)',
            }}
          >
            {getInitials(n.sender.display_name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] leading-snug" style={{ color: 'var(--color-text-primary)' }}>
              <span className="font-medium">{n.sender.display_name}</span>{' '}
              {TYPE_LABELS[n.type](n)}
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {relativeTime(n.created_at)}
            </p>
          </div>
          <span className="shrink-0 text-[16px]" style={{ color: 'var(--color-text-muted)' }}>
            {TYPE_ICONS[n.type]}
          </span>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Étape 2 : Câbler `/notifications/page.tsx`**

Remplacer `src/app/(main)/notifications/page.tsx` :

```typescript
import type { Metadata } from 'next'
import { NotificationFeed } from '@/features/notifications/NotificationFeed'

export const metadata: Metadata = { title: 'Notifications — BASILEIA' }

export default function NotificationsPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="px-6 py-5 border-b border-[var(--color-border)]">
        <p className="text-[10px] font-medium tracking-[.09em] uppercase text-[var(--color-text-muted)]">
          Notifications
        </p>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-16 md:pb-6">
        <NotificationFeed />
      </div>
    </div>
  )
}
```

> Note : `relativeTime` est déjà dans `src/lib/utils.ts`. Vérifier son existence avant de commit.

- [ ] **Étape 3 : Vérifier la compilation**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Étape 4 : Commit**

```bash
git add src/features/notifications/NotificationFeed.tsx src/app/(main)/notifications/page.tsx
git commit -m "feat(notifications): NotificationFeed component + wire notifications page"
```

---

## Task 11 : Composant `EmailSearchForm`

**Fichiers :**
- Create: `src/features/alliances/EmailSearchForm.tsx`

- [ ] **Étape 1 : Créer `src/features/alliances/EmailSearchForm.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { searchCitizenByEmail, sendAllianceRequestById } from '@/lib/actions/allies'
import { getInitials, nameToHsl } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function EmailSearchForm() {
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'not_found' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [candidate, setCandidate] = useState<{
    id: string; display_name: string; avatar_url: string | null
  } | null>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) return
    setStatus('searching')
    setCandidate(null)
    const result = await searchCitizenByEmail(email.trim())
    if (result) {
      setCandidate(result)
      setStatus('found')
    } else {
      setStatus('not_found')
      setMessage('Aucun Citoyen trouvé avec cet email.')
    }
  }

  async function handleInvite() {
    if (!candidate) return
    setStatus('sending')
    const result = await sendAllianceRequestById(candidate.id)
    if (result.error) {
      setStatus('error')
      setMessage(result.error)
    } else {
      setStatus('sent')
      setMessage('Invitation envoyée.')
      setEmail('')
      setCandidate(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-medium tracking-[.09em] uppercase"
        style={{ color: 'var(--color-text-muted)' }}>
        Inviter par email
      </p>
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus('idle'); setCandidate(null) }}
          placeholder="adresse@email.com"
          className="flex-1 bg-transparent text-[13px] outline-none border-b pb-1"
          style={{
            borderColor: 'rgba(255,255,255,0.1)',
            color: 'var(--color-text-primary)',
          }}
        />
        <button
          type="submit"
          disabled={!email.includes('@') || status === 'searching'}
          className={cn(
            'text-[11px] font-medium tracking-[.06em] uppercase px-3 py-1 rounded-[var(--radius-sm)]',
            'border border-[rgba(255,255,255,0.08)] transition-opacity',
            'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            (!email.includes('@') || status === 'searching') && 'opacity-30 cursor-not-allowed'
          )}
        >
          {status === 'searching' ? '…' : 'Chercher'}
        </button>
      </form>

      {status === 'found' && candidate && (
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-medium"
              style={{
                background: nameToHsl(candidate.display_name),
                color: 'var(--color-amber-400)',
                border: '1.5px solid rgba(239,159,39,0.3)',
              }}
            >
              {getInitials(candidate.display_name)}
            </div>
            <span className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
              {candidate.display_name}
            </span>
          </div>
          <button
            onClick={handleInvite}
            disabled={status === 'sending'}
            className={cn(
              'text-[11px] font-medium tracking-[.06em] uppercase px-3 py-1 rounded-[var(--radius-sm)]',
              'border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)]',
              status === 'sending' && 'opacity-30 cursor-not-allowed'
            )}
          >
            {status === 'sending' ? '…' : 'Inviter'}
          </button>
        </div>
      )}

      {(status === 'not_found' || status === 'error' || status === 'sent') && message && (
        <p className="text-[11px]" style={{
          color: status === 'sent'
            ? 'var(--color-amber-400)'
            : 'var(--color-text-muted)'
        }}>
          {message}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Étape 3 : Commit**

```bash
git add src/features/alliances/EmailSearchForm.tsx
git commit -m "feat(alliances): EmailSearchForm — search by email and send invitation"
```

---

## Task 12 : Composant `InvitationList`

**Fichiers :**
- Create: `src/features/alliances/InvitationList.tsx`

- [ ] **Étape 1 : Créer `src/features/alliances/InvitationList.tsx`**

```typescript
'use client'

import { useEffect, useState, useTransition } from 'react'
import { getPendingRequests, type AllyWithProfile } from '@/lib/actions/allies'
import { AllyRequest } from './AllyRequest'
import { ConnectForm } from './ConnectForm'
import { InviteBlock } from './InviteBlock'
import { EmailSearchForm } from './EmailSearchForm'
import { getMyShortCode } from '@/lib/actions/allies'

export function InvitationList() {
  const [pending, setPending]     = useState<AllyWithProfile[]>([])
  const [shortCode, setShortCode] = useState<string | null>(null)
  const [, startTransition]       = useTransition()

  function refresh() {
    startTransition(async () => {
      const [p, code] = await Promise.all([getPendingRequests(), getMyShortCode()])
      setPending(p)
      setShortCode(code)
    })
  }

  useEffect(() => { refresh() }, [])

  return (
    <div className="flex flex-col gap-6">
      {pending.length > 0 && (
        <div className="flex flex-col">
          <p className="text-[10px] font-medium tracking-[.09em] uppercase mb-3"
            style={{ color: 'var(--color-text-muted)' }}>
            Reçues
          </p>
          {pending.map((req) => (
            <AllyRequest
              key={req.id}
              id={req.id}
              displayName={req.ally.display_name}
              onRespond={refresh}
            />
          ))}
        </div>
      )}

      <EmailSearchForm />

      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-medium tracking-[.09em] uppercase"
          style={{ color: 'var(--color-text-muted)' }}>
          Inviter par code
        </p>
        <ConnectForm onSuccess={refresh} />
      </div>

      {shortCode && (
        <InviteBlock shortCode={shortCode} />
      )}
    </div>
  )
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Étape 3 : Commit**

```bash
git add src/features/alliances/InvitationList.tsx
git commit -m "feat(alliances): InvitationList — received invites + email + code + link"
```

---

## Task 13 : Composant `AllyVerseFeed`

**Fichiers :**
- Create: `src/features/alliances/AllyVerseFeed.tsx`

- [ ] **Étape 1 : Créer `src/features/alliances/AllyVerseFeed.tsx`**

```typescript
'use client'

import { useEffect, useState, useTransition } from 'react'
import { getAllyVerses, type AllyVerseRow } from '@/lib/actions/allies'
import { getInitials, nameToHsl, relativeTime } from '@/lib/utils'
import { DOMAIN_META } from '@/features/carte/domain-constants'

export function AllyVerseFeed() {
  const [verses, setVerses]   = useState<AllyVerseRow[]>([])
  const [, startTransition]   = useTransition()

  useEffect(() => {
    startTransition(async () => {
      setVerses(await getAllyVerses())
    })
  }, [])

  if (verses.length === 0) {
    return (
      <p className="py-12 text-center text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
        Aucun verset partagé pour l'instant.<br />
        Tes Alliés peuvent partager leurs versets depuis la Bibliothèque.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {verses.map((v) => (
        <div key={v.id} className="flex flex-col gap-2 pb-5"
          style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium"
              style={{
                background: nameToHsl(v.author.display_name),
                color: 'var(--color-amber-400)',
                border: '1px solid rgba(239,159,39,0.3)',
              }}
            >
              {getInitials(v.author.display_name)}
            </div>
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {v.author.display_name} · {relativeTime(v.created_at)}
            </span>
          </div>

          <p className="text-[11px] font-medium tracking-[.08em] uppercase"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}>
            {v.reference}
          </p>
          <p className="text-[18px] leading-relaxed italic"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-editorial)' }}>
            {v.text}
          </p>

          {v.domain && (
            <span className="self-start text-[10px] font-medium tracking-[.06em] uppercase px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)]">
              {DOMAIN_META.find((d) => d.id === v.domain)?.abbr ?? v.domain}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Étape 3 : Commit**

```bash
git add src/features/alliances/AllyVerseFeed.tsx
git commit -m "feat(alliances): AllyVerseFeed — read-only feed of shared ally verses"
```

---

## Task 14 : Refactor `AllianceTabs` — 4 onglets + simplification `AlliesList`

**Fichiers :**
- Modify: `src/features/alliances/AllianceTabs.tsx`
- Modify: `src/features/alliances/AlliesList.tsx`

- [ ] **Étape 1 : Simplifier `AlliesList` — retirer la section invitations pending**

`AlliesList` affiche maintenant uniquement les alliés acceptés (les pending passent dans l'onglet Invitations).

Remplacer `src/features/alliances/AlliesList.tsx` :

```typescript
'use client'

import { useEffect, useState, useTransition } from 'react'
import { getMyAllies, type AllyWithProfile } from '@/lib/actions/allies'
import { AllyCard } from './AllyCard'

export function AlliesList() {
  const [allies, setAllies] = useState<AllyWithProfile[]>([])
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const data = await getMyAllies()
      setAllies(data.filter((x) => x.status === 'accepted'))
    })
  }, [])

  if (allies.length === 0) {
    return (
      <p className="py-8 text-center text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
        Aucun Allié confirmé pour l'instant.<br />
        Va dans l&apos;onglet Invitations pour en ajouter.
      </p>
    )
  }

  return (
    <div className="flex flex-col">
      {allies.map((a) => <AllyCard key={a.id} ally={a} />)}
    </div>
  )
}
```

- [ ] **Étape 2 : Refactorer `AllianceTabs` — 4 onglets**

Remplacer `src/features/alliances/AllianceTabs.tsx` :

```typescript
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AlliesList } from './AlliesList'
import { InvitationList } from './InvitationList'
import { AllyVerseFeed } from './AllyVerseFeed'
import { TribeCard } from './TribeCard'
import { TribeCreateForm } from './TribeCreateForm'
import { getMyTribes, type TribeWithRole } from '@/lib/actions/tribes'
import { useEffect, useTransition } from 'react'

type Tab = 'allies' | 'invitations' | 'verses' | 'tribes'

const TABS: { id: Tab; label: string }[] = [
  { id: 'allies',      label: 'Alliés' },
  { id: 'invitations', label: 'Invitations' },
  { id: 'verses',      label: 'Versets' },
  { id: 'tribes',      label: 'Tribus' },
]

export function AllianceTabs() {
  const [tab, setTab]       = useState<Tab>('allies')
  const [tribes, setTribes] = useState<TribeWithRole[]>([])
  const [, startTransition] = useTransition()

  function refreshTribes() {
    startTransition(async () => {
      setTribes(await getMyTribes())
    })
  }

  useEffect(() => { refreshTribes() }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex gap-5 px-6 border-b border-[var(--color-border)] overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'shrink-0 py-3 text-[11px] font-medium tracking-[.06em] uppercase border-b-[1.5px] -mb-px transition-colors',
              tab === t.id
                ? 'border-[var(--color-amber-400)] text-[var(--color-amber-400)]'
                : 'border-transparent text-[var(--color-text-muted)]'
            )}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 pb-16 md:pb-6 flex flex-col gap-6">
        {tab === 'allies'      && <AlliesList />}
        {tab === 'invitations' && <InvitationList />}
        {tab === 'verses'      && <AllyVerseFeed />}
        {tab === 'tribes'      && (
          <>
            <TribeCreateForm onSuccess={refreshTribes} />
            {tribes.length === 0 && (
              <p className="text-[12px] text-center py-8"
                style={{ color: 'var(--color-text-muted)' }}>
                Aucune Tribu pour l&apos;instant.
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

- [ ] **Étape 3 : Vérifier la compilation**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Étape 4 : Commit**

```bash
git add src/features/alliances/AlliesList.tsx src/features/alliances/AllianceTabs.tsx
git commit -m "feat(alliances): 4-tab layout — Alliés, Invitations, Versets, Tribus"
```

---

## Task 15 : `VerseCaptureBar` — toggle visibilité

**Fichiers :**
- Modify: `src/features/bibliotheque/VerseCaptureBar.tsx`

- [ ] **Étape 1 : Ajouter le toggle `visibility` dans `VerseCaptureBar`**

Remplacer `src/features/bibliotheque/VerseCaptureBar.tsx` :

```typescript
"use client"

import { useRef, useState } from 'react'
import { useVersesStore } from '@/lib/stores/verses.store'
import { classifyDomain } from '@/lib/ai/classify-domain'
import { DOMAIN_META, type DomainId } from '@/features/carte/domain-constants'
import { cn } from '@/lib/utils'

export function VerseCaptureBar() {
  const [reference, setReference]         = useState('')
  const [text, setText]                   = useState('')
  const [suggestedDomain, setSuggestedDomain] = useState<DomainId | null>(null)
  const [classifying, setClassifying]     = useState(false)
  const [visibility, setVisibility]       = useState<'private' | 'allies'>('private')
  const textRef                           = useRef<HTMLInputElement>(null)
  const addVerse                          = useVersesStore((s) => s.addVerse)

  function reset() {
    setReference('')
    setText('')
    setSuggestedDomain(null)
    setVisibility('private')
    textRef.current?.focus()
  }

  function handleTextKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && reference.trim() && text.trim()) {
      addVerse(reference.trim(), text.trim(), suggestedDomain ?? undefined, visibility)
      reset()
    }
  }

  async function handleClassify() {
    if (classifying || text.trim().length < 3) return
    setClassifying(true)
    try {
      const domain = await classifyDomain(text.trim())
      setSuggestedDomain(domain)
    } catch {
      // silent — App-Effacement
    } finally {
      setClassifying(false)
    }
  }

  const showDomainRow = text.trim().length >= 3

  return (
    <div className="sticky bottom-16 md:bottom-0 z-10 border-t border-[var(--color-border)] bg-[var(--color-bg-base)] px-4 pt-3 pb-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Jean 3:16"
          className="w-[140px] shrink-0 bg-transparent text-[13px] outline-none placeholder:text-[var(--color-text-disabled)] border-r border-[var(--color-border)] pr-2"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}
          suppressHydrationWarning
        />
        <input
          ref={textRef}
          type="text"
          value={text}
          onChange={(e) => { setText(e.target.value); setSuggestedDomain(null) }}
          onKeyDown={handleTextKeyDown}
          placeholder="Texte du verset…"
          className="flex-1 bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-[var(--color-text-disabled)]"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-editorial)' }}
          suppressHydrationWarning
        />
      </div>

      <div className="mt-2 flex h-6 items-center justify-between">
        <div className="flex items-center">
          {showDomainRow && (
            suggestedDomain ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium tracking-[.06em] uppercase px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)]">
                  {DOMAIN_META.find((d) => d.id === suggestedDomain)?.abbr}
                </span>
                <button
                  onClick={() => setSuggestedDomain(null)}
                  className="text-[10px] text-[var(--color-text-muted)] transition-opacity hover:opacity-70"
                  aria-label="Retirer le domaine"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={handleClassify}
                disabled={classifying}
                className={cn(
                  'flex items-center gap-1 text-[10px] font-medium tracking-[.06em] uppercase transition-opacity',
                  'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]',
                  classifying && 'opacity-40 cursor-not-allowed'
                )}
              >
                <span aria-hidden="true">{classifying ? '…' : '◈'}</span>
                {!classifying && 'Domaine'}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => setVisibility((v) => v === 'private' ? 'allies' : 'private')}
          className={cn(
            'text-[10px] font-medium tracking-[.06em] uppercase transition-colors px-2 py-0.5 rounded-[var(--radius-sm)]',
            visibility === 'allies'
              ? 'border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)]'
              : 'text-[var(--color-text-muted)]'
          )}
        >
          {visibility === 'allies' ? '⟡ Alliés' : '⊘ Privé'}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Étape 3 : Commit**

```bash
git add src/features/bibliotheque/VerseCaptureBar.tsx
git commit -m "feat(bibliotheque): VerseCaptureBar — toggle visibility private/allies"
```

---

## Task 16 : Page `/invite/[code]`

**Fichiers :**
- Create: `src/app/invite/[code]/page.tsx`

- [ ] **Étape 1 : Créer `src/app/invite/[code]/page.tsx`**

```typescript
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { acceptLinkInvitation } from '@/lib/actions/allies'
import { getInitials, nameToHsl } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ code: string }>
}

export const metadata: Metadata = { title: 'Invitation — BASILEIA' }

export default async function InvitePage({ params }: Props) {
  const { code } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?next=/invite/${code}`)
  }

  const { data: profile } = await supabase
    .from('citizen_profiles')
    .select('id, display_name, avatar_url')
    .eq('short_code', code.toUpperCase())
    .maybeSingle()

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-[14px] text-center" style={{ color: 'var(--color-text-muted)' }}>
          Lien d&apos;invitation invalide ou expiré.
        </p>
      </div>
    )
  }

  if (profile.id === user.id) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-[14px] text-center" style={{ color: 'var(--color-text-muted)' }}>
          C&apos;est ton propre lien d&apos;invitation.
        </p>
      </div>
    )
  }

  const { data: existing } = await supabase
    .from('allies')
    .select('id, status')
    .or(
      `and(requester_id.eq.${user.id},receiver_id.eq.${profile.id}),` +
      `and(requester_id.eq.${profile.id},receiver_id.eq.${user.id})`
    )
    .maybeSingle()

  const alreadyAllied = existing?.status === 'accepted'
  const pendingExists = existing?.status === 'pending'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full text-[20px] font-medium"
          style={{
            background: nameToHsl(profile.display_name),
            color: 'var(--color-amber-400)',
            border: '2px solid rgba(239,159,39,0.4)',
          }}
        >
          {getInitials(profile.display_name)}
        </div>
        <div>
          <p className="text-[10px] font-medium tracking-[.09em] uppercase mb-1"
            style={{ color: 'var(--color-text-muted)' }}>
            Invitation d&apos;alliance
          </p>
          <p className="text-[22px]"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-editorial)' }}>
            {profile.display_name}
          </p>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
            t&apos;invite à devenir son Allié
          </p>
        </div>
      </div>

      {alreadyAllied && (
        <p className="text-[13px]" style={{ color: 'var(--color-amber-400)' }}>
          Vous êtes déjà Alliés. ✓
        </p>
      )}

      {pendingExists && (
        <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
          Une demande est déjà en attente entre vous.
        </p>
      )}

      {!existing && (
        <form action={async () => {
          'use server'
          await acceptLinkInvitation(code)
          redirect('/alliances')
        }}>
          <button
            type="submit"
            className="text-[12px] font-medium tracking-[.08em] uppercase px-6 py-3 rounded-[var(--radius-md)] border border-[var(--color-amber-border)] bg-[var(--color-amber-bg)] text-[var(--color-amber-400)] transition-opacity hover:opacity-80"
          >
            Accepter l&apos;alliance
          </button>
        </form>
      )}

      <a href="/alliances"
        className="text-[11px] tracking-[.06em] uppercase"
        style={{ color: 'var(--color-text-muted)' }}>
        Retour aux Alliances
      </a>
    </div>
  )
}
```

- [ ] **Étape 2 : Vérifier la compilation**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Étape 3 : Vérifier le build complet**

```bash
npm run build 2>&1 | tail -20
```

Attendu : build sans erreurs.

- [ ] **Étape 4 : Commit**

```bash
git add src/app/invite/
git commit -m "feat(invite): /invite/[code] page — accept alliance via shared link"
```

---

## Vérification manuelle finale

Après toutes les tâches :

- [ ] **Tester le flux invitation par code** : Ouvrir app avec 2 comptes. Compte A copie son code dans Alliances → Invitations. Compte B entre le code → vérifier que `invitation_received` apparaît dans /notifications de A.

- [ ] **Tester le flux invitation par lien** : Compte A copie le lien `/invite/[code]`. Compte B ouvre le lien → page affiche le profil de A → clic "Accepter" → redirect vers /alliances → vérifier notification `invitation_accepted` pour A.

- [ ] **Tester la recherche par email** : Dans Invitations → champ email → taper email de B → profil affiché → Inviter → notification créée pour B.

- [ ] **Tester le badge nav** : Connexion sur un compte qui a des notifications non lues → badge ambre visible sur BottomNav/Sidebar. Ouvrir /notifications → badge disparaît.

- [ ] **Tester visibility verset** : Dans Bibliothèque → activer toggle "Alliés" → anchorer verset → vérifier dans Alliances → Versets sur le compte allié.

- [ ] **Tester territory_updated** : Modifier préférences (déclenche syncPreferences) → si territoire a changé → notification `territory_updated` pour les alliés.
