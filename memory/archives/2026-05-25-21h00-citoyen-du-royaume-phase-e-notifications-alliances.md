---
date: 2026-05-25
heure: "21:00"
projet: citoyen-du-royaume
phase: Phase E — Notifications & Alliances
tags: [projet/citoyen-du-royaume, type/archive]
---

# Session 2026-05-25 21h00 — Citoyen du Royaume Phase E Notifications & Alliances

## Resume
Implémentation complète de Phase E : invitations d'alliance (par email + lien partagé), système de notifications persistantes (4 types), feed de versets partagés par les alliés. 15 commits, 0 erreur TypeScript. Toutes les 16 tâches du plan complètes.

## Travail effectue

### Couche DB (Supabase — setup manuel)
- Créé table `notifications` avec RLS (SELECT/INSERT/UPDATE policies + index on user_id)
- Ajouté colonne `verses.visibility TEXT NOT NULL DEFAULT 'private' CHECK ('private','allies')`
- Ajouté policy `allies_read_shared_verses` sur `verses`
- Ajouté colonne `citizen_profiles.email TEXT UNIQUE` + backfill depuis `auth.users`
- Créé trigger `on_auth_user_email` → fonction `handle_new_user_email()` (SECURITY DEFINER)
- Créé fonction RPC `search_citizen_by_email` (SECURITY DEFINER, retourne id/display_name/avatar_url sans exposer l'email)
- Ajouté policy `profiles_select_notification_senders` (permet de lire le profil des émetteurs de notifs avant qu'ils soient alliés)

### Types & données locales
- `src/lib/supabase/types.ts` : ajouté `notifications`, `verses.visibility`, `citizen_profiles.email`, `Functions.search_citizen_by_email`
- `src/lib/db/basileia.db.ts` : ajouté `visibility` à `Verse` + migration Dexie v2
- `src/lib/stores/verses.store.ts` : `addVerse` accepte param optionnel `visibility`

### Server Actions (src/lib/actions/allies.ts)
- 11 nouvelles fonctions : `searchCitizenByEmail`, `getMyShortCode`, `resolveShortCode`, `sendAllianceRequest`, `acceptAllianceRequest`, `rejectAllianceRequest`, `getNotifications`, `markNotificationsRead`, `getUnreadCount`, `getAllyVerses`, `acceptLinkInvitation`
- Modifié `sendAllyRequest` : crée notification `invitation_received` après insert
- Modifié `respondToAllyRequest` : crée notification `invitation_accepted` si accepted

### Sync (src/lib/supabase/sync.ts)
- `syncVerse` : détecte nouveau verset (select avant upsert), crée notifications `verse_shared` pour tous les alliés si `visibility='allies'`
- `syncPreferences` : compare nouveau vs ancien territoire, crée notifications `territory_updated` pour tous les alliés si changement. Helper `hasChanged()` ajouté.
- `pullVerses` : inclut le champ `visibility` (fait par le subagent Task 3)

### Auth & Nav
- `AuthProvider.tsx` : appel `getUnreadCount()` dans `initSession`, `clearUnread()` dans `resetSession`

### UI créée
- `src/features/notifications/NotificationFeed.tsx` : client component, icônes par type, avatar HSL, texte contextuel, date relative, markRead au mount, clearUnread au mount
- `src/app/(main)/notifications/page.tsx` : câblé avec `getNotifications()` server-side
- `src/features/alliances/EmailSearchForm.tsx` : recherche par email + bouton Inviter
- `src/features/alliances/InvitationList.tsx` : pending reçus + EmailSearchForm + InviteBlock
- `src/features/alliances/AllyVerseFeed.tsx` : feed versets alliés (server component)
- `src/features/alliances/AllianceTabs.tsx` : refacto 4 onglets (Alliés / Invitations / Versets / Tribus), lazy-load versets
- `src/features/alliances/AlliesList.tsx` : simplifié — alliés acceptés uniquement (pending dans Invitations)
- `src/features/bibliotheque/VerseCaptureBar.tsx` : toggle ⬡ Privé / ⬡ Alliés (default: private)
- `src/app/invite/[short_code]/page.tsx` : réécrit — auth guard, resolveShortCode, check alliance existante, inline server action `handleAccept` → `acceptLinkInvitation` → redirect /alliances

## Decisions
- **`acceptLinkInvitation` crée status 'accepted' directement** : le lien d'invitation est une acceptation implicite (A a partagé son lien → B accepte = alliance directe, pas pending)
- **Trigger email distinct** : aucun trigger existant dans Supabase trouvé → créé `on_auth_user_email` (SECURITY DEFINER) séparé
- **Policy `profiles_select_notification_senders`** : nécessaire car les émetteurs d'invitation_received ne sont pas encore alliés mais leur nom/avatar doit être lisible
- **Lazy-load des versets alliés** : chargés seulement au premier clic sur l'onglet "Versets" pour éviter un fetch inutile
- **Détection "nouveau verset" dans syncVerse** : select avant upsert (1 requête supplémentaire) — acceptable car fire-and-forget

## Etat du projet
- Phase actuelle : Phase E complète
- Validé : Phase A (auth OTP), Phase B (profil réel + sync), Phase C (sync prefs + territoire), Phase D (TerritoireAtlas alliés), **Phase E (notifications + invitations + versets alliés)**
- En cours : rien — Phase F en attente

## Prochaines etapes
1. Tester Phase E en dev (`npm run dev`) — golden paths : invitation par email, invitation par lien, notifications, versets partagés
2. Brainstorm Phase F : Realtime (Supabase websocket) + Tribus UI + last-write-wins
3. Déployer sur Vercel

## Fichiers modifies
- `src/lib/supabase/types.ts` — modifié (notifications, verses.visibility, citizen_profiles.email, Functions)
- `src/lib/db/basileia.db.ts` — modifié (Verse.visibility, Dexie v2)
- `src/lib/stores/verses.store.ts` — modifié (addVerse visibility param)
- `src/lib/supabase/sync.ts` — modifié (syncVerse, syncPreferences, pullVerses)
- `src/lib/actions/allies.ts` — modifié (11 nouvelles actions + 2 fonctions modifiées)
- `src/features/auth/AuthProvider.tsx` — modifié (getUnreadCount, clearUnread)
- `src/features/notifications/NotificationFeed.tsx` — créé
- `src/app/(main)/notifications/page.tsx` — modifié (câblé)
- `src/features/alliances/EmailSearchForm.tsx` — créé
- `src/features/alliances/InvitationList.tsx` — créé
- `src/features/alliances/AllyVerseFeed.tsx` — créé
- `src/features/alliances/AllianceTabs.tsx` — modifié (4 onglets)
- `src/features/alliances/AlliesList.tsx` — modifié (acceptés seulement)
- `src/features/bibliotheque/VerseCaptureBar.tsx` — modifié (toggle visibility)
- `src/app/invite/[short_code]/page.tsx` — réécrit
- `docs/superpowers/specs/2026-05-24-phase-e-notifications-alliances.md` — créé (session précédente)
- `docs/superpowers/plans/2026-05-24-phase-e-notifications-alliances.md` — créé (session précédente)

## Assets (URLs)
Aucun.
