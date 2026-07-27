# Plan 009: ESLint 9 + flat config + eslint-plugin-react-hooks v5 へ移行し、React 19 の hooks lint を有効化する

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進む。「STOP conditions」に
> 該当したら中断して報告する。`plans/README.md` は変更せず、実行結果を reviewer に
> 報告する。ステータス更新は reviewer が `reconcile` で行う。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- .eslintrc.json package.json vite.config.ts`
> 続けて `git diff --stat -- .eslintrc.json package.json vite.config.ts`、
> `git diff --cached --stat -- .eslintrc.json package.json vite.config.ts`、
> `git ls-files --others --exclude-standard -- .eslintrc.json package.json vite.config.ts`
> で unstaged / staged / untracked を個別に確認する。作業ツリーに既存変更があれば STOP。
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
3. `package.json` の lint スクリプトを
   `eslint . --report-unused-disable-directives --max-warnings 0` に変更する
   （`--ext js,jsx,ts,tsx` だけを削除し、警告0件のゲートは維持）。
4. `.eslintrc.json` を削除。

**Verify**: `bunx eslint src/App.tsx` がパースエラーなく実行される（違反の有無は問わない）

### Step 3: ルール等価性を確認する

```bash
bunx eslint --print-config src/App.tsx > /tmp/eslint-rules-after.txt
DIFF_STATUS=0
diff -u /tmp/eslint-rules-before.txt /tmp/eslint-rules-after.txt > /tmp/eslint-rules.diff || DIFF_STATUS=$?
if [ "$DIFF_STATUS" -gt 1 ]; then
    exit "$DIFF_STATUS"
fi
cat /tmp/eslint-rules.diff

bun -e '
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import globals from "globals";

const before = JSON.parse(readFileSync("/tmp/eslint-rules-before.txt", "utf8"));
const after = JSON.parse(readFileSync("/tmp/eslint-rules-after.txt", "utf8"));
// ignores は eslint.config.js から別途照合するため、非ルール比較対象から除外する。
// これにより legacy の ignorePatterns と flat config の ignores フィールドが
// normalizeNonRuleConfig の比較に混入しないことを保証する。
const { rules: beforeRules = {}, ignores: _beforeIgnores, ...beforeRest } = before;
const { rules: afterRules = {}, ignores: _afterIgnores, ...afterRest } = after;

const ecmaEnvVersions = {
    es6: 2015,
    es2017: 2017,
    es2020: 2020,
};
const normalizeEcmaVersion = (value) => {
    if (typeof value !== "number" || value <= 5 || value >= 2015) return value;
    return value + 2009;
};
const normalizeParser = (parser) => {
    const name = (typeof parser === "string" ? parser : parser?.meta?.name)
        ?.replaceAll("\\", "/");
    const packageName =
        name?.match(/(?:^|\/)node_modules\/((?:@[^/]+\/)?[^/]+)/)?.[1] ?? name;
    return packageName
        ?.replace(/@[\d][^@]*$/, "")
        .replace(/^typescript-eslint\/parser$/, "@typescript-eslint/parser");
};
const normalizePlugins = (plugins = []) =>
    [...new Set(Array.isArray(plugins) ? plugins : Object.keys(plugins))]
        .filter((name) => name !== "@")
        .sort();
const sortObject = (value) =>
    Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
const normalizeNonRuleConfig = (config) => {
    const {
        env = {},
        globals: legacyGlobals = {},
        parser: legacyParser,
        parserOptions: legacyParserOptions = {},
        languageOptions = {},
        plugins,
        ignorePatterns: _ignorePatterns,
        language,
        ...rest
    } = config;
    const {
        parser: flatParser,
        parserOptions: flatParserOptions = {},
        globals: flatGlobals = {},
        ecmaVersion: flatEcmaVersion,
        sourceType: flatSourceType,
        ...languageOptionsRest
    } = languageOptions;
    const normalizedGlobals = { ...legacyGlobals, ...flatGlobals };
    for (const [name, enabled] of Object.entries(env)) {
        if (!enabled || Object.hasOwn(ecmaEnvVersions, name)) continue;
        assert.ok(Object.hasOwn(globals, name), `未対応の legacy env: ${name}`);
        Object.assign(normalizedGlobals, globals[name]);
    }
    const envEcmaVersion = Math.max(
        0,
        ...Object.entries(env)
            .filter(([, enabled]) => enabled)
            .map(([name]) => ecmaEnvVersions[name] ?? 0)
    );
    const parserOptions = {
        ...legacyParserOptions,
        ...flatParserOptions,
    };
    const ecmaVersion = normalizeEcmaVersion(
        (flatEcmaVersion ?? parserOptions.ecmaVersion ?? envEcmaVersion) || undefined
    );
    const sourceType = flatSourceType ?? parserOptions.sourceType;
    delete parserOptions.ecmaVersion;
    delete parserOptions.sourceType;

    return {
        ...rest,
        ...(language && language !== "@/js" ? { language } : {}),
        languageOptions: {
            ...languageOptionsRest,
            parser: normalizeParser(legacyParser ?? flatParser),
            parserOptions,
            globals: sortObject(normalizedGlobals),
            ...(ecmaVersion === undefined ? {} : { ecmaVersion }),
            ...(sourceType === undefined ? {} : { sourceType }),
        },
        plugins: normalizePlugins(plugins),
    };
};

assert.deepStrictEqual(
    normalizeNonRuleConfig(afterRest),
    normalizeNonRuleConfig(beforeRest),
    "rules 以外に未許可の差分がある（ignores は eslint.config.js から別途検証する）"
);
for (const [name, value] of Object.entries(beforeRules)) {
    assert.ok(Object.hasOwn(afterRules, name), `既存ルールが削除された: ${name}`);
    assert.deepStrictEqual(
        afterRules[name],
        value,
        `既存ルールの設定が変わった: ${name}`
    );
}

const customRules = [
    "react-refresh/only-export-components",
    "@typescript-eslint/no-unused-vars",
    "no-unused-vars",
    "no-mixed-spaces-and-tabs",
];
for (const name of customRules) {
    assert.ok(Object.hasOwn(afterRules, name), `カスタムルールがない: ${name}`);
}

const flatConfig = (
    await import(pathToFileURL(resolve("eslint.config.js")).href)
).default.flat(Infinity);
const actualIgnores = flatConfig.flatMap(({ ignores = [] }) => ignores);
assert.deepStrictEqual(
    actualIgnores,
    [
        "dist",
        "dist-ssr",
        "coverage",
        "node_modules",
        "playwright-report",
        "test-results",
    ],
    "ignores が Step 2 の許可リストと一致しない"
);
'
```

`/tmp/eslint-rules.diff` の全行を確認する（省略・先頭行だけの確認は禁止）。
差分は after 側に追加された「バージョン起因の新ルール」と、Step 2 で明示した ignores
（既存対象を維持し、`playwright-report` と `test-results` を追加）のみを許容する。
上の判定は legacy の `env` / `globals`、`parser` / `parserOptions` と flat config の
`languageOptions`、および両形式の `plugins` を共通表現に正規化してから rules 外を比較する。
ignores は `eslint.config.js` から許可リストと別途照合し、それ以外の rules 外の差分、
既存ルールの削除・値変更、4カスタムルールの欠落があれば非0で失敗する。
追加された各ルールが依存更新に由来することも完全な diff 上で確認し、説明できない追加が
1件でもあれば `exit 1` として STOP する。

**Verify**: 上の機械判定が exit 0 で、4カスタムルール
（react-refresh, no-unused-vars 系×2, no-mixed-spaces-and-tabs）が after 側に存在し、
ignores が Step 2 の6対象と一致し、完全な diff のその他の差分がバージョン起因の
新ルール追加だけである

### Step 4: 新規違反を燃やし尽くす

```bash
bun run lint
```

react-hooks v5 の新ルール（React 19 対応の exhaustive-deps 強化等）が検出した違反を1件ずつ修正する。修正方針:

- 妥当な指摘 → コードを修正（最小差分）
- 誤検知・意図的なパターン → `// eslint-disable-next-line <rule> -- 理由` を付ける（理由必須）
- 判断がつかない違反が5件を超えたら即時 STOP して一覧を報告（新規違反数の停止基準はこの1つだけとする）

**Verify**: `bunx eslint . --report-unused-disable-directives --max-warnings 0`
→ exit 0、警告ゼロ（`package.json` の `lint` スクリプトも同じフラグを持つこと）

### Step 5: 全ゲート + vite dev の確認

```bash
bun run typecheck && bun run test && bun run build

DEV_LOG="$(mktemp)"
bun run dev -- --host 127.0.0.1 >"$DEV_LOG" 2>&1 &
DEV_PID=$!
cleanup_dev() {
    kill "$DEV_PID" 2>/dev/null || true
    wait "$DEV_PID" 2>/dev/null || true
    rm -f "$DEV_LOG"
}
trap cleanup_dev EXIT INT TERM

DEV_READY=0
DEV_FAILURE=""
DEV_REJECTED_ERROR='error([[:space:]]|:)|failed to|could not|couldn.t find|cannot|no eslint configuration found|configerror|vite-plugin-eslint2.*(invalid|not found)|flat[- ]config.*(invalid|not found)|eslint\.config.*(invalid|not found)'
dev_is_running() {
    if ! kill -0 "$DEV_PID" 2>/dev/null; then
        return 1
    fi
    DEV_STATE="$(ps -o stat= -p "$DEV_PID" 2>/dev/null)" || return 1
    [ -n "$DEV_STATE" ] || return 1
    case "$DEV_STATE" in
        *Z*|*T*|*X*) return 1 ;;
    esac
}
dev_has_rejected_error() {
    grep -Eiq "$DEV_REJECTED_ERROR" "$DEV_LOG"
}

# 成功条件: (a) プロセスが正常に稼働している (b) "ready in" メッセージが出た
# (c) 起動前・起動後のログ全体に拒否対象のエラーがない — この3条件すべてが必要。
# 失敗条件: タイムアウト / 異常終了 / 拒否エラー検出（vite-plugin-eslint2 や
# flat config 解決失敗を含む）のいずれかでログを表示して exit 1 する。
for DEV_ATTEMPT in {0..30}; do
    # ループの先頭でエラーを確認（readiness より前のエラーを即捕捉）
    if dev_has_rejected_error; then
        DEV_FAILURE="Vite の起動ログに拒否対象のエラーがある（ready 前）"
        break
    fi
    if ! dev_is_running; then
        DEV_FAILURE="Vite プロセスが ready 前に異常終了した"
        break
    fi
    if grep -q "ready in" "$DEV_LOG"; then
        DEV_READY=1
        break
    fi
    if [ "$DEV_ATTEMPT" -lt 30 ]; then
        sleep 1
    fi
done

if [ -z "$DEV_FAILURE" ] && [ "$DEV_READY" -ne 1 ]; then
    DEV_FAILURE="Vite が30秒以内に \"ready in\" メッセージを出さなかった（タイムアウト）"
fi

# ready 後に遅れて出る vite-plugin-eslint2 / flat-config 解決エラーも検出する。
# "ready in" が出ても plugin がエラーを出して落ちるケースがあるため、
# 2秒間ログとプロセス状態を監視して両方正常であることを確認する。
if [ -z "$DEV_FAILURE" ]; then
    for _ in 1 2; do
        sleep 1
        if dev_has_rejected_error; then
            DEV_FAILURE="Vite の ready 後ログに拒否対象のエラーがある（vite-plugin-eslint2 / flat-config 解決失敗の可能性）"
            break
        fi
        if ! dev_is_running; then
            DEV_FAILURE="Vite プロセスが ready 後に異常終了した"
            break
        fi
    done
fi

# 判定直前の最終ポーリング — ログへの遅延書き込みとプロセス状態を再確認する。
if [ -z "$DEV_FAILURE" ] && dev_has_rejected_error; then
    DEV_FAILURE="Vite の最終確認ログに拒否対象のエラーがある"
fi
if [ -z "$DEV_FAILURE" ] && ! dev_is_running; then
    DEV_FAILURE="Vite プロセスが最終確認前に異常終了した"
fi

if [ -n "$DEV_FAILURE" ]; then
    echo "FAIL: $DEV_FAILURE"
    echo "--- Vite ログ ---"
    cat "$DEV_LOG"
    exit 1
fi
```

`bun run dev` はバックグラウンドで起動し、最大30秒以内に Vite の `ready in` ログが
出た後も2秒間正常に稼働し、起動前・起動後のログ全体に拒否対象のエラーがないことを
成功条件とする。`vite-plugin-eslint2`、flat config / `eslint.config` の解決失敗を含む
エラー、異常終了、タイムアウト時はログを表示して失敗し、成功・失敗のどちらでも
`trap` でプロセスを停止して一時ログを削除する。プラグインのエラーが出る場合は
オプションで flat config を明示するか、バージョンを更新する。

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
- [ ] 実行結果を reviewer に報告し、`plans/README.md` は変更していない

## STOP conditions

- `vite-plugin-eslint2` が ESLint 9 / flat config に対応していない場合 — プラグインの更新 or 削除（lint を CLI/CI のみに寄せる）の判断はオペレーターに委ねる。報告して待つ
- Step 4 で判断がつかない新規違反が5件を超える場合 — 即時STOPし、一覧を報告して判断を仰ぐ
- eslint-plugin-react-refresh が flat config で動作しない場合

## Maintenance notes

- 以後の lint ルール変更は `eslint.config.js` に集約される。`.eslintrc.*` を再作成しないこと。
- `eslint-plugin-react`（v7）は現行 config で未使用（extends に含まれていない）だが依存には残っている。次の依存整理で削除候補（本プランでは触らない）。
- レビュー観点: disable コメントの理由が正当か。ルール等価性 diff で意図せず消えたルールがないか。
