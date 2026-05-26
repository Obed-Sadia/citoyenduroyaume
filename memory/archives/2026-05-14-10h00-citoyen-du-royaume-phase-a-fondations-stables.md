---
date: 2026-05-14
heure: "10:00"
projet: citoyen-du-royaume
phase: Phase A complète — Fondations stables
tags: [projet/citoyen-du-royaume, type/archive]
---

# Session 2026-05-14 10h00 — Citoyen du Royaume Phase A Fondations stables

## Resume
Audit complet de l'app révèle 4 bugs critiques (IndexedDB partagée entre comptes, magic link instable, getSession() non sécurisé, logout inerte) et 9 problèmes de qualité. Phase A conçue, spécifiée, planifiée et implémentée via subagent-driven development — 12 commits, build propre, 0 erreur TypeScript.

## Travail effectue
- Audit complet (auth, DB, logique, UX) — 13 problèmes identifiés
- Brainstorming Phase A avec 3 options par problème → OTP + DB par userId choisis
- Spec écrite : `docs/superpowers/specs/2026-05-13-phase-a-fondations-stables.md`
- Plan écrit : `docs/superpowers/plans/2026-05-13-phase-a-fondations-stables.md`
- `basileia.db.ts` — DB dynamique `basileia_<userId>`, API initDb(async)/getDb/closeDb
- 3 repos migré vers `getDb()` (notes, secrets, verses)
- 3 stores Zustand — ajout de `reset()` pour clear au logout
- `sync.ts` — `getSession()` → `getUser()` (validation serveur)
- `AuthProvider.tsx` — init DB au boot, écoute SIGNED_IN/SIGNED_OUT
- `(main)/layout.tsx` — AuthProvider monté
- `LoginForm.tsx` — magic link → OTP (envoie code, redirect /login/verify)
- `login/verify/page.tsx` + `OtpForm.tsx` — saisie code 6 chiffres + resend 60s
- `LogoutButton.tsx` — signOut + try/finally setLoading
- `profil/page.tsx` — LogoutButton branché

## Decisions
- **OTP vs magic link** : OTP choisi — indépendant du navigateur/client email, plus fiable
- **DB préfixée par userId** : `basileia_${userId}` — isolation totale, pas de migration
- **initDb async** : await open() pour éviter état DB invalide si open() échoue
- **LogoutButton délègue à AuthProvider** : signOut → SIGNED_OUT event → reset + redirect (pas de duplication)
- **shouldCreateUser: true** : BASILEIA est ouvert à tous
- **Phase B identifiée** : profil avec données réelles (mock → Supabase) + sync complet (DELETE, created_at, indicateur)
- **Phase C identifiée** : profil complet + TerritoireAtlas partageable avec Alliés

## Etat du projet
- Phase actuelle : Phase A complète ✅ — en attente test manuel
- Valide : Design system · Nav · Journal · Profil · Secrets · Bibliothèque · Domaines Vivants · Alliés · Tribus · Enluminures · **Auth OTP** · **DB isolée** · **Logout** · **getUser()**
- En cours : Rien — attente activation "Email OTP" dans Dashboard Supabase avant test

## Prochaines etapes
1. Activer "Email OTP" dans Supabase Dashboard (Authentication > Providers > Email)
2. Tester le flow complet : OTP login, isolation DB, logout
3. Phase B — données réelles profil (TerritoireAtlas, métriques, email, shortCode depuis Supabase)
4. Phase B — sync complet (created_at, DELETE Supabase, indicateur d'état)
5. Phase C — TerritoireAtlas partageable avec Alliés + préférences persistées

## Fichiers modifies
- `src/lib/db/basileia.db.ts` — refactored DB dynamique par userId
- `src/lib/db/notes.repo.ts` — getDb()
- `src/lib/db/secrets.repo.ts` — getDb()
- `src/lib/db/verses.repo.ts` — getDb()
- `src/lib/stores/notes.store.ts` — reset()
- `src/lib/stores/secrets.store.ts` — reset()
- `src/lib/stores/verses.store.ts` — reset()
- `src/lib/supabase/sync.ts` — getUser()
- `src/app/(main)/layout.tsx` — AuthProvider monté
- `src/app/(auth)/login/LoginForm.tsx` — OTP mode
- `src/app/(main)/profil/page.tsx` — LogoutButton branché
- `src/features/auth/AuthProvider.tsx` — créé
- `src/app/(auth)/login/verify/page.tsx` — créé
- `src/features/auth/OtpForm.tsx` — créé
- `src/features/profil/LogoutButton.tsx` — créé
- `docs/superpowers/specs/2026-05-13-phase-a-fondations-stables.md` — créé
- `docs/superpowers/plans/2026-05-13-phase-a-fondations-stables.md` — créé

## Assets (URLs)
Aucun.
