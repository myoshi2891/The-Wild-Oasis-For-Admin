---
name: spec-sync-after-test
description: >
  Keeps spec documents and design logs in sync after test implementation or fixes.
  Updates quantitative metrics (test count, suite count, type error count).
  Triggered by: "仕様書更新", "ドキュメント更新", "テスト後の仕様同期",
  "spec sync after test", "update docs after test", "テスト実装後の更新".
invocation: automatic
allowed-tools: [Read, Grep, Glob, Bash, Edit, Write]
---

# Spec Sync After Test スキル

## 目的

テスト実装・修正が完了した後、関連する仕様書・設計ドキュメントを**最新かつ一貫した状態**に保ち、実装とドキュメントの乖離（ドリフト）を防ぐ。

---

## 更新対象ドキュメント

| ファイル | 更新内容 |
|---------|---------|
| `docs/spec.md` | 機能仕様に変更や追加があった場合、対象セクションを更新。 |
| `docs/design.md` | コンポーネント構造、カスタムフック、APIサービスなどの設計を変更した場合に更新。 |
| `docs/tasks.md` | 進捗状況やTODOリストを最新の状態に更新。 |

---

## 実行手順

### Step 1｜最新テスト統計を取得する

以下のコマンドを実行し、最新のテスト統計を取得します。

```bash
bun run test
```

出力から以下を記録します：
- `Tests: X passed, Y total` （テスト総数・成功数）
- `Test Suites: X passed, Y total` （テストスイート数）

### Step 2｜型エラー件数を確認する

以下のコマンドを実行して TypeScript のコンパイルエラーがないことを確認します。

```bash
bunx tsc --noEmit
```

### Step 3｜`docs/spec.md` または `docs/design.md` を更新する

テスト追加やバグ修正によって、設計上の前提、新規コンポーネント、または機能仕様に変更があった場合は、該当するドキュメント（[spec.md](docs/spec.md) または [design.md](docs/design.md)）を速やかに更新します。

更新内容の要約を Git コミットメッセージに記載できる状態に整理します。

### Step 4｜変更をコミットする

ドキュメントの更新が完了したら、Git コミットを実行します。
コミットメッセージには Conventional Commits 形式（例: `docs(spec): update component specifications for ...`）を使用します。

---

## 禁止事項

- 実測値（実際のテスト実行結果）を確認せずに、推測でドキュメントのテスト結果記述を更新すること。
- コードの実装変更をドキュメント（`spec.md` など）に反映させず、乖離した状態のまま PR を作成すること。
