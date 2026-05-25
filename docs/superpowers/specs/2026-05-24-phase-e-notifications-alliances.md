# Phase E — Notifications & Alliances

**Date** : 2026-05-24
**Statut** : Spécifié, en attente d'implémentation

---

## Objectif

Rendre les alliances fonctionnelles depuis l'app : envoyer et recevoir des invitations, être notifié des événements sociaux (invitation, territoire mis à jour, verset partagé), et voir les versets partagés par ses alliés.

---

## 1. Couche données

### Nouvelle table `notifications`

```sql
CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES citizen_profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL CHECK (type IN (
                  'invitation_received',
                  'invitation_accepted',
                  'territory_updated',
                  'verse_shared'
                )),
  from_user_id  UUID NOT NULL REFERENCES citizen_profiles(id) ON DELETE CASCADE,
  payload       JSONB DEFAULT '{}',
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### Nouvelle colonne sur `verses`

```sql
ALTER TABLE verses
  ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'
  CHECK (visibility IN ('private', 'allies'));
```

### Nouvelle colonne sur `citizen_profiles`

```sql
ALTER TABLE citizen_profiles
  ADD COLUMN email TEXT UNIQUE;
```

Peuplée via le trigger de création de compte (à partir de `auth.users.email`). Non exposée en clair via RLS (voir section 4).

### Mise à jour `types.ts`

Ajouter manuellement les types `notifications`, et les nouveaux champs `visibility` sur `verses` et `email` sur `citizen_profiles`.

---

## 2. Server Actions

Fichier existant : `src/lib/supabase/allies.ts`

### Invitations

**`searchCitizenByEmail(email: string)`**
Query `citizen_profiles` sur le champ `email` (indexé). Retourne `{ id, display_name, avatar_url } | null`. Exclut le user connecté et les alliances déjà existantes (pending ou accepted).

**`sendAllianceRequest(receiverId: string)`**
1. Vérifie qu'aucune alliance (pending ou accepted) n'existe entre les deux users.
2. Insert dans `allies` (`status: 'pending'`).
3. Insert dans `notifications` (`type: 'invitation_received'`, `from_user_id: moi`, `user_id: receiver`).

**`getMyShortCode()`**
Retourne `citizen_profiles.short_code` du user connecté. Sert à construire le lien `/invite/[code]`.

**`resolveShortCode(code: string)`**
Lookup `citizen_profiles` par `short_code`. Retourne `{ id, display_name, avatar_url } | null`.

**`acceptAllianceRequest(allyRecordId: string)`**
1. Update `allies.status = 'accepted'`.
2. Insert dans `notifications` (`type: 'invitation_accepted'`, `from_user_id: moi`, `user_id: requester`).

**`rejectAllianceRequest(allyRecordId: string)`**
Update `allies.status = 'rejected'`. Pas de notification.

### Notifications

**`getNotifications()`**
Select notifications de l'utilisateur connecté, ORDER BY `created_at DESC`. Join `citizen_profiles` sur `from_user_id` pour récupérer `display_name` et `avatar_url`.

**`markNotificationsRead(ids: string[])`**
Update `read_at = now()` sur les ids fournis (`user_id = auth.uid()` obligatoire).

**`getUnreadCount()`**
Count des notifications où `read_at IS NULL`. Utilisé pour alimenter le badge nav.

### Feed versets alliés

**`getAllyVerses()`**
Select `verses` dont `user_id` est un allié accepté ET `visibility = 'allies'`. Join `citizen_profiles` pour `display_name` et `avatar_url`. ORDER BY `created_at DESC`.

### Création automatique de notifications

**`territory_updated`** — dans `syncPreferences` (existant) :
Avant d'écrire le snapshot, comparer avec le snapshot actuel en DB. Si au moins un niveau de domaine a changé, créer une notification `territory_updated` pour chaque allié accepté (bulk insert).

**`verse_shared`** — dans `syncVerse` (existant) :
Si `verse.visibility = 'allies'` et que l'opération est un insert (`onConflict: 'ignore'` retourne une ligne → c'est nouveau), créer une notification `verse_shared` pour chaque allié accepté. Payload : `{ reference: verse.reference }`. Si le verset existait déjà (conflit ignoré), ne pas notifier.

---

## 3. UI

### `/alliances` — 3 onglets (Radix Tabs)

**Onglet "Alliés"** — liste `AllyCard` existante, inchangée.

**Onglet "Invitations"**
- Section "Reçues" : liste des `allies` pending où `receiver_id = moi`. Chaque item affiche nom + avatar + boutons Accepter / Refuser.
- Section "Envoyer" :
  - Champ email + bouton Rechercher → affiche le profil trouvé + bouton "Inviter".
  - Ligne séparée : "Partager mon lien" → copie `https://[domaine]/invite/[shortCode]` dans le presse-papier.

**Onglet "Versets"**
Feed lecture seule des versets partagés par les alliés. Chaque item : avatar + nom de l'allié, référence du verset en Cormorant, texte, domaine badge, date relative. Groupé par allié (optionnel).

### `/notifications` — page câblée

Flux vertical de notifications. Chaque notification :
- Icône selon le type : enveloppe (invitation_received), checkmark (invitation_accepted), hexagone (territory_updated), livre ouvert (verse_shared)
- Nom + avatar du `from_user_id`
- Texte contextuel :
  - `invitation_received` → "[Nom] t'a envoyé une invitation d'alliance"
  - `invitation_accepted` → "[Nom] a accepté ton invitation"
  - `territory_updated` → "[Nom] a mis à jour son Territoire"
  - `verse_shared` → "[Nom] a ancré [référence]"
- Date relative
- Fond légèrement distinct si `read_at IS NULL`

Au chargement de la page : `markNotificationsRead` sur toutes les notifs non lues visibles.

### Badge nav

`useNavStore.unreadCount` alimenté par `getUnreadCount()` au login (dans `initSession`). Décrémenté localement à la visite de `/notifications`.

### `VerseCaptureBar`

Ajout d'un toggle "Partager avec mes Alliés" (default: off → `visibility: 'private'`). Persisté dans le payload envoyé à `syncVerse`.

### Route `/invite/[code]`

Nouvelle route hors groupe `(main)` : `src/app/invite/[code]/page.tsx`.
- Auth guard : si non connecté → redirect `/login?next=/invite/[code]`.
- Si connecté : affiche profil de l'invitant (`resolveShortCode`) + bouton "Accepter l'alliance" (appelle `sendAllianceRequest`).
- Si `short_code` invalide → page 404 sobre.
- Si alliance déjà existante → message "Vous êtes déjà alliés."

---

## 4. Sécurité & RLS

### Table `notifications`

| Policy | Condition |
|--------|-----------|
| SELECT | `user_id = auth.uid()` |
| INSERT | `auth.role() = 'authenticated'` |
| UPDATE | `user_id = auth.uid()` (pour `read_at` uniquement) |
| DELETE | aucune |

### Table `verses` — policy alliés

```sql
CREATE POLICY allies_read_shared_verses ON verses
  FOR SELECT
  USING (
    visibility = 'allies' AND (
      EXISTS (
        SELECT 1 FROM allies
        WHERE status = 'accepted'
        AND (
          (requester_id = auth.uid() AND receiver_id = verses.user_id)
          OR
          (receiver_id = auth.uid() AND requester_id = verses.user_id)
        )
      )
    )
  );
```

### Champ `email` sur `citizen_profiles`

La policy SELECT existante sur `citizen_profiles` reste restrictive : un Citoyen lit seulement son propre profil complet. Pour `searchCitizenByEmail`, créer une fonction Postgres `SECURITY DEFINER` qui prend un email en paramètre et retourne `(id, display_name, avatar_url)` uniquement — jamais le champ email lui-même dans les résultats. Appelée via `supabase.rpc('search_citizen_by_email', { email })` dans la Server Action.

### `sendAllianceRequest` — garde doublon

Vérification en Server Action avant insert :
```sql
SELECT 1 FROM allies
WHERE (requester_id = moi AND receiver_id = cible)
   OR (requester_id = cible AND receiver_id = moi)
LIMIT 1
```
Si résultat non vide → erreur "Alliance déjà existante ou en attente."

---

## 5. Fichiers touchés

| Fichier | Action |
|---------|--------|
| Supabase Dashboard | Créer table `notifications`, colonne `verses.visibility`, colonne `citizen_profiles.email`, policies RLS, trigger peuplant `email` depuis `auth.users`, fonction RPC `search_citizen_by_email` |
| `src/lib/supabase/types.ts` | Ajouter types `notifications`, champs `visibility` et `email` |
| `src/lib/supabase/allies.ts` | Ajouter toutes les nouvelles Server Actions |
| `src/lib/supabase/sync.ts` | Modifier `syncPreferences` (territory_updated) + `syncVerse` (verse_shared) |
| `src/lib/stores/nav.store.ts` | Ajouter `unreadCount` + setter |
| `src/features/auth/AuthProvider.tsx` | Appeler `getUnreadCount` dans `initSession` |
| `src/app/(main)/alliances/page.tsx` | Refactor → 3 onglets |
| `src/app/(main)/notifications/page.tsx` | Câbler flux notifications |
| `src/app/invite/[code]/page.tsx` | Nouvelle page (hors groupe main) |
| `src/features/bibliotheque/VerseCaptureBar.tsx` | Toggle visibility |
| `src/features/alliances/AllianceInvite.tsx` | Nouveau composant (search + lien) |
| `src/features/alliances/InvitationList.tsx` | Nouveau composant (received pending) |
| `src/features/alliances/AllyVerseFeed.tsx` | Nouveau composant |
| `src/features/notifications/NotificationFeed.tsx` | Nouveau composant |

---

## 6. Ce qui n'est PAS dans Phase E

- Tribus (tribes) — déjà en DB, UI Phase F
- Realtime Supabase (websocket) — Phase F si besoin
- Suppression de notifications
- Paramètre "ne pas notifier" par type
- last-write-wins sur secrets/verses (Phase F si updated_at ajouté)
