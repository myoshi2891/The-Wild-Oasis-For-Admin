# Engineering Standards

These standards align with the current repo tooling and architecture.

## Code Style
- TypeScript strict mode is required (`tsconfig.json` has `strict: true`); avoid `any`.
- ESLint is the source of truth; run `bun run lint` before committing.
- Components must follow the single-file single-component rule.
- Code style must follow the project rules in `GEMINI.md` (e.g. styled-components for CSS-in-JS, Japanese comments permitted).

## Testing
- Unit and integration tests must be written with Vitest (using jsdom for component rendering).
- Component tests should check UI behavior with React Testing Library.
- Playwright is used for E2E tests covering critical user flows (run `bun run test:e2e`).
- New behaviors must be covered by relevant test cases.

## Error Handling and Logging
- Wrap external Supabase API calls in `try/catch` or use appropriate error boundaries (`react-error-boundary`).
- Log errors using `console.error` at boundaries; never expose sensitive credentials.
- Provide user-friendly, consistent feedback using UI components (e.g. `react-hot-toast`).

## Design and Architecture
- Folder structure must follow the modular features architecture (`src/features/`, `src/ui/`, `src/pages/`, `src/services/`, etc.).
- UI components should remain as presentational as possible. Logic should be isolated in custom hooks.
- Supabase services live under `src/services/` (database query helpers and authentication functions).
- Global state such as theme/dark mode is managed via contexts (e.g., `DarkModeContext`).

## Security
- Always enforce proper authentication and authorization checks on client routes using `ProtectedRoute`.
- Ensure Supabase RLS (Row Level Security) is set up correctly in the database (managed directly on the Supabase dashboard).
- Secrets (Supabase keys) must only live in `.env` or CI environment variables; never commit credentials.

## CI / Supply Chain
- Third-party GitHub Actions in `.github/workflows/` MUST be pinned to a full commit SHA (40 hex chars), never a mutable tag like `@v1` or `@main`.
- Each SHA pin MUST be followed by a trailing comment naming the released version (e.g. `uses: owner/action@<sha> # v2.2.0`).
- Container service images (if any) MUST be pinned to a digest with a `# <tag>` comment.
