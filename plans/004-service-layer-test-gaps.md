# Plan 004: サービス層の未テスト分岐（getBookings のフィルタ/ページネーション、createEditCabin の更新系）を補完する

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進む。「STOP conditions」に
> 該当したら中断して報告する。`plans/README.md` は変更せず、実行結果を reviewer に
> 報告する。ステータス更新は reviewer が `reconcile` で行う。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- src/services/`
> 続けて `git diff --stat -- src/services/`、
> `git diff --cached --stat -- src/services/`、
> `git ls-files --others --exclude-standard -- src/services/`
> で unstaged / staged / untracked を個別に確認する。作業ツリーに既存変更があれば STOP。
> in-scope ファイルに差分がある場合、「Current state」の抜粋と実コードを照合し、
> 不一致なら STOP。特に Plan 005/006/007 が先に実行されているとサービス層は
> 変更されている — その場合は変更後のコードに対する特性テストとして書き直すこと。

## Status

- **Priority**: P1（Plan 005/006/007 のリファクタ前に着地させることが望ましい）
- **Effort**: M
- **Risk**: LOW（テストのみの追加）
- **Depends on**: none（ただし 005/006/007 より**先**に実行するのが推奨順序）
- **Category**: tests
- **Planned at**: commit `d267f0c`, 2026-07-04

## Why this matters

アプリの中核画面（予約一覧）を駆動する `getBookings` は、フィルタメソッドの switch（gte/lte/neq/eq）、`safePage` の正規化、`range()` によるページネーションという分岐の多いロジックを持つが、**直接のテストがゼロ**である。フック側テスト（`useBookings.test.ts` 等）は API 関数を丸ごとモックするため、実クエリ構築ロジックは一度も実行されない。同様に `createEditCabin` の「更新時は画像アップロード失敗でもロールバック（行削除）しない」というデータ損失防止ガードもテストで担保されていない。Plan 005〜007 がサービス層を変更する前に、現行挙動を固定する特性テストを整備する。

## Current state

- `src/services/__tests__/services.test.ts` — 既存のサービステスト。冒頭のモックハーネス（執筆時点で確認済み）:

```ts
const mockFrom = vi.fn();
const mockStorage = {
    from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
    })),
};
vi.mock("../supabase", () => ({
    default: {
        from: (...args: unknown[]) => mockFrom(...args),
        auth: mockAuth,
        storage: mockStorage,
    },
    supabaseUrl: "https://test.supabase.co",
}));
```

既存カバレッジ: `getBooking`（成功）、`deleteBooking`（エラー）、`updateBooking`（成功）、`createEditCabin` の作成系3ケース、apiSettings、apiAuth。

- `src/services/apiBookings.ts:34-82` — `getBookings`。テスト対象の分岐:

```ts
if (filter) {
    const method = filter.method || "eq";
    switch (method) {
        case "gte": query = query.gte(filter.field, filter.value); break;
        case "lte": query = query.lte(filter.field, filter.value); break;
        case "neq": query = query.neq(filter.field, filter.value); break;
        default:    query = query.eq(filter.field, filter.value);  break;
    }
}
const safePage =
    typeof page === "number" && Number.isInteger(page) && page >= 1 ? page : 1;
const from = (safePage - 1) * PAGE_SIZE;
const to = from + PAGE_SIZE - 1;
query = query.range(from, to);
```

- `src/services/apiCabins.ts:83-98` — 更新フローの非ロールバック分岐:

```ts
if (storageError) {
    // Only rollback (delete) for create flow — don't delete existing cabins on update
    if (!id) {
        await supabase.from("cabins").delete().eq("id", (data as Cabin).id);
    }
```

- 未テストのエラーパス: `getCabins`（`apiCabins.ts:13-16`）、`getBookingsAfterDate`（`apiBookings.ts:121-124`）、`getStaysAfterDate`（`:144-147`）、`getStaysTodayActivity`（`:168-171`）。
- `PAGE_SIZE` は `src/utils/constants.ts` で定義（値を確認して期待値に使うこと）。
- リポジトリ規約: AAA パターン、describe は日本語コメント可、`.claude/rules/02-tdd-step-commit.md` により**1コミット最大3テストファイル・200行以内**。

## Commands you will need

| 目的 | コマンド | 成功時の期待結果 |
|------|---------|-----------------|
| 対象テストのみ実行 | `bunx vitest run src/services` | 全パス |
| 全テスト | `bun run test` | 全パス |
| Lint / 型 | `bun run lint && bun run typecheck` | exit 0 |

## Scope

**In scope**:

- `src/services/__tests__/services.test.ts`（追記）— 肥大化する場合は `src/services/__tests__/apiBookings.query.test.ts` を新設してよい

**Out of scope**（触らない）:

- `src/services/*.ts` 本体 — **テスト対象コードは1文字も変更しない**（特性テストの原則）。テストを通すために実装を直したくなったら STOP して報告（それは Plan 005/006/007 の仕事）
- フック側テスト（`useBookings.test.ts` 等）

## Git workflow

- ブランチ: `advisor/004-service-test-gaps`
- Red-Green-Refactor に従い、テスト単位の小さなコミット（`test(services): getBookings のフィルタ分岐を検証` 等）
- 各コミット前に `bun run lint && bun run typecheck && bun run test` が green であること（プロジェクトルール）

## Steps

### Step 1: getBookings 用のチェーン可能なクエリモックを用意する

既存の `mockFrom` パターンを踏襲しつつ、`select→gte/lte/neq/eq→range→order` のメソッドチェーンを記録できるビルダーモックを作る。各メソッドは `vi.fn().mockReturnThis()` 相当でチェーンを維持し、最終的に `{ data, error, count }` を resolve する thenable にする（既存テスト内の類似モックを先に読むこと）。

**Verify**: `bunx vitest run src/services` → 既存テストが引き続き全パス

### Step 2: getBookings のフィルタ4分岐 + ページネーションをテストする

追加ケース（それぞれ Arrange-Act-Assert で）:

1. `filter.method: "gte"` → `gte(field, value)` が呼ばれ `eq` は呼ばれない
2. `"lte"` / `"neq"` も同様（計3ケース）
3. `filter.method` 未指定 → `eq` が呼ばれる
4. `page: 2` → `range(PAGE_SIZE, PAGE_SIZE * 2 - 1)`（`PAGE_SIZE` は `src/utils/constants.ts` から import して算出）
5. `page: 0`・`page: 1.5`・`page: undefined` → いずれも `range(0, PAGE_SIZE - 1)`（safePage フォールバック）
6. `sortBy: { field, direction: "asc" }` → `order(field, { ascending: true })`
7. エラー応答 → `"Bookings could not be loaded"` を throw、`count` 欠落時は `count: 0` を返す

**Verify**: `bunx vitest run src/services` → 新規ケース含め全パス

### Step 3: createEditCabin の更新系3ケースを追加する

1. `id` あり + 新規 `File` + アップロード成功 → `update` が呼ばれ、`storage.upload` が実行され、`delete` は**呼ばれない**
2. `id` あり + 新規 `File` + アップロード失敗 → throw するが、対象 `id` に対する `update` が実行され、`from("cabins").delete()` は**呼ばれない**ことを検証する。現行実装は DB update 後に upload するため、失敗時には新規生成された未存在画像 URL が保存され、既存画像 URL は保持されない。この URL を有効値として扱わず、Plan 005 で解消する既知バグとしてテスト名・コメント・実行結果に明記する
3. `getCabins` のエラーパス → `"Cabins could not be loaded"` を throw

既存の作成系テスト（`services.test.ts` 内の createEditCabin describe、モック File の作り方）を構造パターンとして踏襲する。

**Verify**: `bunx vitest run src/services` → 全パス

### Step 4: ダッシュボード系フェッチャのエラーパスを追加する

`getBookingsAfterDate` / `getStaysAfterDate` / `getStaysTodayActivity` それぞれについて、エラー応答時に `"Bookings could not get loaded"` を throw することを検証する（成功系は各1ケースで十分: 正しい `select` カラム文字列と `gte/lte` 境界が渡ること）。

**Verify**: `bun run test` → 全スイートパス。`bun run lint && bun run typecheck` → exit 0

## Test plan

このプラン自体がテスト追加である。網羅目標:

- `getBookings`: フィルタ4分岐、page 正規化3系、sort、エラー、count フォールバック
- `createEditCabin`: 更新+アップロード成功 / 更新+アップロード失敗（対象IDへのupdate・delete非実行、および未存在画像 URL が残る現行順序を Plan 005 の既知バグとして記録）
- `getCabins` / 日付系フェッチャ3関数: エラーパス

## Done criteria

- [ ] `bunx vitest run src/services` で新規テストがすべてパス（追加ケース数 ≥ 14）
- [ ] `bun run test` / `bun run lint` / `bun run typecheck` がすべて exit 0
- [ ] `git diff --stat` の変更が `src/services/__tests__/` 配下のみ
- [ ] 各コミットが3ファイル・200行以内（プロジェクトルール）
- [ ] 実行結果を reviewer に報告し、`plans/README.md` は変更していない

## STOP conditions

- テストを書く過程で**実装のバグを発見**した場合（例: page 正規化が期待と異なる）— 実装は直さず、現行挙動をそのままテストに固定した上で、発見内容を報告する
- 「Current state」の抜粋と実装が一致しない（Plan 005-007 が先行着地した場合は変更後コードへの特性テストとして書き直し、その旨を報告）
- モックハーネスの変更が既存テストを2件以上壊す場合

## Maintenance notes

- Plan 005（cabin 画像フロー変更）と Plan 007（select 絞り込み）はここで固定したテストの期待値を**意図的に**変えることになる。その際はテスト変更が仕様変更として PR に明記されること。
- レビュー観点: モックがチェーン順序に依存しすぎていないか（実装の内部順序変更で壊れる脆いテストを避ける）。
