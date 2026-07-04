# Plan 003: CI のサプライチェーン規約違反を修正し、キャッシュ・concurrency・pre-commit ゲートを整備する

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進む。「STOP conditions」に
> 該当したら中断して報告する。完了したら `plans/README.md` のステータス行を更新する。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- .github/workflows/ci.yml package.json`
> in-scope ファイルに差分がある場合、「Current state」の抜粋と実コードを照合し、
> 不一致なら STOP。

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security / dx
- **Planned at**: commit `d267f0c`, 2026-07-04

## Why this matters

このリポジトリ自身のルール `.claude/rules/01-engineering-standards.md` は「サードパーティ GitHub Actions は必ず 40 桁のコミット SHA にピン留めし、リリースバージョンのコメントを付ける」ことを MUST としているが、唯一のワークフロー `ci.yml` がこれに違反している（`actions/checkout@v4` は可変タグ）。可変タグはタグ所有者により差し替え可能で、サプライチェーン攻撃の入口になる。あわせて、同ルール群 `.claude/rules/02-tdd-step-commit.md` は「全コミットは lint / typecheck / test が green」を MUST とするがローカル強制手段（pre-commit hook）がなく、CI には依存キャッシュも古い実行のキャンセルもない。小さな変更4点で規約と実装の乖離を解消する。

## Current state

`.github/workflows/ci.yml`（全38行、執筆時点で確認済み）:

```yaml
on:
  push:
  pull_request:
# （concurrency ブロックなし）

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4          # ← 可変タグ（規約違反）

      - name: Setup Bun
        uses: oven-sh/setup-bun@ecf28ddc73e819eb6fa29df6b34ef8921c743461
        # ↑ SHA ピン済みだがバージョンコメントなし（規約違反）
        with:
          bun-version: 1.2.x

      - name: Install dependencies
        run: bun install --frozen-lockfile   # ← キャッシュなし
```

- pre-commit hook: `.husky/`, `lefthook.yml`, `.pre-commit-config.*` はいずれも存在しない（執筆時点で確認済み）。
- パッケージマネージャーは **bun 必須**（`docs/spec.md` の重要開発環境制約。npm/yarn/pnpm 禁止）。
- `package.json` の scripts: `lint` / `typecheck` / `test` が検証ゲート。

## Commands you will need

| 目的 | コマンド | 成功時の期待結果 |
|------|---------|-----------------|
| Lint | `bun run lint` | exit 0 |
| 型チェック | `bun run typecheck` | exit 0 |
| テスト | `bun run test` | 全パス |
| YAML 構文確認 | `bunx yaml-lint .github/workflows/ci.yml`（または actionlint が使えれば `bunx actionlint`） | エラーなし |

## Scope

**In scope**:

- `.github/workflows/ci.yml`
- `lefthook.yml`（新規）+ `package.json`（`prepare` スクリプトと devDependency 追加）
- `CLAUDE.md`（pre-commit hook の存在を1行追記）

**Out of scope**（触らない）:

- ワークフローのジョブ構成・テスト内容の変更（ゲートの追加・削除はしない）
- `src/`, `e2e/` 配下
- 他の `.claude/rules/*` ファイル

## Git workflow

- ブランチ: `advisor/003-ci-hardening`
- コミットは論理単位で分割: ① SHA ピン修正、② キャッシュ + concurrency、③ pre-commit hook
- コミット形式例: `ci: actions/checkout を SHA ピン留めし規約に準拠`
- push / PR はオペレーターの指示があるまで行わない

## Steps

### Step 1: actions を SHA ピン + バージョンコメントに統一する

1. `actions/checkout` の v4 系最新リリースのコミット SHA を GitHub のリリースページ（`https://github.com/actions/checkout/releases`）で確認し、`uses: actions/checkout@<40桁SHA> # v4.x.y` に置換する。
2. `oven-sh/setup-bun` の既存 SHA `ecf28ddc73e819eb6fa29df6b34ef8921c743461` がどのリリースに対応するかを `https://github.com/oven-sh/setup-bun/tags` で確認し、行末に `# v<version>` コメントを追加する（SHA がどのタグとも一致しない場合は STOP）。

**Verify**: `grep -E 'uses: .+@[0-9a-f]{40} # v' .github/workflows/ci.yml | wc -l` → `2`

### Step 2: concurrency とキャッシュを追加する

1. ワークフロー先頭（`permissions:` の近く）に追加:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

2. `bun install` の前に bun のインストールキャッシュを追加する。`actions/cache` を使う場合はそれも SHA ピン + バージョンコメント必須:

```yaml
      - name: Cache bun install cache
        uses: actions/cache@<40桁SHA> # v4.x.y
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('bun.lock') }}
          restore-keys: ${{ runner.os }}-bun-
```

**Verify**: `bunx actionlint`（利用可能なら）→ エラーなし。不可なら YAML としてパース可能なことを確認。

### Step 3: lefthook による pre-commit ゲートを導入する

1. `bun add -d lefthook`（devDependency 追加）
2. リポジトリルートに `lefthook.yml` を作成:

```yaml
pre-commit:
  parallel: true
  commands:
    lint:
      run: bun run lint
    typecheck:
      run: bun run typecheck
```

（`bun run test` は全件実行が重いため pre-commit には含めず、CI に委ねる。含めるかはオペレーター判断。）

3. `package.json` の scripts に `"prepare": "lefthook install"` を追加。
4. `CLAUDE.md` の Build & Test Commands 節に「pre-commit: lefthook が lint + typecheck を自動実行」と1行追記。

**Verify**: `bunx lefthook install && bunx lefthook run pre-commit` → lint と typecheck が実行され exit 0

### Step 4: 全ゲートを通す

**Verify**: `bun run lint && bun run typecheck && bun run test` → すべて exit 0

## Test plan

- CI 変更はワークフロー構文検証（Step 2）と、push 後の CI 実行成功で確認する（push はオペレーター承認後）。
- lefthook は Step 3 の `lefthook run pre-commit` が実テスト。
- 新規ユニットテストは不要（アプリコード変更なし）。

## Done criteria

- [ ] `ci.yml` 内のすべての `uses:` が `@<40桁SHA> # v...` 形式（`grep -E 'uses: .+@v[0-9]' .github/workflows/ci.yml` がヒットしない）
- [ ] `concurrency` ブロックと キャッシュステップが存在する
- [ ] `bunx lefthook run pre-commit` が exit 0
- [ ] `bun run lint && bun run typecheck && bun run test` がすべて exit 0
- [ ] `git status` で in-scope 外の変更がない
- [ ] `plans/README.md` のステータス更新

## STOP conditions

- `oven-sh/setup-bun` の既存 SHA がどの公開タグとも一致しない場合（改ざん・非公式コミットの可能性。報告して指示を仰ぐ）
- lefthook のインストールが bun 環境で失敗する場合（husky 等への切替は独断で行わず報告する）
- `actions/cache` 追加後に CI の install が失敗する場合

## Maintenance notes

- 以後、Actions のバージョン更新時は「SHA + バージョンコメント」形式を維持する（Dependabot/Renovate を導入する場合は SHA ピンを理解する設定にする）。
- lefthook はコミット速度に影響する。遅いと感じたら `lint` を lint-staged 相当（差分ファイルのみ）へ絞る改善余地がある。
- レビュー観点: SHA が本当に主張どおりのリリースタグを指しているか（タグページで照合）。
