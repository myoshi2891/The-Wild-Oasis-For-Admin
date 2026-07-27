# Tech Constraints

## 必須技術スタック

- Language: TypeScript 5.9 (strict)
- Runtime: Node.js 22.22.0+ / React 19.2.7+ / Vite 7
- Routing: React Router v8.3.0+
- State: @tanstack/react-query v4
- Styling: styled-components v6
- Forms: react-hook-form v7
- BaaS: Supabase (PostgreSQL + Auth)
- Charts: recharts v2
- Testing: Vitest 4 + @testing-library/react

## 禁止事項

- CSS Modules や Tailwind の導入（styled-components に統一）
- Redux / Zustand 等の外部状態管理ライブラリの追加（React Query で統一）
- `class` コンポーネントの新規作成（関数コンポーネント + Hooks のみ）
- `var` の使用（`const` / `let` のみ）
- インラインスタイルの使用（styled-components を使う）
- `any` 型の TypeScript 使用（TypeScript strict モードで強制）

## テストポリシー

- Vitest + @testing-library/react を使用
- 新規コンポーネントにはユニットテスト推奨
- カスタムフックの品質担保は、陳腐化しやすいコード内コメントではなく、READMEの断片やユニット/統合テスト（使用例テスト）を中心とした運用を推奨する
- Supabase API 呼び出しは `src/services/` に集約

## コーディング規約

- ESLint: `eslint-config-react-app` ベース + `@typescript-eslint`
- ファイル命名: PascalCase（コンポーネント）、camelCase（フック/ユーティリティ）
- インポート順序: React → ライブラリ → 内部モジュール → スタイル

## Build & Test

- Package Manager: `bun` (lockfile: `bun.lock`)
- Dev: `bun run dev`
- Build: `bun run build`
- Lint: `bun run lint`
- Test: `bun run test`
- Typecheck: `bun run typecheck`
