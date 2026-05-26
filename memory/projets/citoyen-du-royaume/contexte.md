---
projet: citoyen-du-royaume
phase: Redesign Brume & Acier complet — prêt à merger
derniere-session: 2026-05-25
tags: [projet/citoyen-du-royaume]
---

# Citoyen du Royaume (BASILEIA) — Contexte actif

## Etat courant

- Phase : Redesign Brume & Acier — COMPLET (11/11 tasks)
- Branch : `feat/brume-acier-redesign` — ship-ready, build propre
- Validé : tokens saphir, Lora+DM Mono, Magazine+Bento toutes pages, nav redesign, 25 fichiers ambre nettoyés
- Post-ship non-bloquant : renommer prop `amber` → `accent` dans MetricBlock, MAJ profil/CLAUDE.md

## Decisions cumulees

- Ambre `#EF9F27` **remplacé** par saphir `#6B9FD4` (`--color-accent`) — seule couleur vive
- Fond `#131517` (ardoise froide) remplace `#09080B`
- Typo : Lora (éditorial/versets italic) + DM Mono (UI labels) — remplace Geist + Fraunces
- Layout : Magazine+Bento (hero → bento grid → feed → capture bar) sur toutes les pages
- HexMap supprimée → bento cards cliquables naviguent vers `/domaines/[id]`
- VerseFeed self-contained (page Bibliothèque = Server Component)
- Toutes navigations via `<Link>` (pas de window.location.href)
- `@source not "../../docs/**"` dans globals.css (Tailwind ne scanne pas docs/)
- Apostrophes françaises dans JSX → `{' texte avec l\'apostrophe '}`
- **notes.id est TEXT** (pas UUID) — inchangé
- Auth OTP 8 chiffres · shouldCreateUser: true — inchangé
- Last-write-wins notes ; secrets/verses insert-if-missing — inchangé
- Gemini invisible : suggère, ne s'impose jamais — inchangé
- `proxy.ts` obligatoire Next.js 16 + Supabase SSR — inchangé

## Composants partagés crees

- `src/components/bento/BentoCard.tsx` — BentoCard, BentoVal, BentoSub
- `src/components/layout/FeedEntry.tsx` — FeedEntry, FeedHeader

## Prochaines etapes

1. Merger `feat/brume-acier-redesign` → `main`
2. Tester visuellement mobile (BottomNav saphir, responsive)
3. Renommer prop `amber` → `accent` dans `src/features/profil/stats/MetricBlock.tsx`
4. MAJ `src/features/profil/CLAUDE.md` (mentionne encore ambre)
5. Définir prochaine feature (Phase F : Realtime / Tribus UI / UX polish)

## Assets actifs (URLs)

Aucun.
