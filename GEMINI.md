# Project: The Wild Oasis

## 🎯 Project Overview

ホテルスタッフ向けの客室・予約・ゲスト管理アプリケーション。
React + Vite + Supabase (BaaS) によるシングルページアプリケーション構成。

## 🛠 Build & Test Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Preview: `npm run preview`

## 📐 Code Style

- ES Modules (`"type": "module"`)
- React 18 + JSX（`.jsx` 拡張子を使用）
- styled-components による CSS-in-JS スタイリング
- コンポーネントは1ファイル1コンポーネント
- カスタムフックは `use` プレフィックス必須
- Conventional Commits 形式でコミット
- コメントは日本語可、コード識別子は英語

## 🏗 Architecture

- エントリーポイント: `src/main.jsx`
- ルーティング: `src/App.jsx` (React Router DOM v6)
- 機能モジュール: `src/features/` (bookings, cabins, check-in-out, dashboard, authentication, settings)
- UIコンポーネント: `src/ui/`
- ページ: `src/pages/`
- APIサービス: `src/services/` (Supabase クライアント)
- カスタムフック: `src/hooks/`
- ユーティリティ: `src/utils/`
- 状態管理: React Query (@tanstack/react-query v4)
- コンテキスト: `src/context/` (DarkModeContext)

## 🔗 References

@./docs/spec.md
@./docs/design.md

## ⚠️ Constraints

- `.env` をコミットしない（Supabase キー含む）
- Supabase のテーブルスキーマを直接変更しない
- `node_modules/` 配下のファイルを変更しない
- styled-components のグローバルスタイルは `src/styles/GlobalStyles.js` に集約
- React Query のキャッシュ設定（staleTime: 0）を変更しない

## 🤖 Agent Behavior Preferences

- タスク開始前に Implementation Plan を必ず生成すること
- 不確実な場合は実装前に確認
- git commit はタスク単位で細かく行う
