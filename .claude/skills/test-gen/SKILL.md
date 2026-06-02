---
name: test-gen
description: >
  Analyzes existing production code, identifies untested paths and edge cases,
  and generates comprehensive test cases using the project's test infrastructure.
  Supports unit and component (Vitest + RTL), and E2E (Playwright) test generation.
  Triggered by: "テスト追加", "テストケース追加", "テスト補完", "テスト生成",
  "カバレッジ改善", "不足テスト", "テストギャップ", "add tests", "generate tests",
  "write tests for".
invocation: automatic
allowed-tools: [Read, Grep, Glob, Bash, Edit, Write]
---

# Test Gen スキル

## 目的

既存コードのテストギャップを分析し、不足しているテストケースを生成・追加するスキル。既存モジュールへのテスト補完に特化する。

---

## 実行手順

### Step 1｜スコープを決定する

ユーザーの指示から対象を特定し、ユニットテスト、コンポーネントテスト、または E2E テストのいずれかを生成するか決定します。

| 対象 | テスト種別 |
|------|-----------|
| `src/services/` 内の API ヘルパー | ユニットテスト |
| `src/features/` 内の UI / カスタムフック | コンポーネント / フックテスト |
| ユーザー全体の操作フロー | Playwright E2E テスト |

---

### Step 2｜本番コードを分析する

対象ファイルを読み込み、公開関数、条件分岐（`if/else` 等）、エラー処理（例外のスロー）、および外部サービス（Supabase クライアント等）の依存関係を列挙します。

---

### Step 3｜テストのモックと雛形を構成する (Vitest)

#### ユニットテスト / フックテスト (Vitest)
**配置先**: テスト対象と同階層の `__tests__/` ディレクトリ内。

**Vitest を使ったモックの構成例**:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Supabase 等の外部サービスのモック定義
vi.mock("@/services/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
    })),
  },
}));

describe("API関数のテスト", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("正常系: データを正しく取得できる", async () => {
    // Arrange & Act & Assert
  });

  it("異常系: API エラー時に例外をスローする", async () => {
    // Exception assertions
  });
});
```

#### コンポーネントテスト (React Testing Library + Vitest)
**配置先**: テスト対象と同階層の `__tests__/` ディレクトリ内。

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

describe("ComponentName", () => {
  it("正常系: 初期表示が正しく行われる", () => {
    render(<Component />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

---

### Step 4｜テストを実行して検証する

```bash
# 作成したテストファイルを指定して実行
bun run test -- <テストファイル名>
```

すべてのテストケースがパスし、型エラー（`npx tsc --noEmit`）およびリント（`bun run lint`）が正常であることを確認します。

---

## 重要ルール

### ❌ 絶対禁止
- `any` 型を安易にテストで使用すること（可能な限り適切な型定義か `unknown` からのキャストを使用する）。
- コミット前に `bun run test` や `npx tsc` などの検証チェックをスキップすること。
- モックを定義せずに、実際の Supabase 本番 DB や API に対するライブ接続をユニットテスト内で行うこと。
