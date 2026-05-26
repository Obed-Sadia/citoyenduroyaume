---
date: 2026-05-12
heure: "14:00"
projet: citoyen-du-royaume
phase: Phase 2 complète — Phase 3 à définir
tags: [projet/citoyen-du-royaume, type/archive]
---

# Session 2026-05-12 14h00 — Citoyen du Royaume Phase 2 Checklist + Tooltip Fix

## Resume
Validation complète de la checklist Phase 2 (Versets Ancrés + Domaines Vivants). Correction d'un bug UX sur la DomainTooltip qui n'était pas entièrement visible et bloquait le scroll — rendue fixed bottom au-dessus de la BottomNav.

## Travail effectue
- Reprise de session via `/recall citoyen-du-royaume`
- Lecture de la checklist Phase 2 depuis la spec
- Test et validation des 7 points de la checklist (tous passent)
- Fix bug tooltip HexMap : rendu `fixed bottom-[4.5rem] md:bottom-4 left-4 right-4 z-20` dans HexMap.tsx
- Suppression `mt-3` devenu inutile dans DomainTooltip.tsx
- Mise à jour STATUS.md : phase actuelle + entrée checklist validée

## Decisions
- **Tooltip fixed bottom** : évite les problèmes de scroll/overflow — page utilise `flex items-center justify-center` sans scroll, tooltip inline dépassait le viewport ; fixed bottom est le pattern mobile correct
- **`bottom-[4.5rem]`** : aligné au-dessus de la BottomNav (pb-16 = 4rem + marge)

## Etat du projet
- Phase actuelle : Phase 2 complète ✅ — Phase 3 à définir
- Valide : Design system · Nav · Shell · HexMap · Journal · Profil · Secrets · Dexie.js · Supabase auth · Gemini · Sync · Bibliothèque · Domaines Vivants · Checklist Phase 2 ✅
- En cours : Aucun

## Prochaines etapes
1. Définir Phase 3 — Les Enluminures (4e objet fondamental)
2. Lire `docs/vision.md` pour cadrer Phase 3

## Fichiers modifies
- `src/features/carte/HexMap.tsx` — tooltip rendu fixed bottom
- `src/features/carte/DomainTooltip.tsx` — suppression mt-3
- `STATUS.md` — phase actuelle + checklist Phase 2 validée

## Assets (URLs)
Aucun.
