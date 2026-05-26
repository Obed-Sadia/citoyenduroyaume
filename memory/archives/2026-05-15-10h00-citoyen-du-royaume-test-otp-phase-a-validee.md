---
date: 2026-05-15
heure: "10:00"
projet: citoyen-du-royaume
phase: Phase A validée — prêt pour Phase B
tags: [projet/citoyen-du-royaume, type/archive]
---

# Session 2026-05-15 10h00 — Citoyen du Royaume Test OTP Phase A validée

## Resume
Session de test du flow OTP end-to-end. Deux bugs identifiés et corrigés : le template Supabase envoyait un magic link au lieu d'un code, et l'app attendait 6 chiffres alors que Supabase envoie 8. Phase A entièrement validée en production locale.

## Travail effectue
- Diagnostiqué : Supabase envoyait un magic link (template `{{ .ConfirmationURL }}`) au lieu d'un code OTP
- Corrigé : template email Supabase remplacé par affichage texte `{{ .Token }}`
- Corrigé : `OtpForm.tsx` — pattern/maxLength/disabled de 6 → 8 chiffres
- Validé : flow complet (email → code → login → DB isolée → logout)

## Decisions
- **OTP = 8 chiffres** : Supabase génère des codes à 8 chiffres par défaut (pas 6)
- **Template Supabase** : `{{ .Token }}` en texte brut uniquement, pas en href de lien

## Etat du projet
- Phase actuelle : Phase A — 100% complète et testée ✅
- Valide : Design system · Nav · Shell · HexMap · Journal · Profil · Secrets · Bibliothèque · Domaines Vivants · Alliés · Tribus · Enluminures · Auth OTP · DB isolée par userId · Logout · getUser() sécurisé · Flow OTP testé end-to-end
- En cours : —

## Prochaines etapes
1. Phase B — profil réel : TerritoireAtlas depuis Supabase, métriques vraies, email, shortCode
2. Phase B — sync complet : created_at dans syncNote, DELETE Supabase, indicateur d'état
3. Phase C — TerritoireAtlas partageable avec Alliés + préférences persistées en DB

## Fichiers modifies
- `src/features/auth/OtpForm.tsx` — 6 chiffres → 8 chiffres (pattern, maxLength, disabled)
- `memory/projets/citoyen-du-royaume/contexte.md` — état mis à jour Phase A validée

## Assets (URLs)
Aucun.
