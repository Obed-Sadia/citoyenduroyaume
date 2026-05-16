---
projet: citoyen-du-royaume
phase: Phase C complète — prêt pour Phase D
derniere-session: 2026-05-16
tags: [projet/citoyen-du-royaume]
---

# Citoyen du Royaume (BASILEIA) — Contexte actif

## Etat courant
- Phase : Phase C — 100% complète ✅
- Valide : Design system · Nav · Shell · HexMap · Journal · Profil · Secrets · Bibliothèque · Domaines Vivants · Alliés · Tribus · Enluminures · Auth OTP · DB isolée par userId · Logout · getUser() sécurisé · Flow OTP testé · Profil réel Supabase · Sync complet (created_at + DELETE + SyncDot) · **Sync bidirectionnel (pull au login)** · **Préférences persistées en DB** · **Toggle share_territoire**
- En cours : —

## Decisions cumulees
- Ambre `#EF9F27` seule couleur vive
- Framer Motion · ease `[0.16,1,0.3,1]` · max 300ms · jamais de bounce
- Offline-first Dexie.js → sync Supabase fire-and-forget
- Gemini invisible : suggère, ne s'impose jamais — erreurs silencieuses
- `proxy.ts` obligatoire Next.js 16 + Supabase SSR
- Plans/specs → docs/superpowers/specs/
- **notes.id est TEXT** (pas UUID) — FK enluminures adaptée
- **citizen_profiles** : créée manuellement en Supabase avec short_code + trigger auto
- **Guard IDOR** : respondToAllyRequest filtre `.eq('receiver_id', user.id)`
- **assertTribeAdmin** : helper privé dans tribes.ts
- **Cast Record<string, unknown>** : pour FK hints Supabase (pattern allies.ts)
- **Pas de colonne excerpt** dans Supabase notes — seulement dans Dexie local
- **DB Dexie = `basileia_<userId>`** — isolation totale par compte
- **initDb est async** — await open() avant toute opération
- **Auth OTP** : shouldCreateUser: true (ouvert à tous), resend 60s, verify page /login/verify
- **LogoutButton délègue à AuthProvider** via SIGNED_OUT event (pas de duplication reset/redirect)
- **getUser() dans sync.ts** — validation serveur (pas getSession())
- **OTP = 8 chiffres** — Supabase génère 8 chiffres par défaut (pas 6)
- **Template Supabase** : `{{ .Token }}` en texte brut, pas en href de lien
- **Profil réel** : 4 queries parallèles (citizen_profiles + notes + secrets + verses) dans Server Component async
- **"En profondeur"** = notes avec domain_id non null (proxy Gemini classification — pas de colonne anchored_verse_count en DB)
- **Bouton "Mot de passe" supprimé** — app OTP-only, aucun mot de passe
- **SyncDot** : point ambre animé fixed top-3 right-3, visible si pending > 0 (useSyncStore)
- **track() helper** dans sync.ts — wraps increment/decrement autour de chaque opération
- **Sync bidirectionnel** : pull au login dans initSession (initDb → pull* → prefs → loadFromDb)
- **Last-write-wins notes** : compare `updated_at` ISO strings (lexicographiquement triables)
- **pullSecrets/pullVerses** : insert-if-missing seulement (pas de updated_at en DB pour ces tables)
- **hydrateFromRemote** : set() direct dans profil.store — pas de syncPreferences appelé (évite boucle)
- **share_territoire Phase C** : toggle sauvegardé en DB, vue côté Allié = Phase D
- **syncNote** : utilise `note.updatedAt ?? new Date().toISOString()` (fix last-write-wins consistency)

## Prochaines etapes
1. Phase D — Vue TerritoireAtlas côté Allié dans AlliesList (RLS Supabase + composant read-only)
2. Phase D — Sync temps réel optionnel (Supabase Realtime)
3. Affiner "En profondeur" si ajout colonne `anchored_verse_count` en DB
4. pullSecrets/pullVerses : ajouter last-write-wins si `updated_at` ajouté en DB

## Assets actifs (URLs)
Aucun.
