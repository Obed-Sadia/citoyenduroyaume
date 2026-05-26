---
date: 2026-05-12
heure: "10:00"
projet: citoyen-du-royaume
phase: Phase 2 Partie B — Domaines Vivants (à démarrer)
tags: [projet/citoyen-du-royaume, type/archive]
---

# Session 2026-05-12 10h00 — Citoyen du Royaume Debug Sync + Auth

## Resume
Session de debug sur /bibliotheque : 4 bugs corrigés (Framer Motion, Gemini classify, sync Supabase auth, session proxy). Le sync Supabase fonctionne désormais — versets capturés apparaissent en base. Compte utilisateur créé + tables notes/secrets ajoutées dans Supabase.

## Travail effectue
- Diagnostic Framer Motion : warning `opacity: undefined` sur items ajoutés dynamiquement → fix `initial="hidden"` sur `motion.li`
- Diagnostic Gemini classify : `classifyDomain` retournait `null` silencieusement car `gemini-2.5-flash` retourne parfois du contenu autour du mot-clé → fix regex robuste
- Diagnostic sync Supabase : `getUser()` (appel réseau) échouait → remplacé par `getSession()` (lecture localStorage) + helper `getUserId()`
- Création `proxy.ts` : manquant — sans lui les cookies Supabase ne se propagent pas entre requêtes en Next.js 16
- Fix callback auth : `exchangeCodeForSession` ne vérifiait pas l'erreur de retour
- Tables Supabase créées manuellement : `notes`, `secrets` (avec RLS) — `verses` déjà présente
- Compte utilisateur Supabase créé via Authentication → Add user

## Decisions
- **`getSession()` au lieu de `getUser()` pour sync client-side** : `getUser()` fait un appel réseau pour valider le JWT, peut retourner null si instance fraîche. `getSession()` lit le localStorage directement.
- **`proxy.ts` obligatoire** : Next.js 16 + Supabase SSR nécessite ce fichier pour rafraîchir les cookies de session à chaque requête. Sans lui, session non propagée.
- **Regex dans `classifyDomain`** : essaie d'abord la correspondance exacte, puis extrait le premier ID valide via `\b(roi|territoire|...)\b` — plus robuste face à la verbosité de gemini-2.5-flash.

## Etat du projet
- Phase actuelle : Phase 2 Partie B à démarrer
- Valide : Design system · Nav · Shell · HexMap · Journal · Profil · Secrets · Dexie.js · Supabase auth · Gemini 2.5-flash · Sync (notes + secrets + versets) · **Bibliothèque complète** ✅
- En cours : `console.warn/error` debug temporaires dans `sync.ts` (à retirer quand stable)

## Prochaines etapes
1. Retirer les logs debug temporaires de `sync.ts` (console.warn no user + console.error)
2. **Partie B** : `DomaineHeader.tsx` → `DomaineContent.tsx` → `/domaines/[id]/page.tsx` → `DomainTooltip.tsx`

## Fichiers modifies
- `src/lib/ai/classify-domain.ts` — regex robuste (exact match + fallback extraction)
- `src/lib/supabase/sync.ts` — getSession() + helper getUserId() + debug logs temporaires
- `src/features/bibliotheque/VerseFeed.tsx` — initial="hidden" sur motion.li
- `src/proxy.ts` — créé (session refresh Supabase pour Next.js 16)
- `src/app/auth/callback/route.ts` — vérification erreur exchangeCodeForSession

## Assets (URLs)
Aucun.
