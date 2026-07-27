# Plan 008: ルート単位の code-splitting を導入し、初期バンドルから recharts と全ページコードを外す

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進む。「STOP conditions」に
> 該当したら中断して報告する。`plans/README.md` は変更せず、実行結果を reviewer に
> 報告する。ステータス更新は reviewer が `reconcile` で行う。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- src/App.tsx src/pages/`
> 続けて `git diff --stat -- src/App.tsx src/pages/`、
> `git diff --cached --stat -- src/App.tsx src/pages/`、
> `git ls-files --others --exclude-standard -- src/App.tsx src/pages/`
> で unstaged / staged / untracked を個別に確認する。作業ツリーに既存変更があれば STOP。
> in-scope ファイルに差分がある場合、「Current state」の抜粋と実コードを照合し、
> 不一致なら STOP。

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `d267f0c`, 2026-07-04

## Why this matters

`src/App.tsx` は全10ページを静的 import しており、`src/` に `lazy` / `Suspense` は一切ない（執筆時点で grep 確認済み）。その結果、ログイン画面を開いただけのユーザーも、Dashboard ルートでしか使われない recharts（本アプリ最重量級の依存）を含む全ルートの JS をダウンロードする。ルート単位の `React.lazy` に切り替えることで、初期ロードをログインに必要な分だけに縮小し、recharts はダッシュボード初訪問時のチャンクに分離される。

## Current state

- `src/App.tsx:7-17` — 全ページの静的 import（執筆時点で確認済み）:

```tsx
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Cabins from "./pages/Cabins";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Account from "./pages/Account";
import Login from "./pages/Login";
import PageNotFound from "./pages/PageNotFound";
import Booking from "./pages/Booking";
import Checkin from "./pages/Checkin";
```

（`AppLayout` / `ProtectedRoute` / `DarkModeProvider` は全ルート共通なので静的 import のまま維持する。）

- recharts の import 箇所: `src/features/dashboard/SalesChart.tsx` と `src/features/dashboard/DurationChart.tsx` のみ。Dashboard ページ経由でしか到達しない。
- ローディング UI の既存コンポーネント: `src/ui/Spinner.tsx`（`ProtectedRoute` などで使用中。Suspense fallback に再利用する）。
- 対象は Dashboard、Bookings、Booking（`bookings/:bookingId`）、Checkin、Cabins、Users、Settings、Account、Login、PageNotFound の10ページ。
- 各ページは `export default` を持つ（`React.lazy` の要件。全10ページで要確認）。
- ページテスト: `src/pages/__tests__/` にあり、ページコンポーネントを直接 import しているため lazy 化の影響を受けない。

## Commands you will need

| 目的 | コマンド | 成功時の期待結果 |
|------|---------|-----------------|
| ビルド | `bun run build` | exit 0、`dist/assets/` に複数チャンク |
| 全テスト | `bun run test` | 全パス |
| Lint / 型 | `bun run lint && bun run typecheck` | exit 0 |
| 動作確認 | `bun run preview` | 起動しルート遷移できる |

## Scope

**In scope**:

- `src/App.tsx`

**Out of scope**（触らない）:

- `src/pages/` 配下（default export の確認のみ。変更はしない）
- `vite.config.ts` の manualChunks 設定（Vite の自動分割に任せる）
- `AppLayout` / `ProtectedRoute` の lazy 化（共通シェルは即時必要）

## Git workflow

- ブランチ: `advisor/008-code-splitting`
- 単一コミットで完結してよい: `perf(app): ページを React.lazy 化し初期バンドルを縮小`

## Steps

### Step 1: ビルドのベースラインを記録する

```bash
bun run build && ls -la dist/assets/
```

最大 JS チャンクのファイルサイズを控える（Done criteria の比較用）。

**Verify**: exit 0

### Step 2: ページ import を lazy 化する

最初に対象10ファイルすべての `export default` を確認し、1つでも欠ければ STOP。その後
`src/App.tsx` で全10ページを個別に変換する:

```tsx
import { lazy, Suspense } from "react";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Booking = lazy(() => import("./pages/Booking"));
const Checkin = lazy(() => import("./pages/Checkin"));
const Cabins = lazy(() => import("./pages/Cabins"));
const Users = lazy(() => import("./pages/Users"));
const Settings = lazy(() => import("./pages/Settings"));
const Account = lazy(() => import("./pages/Account"));
const Login = lazy(() => import("./pages/Login"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
```

`<Routes>` 全体を `Suspense` で包む（`BrowserRouter` の内側）:

```tsx
<BrowserRouter>
    <Suspense fallback={<Spinner />}>
        <Routes>
            {/* 既存のルート定義は変更しない */}
        </Routes>
    </Suspense>
</BrowserRouter>
```

`Spinner` は `src/ui/Spinner.tsx` から import する。

**Verify**: `bun run typecheck && bun run lint` → exit 0

### Step 3: 分割効果とアプリ動作を確認する

```bash
bun run build && ls -la dist/assets/
```

期待: JS チャンク数が増え、recharts を含むチャンクがエントリーチャンクから分離している（`grep -l recharts dist/assets/*.js` 相当で確認するか、チャンク名 `Dashboard-*.js` の存在で判断）。エントリーチャンクのサイズが Step 1 のベースラインより明確に減少している。

```bash
bun run preview
```

ブラウザ（または curl）で `/login` → ログイン → 各ルートに遷移し、白画面・無限スピナーがないこと。

**Verify**: `bun run test` → 全パス（App.test 系がある場合、Suspense により `findBy*` 待機が必要になったテストは async 化して修正）

## Test plan

- 既存のページテスト・App レベルのテストが回帰検出を担う。lazy 化でテストが非同期になる場合は `await screen.findBy...` へ書き換える（`@testing-library/react` の標準手法）。
- 新規テストは不要（構成変更のみ）。E2E 環境があれば `bun run test:e2e` の navigation.spec が実ブラウザでの遷移を検証してくれる。

## Done criteria

- [ ] 10ページすべてに `export default` が存在し、`Booking` が `bookings/:bookingId` のlazy要素として維持されている
- [ ] `grep -c "lazy(() => import" src/App.tsx` → `10`
- [ ] `bun run build` の dist でエントリーチャンクが縮小し、ページ別チャンクが生成されている
- [ ] `bun run test` / `bun run lint` / `bun run typecheck` がすべて exit 0
- [ ] `git diff --name-only` が `src/App.tsx`（+ 必要なら該当テスト）のみ
- [ ] 実行結果を reviewer に報告し、`plans/README.md` は変更していない

## STOP conditions

- いずれかのページが default export を持たない場合（named export の lazy 化は形が変わる — 対象を報告）
- lazy 化後に `bun run test` で3件以上のテストが失敗し、単純な async 化で解決しない場合
- ビルド後のチャンクにページ分割が現れない場合（Vite 設定が上書きしている可能性 — `vite.config.ts` を確認して報告。変更はしない）

## Maintenance notes

- 今後ページを追加する際も `lazy(() => import(...))` パターンを踏襲すること（1つでも静的 import に戻すとそのページはエントリーに巻き込まれる）。
- ルート遷移時のスピナーが目立つ場合、将来 `preload`（マウス hover 時の先読み）を検討できるが、本プランでは見送り。
- レビュー観点: `Suspense` が `ProtectedRoute` の外側/内側どちらにあるか（認証リダイレクトとローディングの相互作用に注意。本プランは Routes 全体を包む最小構成）。
