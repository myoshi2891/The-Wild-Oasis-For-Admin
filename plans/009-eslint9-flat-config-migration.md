# Plan 009: ESLint 9 + flat config + eslint-plugin-react-hooks v5 へ移行し、React 19 の hooks lint を有効化する

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進む。「STOP conditions」に
> 該当したら中断して報告する。完了したら `plans/README.md` のステータス行を更新する。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- .eslintrc.json package.json vite.config.ts`
> in-scope ファイルに差分がある場合、「Current state」の抜粋と実コードを照合し、
> 不一致なら STOP。

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED（`--max-warnings 0` 運用のため、新ルールの警告1件で CI が落ちる）
- **Depends on**: none（ただし他プランのコード変更と並行させず、単独ブランチで実施すること）
- **Category**: migration / dx
- **Planned at**: commit `d267f0c`, 2026-07-04

## Why this matters

lint はこのリポジトリの品質ゲートの根幹（CI とプロジェクトルールの両方が必須化）だが、ESLint 8 は EOL（修正提供終了）であり、`eslint-plugin-react-hooks` v4 は React 19 の hooks パターンを理解しない — つまり**ランタイムは React 19 なのに hooks の誤用を検出できない**状態にある。2026-06 のメジャーアップグレードでツール系は意図的に保留されたが、@typescript-eslint は既に v8（ESLint 9 / flat config 推奨）でバージョンの股裂きになっており、保留の期限が来た。flat config への移行と同時に実施する（この2つは実質1つの結合した移行）。

## Current state

- `package.json` devDependencies（執筆時点で確認済み）:

```json
"eslint": "^8.57.1",
"eslint-plugin-react-hooks": "^4.6.2",
"eslint-plugin-react": "^7.37.5",
"eslint-plugin-react-refresh": "^0.4.26",
"@typescript-eslint/eslint-plugin": "^8.60.1",
"@typescript-eslint/parser": "^8.60.1",
"vite-plugin-eslint2": "^5.1.0",
```

- `.eslintrc.json`（全28行、legacy eslintrc 形式）:

```json
{
    "env": { "browser": true, "es2020": true, "node": true },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react-hooks/recommended"
    ],
    "ignorePatterns": ["dist", "dist-ssr", "coverage", ".eslintrc.json", "node_modules"],
    "parser": "@typescript-eslint/parser",
    "plugins": ["react-refresh", "@typescript-eslint"],
    "rules": {
        "react-refresh/only-export-components": ["warn", { "allowConstantExport": true }],
        "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
        "no-unused-vars": "off",
        "no-mixed-spaces-and-tabs": "off"
    }
}
```

- lint スクリプト（`package.json`）: `eslint . --ext js,jsx,ts,tsx --report-unused-disable-directives --max-warnings 0`
  — ESLint 9 では `--ext` が廃止（flat config の `files` で指定）。スクリプトの書き換えが必要。
- `vite.config.ts` が `vite-plugin-eslint2` を使用（flat config 対応バージョンであることを要確認）。
- パッケージマネージャー: **bun のみ**（`bun add` / `bun remove` を使用。npm/yarn/pnpm 禁止）。

## Commands you will need

| 目的 | コマンド | 成功時の期待結果 |
|------|---------|-----------------|
| 依存更新 | `bun add -d eslint@^9 eslint-plugin-react-hooks@^5` | exit 0 |
| Lint | `bun run lint` | exit 0（移行完了後） |
| 型 / テスト | `bun run typecheck && bun run test` | exit 0 / 全パス |
| ルール差分確認 | `bunx eslint --print-config src/App.tsx` | 有効ルール一覧が出力される |

## Scope

**In scope**:

- `package.json`（devDependencies、`lint` スクリプト）
- `eslint.config.js`（新規作成）
- `.eslintrc.json`（削除）
- `vite.config.ts`（vite-plugin-eslint2 の設定調整が必要な場合のみ）
- 新ルールが検出した違反の修正（`src/`, `e2e/` の**最小限の**修正。1ファイルあたりの変更は警告解消に必要な行のみ）

**Out of scope**（触らない）:

- ルールセットの強化・追加（例: strict-type-checked への変更）— 移行は**現行ルールの等価再現**が原則。強化は別プラン
- Prettier 等フォーマッタの導入
- vitest / TypeScript のバージョン

## Git workflow

- ブランチ: `advisor/009-eslint9`（**他プランと並行させない** — lint 修正が広範囲に触るため conflict 源になる）
- コミット分割: ① 依存 + flat config 移行（lint がまだ落ちてよいのはこのコミットの作業中のみ）、② 新規違反の修正（モジュール単位に分割可）
- 形式例: `chore(lint): ESLint 9 + flat config へ移行`

## Steps

### Step 1: 移行前のベースラインを取る

```bash
bun run lint          # exit 0 を確認
bunx eslint --print-config src/App.tsx > /tmp/eslint-rules-before.txt
```

**Verify**: lint が exit 0、ルール一覧が保存されている

### Step 2: 依存を更新し flat config を作成する

1. `bun add -d eslint@^9 eslint-plugin-react-hooks@^5 globals @eslint/js typescript-eslint`
   （`typescript-eslint` は flat config 用の統合パッケージ。既存の `@typescript-eslint/eslint-plugin` / `parser` 個別指定は不要になれば `bun remove` で除去）
2. `eslint.config.js` を作成し、現行構成を等価再現する:
   - `@eslint/js` の recommended + `typescript-eslint` の recommended + `react-hooks` の recommended（v5 は flat config ネイティブ）
   - `react-refresh/only-export-components: ["warn", { allowConstantExport: true }]`
   - `@typescript-eslint/no-unused-vars: ["warn", { argsIgnorePattern: "^_" }]`、`no-unused-vars: off`、`no-mixed-spaces-and-tabs: off`
   - `ignores: ["dist", "dist-ssr", "coverage", "node_modules", "playwright-report", "test-results"]`
   - `languageOptions.globals`: `globals.browser` + `globals.node`
   - `files: ["**/*.{js,jsx,ts,tsx}"]`
3. `package.json` の lint スクリプトから `--ext js,jsx,ts,tsx` を削除（他のフラグは維持）。
4. `.eslintrc.json` を削除。

**Verify**: `bunx eslint src/App.tsx` がパースエラーなく実行される（違反の有無は問わない）

### Step 3: ルール等価性を確認する

```bash
bunx eslint --print-config src/App.tsx > /tmp/eslint-rules-after.txt
diff /tmp/eslint-rules-before.txt /tmp/eslint-rules-after.txt | head -50
```

差分は「バージョン起因の新ルール追加」のみが許容。**現行の4カスタムルールが消えていないこと**を確認する。

**Verify**: 4カスタムルール（react-refresh, no-unused-vars 系×2, no-mixed-spaces-and-tabs）が after 側に存在する

### Step 4: 新規違反を燃やし尽くす

```bash
bun run lint
```

react-hooks v5 の新ルール（React 19 対応の exhaustive-deps 強化等）が検出した違反を1件ずつ修正する。修正方針:

- 妥当な指摘 → コードを修正（最小差分）
- 誤検知・意図的なパターン → `// eslint-disable-next-line <rule> -- 理由` を付ける（理由必須）
- 判断がつかない違反が5件を超えたら STOP して一覧を報告

**Verify**: `bun run lint` → exit 0（`--max-warnings 0` で警告ゼロ）

### Step 5: 全ゲート + vite dev の確認

```bash
bun run typecheck && bun run test && bun run build
```

`vite-plugin-eslint2` が flat config を解決できることを `bun run dev` の起動ログで確認（エラーが出る場合はプラグインのオプションで flat config を明示するか、バージョンを更新）。

**Verify**: すべて exit 0 / 全パス

## Test plan

- コードの挙動変更はないため新規ユニットテストはなし。`bun run test` の全パスが回帰ゲート。
- Step 3 のルール等価性 diff が「lint 構成のテスト」に相当する。

## Done criteria

- [ ] `bunx eslint --version` が v9 系を表示
- [ ] `.eslintrc.json` が存在せず `eslint.config.js` が存在する
- [ ] `bun run lint` / `bun run typecheck` / `bun run test` / `bun run build` がすべて exit 0
- [ ] `package.json` に `eslint-plugin-react-hooks` v5 系が入っている
- [ ] eslint-disable 追加箇所すべてに理由コメントがある
- [ ] `plans/README.md` のステータス更新

## STOP conditions

- `vite-plugin-eslint2` が ESLint 9 / flat config に対応していない場合 — プラグインの更新 or 削除（lint を CLI/CI のみに寄せる）の判断はオペレーターに委ねる。報告して待つ
- Step 4 の新規違反が 30 件を超える場合 — 一覧を報告し、燃やし尽くすか段階導入かの判断を仰ぐ
- eslint-plugin-react-refresh が flat config で動作しない場合

## Maintenance notes

- 以後の lint ルール変更は `eslint.config.js` に集約される。`.eslintrc.*` を再作成しないこと。
- `eslint-plugin-react`（v7）は現行 config で未使用（extends に含まれていない）だが依存には残っている。次の依存整理で削除候補（本プランでは触らない）。
- レビュー観点: disable コメントの理由が正当か。ルール等価性 diff で意図せず消えたルールがないか。
