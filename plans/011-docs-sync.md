# Plan 011: ドキュメントを実装と同期する — 過大表記の修正とバックエンドセットアップ手順の追加

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進む。「STOP conditions」に
> 該当したら中断して報告する。`plans/README.md` は変更せず、実行結果を reviewer に
> 報告する。ステータス更新は reviewer が `reconcile` で行う。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- README.md docs/ src/features/`
> 続けて `git diff --stat -- README.md docs/ src/features/`、
> `git diff --cached --stat -- README.md docs/ src/features/`、
> `git ls-files --others --exclude-standard -- README.md docs/ src/features/`
> で unstaged / staged / untracked を個別に確認する。作業ツリーに既存変更があれば STOP。
> `src/features/` に差分がある場合（特に guests/ ディレクトリや booking 作成機能の追加）、
> 本プランの「過大表記」前提が変わっている可能性がある。実装を確認してから進む。

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW（ドキュメントのみ）
- **Depends on**: none（Plan 001 が先に着地していれば新ガード `E2E_SUPABASE_URL_ALLOWLIST` も記載する）
- **Category**: docs
- **Planned at**: commit `d267f0c`, 2026-07-04

## Why this matters

ドキュメントが実装より広い機能を主張している。README はアプリが「ゲスト」を管理し「予約作成」を行うかのように読めるが、実装にはゲスト管理 UI も予約作成フォームも存在しない（予約は閲覧・ステータス遷移・削除のみ）。新規開発者はこの記述を信じて存在しない画面を探すことになる。また、`.env.example` の変数をどう入手するか（Supabase プロジェクトの作成・スキーマ適用・E2E ユーザー作成）を説明する文書がなく、クローン直後に `bun run dev` を動かす手順が事実上口伝である。マイナーなバージョン表記の乖離も併せて解消する。

## Current state

執筆時点で確認済みの乖離（各修正箇所の正確な行は編集時に再確認すること）:

1. **ゲスト管理の過大表記**:
   - `README.md` 概要: 「キャビン（客室）・予約・**ゲスト**・日常業務を管理」
   - `docs/spec.md:5`: 「客室、予約、**ゲスト**、および日々の業務を管理」— だが主要機能一覧（8-47行）にゲスト管理の節はない
   - 実装事実: `src/features/guests/` は存在せず、`src/services/` に `apiGuests.ts` はない（apiAuth/apiBookings/apiCabins/apiSettings のみ）。ゲストは bookings の join 経由の読み取り専用。

2. **予約作成の過大表記**:
   - `README.md` の予約ライフサイクル節: mermaid 図が `[*] --> unconfirmed : 予約作成` で始まり、本文に「予約作成時の初期ステート」とある
   - 実装事実: `src/features/bookings/` のフックは `useBooking` / `useBookings` / `useDeleteBooking` のみ。作成・編集フックは存在しない。`docs/spec.md:31-36` は正しく「一覧/詳細/フィルタ/削除」と書いている（spec が正、README が過大）。

3. **バージョン表記の乖離**（`docs/spec.md` の依存ライブラリ表）:
   - 「Vitest ~4.0」← 実際は `^4.1.8`、「Playwright ~1.46」← 実際は `^1.60.0`（`package.json` 執筆時点確認済み）

4. **セットアップ手順の欠落**: `.env.example` は `VITE_SUPABASE_URL` / `VITE_SUPABASE_KEY` / `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` を列挙するが、Supabase プロジェクト作成 → スキーマ適用（`docs/design.md` の ER 図参照）→ `cabin-images` ストレージバケット作成 → E2E ユーザー作成、という初回手順を説明する文書がない。

5. **spec の「完了の定義」**: E2E テスト基盤（Playwright、`e2e/` 8 spec）が導入済みだがチェックリストに項目がない。

## Commands you will need

| 目的 | コマンド | 成功時の期待結果 |
|------|---------|-----------------|
| Markdown lint | `bunx markdownlint-cli2 "README.md" "docs/**/*.md"`（`.markdownlint.json` がルート設定） | エラーなし |
| ゲート | `bun run lint && bun run typecheck` | exit 0（コード無変更の確認） |

## Scope

**In scope**:

- `README.md`
- `docs/spec.md`
- `docs/design.md`（ディレクトリ図の `hooks/` に `useLocalStorageState.ts` を追記する程度の軽微修正）

**Out of scope**（触らない）:

- コード（`src/`, `e2e/`）— ドキュメントを実装に合わせる。実装をドキュメントに合わせる方向の変更（ゲスト管理の実装等）は Plan 012 のスパイクの領分
- `CLAUDE.md` / `.claude/rules/`（別の管理体系）
- mermaid 図の全面的な書き直し（ラベル修正のみ）

## Git workflow

- ブランチ: `advisor/011-docs-sync`
- コミット形式例: `docs(readme): ゲスト・予約作成の記述を実装スコープに合わせて修正`
- ドキュメントのみでも各コミットで `bun run lint && bun run typecheck` を通す（プロジェクトルール）

## Steps

### Step 1: ゲスト表記を「読み取り専用」に修正する

- `README.md` 概要と guests テーブルの説明に「ゲスト情報は予約経由の**閲覧のみ**（登録・編集はアプリ外: シード/Supabase 直接操作）」の1文を追加。
- `docs/spec.md` の概要文を「客室、予約、および日々の業務を管理（ゲスト情報は予約経由で参照）」の形に修正。

**Verify**: `grep -n "ゲスト" README.md docs/spec.md` の各ヒット周辺が実装と矛盾しない

### Step 2: 予約作成の表記を修正する

- README の予約ライフサイクル節に「予約レコードはアプリ外（シード等）で作成される。本アプリはステータス遷移（チェックイン/アウト）と削除のみを担う」の注記を追加。
- mermaid 図の `[*] --> unconfirmed : 予約作成` ラベルを「予約登録（アプリ外）」等に修正。

**Verify**: README に予約作成 UI があるかのような記述が残っていない（`grep -n "予約作成" README.md` の各ヒットを目視確認）

### Step 3: バージョン表記と細部を同期する

- `docs/spec.md` の依存表: Vitest / Playwright のバージョンを `package.json` の現在値に合わせる（他の行も `package.json` と突き合わせて乖離があれば修正）。
- `docs/spec.md` の「完了の定義」に `- [x] Playwright による E2E テスト基盤が導入されている` を追加。
- `docs/design.md` のディレクトリ図の `hooks/` に `useLocalStorageState.ts` を追記。

**Verify**: 表の各行が `package.json` と一致する

### Step 4: 「初回バックエンドセットアップ」節を README に追加する

`README.md` の開発環境節の近くに以下の内容の節を追加する（コマンドではなく手順の説明でよい）:

1. Supabase プロジェクトを作成し、`docs/design.md` の ER 図に従って4テーブルを作成する
2. RLS を有効化する（Plan 002 が着地済みなら `supabase/policies/` を参照、と書く。未着地ならダッシュボードで設定と書く）
3. Storage に `cabin-images` バケット（公開読み取り）を作成する
4. Authentication でスタッフ用ユーザーを作成する（E2E 用は `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` と一致させる）
5. `.env.example` を `.env` にコピーして URL / anon キーを設定する（**実際の値は書かない**）
6. Plan 001 着地済みの場合: `E2E_SUPABASE_URL_ALLOWLIST` の設定にも言及する

**Verify**: 新節に実キー・実 URL・個人情報が含まれない（プレースホルダーのみ）

### Step 5: Markdown lint と最終確認

**Verify**: `bunx markdownlint-cli2 "README.md" "docs/**/*.md"` → エラーなし。`git diff --stat` が in-scope の3ファイルのみ。`bun run lint && bun run typecheck` → exit 0

## Test plan

- ドキュメント変更のためユニットテストなし。Step 5 の markdownlint が機械検証。
- 人間レビュー: 修正後の README を新規開発者の視点で読み、存在しない機能への言及が残っていないこと。

## Done criteria

- [ ] ゲスト・予約作成が「アプリ内で管理される」と読める記述が README / spec に残っていない
- [ ] 依存表のバージョンが `package.json` と一致
- [ ] 初回バックエンドセットアップ節が存在し、秘密値を含まない
- [ ] `bunx markdownlint-cli2` がエラーなし
- [ ] `git status` で in-scope 外の変更がない
- [ ] 実行結果を reviewer に報告し、`plans/README.md` は変更していない

## STOP conditions

- Drift check で `src/features/guests/` や予約作成フックが**存在する**ようになっていた場合（Plan 012 由来の実装が着地済み）— 本プランの前提が逆転しているので、記述の修正方向を報告して確認する
- README の構成が大きく変わっていて「Current state」の該当節が特定できない場合

## Maintenance notes

- Plan 012（予約作成スパイク）が実装に進んだら、Step 1-2 で入れた「アプリ外で作成」注記を**元に戻す**必要がある。スパイクの成果物にこの注記の更新を含めること。
- `.claude/rules/02-tdd-step-commit.md` の MUST（機能変更時の spec/design 同期）が守られていれば本プランのような乖離は再発しない。PR テンプレートに「docs 同期チェック」を足すのも一案（本プランでは見送り）。
