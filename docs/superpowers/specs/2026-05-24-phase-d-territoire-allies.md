# Phase D — TerritoireAtlas des Alliés

**Date :** 2026-05-24
**Projet :** BASILEIA (Citoyen du Royaume)
**Prérequis :** Phase C complète (sync bidirectionnel + toggle share_territoire)

---

## Objectif

Afficher le TerritoireAtlas (SVG 7 hexagones) d'un Allié dans AllyCard, uniquement si cet Allié a activé "Partager mon Territoire avec mes Alliés". Lecture seule, aucun contenu (notes, secrets) exposé.

---

## Architecture

### Flux de données

```
[Citoyen A sync prefs]
  → syncPreferences() calcule exploration depuis Dexie
  → push preferences.territoire (snapshot ExplorationLevel par domaine) en Supabase

[Citoyen B consulte ses Alliés]
  → AllyCard expand → getAllyTerritoire(allyId)
  → Supabase lit citizen_profiles.preferences (RLS vérifie alliance acceptée + share_territoire)
  → retourne Partial<Record<DomainId, ExplorationLevel>> | null
  → AllyCard affiche TerritoireAtlas si non-null
```

### Snapshot territoire

Le snapshot est un objet `Partial<Record<DomainId, ExplorationLevel>>` stocké dans `citizen_profiles.preferences.territoire`. Il est calculé au moment du sync des préférences, identiquement à la page Profil :

- Count notes + secrets + verses par `domain_id` depuis Dexie
- `toExplorationLevel(count)` : 0→0, 1-2→1, 3-5→2, 6-10→3, 11-20→4, 21+→5
- Inclus dans preferences **uniquement si** `share_territoire === true`
- Si `share_territoire === false` : `territoire` est absent du JSONB (pas exposé)

---

## Fichiers modifiés (3 fichiers + 1 SQL)

### 1. `src/lib/supabase/sync.ts`

Modifier `syncPreferences` pour inclure le snapshot territoire :

- Si `share_territoire === true` :
  - Lire toutes les notes, secrets, verses depuis Dexie (champs `domain_id` / `domain`)
  - Calculer `domainCounts` par domaine
  - Appliquer `toExplorationLevel` → objet `territoire`
  - Inclure dans le JSONB pushé : `{ ...prefs, share_territoire: true, territoire }`
- Si `share_territoire === false` :
  - Push normalement sans `territoire`

### 2. `src/lib/actions/allies.ts`

Ajouter `getAllyTerritoire(allyId: string)` :

```typescript
export async function getAllyTerritoire(
  allyId: string
): Promise<Partial<Record<DomainId, ExplorationLevel>> | null>
```

- Crée client Supabase serveur, vérifie session
- Lit `citizen_profiles.preferences` pour `allyId` (la RLS bloque si non autorisé)
- Retourne `(data.preferences as Record<string, unknown>).territoire ?? null`
- En cas d'erreur ou absence de données : retourne `null`

### 3. `src/features/alliances/AllyCard.tsx`

Ajouter affichage conditionnel du TerritoireAtlas :

- Nouveau state : `territoire: Partial<Record<DomainId, ExplorationLevel>> | null | undefined` (init `undefined`)
  - `undefined` = pas encore fetché
  - `null` = fetché, non disponible (non partagé ou RLS bloque)
  - objet = fetché et disponible
- Au premier expand (`expanded` passe à `true` ET `territoire === undefined`) : appeler `getAllyTerritoire`
- Pendant le fetch : state reste `undefined` (pas de skeleton — juste rien affiché)
- Après fetch : stocker le résultat (objet) ou `null` si non disponible
- Dans la section expandée :
  ```
  [TerritoireAtlas] ← si territoire non-null
  "Territoire Intérieur" (label 10px uppercase muted) ← si territoire non-null
  ─────────────────
  [AllyJournalFeed]
  ```
- Si `territoire === null` : afficher uniquement `AllyJournalFeed` (comportement Phase C inchangé)

### 4. SQL — RLS Supabase Dashboard

Nouvelle politique `citizen_profiles` (SELECT) — s'ajoute à la politique existante (OR implicite) :

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

Navigation : Supabase Dashboard → Authentication → Policies → `citizen_profiles` → New Policy → For full customization → coller le SQL ci-dessus.

---

## Composants inchangés

- `TerritoireAtlas` — aucune modification (props identiques)
- `AlliesList` — aucune modification
- `AllyJournalFeed` — aucune modification
- `profil.store.ts` — aucune modification
- Stores Zustand — aucune modification

---

## Cas limites

| Situation | Comportement |
|-----------|-------------|
| Allié n'a pas encore syncé avec share_territoire=true | `territoire` absent de preferences → `getAllyTerritoire` retourne `null` → pas d'atlas affiché |
| Allié a share_territoire=false | RLS bloque la lecture → `null` → pas d'atlas |
| Pas d'alliance acceptée | RLS bloque → `null` → pas d'atlas |
| Erreur réseau | `null` → pas d'atlas, journal feed normal |
| Territoire = tous 0 | Atlas affiché (hexagones quasi-transparents, normal) |

---

## Hors scope Phase D

- Fraîcheur en temps réel du territoire (snapshot au dernier sync — acceptable pour usage contemplatif)
- Afficher les stats chiffrées (MetricBlock) de l'allié
- Vue dédiée page `/allies/[id]`
- Politique RLS sur `notes` / `secrets` cross-user
