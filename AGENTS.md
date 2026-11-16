# Instructions for AI agents (Codex reads this file)

## Before you review or change anything

1. Read `CLAUDE.md`: the project's stack, commands, rules, and what must not be touched.
2. Read `HANDOVER.md` if it exists: current state, decisions already made, and next steps.
   Do not flag a decision recorded there as a mistake unless it causes a real bug or security issue.

## Review guidelines

- Review the PR against the acceptance criteria in the PR description. Say clearly if one is not met.
- Flag any change that breaks a rule in `CLAUDE.md`.
- High priority: security (secrets in code, auth bypass, injection), data loss, and broken builds or deploys.
- Keep each comment specific: the problem, why it matters, and the fix.
