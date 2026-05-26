---
date: 2026-05-13
heure: "HH:MM"
projet: citoyen-du-royaume
phase: Phase 3 — Les Enluminures (complète)
tags: [projet/citoyen-du-royaume, type/archive]
---

# Session 2026-05-13 — Citoyen du Royaume Phase 3 Enluminures

## Resume
Implémentation complète de la Phase 3 — la couche sociale de BASILEIA. 18 tâches livrées via subagent-driven development : schema Supabase (4 nouvelles tables + RLS), système Alliés (connexion via code court 6 chars), Tribus (groupes avec approbation admin), Enluminures (annotations sur Journal d'un Allié), et intégration dans toute l'interface. TypeScript strict ✅, branche `master` prête pour PR vers `main`.

## Travail effectue

### Bloc 1 — Schema + Alliés
- Schema SQL : tables `allies`, `tribes`, `tribe_members`, `enluminures` + modifs `notes` (visibility, tribe_id) + `citizen_profiles` (short_code) + RLS policies
- `src/lib/supabase/types.ts` : 4 nouveaux types + modifs notes/citizen_profiles
- `src/lib/actions/allies.ts` : sendAllyRequest, respondToAllyRequest (guard IDOR receiver_id), getMyAllies, getPendingRequests
- `src/features/alliances/InviteBlock.tsx` : affiche code court, copie lien invite
- `src/features/alliances/ConnectForm.tsx` : saisie code court 6 chars → demande Allié
- `src/features/alliances/AllyRequest.tsx` : Accepter/Refuser avec try/finally
- `src/features/alliances/AllyCard.tsx` : fiche Allié expandable
- `src/features/alliances/AllyJournalFeed.tsx` : notes partagées d'un Allié (visibility=allies)
- `src/features/alliances/AlliesList.tsx` : liste pending + acceptés
- `src/app/(main)/alliances/page.tsx` : reécrit 2x (onglets initiaux → AllianceTabs)
- `src/app/invite/[short_code]/page.tsx` : page pré-remplie depuis lien invitation
- `src/features/journal/JournalEditor.tsx` : toggle visibilité Privé/Alliés/Tribu + tribe picker
- `src/lib/supabase/sync.ts` : syncNote inclut visibility + tribe_id

### Bloc 2 — Tribus + Enluminures
- `src/lib/actions/tribes.ts` : createTribe, requestToJoinTribe, approveTribeMember, rejectTribeMember (assertTribeAdmin helper), getMyTribes, getTribePreview
- `src/lib/actions/enluminures.ts` : addEnluminure, getEnluminuresForNote, getEnluminureCountForNote
- `src/features/alliances/TribeCard.tsx` : nom/thème/membres, tabs Journaux/Membres
- `src/features/alliances/TribeCreateForm.tsx` : créer une Tribu (collapsible)
- `src/features/alliances/TribeMemberList.tsx` : membres + pending, approve/reject (admin)
- `src/features/alliances/TribeJournalFeed.tsx` : notes visibility=tribe
- `src/app/tribu/[invite_code]/page.tsx` : aperçu tribu + rejoindre → redirect /alliances
- `src/features/enluminures/EnluminureComposer.tsx` : mode Annotation/Verset, ≤50 chars
- `src/features/enluminures/EnluminureMargin.tsx` : affichage enluminures + bouton ◈ Enluminer
- `src/features/enluminures/EnluminureBadge.tsx` : ◈ {count} en amber sur JournalCard
- `src/features/alliances/AllianceTabs.tsx` : tabs Alliés/Tribus complets
- `src/features/journal/JournalCard.tsx` : EnluminureBadge dans footer
- `src/app/(main)/journal/[id]/page.tsx` : EnluminureMargin isAuthor=true

## Decisions
- **Subagent-driven development** : 18 tâches via subagents indépendants + spec compliance + code quality review à chaque tâche
- **note_id TEXT (pas UUID)** : `notes.id` est text dans Supabase — FK enluminures adaptée
- **citizen_profiles créée manuellement** : table n'existait pas en Supabase, créée avec schema complet + trigger short_code
- **Guard IDOR receiver_id** : `respondToAllyRequest` filtre `.eq('receiver_id', user.id)` pour éviter qu'un user change le statut d'une autre demande
- **assertTribeAdmin helper** : approveTribeMember/rejectTribeMember vérifient que le caller est admin avant d'agir
- **Cast `Record<string, unknown>`** : Supabase TS SDK retourne `never` pour les FK hints quand Relationships: [] — même pattern que allies.ts
- **Pas de colonne excerpt** : n'existe que dans Dexie local, pas dans Supabase notes — retiré de AllyJournalFeed
- **expandedIds Set** : AllyJournalFeed permet plusieurs notes ouvertes simultanément (amélioration sur la spec)
- **Remote non configuré** : PR vers main reportée — branche master prête, remote à ajouter

## Etat du projet
- Phase actuelle : Phase 3 — Les Enluminures (100% complète)
- Valide : Schema SQL + RLS ✅, Alliés ✅, Tribus ✅, Enluminures ✅, TypeScript strict ✅
- En cours : Rien — branche master prête pour PR

## Prochaines etapes
1. Configurer remote GitHub : `git remote add origin https://github.com/<compte>/citoyen-du-royaume.git`
2. Push + créer PR `master` → `main`
3. Tester le preview Vercel (Alliés, Tribus, Enluminures end-to-end)
4. Définir Phase 4 (Notifications ? Profil complet ? TerritoireAtlas ?)

## Fichiers modifies
- `src/lib/supabase/types.ts` — modifié
- `src/lib/supabase/sync.ts` — modifié
- `src/lib/actions/allies.ts` — créé
- `src/lib/actions/tribes.ts` — créé
- `src/lib/actions/enluminures.ts` — créé
- `src/features/alliances/InviteBlock.tsx` — créé
- `src/features/alliances/ConnectForm.tsx` — créé
- `src/features/alliances/AllyRequest.tsx` — créé
- `src/features/alliances/AllyCard.tsx` — créé
- `src/features/alliances/AllyJournalFeed.tsx` — créé
- `src/features/alliances/AlliesList.tsx` — créé
- `src/features/alliances/AllianceTabs.tsx` — créé
- `src/features/alliances/TribeCard.tsx` — créé
- `src/features/alliances/TribeCreateForm.tsx` — créé
- `src/features/alliances/TribeMemberList.tsx` — créé
- `src/features/alliances/TribeJournalFeed.tsx` — créé
- `src/features/enluminures/EnluminureComposer.tsx` — créé
- `src/features/enluminures/EnluminureMargin.tsx` — créé
- `src/features/enluminures/EnluminureBadge.tsx` — créé
- `src/features/journal/JournalEditor.tsx` — modifié
- `src/features/journal/JournalCard.tsx` — modifié
- `src/app/(main)/alliances/page.tsx` — modifié
- `src/app/(main)/journal/[id]/page.tsx` — modifié
- `src/app/invite/[short_code]/page.tsx` — créé
- `src/app/tribu/[invite_code]/page.tsx` — créé
- `src/app/(main)/profil/page.tsx` — modifié (InviteBlock stub)
- `docs/superpowers/specs/2026-05-12-phase3-enluminures.md` — créé
- `docs/superpowers/plans/2026-05-12-phase3-enluminures.md` — créé

## Assets (URLs)
Aucun.
