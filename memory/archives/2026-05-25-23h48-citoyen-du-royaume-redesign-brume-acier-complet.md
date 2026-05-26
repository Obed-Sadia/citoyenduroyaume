---
date: 2026-05-25
heure: "23:48"
projet: citoyen-du-royaume
phase: Redesign Brume & Acier — COMPLET
tags: [projet/citoyen-du-royaume, type/archive]
---

# Session 2026-05-25 23h48 — Citoyen du Royaume Redesign Brume & Acier complet

## Resume
Exécution complète du redesign Brume & Acier en mode subagent-driven (11 tâches, un subagent par tâche + spec review + quality review). Palette ambre entièrement remplacée par saphir (#6B9FD4), typographie Lora + DM Mono, layout Magazine+Bento sur toutes les pages. Build propre, branch feat/brume-acier-redesign prête à merger.

## Travail effectue

- **Task 2 review** — spec + quality review typographie (Lora/DM_Mono) validée
- **Task 3** — BentoCard + FeedEntry créés, a11y (role=button, tabIndex, onKeyDown, aria-hidden) ajoutée après review
- **Task 4** — Navigation : NavItem, Sidebar (logo "B" saphir), BottomNav, NotificationBadge, SyncDot → saphir
- **Task 5** — La Carte : HexMap supprimée, layout Magazine+Bento avec domaines en bento cards cliquables (Link)
- **Task 6** — Le Journal : hero + bento placeholder + JournalCard → FeedEntry
- **Task 7** — Les Secrets : CaptureBar redesign, SecretCard → FeedEntry, page bento. Fix ambre dans domain badge + apostrophe ESLint
- **Task 8** — La Bibliothèque : VerseCard + VerseFeed (self-contained) + VerseCaptureBar restyled. Fix ambre dans VerseCaptureBar
- **Task 9** — Alliances : hero + bento + AllianceTabs conservé
- **Task 10** — Domaines vivants : hero label + tabs saphir dans DomaineHeader + DomaineContent
- **Task 11** — Profil saphir + hero, 25 fichiers résiduels nettoyés (domain-constants, GlassPanel, alliances, journal, notifications...), STATUS.md mis à jour
- **Fix build** — Tailwind v4 scannait docs/*.md et trouvait `border-[var(--color-amber-*)]` → @source not + remplacement `*` par `N` dans le plan md

## Decisions

- **HexMap supprimée** : remplacée par bento cards cliquables → navigation via Link, plus cohérente avec le design Magazine+Bento
- **VerseFeed self-contained** : page bibliotheque convertie en Server Component, VerseFeed prend en charge le store Zustand en interne
- **window.location.href interdit** : toutes les navigations passent par `<Link>` (Server Components ne peuvent pas passer onClick)
- **Apostrophes JSX** : chaînes avec apostrophes françaises enveloppées dans `{''...'}` pour éviter ESLint
- **@source not** : ajout dans globals.css pour éviter que Tailwind scanne docs/

## Etat du projet

- Phase actuelle : Redesign Brume & Acier — COMPLET, prêt à merger
- Validé : Tous les 11 tasks complétés, build propre (pnpm build ✅), TypeScript strict ✅
- En cours : rien — branch feat/brume-acier-redesign ship-ready
- Post-ship non-bloquant : renommer prop `amber` → `accent` dans MetricBlock, MAJ profil/CLAUDE.md

## Prochaines etapes

1. Merger `feat/brume-acier-redesign` → `main`
2. Tester visuellement sur mobile (BottomNav saphir, responsive)
3. Renommer prop `amber` → `accent` dans `src/features/profil/stats/MetricBlock.tsx`
4. Mettre à jour `src/features/profil/CLAUDE.md` (mentionne encore couleurs ambre)
5. Prochaine feature à définir

## Fichiers modifies

- `src/styles/tokens.css` — refonte complète palette saphir (Task 1, session précédente)
- `src/styles/globals.css` — @theme fonts + @source not docs + fix build
- `src/app/layout.tsx` — Lora + DM_Mono fonts
- `src/components/bento/BentoCard.tsx` — créé (BentoCard, BentoVal, BentoSub)
- `src/components/layout/FeedEntry.tsx` — créé (FeedEntry, FeedHeader)
- `src/features/nav/Sidebar.tsx` — logo "B" saphir
- `src/features/nav/BottomNav.tsx` — saphir
- `src/features/nav/NavItem.tsx` — saphir
- `src/features/nav/NotificationBadge.tsx` — saphir
- `src/features/nav/SyncDot.tsx` — fix color-text-amber → accent
- `src/app/(main)/page.tsx` — Magazine+Bento, HexMap supprimée
- `src/app/(main)/journal/page.tsx` — Magazine+Bento
- `src/features/journal/JournalCard.tsx` — → FeedEntry
- `src/app/(main)/secrets/page.tsx` — Magazine+Bento
- `src/features/secrets/SecretCard.tsx` — → FeedEntry
- `src/features/secrets/CaptureBar.tsx` — redesign style
- `src/app/(main)/bibliotheque/page.tsx` — Magazine+Bento
- `src/features/bibliotheque/VerseCard.tsx` — → FeedEntry
- `src/features/bibliotheque/VerseFeed.tsx` — self-contained
- `src/features/bibliotheque/VerseCaptureBar.tsx` — redesign style
- `src/app/(main)/alliances/page.tsx` — Magazine+Bento
- `src/features/carte/DomaineHeader.tsx` — hero label + saphir
- `src/features/carte/DomaineContent.tsx` — tabs saphir
- `src/app/(main)/profil/page.tsx` — hero
- `src/features/profil/CitizenIdentity.tsx` — saphir
- `src/features/profil/stats/MetricBlock.tsx` — saphir
- `src/features/profil/stats/TerritoireAtlas.tsx` — hexagones saphir
- + 17 autres fichiers (GlassPanel, domain-constants, alliances, notifications, enluminures...)
- `STATUS.md` — section Redesign Brume & Acier ajoutée

## Assets (URLs)

Aucun.
