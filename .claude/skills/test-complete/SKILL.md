---
name: test-complete
description: >
  Runs unit tests (Vitest), optional E2E tests (Playwright), TypeScript type check,
  and ESLint, then reports results with pass/fail details and commit readiness.
  Triggered by: "テスト実行", "テスト確認", "カバレッジ確認", "品質チェック",
  "テストチェック", "コミット前確認", "test run", "run tests", "check coverage",
  "quality check", "pre-commit check".
invocation: automatic
allowed-tools: [Bash, Read, Grep]
---

# Test Complete スキル

## 目的

コミット前にユニットテスト（Vitest）・型チェック・リントを実行し、結果をレポートしてコミット可能かを判定する。E2E テストは明示的な指定または必要に応じて実行する。

---

## 実行手順

### Step 1｜実行内容を決定する

| 条件 | 実行内容 |
|------|---------|
| デフォルト | ユニットテスト + 型チェック + リント |
| 「E2Eも含めて」と指定あり | 上記 + Playwright E2E テスト |

---

### Step 2｜ユニットテストを実行する (Vitest)

```bash
# 全テスト実行
bun run test

# 特定のファイルのみ実行
bun run test -- <pattern>
```

出力から以下を抽出します：
- テスト総数・成功数・失敗数・スキップ数
- 失敗したテストのファイル名、テスト名、エラー内容

---

### Step 3｜型チェックを実行する

```bash
bunx tsc --noEmit
```

エラーが検出された場合はファイル名、行番号、エラーメッセージを抽出します。

---

### Step 4｜リントを実行する

```bash
bun run lint
```

エラー・警告が検出された場合はファイル名、行番号、ルール名を抽出します。

---

### Step 5｜E2E テストを実行する（Playwright、必要な場合のみ）

```bash
# シードデータを投入
bun run seed:e2e

# テスト実行
bunx playwright test
```

---

### Step 6｜レポートを出力する

以下のフォーマットで実行結果をレポートします。

```markdown
## テスト実行結果

### ユニットテスト（Vitest）
- 実行: [総数] tests
- 成功: [成功数] passed
- 失敗: [失敗数] failed
- スキップ: [スキップ数] skipped

### 型チェック（TypeScript）
- ステータス: ✅ エラーなし / ❌ [N] errors

### リント（ESLint）
- ステータス: ✅ エラーなし / ❌ [N] errors

### E2E テスト（Playwright）（実行した場合のみ）
- 実行: [総数] tests
- 成功: [成功数] passed
- 失敗: [失敗数] failed

---

### コミット判定
- ✅ コミット可能（全チェック通過）
- ❌ コミット不可（エラーあり）
```

---

## 重要ルール

### ❌ 絶対禁止
- `it.skip()` や `describe.skip()` をコミットに残すこと（デバッグ用の一時的なスキップを除く）。
- `// @ts-ignore` を安易に使用して型チェックをパスさせること。
- デバッグ用 `console.log` をコミットに残すこと。

### ✅ 必須
- コミット前には必ず `npx tsc --noEmit` および `bun run lint` を実行し、クリーンな状態を維持する。
