---
date: 2026-05-11
heure: "23:55"
projet: citoyen-du-royaume
phase: Phase 2 Partie A — Versets Ancrés terminée
tags: [projet/citoyen-du-royaume, type/archive]
---

# Session 2026-05-11 23h55 — BASILEIA Phase 2 Versets Ancrés

## Resume
Implémentation complète de la Partie A de la Phase 2 : couche données (Dexie + Supabase + Zustand) et tous les composants UI de La Bibliothèque. TypeScript 0 erreur. En attente de la migration Supabase manuelle pour activer la sync cloud.

## Travail effectue
- Bump schéma Dexie v2→v3, ajout table `verses` + interface `Verse`
- Création `verses.repo.ts` (getAll, add, remove) — pattern SecretsRepo
- Création `verses.store.ts` (addVerse, removeVerse, loadFromDb) — pattern SecretsStore
- Ajout type `verses` dans `supabase/types.ts`
- Ajout `syncVerse()` dans `sync.ts` — fire-and-forget silencieux
- Création `VerseCard.tsx` — CSS group-hover (pas de useState) pour bouton suppression
- Création `VerseCaptureBar.tsx` — 2 inputs inline + ◈ Domaine Gemini
- Création `VerseFeed.tsx` — stagger Framer Motion, accepte `verses: Verse[]` en prop
- Création `VerseSearch.tsx` — debounce 300ms, reset Escape
- Remplacement stub `bibliotheque/page.tsx` — câbrage complet + filtre useMemo
- Mise à jour `bibliotheque/CLAUDE.md` — noms composants alignés avec la spec

## Decisions
- **CSS group-hover pour suppression** : évite useState (re-render à chaque mouseenter/mouseleave), recommandation react-best-practices skill
- **VerseFeed accepte verses: Verse[] en prop** : séparation claire des responsabilités — la page gère le store et le filtre, VerseFeed ne fait que rendre
- **VerseSearch séparé de VerseFeed** : cohérent avec la spec, la page gère le state query et passe les données filtrées
- **useMemo pour le filtre** : évite recalcul à chaque render de la page

## Etat du projet
- Phase actuelle : Phase 2 Partie A terminée ✅ — Partie B à faire
- Valide : Design system · Nav · Shell · HexMap · Journal · Profil · Secrets · Dexie · Supabase auth · Gemini · Sync notes/secrets · **Versets Ancrés (couche données + UI complet)**
- En cours : migration Supabase manuelle (table verses + RLS) — bloquant pour la sync cloud

## Prochaines etapes
1. Exécuter SQL migration dans Supabase Dashboard (table verses + RLS — SQL dans spec)
2. Tester en local : capture verset → feed → recherche → rechargement page
3. Partie B : `DomaineHeader.tsx` → `DomaineContent.tsx` → `/domaines/[id]/page.tsx` → vérifier `DomainTooltip.tsx`

## Fichiers modifies
- `src/lib/db/basileia.db.ts` — modifié (version 3, Verse interface, verses table)
- `src/lib/db/verses.repo.ts` — créé
- `src/lib/stores/verses.store.ts` — créé
- `src/lib/supabase/types.ts` — modifié (type verses ajouté)
- `src/lib/supabase/sync.ts` — modifié (syncVerse ajouté)
- `src/features/bibliotheque/VerseCard.tsx` — créé
- `src/features/bibliotheque/VerseCaptureBar.tsx` — créé
- `src/features/bibliotheque/VerseFeed.tsx` — créé
- `src/features/bibliotheque/VerseSearch.tsx` — créé
- `src/app/(main)/bibliotheque/page.tsx` — remplacé (stub → implémentation complète)
- `src/features/bibliotheque/CLAUDE.md` — mis à jour

## Assets (URLs)
Aucun.
