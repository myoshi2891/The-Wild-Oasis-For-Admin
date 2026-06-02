---
name: spec-sync-check
description: >
  Detects and reports divergences across implementation, design, and specifications.
  Never auto-fixes — always reports to the human for judgment.
  Triggered by: "仕様確認", "仕様同期", "spec確認", "仕様書チェック",
  "仕様と実装の整合性", "仕様乖離", "ルール確認", "規約整合性チェック",
  "ドリフト確認", "skill 整合", "rule 整合", "spec check", "sync check".
invocation: automatic
allowed-tools: [Read, Grep, Bash]
---

# Spec Sync Checker スキル

## 目的

実装コードと仕様書・設計書（`docs/spec.md`, `docs/design.md`, `docs/tasks.md`）の間で発生する乖離（ドリフト）を検出し、人間に報告するスキル。
乖離の自動修正は絶対に行わず、実装とドキュメントのどちらが正しいかは開発者が判断する。

---

## 実行手順

### Step 1｜変更ファイルを特定し、検査範囲を決定する

```bash
git status
git diff --name-only HEAD
git log --oneline -5
```

### Step 2｜関連する仕様書・規約ドキュメントを読み込む

仕様や設計に関わるファイル変更がある場合、[spec.md](docs/spec.md) および [design.md](docs/design.md) を読み込みます。

---

### Step 3｜乖離を検出する

以下のチェックリストに従って、コードと仕様の不整合を精査します。

#### 1. 機能仕様の乖離 (`docs/spec.md`)
* 新規追加または削除された機能が `docs/spec.md` に記載されているか。
* ビジネスルール（例: 割引やチェックイン/アウト時の制約）がコード内のロジックと一致しているか。

#### 2. 設計・アーキテクチャの乖離 (`docs/design.md`)
* 新規コンポーネント、カスタムフック、APIサービス（`src/services/` 内）が `docs/design.md` に定義されている設計と整合しているか。
* styled-components のグローバルスタイル適用（`src/styles/GlobalStyles.ts`）に違反していないか。

#### 3. 禁止事項チェック（静的解析/Grepによる確認）
必要に応じて、以下の grep を実行し、規約違反を検出します。

```bash
# D-1: デバッグ用 console.log の残留チェック
grep -rn "console\.log(" src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\."

# D-2: TypeScript の any 使用チェック
grep -rn ": any" src/ --include="*.ts" --include="*.tsx" | grep -v "\.test\."

# D-3: styled-components が各コンポーネントまたは GlobalStyles に正しく閉じているか
# (グローバルなインライン CSS 指定がないかなどの目視確認)
```

---

### Step 4｜レポートを出力する

乖離を検出した場合、以下のフォーマットで開発者に報告します。

```markdown
## 仕様・規約同期チェック結果

### 検出された乖離

#### 🔴 仕様 ↔ 実装の乖離
**内容**: [乖離している内容]
- 実装: [実際のコードの状態]
- 仕様書: [docs/spec.md 内の記述]
- 推奨対応: [どちらを修正すべきか]

#### 🟠 規約・設計の乖離
**内容**: [規約・設計と実装の不整合]
- 実装: ...
- 設計書: [docs/design.md 内の記述]

---

### 更新が必要なドキュメント
1. `docs/spec.md`
   - セクション X に新規機能 A について追記
```

乖離がない場合は、以下のように報告します。

```markdown
## 仕様・規約同期チェック結果

- 仕様 ↔ 実装: 乖離なし ✅
- 設計 ↔ 実装: 乖離なし ✅
```

---

## 重要ルール

### ❌ 絶対禁止
* 仕様書や設計書、および実装コードの自動修正・自動更新。
* 乖離を発見したにもかかわらず、報告せず放置すること。
