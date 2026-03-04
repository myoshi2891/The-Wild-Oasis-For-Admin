# Project: The Wild Oasis

## 🎯 Project Overview

ホテルスタッフ向けの客室・予約・ゲスト管理アプリケーション。
React + Vite + Supabase (BaaS) によるシングルページアプリケーション構成。

## 🛠 Build & Test Commands

- Package Manager: `bun` (lockfile: `bun.lock`)
- Dev: `bun run dev`
- Build: `bun run build`
- Lint: `bun run lint`
- Test: `bun run test`
- Typecheck: `bun run typecheck`
- Preview: `bun run preview`

## 📐 Code Style

- ES Modules (`"type": "module"`)
- React 18 + TypeScript（`.tsx` / `.ts` 拡張子を使用）
- styled-components による CSS-in-JS スタイリング
- コンポーネントは1ファイル1コンポーネント
- カスタムフックは `use` プレフィックス必須
- Conventional Commits 形式でコミット
- コメントは日本語可、コード識別子は英語

## 🏗 Architecture

- エントリーポイント: `src/main.tsx`
- ルーティング: `src/App.tsx` (React Router DOM v6)
- 機能モジュール: `src/features/` (bookings, cabins, check-in-out, dashboard, authentication, settings)
- UIコンポーネント: `src/ui/`
- ページ: `src/pages/`
- APIサービス: `src/services/` (Supabase クライアント)
- カスタムフック: `src/hooks/`
- ユーティリティ: `src/utils/`
- 型定義: `src/types/` (domain, supabase, common)
- テスト基盤: `src/test/` (Vitest セットアップ)
- 状態管理: React Query (@tanstack/react-query v4)
- コンテキスト: `src/context/` (DarkModeContext)

## 🔗 Imports

@docs/spec.md
@docs/design.md

## ⚠️ Constraints

- `.env` をコミットしない（Supabase キー含む）
- Supabase のテーブルスキーマを直接変更しない
- `node_modules/` 配下のファイルを変更しない
- styled-components のグローバルスタイルは `src/styles/GlobalStyles.ts` に集約
- React Query のキャッシュ設定（staleTime）は原則0をデフォルトとする。ただし、パフォーマンス改善等の正当な理由・測定結果・責任所在（オーナー）をドキュメント/PRに明記した上での変更は許可する。
