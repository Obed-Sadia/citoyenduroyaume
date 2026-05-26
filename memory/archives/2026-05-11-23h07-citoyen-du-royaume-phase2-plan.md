---
date: 2026-05-11
heure: "23:07"
projet: citoyen-du-royaume
phase: Phase 2 — Versets Ancrés + Domaines Vivants (planifié)
tags: [projet/citoyen-du-royaume, type/archive]
---

# Session 2026-05-11 23h07 — BASILEIA Phase 2 Plan

## Resume
Phase 1 validée et clôturée : auto-titre Gemini confirmé fonctionnel, modèles Gemini upgradés en 2.5-flash, commit propre. Phase 2 planifiée via brainstorming complet : Versets Ancrés (La Bibliothèque) + Domaines Vivants (/domaines/[id]), spec détaillée rédigée et STATUS.md mis à jour.

## Travail effectue
- Validé auto-titre Gemini (user confirme fonctionnel après 30s d'inactivité)
- Révoqué console.error debug → catch silencieux dans JournalEditor.tsx (App-Effacement)
- Commité upgrade Gemini 2.0-flash → 2.5-flash (classify-domain.ts + generate-title.ts)
- Brainstorming Phase 2 : clarification priorités (Versets Ancrés + Domaines Vivants), UX capture (barre comme Secrets), contenu page domaine (agrégat complet 3 tabs)
- Rédigé spec Phase 2 dans `docs/superpowers/specs/2026-05-11-phase2-versets-domaines.md`
- Mis à jour STATUS.md (Phase 2 courante, checklist complète 13 étapes)
- Mis à jour memory/contexte.md
- Créé feedback memory : plans/specs → dans projet, pas dans ~/.claude/plans/

## Decisions
- **Phase 2 = Versets Ancrés + Domaines Vivants** : 3e objet fondamental (Bibliothèque) + rendre La Carte cliquable et significative
- **UX VerseCaptureBar = barre sticky (comme Secrets)** : familier, deux inputs inline (référence + texte) + bouton ◈ Domaine
- **Page /domaines/[id] = agrégat complet** : 3 tabs Notes | Secrets | Versets filtrés par domaine
- **Specs → docs/superpowers/specs/** : pas dans ~/.claude/plans/, rester dans le projet

## Etat du projet
- Phase actuelle : Phase 2 planifiée, prête à implémenter
- Valide : Phase 1 entière (design system, nav, HexMap, Journal, Secrets, Profil, Dexie, Supabase auth, Gemini classification + auto-titre, sync Supabase)
- En cours : rien — prochain commit = début Phase 2

## Prochaines etapes
1. Implémenter Partie A : `basileia.db.ts` → `verses.repo.ts` → `verses.store.ts` → `sync.ts` → composants → `/bibliotheque`
2. Implémenter Partie B : `DomaineHeader` → `DomaineContent` → `/domaines/[id]`
3. Créer table `verses` dans Supabase Dashboard (SQL dans spec)
4. Vérifier navigation DomainTooltip → /domaines/[id]

## Fichiers modifies
- `src/lib/ai/classify-domain.ts` — model 2.0-flash → 2.5-flash (commité)
- `src/lib/ai/generate-title.ts` — model 2.0-flash → 2.5-flash (commité)
- `src/features/journal/JournalEditor.tsx` — catch silencieux restauré (non commité, pas de diff réel)
- `STATUS.md` — phase + checklist Phase 2 ajoutée
- `docs/superpowers/specs/2026-05-11-phase2-versets-domaines.md` — créé
- `memory/projets/citoyen-du-royaume/contexte.md` — mis à jour
- `memory/feedback_plan_location.md` — créé

## Assets (URLs)
Aucun.
