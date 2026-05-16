# Phase C — Sync bidirectionnel, Préférences DB, TerritoireAtlas toggle

**Date :** 2026-05-16  
**Statut :** Approuvé — prêt pour implémentation

---

## Périmètre

Phase C couvre trois fonctionnalités liées par un thème commun : la persistance cross-appareils et les premières fondations du partage entre Alliés.

| Feature | Scope Phase C |
|---|---|
| Sync bidirectionnel | Pull au login · 3 tables (notes, secrets, verses) · last-write-wins |
| Préférences en DB | Persistées dans `citizen_profiles.preferences` JSONB · push + pull |
| TerritoireAtlas partageable | Toggle `share_territoire` dans PreferencesForm + sauvegarde en DB |

---

## 1. Sync bidirectionnel

### Principe

Le sync existant est push-only (local → Supabase, fire-and-forget). Phase C ajoute un pull au login pour permettre la restauration des données sur un nouvel appareil.

### Stratégie de conflit : last-write-wins

- Si une row Supabase est absente en Dexie → insert local
- Si `supabase.updated_at > dexie.updated_at` → overwrite local
- Sinon → skip (local est plus récent, déjà synced vers Supabase)
- **Exception :** `secrets` n'a pas de `updated_at` en DB — stratégie insert-if-missing uniquement

### Nouveaux pullers dans `sync.ts`

```typescript
export async function pullNotes(): Promise<void>
export async function pullSecrets(): Promise<void>
export async function pullVerses(): Promise<void>
```

Chaque puller :
1. Récupère `userId` via `getUserId()`
2. Fetch toutes les rows Supabase de l'utilisateur (pas de limite)
3. Compare avec Dexie row par row (last-write-wins)
4. Upsert en Dexie uniquement si nécessaire
5. Wrapped dans `track()` — SyncDot couvre le feedback visuel

### Déclencheur — `AuthProvider` via `initSession`

`AuthProvider` possède déjà une fonction `initSession(userId)` appelée sur `SIGNED_IN` et au mount initial. Le pull s'intègre **dans** `initSession`, après `initDb()` (Dexie ouverte) et avant `loadFromDb()` (stores chargés depuis Dexie) :

```typescript
async function initSession(userId: string): Promise<void> {
  await initDb(userId)
  // Pull Supabase → Dexie (last-write-wins) AVANT loadFromDb
  await Promise.all([pullNotes(), pullSecrets(), pullVerses()])
  await Promise.all([
    useNotesStore.getState().loadFromDb(),
    useSecretsStore.getState().loadFromDb(),
    useVersesStore.getState().loadFromDb(),
  ])
}
```

Comportement : le pull est attendu (`await`) pour que `loadFromDb()` voie les données fraîches. L'utilisateur voit ses données à jour dès le premier rendu des stores. SyncDot couvre le feedback visuel via `track()`.

### Fichiers modifiés

- `src/lib/supabase/sync.ts` — ajout `pullNotes`, `pullSecrets`, `pullVerses`
- `src/features/auth/AuthProvider.tsx` — modification de `initSession` pour intégrer le pull

---

## 2. Préférences persistées en DB

### Principe

Les préférences restent dans Zustand persist (localStorage) comme cache local rapide. Supabase devient la source de vérité cross-appareils via la colonne `citizen_profiles.preferences` (JSONB, déjà existante).

### Structure JSONB

```json
{
  "theme": "dark",
  "editor_font": "cormorant",
  "font_size": "md",
  "bible_translation": "LSG",
  "locale": "fr",
  "share_territoire": false
}
```

### Push — à chaque changement de préférence

Chaque setter dans `profil.store.ts` appelle `syncPreferences(patch)` après mise à jour du state local.

`syncPreferences()` dans `sync.ts` :
- Upsert sur `citizen_profiles` avec `{ preferences: { ...current, ...patch } }`
- Fire-and-forget, silent catch

### Pull — au login (dans `initSession`, après `initDb`)

```typescript
// Dans initSession, via client Supabase (pas de Server Action — AuthProvider est client)
const { data: profile } = await supabase
  .from('citizen_profiles')
  .select('preferences')
  .eq('id', userId)
  .single()
if (profile?.preferences) {
  useProfilStore.getState().hydrateFromRemote(profile.preferences)
}
```

`hydrateFromRemote()` dans `profil.store.ts` :
- Écrit les valeurs Supabase dans le store Zustand
- N'appelle **pas** `syncPreferences()` (évite la boucle push immédiat après pull)
- Implémenté via un flag `_syncing` interne ou en passant directement par `setState` sans passer par les setters publics

### Pas de migration DB

La colonne `preferences JSONB DEFAULT '{}'` existe déjà dans `citizen_profiles`.

### Fichiers modifiés

- `src/lib/stores/profil.store.ts` — ajout `hydrateFromRemote()`· chaque setter appelle `syncPreferences`
- `src/lib/supabase/sync.ts` — ajout `syncPreferences(patch)`
- `src/features/auth/AuthProvider.tsx` — pull profil dans SIGNED_IN

---

## 3. TerritoireAtlas partageable — toggle Phase C

### Principe

`share_territoire` est une préférence comme les autres. Elle est stockée dans `citizen_profiles.preferences` via le mécanisme de la Section 2. Aucune table supplémentaire, aucune migration DB.

### Champ dans le store

```typescript
// profil.store.ts
share_territoire: boolean  // défaut: false
```

### UI — PreferencesForm.tsx

Nouveau toggle ajouté après les dropdowns existants :

```
MON TERRITOIRE INTÉRIEUR
Partager mon atlas avec mes Alliés    [toggle]
```

Style : cohérent avec les dropdowns existants (`font-size: 11px`, fond `rgba(255,255,255,0.05)`).  
Un clic → `setShareTerritoire(bool)` → `syncPreferences({ share_territoire: bool })`.

### Ce qui est hors scope Phase C

- Aucune modification des RLS Supabase — les Alliés ne lisent pas encore l'atlas
- Aucun composant de vue côté Allié
- Le toggle enregistre la préférence ; son effet visible est réservé à Phase D

### Fichiers modifiés

- `src/lib/stores/profil.store.ts` — ajout champ `share_territoire` + setter
- `src/features/profil/PreferencesForm.tsx` — ajout toggle

---

## Ordre d'implémentation recommandé

1. `sync.ts` — `syncPreferences()` + `pullNotes/Secrets/Verses()`
2. `profil.store.ts` — `hydrateFromRemote()` + setters mis à jour + `share_territoire`
3. `AuthProvider` — handlers `SIGNED_IN` (pull data + pull prefs)
4. `PreferencesForm.tsx` — toggle `share_territoire`

---

## Décisions

| Sujet | Décision | Raison |
|---|---|---|
| Conflit sync | Last-write-wins via `updated_at` | Simple, suffisant pour l'échelle de l'app |
| Secrets conflit | Insert-if-missing | Pas de `updated_at` en DB |
| Déclencheur pull | `SIGNED_IN` dans AuthProvider | Pattern existant, déclenché une seule fois |
| Préfs stockage | JSONB dans `citizen_profiles.preferences` | Colonne déjà existante, pas de migration |
| Boucle push/pull | Flag `hydrateFromRemote` sans appel setter | Évite un upsert inutile post-login |
| Toggle Phase C | Sauvegarde uniquement, vue Phase D | YAGNI — fondation avant affichage |

---

## Hors scope Phase C (réservé Phase D)

- Vue TerritoireAtlas dans AlliesList
- RLS Supabase pour lecture cross-user
- Sync temps réel (Supabase Realtime)
- Résolution de conflits interactive
