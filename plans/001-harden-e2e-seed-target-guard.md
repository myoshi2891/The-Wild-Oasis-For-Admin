# Plan 001: E2E シードスクリプトの接続先ガードを「テスト DB であることの積極的検証」に強化する

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進む。「STOP conditions」に
> 該当したら中断して報告する（独自判断で回避しない）。`plans/README.md` は変更せず、
> 実行結果を reviewer に報告する。ステータス更新は reviewer が `reconcile` で行う。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- e2e/seed.ts .env.example docs/spec.md docs/design.md`
> 続けて `git diff --stat -- e2e/seed.ts .env.example docs/spec.md docs/design.md`、
> `git diff --cached --stat -- e2e/seed.ts .env.example docs/spec.md docs/design.md`、
> `git ls-files --others --exclude-standard -- e2e/seed.ts .env.example docs/spec.md docs/design.md`
> で unstaged / staged / untracked を個別に確認する。作業ツリーに既存変更があれば STOP。
> in-scope ファイルに差分がある場合、「Current state」の抜粋と実コードを照合し、
> 不一致なら STOP。

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `d267f0c`, 2026-07-04

## Why this matters

`e2e/seed.ts` は bookings / guests / cabins の**全行削除**を行う破壊的スクリプトである。現在の「テスト環境ガード」は `.env.test` ファイルが**存在するかどうか**だけで判定しており、接続先 URL がテスト用 Supabase プロジェクトであることを一切検証しない。シェルに本番用 `VITE_SUPABASE_URL` / `VITE_SUPABASE_KEY` が export 済みの端末では、env ファイルの値より**シェル環境変数が優先される**実装のため、空の `.env.test` が存在するだけで `--force-seed` 実行が本番 DB を全削除しうる。接続先そのものを検証する肯定的ガードを追加し、この経路を塞ぐ。

## Current state

- `e2e/seed.ts` — シードスクリプト本体。関連箇所:

`.env.test` の存在のみで「テスト環境」と判定している（`e2e/seed.ts:40` 付近）:

```ts
if (fs.existsSync(envPath)) {
    if (file === ".env.test") isTestEnvLoaded = true;
```

シェル環境変数が env ファイルの値より優先される（`e2e/seed.ts:58` 付近）:

```ts
if (process.env[key] === undefined) {
    process.env[key] = value;
}
```

`main()` のガード（`e2e/seed.ts:560-577` 付近）は `--force-seed` / `ALLOW_DESTRUCTIVE_SEED` と `isTestEnvLoaded` / `NODE_ENV=test` / `ALLOW_NON_TEST_SEED` を検査するが、**解決済みの接続先 URL は検査しない**。

`deleteAll()`（`e2e/seed.ts:398-408` 付近）が破壊的操作の実体:

```ts
const { error: errBk } = await supabase.from("bookings").delete().gt("id", 0);
```

- リポジトリ規約: `docs/spec.md` の「重要E2E環境制約」と `docs/design.md` の「シードデータの保護と仕様」が現行ガードを文書化している。ガード仕様を変更したら**両ドキュメントの該当節も更新する**こと（`.claude/rules/02-tdd-step-commit.md` の MUST）。
- コメントは日本語、識別子は英語（リポジトリ規約）。既存のエラーメッセージも日本語なので合わせる。

## Commands you will need

| 目的 | コマンド | 成功時の期待結果 |
|------|---------|-----------------|
| 型チェック | `bun run typecheck` | exit 0 |
| Lint | `bun run lint` | exit 0 |
| ユニットテスト | `bun run test` | 全パス |
| ガード動作確認（DB 接続なし） | 下記 Step 3 参照 | ブロックメッセージで exit 1 |

## Scope

**In scope**（変更してよいファイル）:

- `e2e/seed.ts`
- `.env.example`（新変数の追記）
- `docs/spec.md` / `docs/design.md`（ガード仕様の記述更新）

**Out of scope**（触らない）:

- `src/` 配下すべて
- `playwright.config.ts`、`e2e/*.spec.ts`
- 既存ガード（`--force-seed` / `ALLOW_DESTRUCTIVE_SEED` / `ALLOW_NON_TEST_SEED`）の削除・緩和 — 本プランは**追加**のみ

## Git workflow

- ブランチ: `advisor/001-harden-seed-guard`
- コミット形式: Conventional Commits（例: `fix(e2e): seed 実行前に接続先がテスト DB であることを検証`）
- push / PR はオペレーターの指示があるまで行わない

## Steps

### Step 1: テスト DB 許可リスト変数を導入する

`e2e/seed.ts` の env 読み込み完了後・Supabase クライアント生成前に、接続先検証関数を追加する:

- 新しい環境変数 `E2E_SUPABASE_URL_ALLOWLIST`（カンマ区切りの URL プレフィックス）を導入。
- 解決済みの `process.env.VITE_SUPABASE_URL` が許可リストのいずれかのプレフィックスで始まらない場合、日本語のエラーメッセージ（既存ガードの文体に合わせる）を表示して `process.exit(1)`。
- `ALLOW_NON_TEST_SEED` が `true`/`1` の場合のみこの検証をスキップ可能とする（既存のオプトイン思想と整合させる）。
- `.env.example` に `E2E_SUPABASE_URL_ALLOWLIST=` をプレースホルダーとコメント付きで追記。

**Verify**: `bun run typecheck` → exit 0

### Step 2: main() のガード連鎖に接続先検証を組み込む

`main()` 内の既存2ガード（`--force-seed` 検査、非テスト環境検査）の**直後**に Step 1 の検証呼び出しを追加する。ガードの順序: ① 破壊フラグ → ② テスト環境判定 → ③ 接続先許可リスト。

**Verify**: `bun run lint && bun run typecheck` → 両方 exit 0

### Step 3: ガードの動作を DB なしで確認する

```bash
# 許可リスト未設定 + ダミー URL → ブロックされること
VITE_SUPABASE_URL="https://example.supabase.co" VITE_SUPABASE_KEY="dummy" \
  bun run e2e/seed.ts --force-seed
```

期待: 接続先検証のブロックメッセージを表示して exit 1（`echo $?` が `1`）。DB への接続・削除は発生しない。

```bash
# 許可リスト一致 → ガード通過（その後の実接続エラーは許容）
VITE_SUPABASE_URL="https://example.supabase.co" VITE_SUPABASE_KEY="dummy" \
  E2E_SUPABASE_URL_ALLOWLIST="https://example.supabase.co" \
  bun run e2e/seed.ts --force-seed
```

期待: 接続先ガードは通過し、「シードデータ注入開始」ログの後、ダミー接続先への接続エラーで失敗する（ガード以外の理由での失敗は正常）。

### Step 4: ドキュメントを同期する

`docs/spec.md` の「重要E2E環境制約」と `docs/design.md` の「シードデータの保護と仕様」に、接続先許可リスト検証（`E2E_SUPABASE_URL_ALLOWLIST`）の説明を1〜2文で追記する。

**Verify**: `git diff --stat docs/` → 2ファイルのみ変更

## Test plan

- 本スクリプトはユニットテストの対象外（`vitest` は `src/` のみ）。Step 3 の手動検証コマンド2本が実質のテスト。
- 追加で `bun run test` を実行し、既存 70+ テストファイルに影響がないこと（seed.ts は import されていないので影響なしが期待値）。

## Done criteria

すべて成立すること:

- [ ] `bun run lint` / `bun run typecheck` / `bun run test` がすべて exit 0
- [ ] Step 3 の1本目が exit 1 かつブロックメッセージ表示
- [ ] `.env.example` に `E2E_SUPABASE_URL_ALLOWLIST` が存在（`grep E2E_SUPABASE_URL_ALLOWLIST .env.example` がヒット）
- [ ] `docs/spec.md` と `docs/design.md` に新ガードの記述がある
- [ ] `git status` で in-scope 外のファイルに変更がない
- [ ] 実行結果を reviewer に報告し、`plans/README.md` は変更していない

## STOP conditions

以下の場合は中断して報告する:

- `e2e/seed.ts` のガード構造が「Current state」の抜粋と大きく異なる（ドリフト）
- 既存の E2E パイプライン（`bun run test:e2e`）が許可リスト必須化によって CI で壊れることが判明した場合 — CI 側の環境変数設定はこのプランの範囲外なので、必要な CI 変更を報告して指示を仰ぐ
- Step 3 の検証で、ガード追加**前**からブロックされない経路が他に見つかった場合

## Maintenance notes

- CI や新しい開発端末で E2E を動かす際は `E2E_SUPABASE_URL_ALLOWLIST` の設定が必須になる。オンボーディング文書（Plan 011 参照）に反映すること。
- テスト用 Supabase プロジェクトを作り直したら許可リストの更新が必要。
- レビュー観点: ガードが「削除処理より前」に評価されること、`ALLOW_NON_TEST_SEED` によるスキップが意図した1箇所だけであること。
