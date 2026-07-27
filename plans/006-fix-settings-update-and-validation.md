# Plan 006: 設定更新の3欠陥を修正する — id=1 ハードコード、queryKey 不一致、バリデーション欠如

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進む。「STOP conditions」に
> 該当したら中断して報告する。`plans/README.md` は変更せず、実行結果を reviewer に
> 報告する。ステータス更新は reviewer が `reconcile` で行う。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- src/services/apiSettings.ts src/features/settings/`
> 続けて `git diff --stat -- src/services/apiSettings.ts src/features/settings/`、
> `git diff --cached --stat -- src/services/apiSettings.ts src/features/settings/`、
> `git ls-files --others --exclude-standard -- src/services/apiSettings.ts src/features/settings/`
> で unstaged / staged / untracked を個別に確認する。作業ツリーに既存変更があれば STOP。
> in-scope ファイルに差分がある場合、「Current state」の抜粋と実コードを照合し、
> 不一致なら STOP。

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/004-service-layer-test-gaps.md（推奨。必須ではない）
- **Category**: bug / direction
- **Planned at**: commit `d267f0c`, 2026-07-04

## Why this matters

設定機能に独立した3つの欠陥がある。(1) `updateSetting` が `id=1` をハードコードしているが、シード（`e2e/seed.ts` の `seedSettings`）は実際に DB が割り当てた id を使うため、id が 1 でない環境では更新が0行にマッチし `.single()` がエラーになり**設定が永久に更新不能**になる。(2) `useSettings` の queryKey は `["setting"]`、`useUpdateSetting` の invalidate は `["settings"]` と**不一致**のため、更新成功後もフォームが古い値のまま再取得されない。(3) フォームは `Number.isFinite` しか検証せず、負の朝食価格や「最小宿泊日数 > 最大宿泊日数」が保存できてしまい、予約業務ルールを静かに壊す。

## Current state

- `src/services/apiSettings.ts:30-46` — id ハードコード（執筆時点で確認済み）:

```ts
const { data, error } = await supabase
    .from("settings")
    .update(newSetting)
    .select("*")
    // There is only ONE row of settings, and it has the ID=1, and so this is the updated one
    .eq("id", 1)
    .single();
```

なお読み取り側 `getSettings`（同ファイル 10-21 行）は id フィルタなしの `.select("*").single()` で、**読めるのに書けない**非対称がある。

- `src/features/settings/useSettings.ts` — queryKey は `["setting"]`（単数）:

```ts
useQuery({
    queryKey: ["setting"],
    queryFn: getSettings,
});
```

- `src/features/settings/useUpdateSetting.ts` — invalidate は `["settings"]`（複数）:

```ts
onSuccess: () => {
    toast.success("Setting successfully edited.");
    queryClient.invalidateQueries({ queryKey: ["settings"] });
},
```

- `src/features/settings/UpdateSettingsForm.tsx:33-42` — 検証は有限数チェックのみ:

```ts
function handleUpdate(e: FocusEvent<HTMLInputElement>, field: keyof SettingsUpdate) {
    const { value } = e.target;
    if (!value) return;
    const num = Number(value);
    if (!Number.isFinite(num)) return;
    updateSetting({ [field]: num });
}
```

フィールド: `minBookingLength` / `maxBookingLength` / `maxGuestsPerBooking` / `breakfastPrice`（onBlur で1フィールドずつ更新）。

- 既存テスト: `src/features/settings/__tests__/` に `UpdateSettingsForm.test.tsx` / `useSettings.test.ts` / `useUpdateSetting.test.ts` があり、パターンとして踏襲する。
- エラー通知規約: `react-hot-toast`（`useUpdateSetting` の `onError` パターン）。

## Commands you will need

| 目的 | コマンド | 成功時の期待結果 |
|------|---------|-----------------|
| 対象テスト | `bunx vitest run src/features/settings src/services` | 全パス |
| 全テスト | `bun run test` | 全パス |
| Lint / 型 | `bun run lint && bun run typecheck` | exit 0 |

## Scope

**In scope**:

- `src/services/apiSettings.ts`
- `src/features/settings/useSettings.ts` または `useUpdateSetting.ts`（queryKey 統一。定数化推奨）
- `src/features/settings/UpdateSettingsForm.tsx`
- `src/features/settings/__tests__/`（該当テストの更新・追加）
- `src/services/__tests__/services.test.ts`（updateSetting の期待値更新）

**Out of scope**（触らない）:

- `settings` テーブルのスキーマ・シードスクリプト
- 他 feature の queryKey 体系（bookings/cabins は別管理）

## Git workflow

- ブランチ: `advisor/006-settings-fixes`
- コミット分割: ① id 修正、② queryKey 統一、③ バリデーション（各コミット green 必須）
- 形式例: `fix(settings): 設定更新をハードコード id ではなく単一行更新に変更`

## Steps

### Step 1: updateSetting から id ハードコードを外す

単一行テーブルなので、`getSettings` と同じ「フィルタなし」戦略に揃える:

```ts
const { data, error } = await supabase
    .from("settings")
    .update(newSetting)
    .select("*")
    .single();
```

Supabase の update はフィルタなしでも全行（=1行）に適用され、`.single()` が1行であることを保証する。`services.test.ts` の updateSetting テストで `eq` が呼ばれない期待に更新する。

**Verify**: `bunx vitest run src/services` → 全パス

### Step 2: queryKey を定数に統一する

`src/features/settings/` に定数を1箇所定義し（例: `useSettings.ts` で `export const SETTINGS_QUERY_KEY = ["settings"] as const;`）、`useSettings` の `queryKey` と `useUpdateSetting` の `invalidateQueries` の両方で参照する。

`useUpdateSetting.test.ts` に「invalidateQueries が useSettings と同一のキーで呼ばれる」ことを検証するアサーションを追加（現状の不一致なら落ちるテストを先に書き、修正で通す）。

**Verify**: `bunx vitest run src/features/settings` → 全パス

### Step 3: フォームバリデーションを追加する

`handleUpdate` に以下を追加し、違反時は `toast.error`（日本語または既存文体の英語メッセージ）で通知して `updateSetting` を呼ばない:

- 全フィールド: `num <= 0` を拒否（`breakfastPrice` のみ `num < 0` を拒否し 0 は許可）
- `minBookingLength` / `maxBookingLength` / `maxGuestsPerBooking`: 整数チェック（`Number.isInteger`）
- クロスフィールド: `minBookingLength > maxBookingLength` になる更新を拒否（現在値は `useSettings` の `settings` から取得できる — フォームは既に分割代入で保持している）

**Verify**: `bunx vitest run src/features/settings` → 全パス

### Step 4: バリデーションテストを追加する

`UpdateSettingsForm.test.tsx` に追加（既存の onBlur 発火パターンを踏襲）:

1. 負の朝食価格 → mutation 不発 + エラートースト
2. `minBookingLength` に max より大きい値 → mutation 不発
3. 正常値 → mutation 発火（既存ケースがあれば流用）

**Verify**: `bun run test && bun run lint && bun run typecheck` → すべて exit 0

## Test plan

- Step 2 の queryKey 一致テスト（回帰防止の要）、Step 4 の3ケース。
- 構造パターン: `useUpdateSetting.test.ts` / `UpdateSettingsForm.test.tsx` の既存ケース。

## Done criteria

- [ ] `grep -n 'eq("id", 1)' src/services/apiSettings.ts` がヒットしない
- [ ] `grep -rn 'queryKey' src/features/settings/*.ts` の設定系キーが単一の定数参照に統一されている
- [ ] 負値・min>max が保存できないことをテストが証明している
- [ ] `bun run test` / `bun run lint` / `bun run typecheck` がすべて exit 0
- [ ] `git status` で in-scope 外の変更がない
- [ ] 実行結果を reviewer に報告し、`plans/README.md` は変更していない

## STOP conditions

- Supabase の update がフィルタなしを拒否する設定（RLS 等）でテスト・実環境が失敗する場合 — `getSettings` で id を取得して渡す代替案に切り替える前に報告
- queryKey 変更が settings 以外のテストを壊す場合（キーが他所で参照されている兆候）

## Maintenance notes

- Plan 012（予約作成スパイク）が実装されると、これらの設定値（min/max 宿泊日数、最大ゲスト数）が予約フォームの検証に使われる。ここで導入するバリデーションが上流の防波堤になる。
- レビュー観点: onBlur 更新という UX（フィールド単位保存）は維持されているか。クロスフィールド検証が「現在の DB 値」ではなく「フォームの表示値」と比較していないか。
