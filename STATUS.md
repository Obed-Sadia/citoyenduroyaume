# STATUS — BASILEIA

> Claude Code : lire ce fichier en début de chaque session.
> Développeur : mettre à jour après chaque session de travail.

---

## Phase actuelle
Phase 1 — Design system + Navigation

---

## ✅ Terminé

### Design system
- [x] `src/styles/tokens.css` — variables CSS complètes (couleurs, typo, spacing, radius, z-index)
- [x] `src/styles/globals.css` — imports tokens + base styles
- [x] `docs/style-guide.md` — référence design complète
- [x] `docs/vision.md` — philosophie et principes du projet
- [x] `tailwind.config.ts`
- [x] `next.config.ts`
- [x] `.env.local.example`

### Documentation Claude Code
- [x] `CLAUDE.md` — index racine (lu automatiquement)
- [x] `STATUS.md` — tracker de session (ce fichier)
- [x] `.claude/commands/session.md`
- [x] `.claude/commands/feature.md`
- [x] `.claude/commands/new-component.md`
- [x] `.claude/commands/new-page.md`
- [x] `.claude/commands/done.md`

### Features CLAUDE.md
- [x] `src/features/nav/CLAUDE.md`
- [x] `src/features/profil/CLAUDE.md`
- [x] `src/features/carte/CLAUDE.md`
- [x] `src/features/journal/CLAUDE.md`
- [x] `src/features/secrets/CLAUDE.md`
- [x] `src/features/bibliotheque/CLAUDE.md`
- [x] `src/features/alliances/CLAUDE.md`

### Navigation
- [x] `src/features/nav/Sidebar.tsx` — hover / lock / collapse
- [x] `src/features/nav/BottomNav.tsx` — 5 items + safe-area iOS
- [x] `src/features/nav/NavItem.tsx` — item partagé avec état actif ambre
- [x] `src/features/nav/NotificationBadge.tsx` — dot pulsant
- [x] `src/lib/stores/nav.store.ts` — Zustand persist (isLocked uniquement)

### Shell & utilitaires
- [x] `src/app/layout.tsx` — fonts DM Sans + Cormorant + globals.css
- [x] `src/app/(main)/layout.tsx` — Sidebar + main + BottomNav
- [x] `src/lib/utils.ts` — cn() · nameToHsl() · getInitials() · relativeTime()
- [x] `src/lib/supabase/client.ts`
- [x] `src/lib/supabase/types.ts` — types manuels (à remplacer par CLI)

### Pages squelettes
- [x] `src/app/(main)/page.tsx` — La Carte
- [x] `src/app/(main)/journal/page.tsx`
- [x] `src/app/(main)/secrets/page.tsx`
- [x] `src/app/(main)/bibliotheque/page.tsx`
- [x] `src/app/(main)/alliances/page.tsx`
- [x] `src/app/(main)/notifications/page.tsx`
- [x] `src/app/(main)/profil/page.tsx`
- [x] `src/app/(main)/domaines/[id]/page.tsx` — stub

### La Carte — HexMap
- [x] `src/features/carte/domain-constants.ts` — DomainId, ExplorationLevel, FILL, STROKE, DOMAIN_META
- [x] `src/features/carte/ZoneGrise.tsx` — pattern SVG pointillé (hexagones inexploréss)
- [x] `src/features/carte/DomainTooltip.tsx` — popup stats Domaine + bouton Explorer
- [x] `src/features/carte/HexMap.tsx` — SVG interactif (tap court→tooltip, tap long→navigate, hover, stagger, pulse)

### Journal — Liste
- [x] `src/features/journal/mock-notes.ts` — interface Note + MOCK_NOTES (4 entrées)
- [x] `src/features/journal/DomainBadge.tsx` — badge ambre avec abréviation du domaine
- [x] `src/features/journal/JournalCard.tsx` — carte cliquable (titre Cormorant, extrait, badge, date relative)
- [x] `src/features/journal/JournalList.tsx` — liste avec stagger Framer Motion + compteur + empty state
- [x] `src/app/(main)/journal/page.tsx` — branché sur JournalList

### Profil & Stats Contemplatives
- [x] `src/lib/stores/profil.store.ts` — Zustand persist (thème, police, taille, traduction, locale)
- [x] `src/features/profil/CitizenIdentity.tsx` — Avatar + initiales + fallback nameToHsl
- [x] `src/features/profil/stats/MetricBlock.tsx` — Valeur + label, variants amber + small
- [x] `src/features/profil/stats/TerritoireAtlas.tsx` — SVG 7 hexagones, Framer Motion pulse, 6 niveaux
- [x] `src/features/profil/PreferencesForm.tsx` — 5 dropdowns connectés au store

---

## 🔄 En cours

_(vide)_

---

## 📋 Prochaine session

1. `src/features/journal/JournalEditor.tsx` — éditeur Tiptap plein écran + route `/journal/[id]`
2. `src/features/secrets/` — Capture de secrets, classification Domaines (Gemini)
3. `src/lib/db/` — Dexie.js IndexedDB (notes, secrets, verses) + sync Supabase
4. Supabase auth + `fetchDomainStats()` réel dans `CartePage`

---

## Décisions prises

| Sujet | Décision |
|-------|----------|
| Accent couleur | Ambre `#EF9F27` uniquement — aucune autre couleur vive |
| Fonts | Cormorant Garamond (éditorial) + DM Sans (UI) |
| Animation | Framer Motion · ease `[0.16,1,0.3,1]` · max 300ms · jamais de bounce |
| Nav mobile | Notifications fusionnées dans Alliances — pas d'item séparé |
| Stats | Pas de streaks · pas de scores · contemplatif uniquement |
| Supabase | RLS activé · chaque Citoyen lit son propre profil uniquement |
| Offline | Dexie.js IndexedDB · sync Supabase en arrière-plan |
| IA | Gemini invisible · classification Domaines · auto-titre Journal |
| Thème | Sombre par défaut · thème clair disponible via `[data-theme="light"]` |

---

## Problèmes ouverts

_(aucun)_
