---
activation: fileMatch
pattern: "**/*.{jsx,js}"
---

# React / JavaScript Coding Standards

## コンポーネント設計

- 関数コンポーネント + Hooks のみ使用（class コンポーネント禁止）
- 1ファイル1コンポーネント（default export）
- ファイル名は PascalCase（例: `BookingTable.jsx`）
- プレゼンテーション / コンテナの分離を意識する

## Hooks ルール

- カスタムフックは `use` プレフィックス必須（例: `useBookings`）
- フックは条件分岐・ループ内で呼び出さない
- 副作用は `useEffect` に集約し、依存配列を正確に記述
- データ取得は React Query の `useQuery` / `useMutation` を使用

## styled-components ルール

- インラインスタイルを使用しない（styled-components を使う）
- テーマトークンは CSS 変数（`var(--color-grey-50)` 等）を参照
- コンポーネントと同一ファイルにスタイルを定義

## インポート順序

1. React / React DOM
2. 外部ライブラリ（react-router-dom, @tanstack/react-query 等）
3. 内部モジュール（features, ui, services, hooks, utils）
4. スタイル / アセット

## エラーハンドリング

- API 呼び出しは try-catch で囲む
- ユーザー向けエラーメッセージは `react-hot-toast` で表示
- Error Boundary でクラッシュを防止

## 禁止事項

- `var` の使用（`const` / `let` を使う）
- `==` の使用（`===` を使う）— 意図的な型変換を除く
- `any` 型の使用（将来の TS 移行を見据えて）
- `console.log()` の本番コードへの残留
