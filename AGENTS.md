Package manager: pnpm (do not use npm or yarn).

<!-- intent-skills:start -->

## Skill Loading

Before substantial work:

- Skill check: run `pnpm dlx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `pnpm dlx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

## Completion Checklist

Before reporting a task as done, you MUST ensure both commands pass cleanly:

1. `pnpm run typecheck` — no type errors
2. `pnpm run lint` — no lint errors (use `pnpm run lint:fix` to auto-fix what can be fixed)
