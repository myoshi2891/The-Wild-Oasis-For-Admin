# TDD & Step-by-Step Commit Discipline

## Scope
- All unit, integration, and component tests (`src/features/**/__tests__/*.test.ts`, `src/features/**/__tests__/*.test.tsx`, `src/ui/__tests__/*.test.tsx`)
- Playwright E2E tests (`e2e/**/*.spec.ts`)
- Synchronization with project documentation (`docs/spec.md`, `docs/design.md`, `docs/tasks.md`)

## Rules

### MUST
- Follow the Red-Green-Refactor cycle when writing new tests or features. Use granular git commits to allow easy rollback.
- Commit test-by-test or module-by-module. Avoid giant commits. Grouping multiple test files into a single commit is permitted only if:
  1. They belong to the same module/feature (e.g. `src/features/cabins/`).
  2. The commit contains a maximum of 3 test files.
  3. The total line change is under 200 lines.
- Ensure that the specifications in `docs/spec.md` or `docs/design.md` are updated if any features or business rules are modified.
- Every commit must be green and pass all lint, typecheck, and unit test checks (`bun run lint`, `bun run typecheck`, `bun run test`).
- Write meaningful commit messages following the Conventional Commits format.

### NEVER
- Commit broken or failing tests (unless explicitly marked with `vi.spyOn` or expected exceptions).
- Skip running typecheck (`bun run typecheck`) and linter (`bun run lint`) before committing.
- Commit debugging helper code such as `console.log` or temporary test files.
- Bundle implementation code, tests, and documentation changes together into one massive commit. Keep them separated or grouped logically by module.

## Rationale
- **Reviewability**: Splitting work into logical, atomic commits makes it easy for reviewers to follow the progression and spot errors.
- **Traceability**: Granular commits help pinpoint regressions using tools like `git bisect`.
- **Maintainability**: Documenting specs alongside implementation keeps docs from drifting.

## Related
- `.claude/skills/test-gen/SKILL.md` (Test generation instructions)
- `.claude/skills/test-complete/SKILL.md` (Pre-commit validation checklist)
- `.claude/skills/spec-sync-after-test/SKILL.md` (Document synchronization steps)
