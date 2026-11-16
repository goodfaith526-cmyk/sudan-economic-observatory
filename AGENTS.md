# Instructions for AI agents (Codex reads this file)

## Review guidelines

- Before reviewing, read `CLAUDE.md` (stack, commands, rules, and what must not be touched) and
  `HANDOVER.md` if it exists (current state, decisions already made, next steps).
- Review the PR against the acceptance criteria in the PR description. Say clearly if one is not met.
- Flag any change that breaks a rule in `CLAUDE.md` or contradicts a decision in `HANDOVER.md`.
- Treat decisions recorded in `HANDOVER.md` as intended, but still flag them when they cause a bug,
  a security issue, or data loss. If `HANDOVER.md` disagrees with the code, trust the code and say
  that `HANDOVER.md` is out of date.
- High priority: security (secrets in code, auth bypass, injection), data loss, and broken builds
  or deploys.
- Keep each comment specific: the problem, why it matters, and the fix.
