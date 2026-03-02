# Tech Constraints

## 必須技術スタック

- Runtime: React 18 + Vite
- Routing: React Router DOM v6
- State: @tanstack/react-query v4
- Styling: styled-components v6
- Forms: react-hook-form v7
- BaaS: Supabase (PostgreSQL + Auth)
- Charts: recharts v2

## 禁止事項

- CSS Modules や Tailwind の導入（styled-components に統一）
- Redux / Zustand 等の外部状態管理ライブラリの追加（React Query で統一）
- `class` コンポーネントの新規作成（関数コンポーネント + Hooks のみ）
- `var` の使用（`const` / `let` のみ）
- インラインスタイルの使用（styled-components を使う）
- `any` 型の TypeScript 使用（現在は JS だが将来の TS 移行を見据えて）

## テストポリシー

- 新規コンポーネントにはユニットテスト推奨
- カスタムフックには必ず使用例コメントを付与
- Supabase API 呼び出しは `src/services/` に集約

## コーディング規約

- ESLint: `eslint-config-react-app` ベース
- ファイル命名: PascalCase（コンポーネント）、camelCase（フック/ユーティリティ）
- インポート順序: React → ライブラリ → 内部モジュール → スタイル
