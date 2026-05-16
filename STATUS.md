# STATUS — BASILEIA

> Claude Code : lire ce fichier en début de chaque session.
> Développeur : mettre à jour après chaque session de travail.

---

## Phase actuelle
Phase C complète ✅ — Phase D à définir (vue TerritoireAtlas côté Allié)

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

### Journal — Liste & Éditeur
- [x] `src/features/journal/mock-notes.ts` — interface Note (+ content) + MOCK_NOTES (4 entrées)
- [x] `src/features/journal/DomainBadge.tsx` — badge ambre avec abréviation du domaine
- [x] `src/features/journal/JournalCard.tsx` — carte cliquable (titre Cormorant, extrait, badge, date relative)
- [x] `src/features/journal/JournalList.tsx` — liste store + stagger Framer Motion + bouton + fonctionnel
- [x] `src/features/journal/JournalEditor.tsx` — éditeur Tiptap plein écran (debounce 1s, compteur mots)
- [x] `src/lib/stores/notes.store.ts` — Zustand (addNote, updateNote, getNoteById)
- [x] `src/app/(main)/journal/page.tsx` — branché sur JournalList
- [x] `src/app/(main)/journal/[id]/page.tsx` — route dynamique → JournalEditor

### Profil & Stats Contemplatives
- [x] `src/lib/stores/profil.store.ts` — Zustand persist (thème, police, taille, traduction, locale)
- [x] `src/features/profil/CitizenIdentity.tsx` — Avatar + initiales + fallback nameToHsl
- [x] `src/features/profil/stats/MetricBlock.tsx` — Valeur + label, variants amber + small
- [x] `src/features/profil/stats/TerritoireAtlas.tsx` — SVG 7 hexagones, Framer Motion pulse, 6 niveaux
- [x] `src/features/profil/PreferencesForm.tsx` — 5 dropdowns connectés au store

### Les Secrets — Fulgurances
- [x] `src/lib/stores/secrets.store.ts` — interface Secret + Zustand (addSecret, liste vide)
- [x] `src/features/secrets/SecretCard.tsx` — carte compacte (texte, date, domaine optionnel)
- [x] `src/features/secrets/CaptureBar.tsx` — barre sticky, focus auto, Enter soumet
- [x] `src/features/secrets/SecretFeed.tsx` — flux vertical + stagger Framer Motion
- [x] `src/app/(main)/secrets/page.tsx` — branché sur SecretFeed + CaptureBar

### Persistance locale — Dexie.js
- [x] `src/lib/db/basileia.db.ts` — BasileiaDB (tables notes + secrets)
- [x] `src/lib/db/notes.repo.ts` — NotesRepo (getAll/add/update/remove)
- [x] `src/lib/db/secrets.repo.ts` — SecretsRepo (getAll/add/remove)
- [x] `src/lib/stores/notes.store.ts` — hydraté depuis IndexedDB au mount
- [x] `src/lib/stores/secrets.store.ts` — hydraté depuis IndexedDB au mount

### Auth & Stats — Supabase
- [x] `src/lib/supabase/server.ts` — client serveur SSR
- [x] `middleware.ts` + `proxy.ts` — refresh session + protection routes
- [x] `src/app/auth/callback/route.ts` — échange code → session
- [x] `src/app/(auth)/login/` — page magic link (LoginForm)
- [x] `src/app/(main)/page.tsx` — fetchDomainStats() réel depuis Supabase

### IA — Gemini
- [x] `src/lib/ai/classify-domain.ts` — Server Action (gemini-2.5-flash)
- [x] `src/lib/ai/generate-title.ts` — Server Action (gemini-2.5-flash)
- [x] `src/features/journal/JournalEditor.tsx` — suggestion domaine + auto-titre (30s, titre vide, ≥50 chars)
- [x] `src/features/secrets/CaptureBar.tsx` — bouton ◈ Domaine manuel

### Sync Supabase
- [x] `src/lib/supabase/sync.ts` — syncNote() + syncSecret() + syncVerse() fire-and-forget

### Versets Ancrés — La Bibliothèque
- [x] `src/lib/db/basileia.db.ts` — bump version + table `verses`
- [x] `src/lib/db/verses.repo.ts` — VersesRepo (getAll/add/remove)
- [x] `src/lib/stores/verses.store.ts` — Zustand (addVerse, removeVerse, loadFromDb)
- [x] `src/features/bibliotheque/VerseCard.tsx`
- [x] `src/features/bibliotheque/VerseCaptureBar.tsx` — référence + texte + ◈ Domaine
- [x] `src/features/bibliotheque/VerseFeed.tsx`
- [x] `src/app/(main)/bibliotheque/page.tsx` — câbrage
- [x] Supabase Dashboard — table `verses` créée

### Domaines Vivants
- [x] `src/features/carte/DomaineHeader.tsx` — hex ambre + nom Cormorant + stats
- [x] `src/features/carte/DomaineContent.tsx` — tabs Notes | Secrets | Versets + filtrage
- [x] `src/app/(main)/domaines/[id]/page.tsx` — câbrage + validation id + notFound()
- [x] `src/features/carte/DomainTooltip.tsx` — navigation Explorer → /domaines/[id] ✅
- [x] Checklist Phase 2 validée · fix tooltip fixed bottom (HexMap) ✅

### Phase C — Sync bidirectionnel + Préférences DB + Toggle territoire
- [x] `Note.updatedAt?: string` — champ ajouté pour last-write-wins
- [x] `syncNote` — utilise `note.updatedAt` (fix last-write-wins)
- [x] `sync.ts` — `syncPreferences`, `pullNotes`, `pullSecrets`, `pullVerses`
- [x] `notes.repo.ts` / `secrets.repo.ts` / `verses.repo.ts` — `getById` ajouté
- [x] `profil.store.ts` — `share_territoire`, `hydrateFromRemote`, setters avec sync
- [x] `AuthProvider.tsx` — `initSession` : initDb → pull → prefs → loadFromDb
- [x] `PreferencesForm.tsx` — toggle "Partager mon Territoire avec mes Alliés"

---

## 🔄 En cours

_(vide)_

---

## 📋 Phase C — Plan complet

> Spec : `docs/superpowers/specs/2026-05-16-phase-c-sync-preferences-partage.md`
> Plan : `docs/superpowers/plans/2026-05-16-phase-c-sync-preferences-partage.md`

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
| Sync bidirectionnel | pull au login (last-write-wins notes · insert-if-missing secrets/verses) |
| Préférences | `citizen_profiles.preferences` JSONB · push à chaque changement · pull au login |
| share_territoire | toggle Phase C (sauvegarde seulement) · vue côté Allié = Phase D |
| IA | Gemini invisible · classification Domaines · auto-titre Journal |
| Thème | Sombre par défaut · thème clair disponible via `[data-theme="light"]` |

---

## Problèmes ouverts

_(aucun)_
