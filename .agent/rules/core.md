---
activation: always
---

# Project Core Rules

## Architecture
- このプロジェクトは React 18 + TypeScript (strict) + Vite の SPA 構成
- バックエンドは Supabase (BaaS) を使用
- 状態管理は React Query (@tanstack/react-query) に統一
- ルーティングは React Router DOM v6 を使用
- スタイリングは styled-components に統一
- テストは Vitest + @testing-library/react

## Directory Structure
- `src/features/` — ビジネスロジック（機能モジュール単位）
- `src/ui/` — 再利用可能な UI コンポーネント
- `src/pages/` — ページコンポーネント（ルートに対応）
- `src/services/` — Supabase API 呼び出し
- `src/hooks/` — カスタムフック
- `src/context/` — React Context（DarkMode等）
- `src/utils/` — ユーティリティ関数
- `src/styles/` — グローバルスタイル
- `src/types/` — 型定義（domain, supabase, common）
- `src/test/` — テストセットアップ

## Security Constraints
- `.env` ファイルをコミットしない（Supabase URL / Key を含む）
- `dangerouslySetInnerHTML` を使用しない
- ユーザー入力は必ずバリデーションを通す

## Forbidden Actions
- `node_modules/` 配下のファイルを変更しない
- Supabase のテーブルスキーマを直接変更しない（マイグレーション経由）
- `console.log()` をコードレビュー前に削除する
- グローバルスタイルを `src/styles/GlobalStyles.ts` 以外に記述しない

## Build & Test

- Package Manager: `bun` (lockfile: `bun.lock`)
- Dev: `bun run dev`
- Build: `bun run build`
- Lint: `bun run lint`
- Test: `bun run test`
- Typecheck: `bun run typecheck`
