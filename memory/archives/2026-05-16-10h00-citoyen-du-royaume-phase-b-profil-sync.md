---
date: 2026-05-16
heure: "10:00"
projet: citoyen-du-royaume
phase: Phase B — Profil réel + Sync complet
tags: [projet/citoyen-du-royaume, type/archive]
---

# Session 2026-05-16 10h00 — Citoyen du Royaume Phase B Profil + Sync

## Resume
Session Phase B : remplacement de toutes les données mock du profil par de vraies données Supabase (citizen_profiles, notes, secrets, verses), et complétion du sync (created_at manquant, delete Supabase, indicateur d'état visuel). Bouton "Mot de passe" inutile supprimé (app OTP, pas de mot de passe).

## Travail effectue
- `profil/page.tsx` → async Server Component avec 4 queries Supabase en parallèle
- Calcul des niveaux d'exploration par domaine (comptage items → seuils 0/1-2/3-5/6-10/11-20/21+)
- `activeThisWeek` : domaine avec activité la plus récente dans les 7 derniers jours
- Email masqué depuis `user.email`, shortCode depuis `citizen_profiles`
- Suppression du bloc "Mot de passe" (vestige pré-OTP, inutile)
- `sync.store.ts` → compteur `pending` Zustand
- `sync.ts` → helper `track()` + `created_at` dans `syncNote` + `deleteNote/Secret/Verse`
- `types.ts` → `created_at?` ajouté dans `notes.Insert`
- `notes.store.ts` → action `removeNote` + import `deleteNote`
- `verses.store.ts` → `void deleteVerse(id)` dans `removeVerse`
- `secrets.store.ts` → action `removeSecret` + import `deleteSecret`
- `SyncDot.tsx` → point ambre animé `fixed top-3 right-3`, visible si `pending > 0`
- `layout.tsx` → `<SyncDot />` monté dans `AuthProvider`

## Decisions
- **"En profondeur" = notes avec domain_id non null** : faute de colonne `anchored_verse_count` en DB, proxy = notes classifiées par Gemini (à affiner Phase C si besoin)
- **Suppression bouton Mot de passe** : l'app est OTP-only, aucun utilisateur n'a de mot de passe
- **`track()` helper dans sync.ts** : évite la duplication increment/decrement sur chaque fonction sync/delete
- **`SyncDot` en `aria-hidden`** : indicateur purement visuel, pas d'info critique pour accessibilité

## Etat du projet
- Phase actuelle : Phase B complète ✅
- Valide : Phase A complète + Profil réel (Supabase) + Sync complet (created_at, DELETE, indicateur)
- En cours : —

## Prochaines etapes
1. Phase C — TerritoireAtlas partageable avec Alliés + préférences persistées en DB
2. Affiner "En profondeur" si ajout colonne `anchored_verse_count` en DB
3. Phase C — Sync bidirectionnel (pull depuis Supabase au login, pas seulement push)

## Fichiers modifies
- `src/app/(main)/profil/page.tsx` — modifié (async, données réelles Supabase, suppression bloc mot de passe)
- `src/lib/supabase/sync.ts` — modifié (created_at, track helper, delete functions)
- `src/lib/supabase/types.ts` — modifié (created_at? dans notes.Insert)
- `src/lib/stores/sync.store.ts` — créé
- `src/lib/stores/notes.store.ts` — modifié (removeNote, import deleteNote)
- `src/lib/stores/verses.store.ts` — modifié (deleteVerse dans removeVerse)
- `src/lib/stores/secrets.store.ts` — modifié (removeSecret, import deleteSecret)
- `src/features/nav/SyncDot.tsx` — créé
- `src/app/(main)/layout.tsx` — modifié (SyncDot monté)

## Assets (URLs)
Aucun.
