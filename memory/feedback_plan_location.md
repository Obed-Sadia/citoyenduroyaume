---
name: Plan location preference
description: Sauvegarder les plans/specs dans le projet, pas dans ~/.claude/plans/
type: feedback
---

Sauvegarder les specs et plans de Phase dans `docs/superpowers/specs/` du projet, pas dans `~/.claude/plans/`.

**Why:** L'utilisateur veut que les plans soient dans le projet (STATUS.md ou docs/), pas dans les plans globaux de Claude Code.

**How to apply:** Quand brainstorming ou writing-plans → écrire spec dans `docs/superpowers/specs/YYYY-MM-DD-<topic>.md` + mettre à jour STATUS.md. Ne pas utiliser ExitPlanMode si le user veut juste sauver la spec dans le projet.
