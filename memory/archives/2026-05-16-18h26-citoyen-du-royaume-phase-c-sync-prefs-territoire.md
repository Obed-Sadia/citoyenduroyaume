---
date: 2026-05-16
heure: "18:26"
projet: citoyen-du-royaume
phase: Phase C complète — debug syncPreferences en cours
tags: [projet/citoyen-du-royaume, type/archive]
---

# Session 2026-05-16 18h26 — Citoyen du Royaume Phase C Sync + Prefs + Territoire

## Resume
Phase C implémentée complètement via subagent-driven development : sync bidirectionnel au login (pull notes/secrets/verses), préférences persistées dans Supabase, toggle share_territoire. En fin de session, debug d'un problème de syncPreferences (406 sur citizen_profiles) et d'un problème de template email Supabase qui envoie un lien au lieu du code OTP.

## Travail effectue
- Brainstorming Phase C : 4 questions → choix last-write-wins, 3 tables, toggle seulement, AuthProvider
- Spec écrite : `docs/superpowers/specs/2026-05-16-phase-c-sync-preferences-partage.md`
- Plan écrit : `docs/superpowers/plans/2026-05-16-phase-c-sync-preferences-partage.md`
- T1 : `Note.updatedAt?: string` ajouté + `updateNote` peuple updatedAt + fix `syncNote` utilise `note.updatedAt`
- T2 : `syncPreferences(patch)` ajoutée dans sync.ts — merge JSONB + update citizen_profiles
- T3 : `profil.store.ts` réécrit — `share_territoire`, `hydrateFromRemote`, setters avec syncPreferences
- T4 : `pullNotes` (last-write-wins), `pullSecrets`, `pullVerses` (insert-if-missing) + `getById` dans les 3 repos
- T5 : `AuthProvider.initSession` — ordre : initDb → pull* → fetch prefs → hydrateFromRemote → loadFromDb
- T6 : toggle "Partager mon Territoire" dans PreferencesForm (role="switch", aria-checked, ambre animé)
- STATUS.md et contexte.md mis à jour
- Debug syncPreferences : 406 = `.single()` retourne 0 lignes → remplacé par `.maybeSingle()` + logs SELECT/UPDATE
- Script SQL fourni pour vider toutes les tables (reset DB test)
- Fix template email Supabase : utiliser `{{ .Token }}` au lieu du lien de confirmation

## Decisions
- **Last-write-wins pour notes** : compare `updated_at` ISO strings lexicographiquement triables
- **Insert-if-missing pour secrets/verses** : pas de `updated_at` en DB pour ces tables
- **hydrateFromRemote sans syncPreferences** : `set()` direct pour éviter boucle push/pull
- **Pull dans initSession** : ordre critique initDb → pull → prefs → loadFromDb
- **`.maybeSingle()` au lieu de `.single()`** : évite le 406 quand 0 lignes retournées
- **Toggle Phase C = sauvegarde seulement** : vue côté Allié reportée à Phase D (YAGNI)

## Etat du projet
- Phase actuelle : Phase C complète ✅ — debug syncPreferences en attente validation
- Valide : Tout Phase B + `Note.updatedAt` + pull bidirectionnel + profil.store avec prefs DB + AuthProvider pull + toggle territoire
- En cours : Vérification que syncPreferences fonctionne après reset DB + fix template OTP Supabase

## Prochaines etapes
1. Vider les tables (script SQL fourni) → se reconnecter via OTP → vérifier syncPreferences dans console
2. Fixer template email Supabase → Authentication → Email Templates → Magic Link → `{{ .Token }}`
3. Retirer les `console.error` de debug dans sync.ts une fois confirmé
4. Phase D — Vue TerritoireAtlas dans AlliesList (RLS UPDATE + SELECT cross-user + composant)
5. pullSecrets/pullVerses : ajouter last-write-wins si `updated_at` ajouté en DB

## Fichiers modifies
- `src/features/journal/mock-notes.ts` — ajout `updatedAt?: string` à Note
- `src/lib/stores/notes.store.ts` — updateNote peuple updatedAt
- `src/lib/supabase/sync.ts` — syncPreferences, pullNotes/Secrets/Verses, fix syncNote updatedAt, debug logs
- `src/lib/db/notes.repo.ts` — ajout getById
- `src/lib/db/secrets.repo.ts` — ajout getById
- `src/lib/db/verses.repo.ts` — ajout getById
- `src/lib/stores/profil.store.ts` — share_territoire + hydrateFromRemote + setters avec sync
- `src/features/auth/AuthProvider.tsx` — initSession avec pull intégré
- `src/features/profil/PreferencesForm.tsx` — toggle share_territoire
- `STATUS.md` — Phase C documentée
- `memory/projets/citoyen-du-royaume/contexte.md` — mis à jour
- `docs/superpowers/specs/2026-05-16-phase-c-sync-preferences-partage.md` — créé
- `docs/superpowers/plans/2026-05-16-phase-c-sync-preferences-partage.md` — créé

## Assets (URLs)
Aucun.
