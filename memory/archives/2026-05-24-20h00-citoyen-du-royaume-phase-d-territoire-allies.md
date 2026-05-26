---
date: 2026-05-24
heure: "20:00"
projet: citoyen-du-royaume
phase: Phase D complète — TerritoireAtlas des Alliés
tags: [projet/citoyen-du-royaume, type/archive]
---

# Session 2026-05-24 20h00 — Citoyen du Royaume Phase D TerritoireAtlas des Alliés

## Resume

Implémentation complète de la Phase D : affichage du TerritoireAtlas d'un Allié dans AllyCard quand il a activé `share_territoire`. Le snapshot d'exploration est calculé depuis Dexie et stocké dans `citizen_profiles.preferences.territoire`, protégé par une RLS cross-user et une vérification d'alliance applicative.

## Travail effectue

- Brainstorming + spec Phase D : approche snapshot preferences (vs requête cross-user directe)
- `sync.ts` : ajout `computeExplorationSnapshot()` + `toExplorationLevel()` + modification `syncPreferences` pour inclure/purger le snapshot territoire
- RLS Supabase Dashboard : policy `allies_read_shared_territoire` (SELECT citizen_profiles cross-user pour alliés acceptés avec share_territoire=true)
- `allies.ts` : ajout `getAllyTerritoire(allyId)` Server Action avec double sécurité (vérification alliance + sanitisation JSONB)
- `AllyCard.tsx` : état territoire 3 valeurs (undefined/null/objet) + fetch-once au premier expand + affichage conditionnel TerritoireAtlas au-dessus d'AllyJournalFeed
- Review double couche (spec compliance + code quality) par sous-agents pour chaque tâche
- Fix sécurité ajouté suite à code review : vérification explicite alliance dans Server Action
- Fix qualité ajouté : sanitisation valeurs JSONB ExplorationLevel (0-5 seulement)

## Decisions

- **Snapshot dans preferences** : stocke `preferences.territoire` au moment du sync au lieu de requêtes cross-user en temps réel — plus simple, pas de RLS sur notes/secrets, fraîcheur suffisante pour usage contemplatif
- **Purge territoire si désactivé** : `delete merged.territoire` quand `share_territoire=false` — évite snapshot orphelin visible par alliés après désactivation
- **Double sécurité** : RLS Supabase (defense systémique) + vérification alliance dans Server Action (defense en profondeur) — ajouté suite à code review
- **Sanitisation JSONB** : valider que les valeurs territoire sont bien des ExplorationLevel (0-5) avant de retourner — évite silent rendering bug si données corrompues
- **État territoire 3 valeurs** : `undefined` = pas encore fetché, `null` = fetché non disponible, objet = disponible — distingue "pas encore fetché" de "fetché mais vide"

## Etat du projet

- Phase actuelle : Phase D complète ✅
- Valide : Toutes phases A→D · Design system · Auth OTP · Sync bidirectionnel · Préférences DB · TerritoireAtlas Alliés
- En cours : rien

## Prochaines etapes

1. Tester en conditions réelles : 2 comptes, activer share_territoire sur A, vérifier AllyCard de B
2. Phase E à définir (pullSecrets/pullVerses last-write-wins si updated_at ajouté en DB ?)

## Fichiers modifies

- `src/lib/supabase/sync.ts` — modifié (snapshot territoire + purge)
- `src/lib/actions/allies.ts` — modifié (getAllyTerritoire + sécurité + sanitisation)
- `src/features/alliances/AllyCard.tsx` — modifié (affichage conditionnel TerritoireAtlas)
- `STATUS.md` — mis à jour (Phase D complète)
- `memory/projets/citoyen-du-royaume/contexte.md` — mis à jour
- `docs/superpowers/specs/2026-05-24-phase-d-territoire-allies.md` — créé
- `docs/superpowers/plans/2026-05-24-phase-d-territoire-allies.md` — créé

## Assets (URLs)

Aucun.
