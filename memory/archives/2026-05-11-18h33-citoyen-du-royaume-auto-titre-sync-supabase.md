---
date: 2026-05-11
heure: "18:33"
projet: citoyen-du-royaume
phase: Phase 1 — Design system + Navigation (close)
tags: [projet/citoyen-du-royaume, type/archive]
---

# Session 2026-05-11 18h33 — Citoyen du Royaume Auto-titre + Sync Supabase

## Resume
Implémentation des deux dernières features de la Phase 1 : génération automatique de titre via Gemini (timer 30s, déclencheur titre vide + 50 chars) et sync IndexedDB → Supabase en arrière-plan pour notes et secrets. En fin de session, debug en cours car l'auto-titre ne produisait pas de résultat visible lors du test.

## Travail effectue
- Créé `src/lib/ai/generate-title.ts` — Server Action Gemini, prompt fr-CA, 3-6 mots, sans guillemets
- Modifié `src/features/journal/JournalEditor.tsx` — timer 30s (réduit à 5s + logs pour debug), déclenché si titre vide et texte ≥ 50 chars, une seule tentative (hasTitleAttemptedRef)
- Créé `src/lib/supabase/sync.ts` — syncNote + syncSecret (upsert Supabase fire-and-forget, getUser silencieux si non auth)
- Modifié `src/lib/stores/notes.store.ts` — appel syncNote après addNote et updateNote
- Modifié `src/lib/stores/secrets.store.ts` — appel syncSecret après addSecret
- Modifié `src/lib/supabase/types.ts` — réécriture plate sans auto-références (ajout Views, Functions, Relationships requis par GenericSchema/GenericTable de @supabase/postgrest-js)
- Commité : `2f1f61a`

## Decisions
- **Fire-and-forget pour sync** : offline-first, Supabase reçoit une copie en arrière-plan — pas de retry, erreurs silencieuses
- **Timer 30s → réduit à 5s temporairement** : debug en cours, à remettre à 30s après validation
- **types.ts réécrit sans Omit auto-référentiels** : les self-references cassaient l'inférence TypeScript (GenericSchema exige Views + Functions + Relationships)
- **hasTitleAttemptedRef = !!(note?.title)** : si note a déjà un titre, jamais de tentative de génération

## Etat du projet
- Phase actuelle : Phase 1 — quasi terminée (debug auto-titre en cours)
- Valide : Design system · Nav · Shell · Pages squelettes · HexMap · Journal (Tiptap) · Profil · Secrets · Dexie.js IndexedDB · Supabase auth (magic link) · fetchDomainStats réel · Gemini classification · Sync Supabase (notes + secrets) · Auto-titre Gemini (implémenté, debug en cours)
- En cours : Debug auto-titre (timer à 5s + logs console actifs)

## Prochaines etapes
1. Valider l'auto-titre avec les logs console (F12 → Console après 6s d'inactivité)
2. Si OK → remettre le timer à 30s, supprimer les console.log
3. Commiter la version finale propre
4. Passer à Phase 2 (à définir)

## Fichiers modifies
- `src/lib/ai/generate-title.ts` — créé
- `src/lib/supabase/sync.ts` — créé
- `src/features/journal/JournalEditor.tsx` — modifié (auto-titre + debug temporaire)
- `src/lib/stores/notes.store.ts` — modifié (syncNote)
- `src/lib/stores/secrets.store.ts` — modifié (syncSecret)
- `src/lib/supabase/types.ts` — modifié (réécriture plate)

## Assets (URLs)
Aucun.
