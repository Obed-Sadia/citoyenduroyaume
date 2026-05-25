---
projet: citoyen-du-royaume
phase: Phase D complète — TerritoireAtlas des Alliés
derniere-session: 2026-05-24
tags: [projet/citoyen-du-royaume]
---

# Citoyen du Royaume (BASILEIA) — Contexte actif

## Etat courant
- Phase : Phase D — 100% implémentée et validée
- Valide : Design system · Nav · Shell · HexMap · Journal · Profil · Secrets · Bibliothèque · Domaines Vivants · Alliés · Tribus · Enluminures · Auth OTP · DB isolée · Logout · Profil réel Supabase · Sync complet · **Sync bidirectionnel (pull au login)** · **Préférences persistées en DB** · **Toggle share_territoire** · **TerritoireAtlas des Alliés (Phase D)**
- En cours : rien

## Decisions cumulees
- Ambre `#EF9F27` seule couleur vive
- Framer Motion · ease `[0.16,1,0.3,1]` · max 300ms · jamais de bounce
- Offline-first Dexie.js → sync Supabase fire-and-forget
- Gemini invisible : suggère, ne s'impose jamais — erreurs silencieuses
- `proxy.ts` obligatoire Next.js 16 + Supabase SSR
- **notes.id est TEXT** (pas UUID)
- **citizen_profiles** : trigger auto à la création de compte
- **DB Dexie = `basileia_<userId>`** — isolation totale par compte
- **Auth OTP** : shouldCreateUser: true, resend 60s, verify page /login/verify
- **OTP = 8 chiffres** — template Supabase : `{{ .Token }}` en texte brut (PAS le lien)
- **SyncDot** : point ambre animé fixed top-3 right-3, si pending > 0
- **track() helper** dans sync.ts — wraps increment/decrement
- **Sync bidirectionnel** : pull dans initSession (initDb → pull* → prefs → loadFromDb)
- **Last-write-wins notes** : compare `updated_at` ISO strings
- **pullSecrets/pullVerses** : insert-if-missing seulement (pas de updated_at en DB)
- **hydrateFromRemote** : set() direct — pas de syncPreferences (évite boucle)
- **syncNote** : utilise `note.updatedAt ?? new Date().toISOString()`
- **share_territoire Phase D** : snapshot Dexie → `preferences.territoire` JSONB · purge si désactivé
- **getAllyTerritoire** : double sécurité RLS + vérification alliance applicative + sanitisation JSONB
- **AllyCard territoire** : état 3 valeurs (undefined/null/objet) · fetch-once au premier expand
- **syncPreferences** : `.maybeSingle()` au lieu de `.single()` (évite 406 si 0 lignes)

## Prochaines etapes
1. Tester Phase D en conditions réelles (2 comptes, share_territoire activé, vérifier AllyCard)
2. Retirer console.error debug dans sync.ts (déjà fait en Phase D)
3. Phase E — à définir (pullSecrets/pullVerses last-write-wins si updated_at ajouté en DB ?)

## Assets actifs (URLs)
Aucun.
