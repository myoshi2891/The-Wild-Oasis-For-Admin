# Plan 007: ダッシュボードの正確性と効率を改善する — タイムゾーン集計・稼働率・select 絞り込み

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進む。「STOP conditions」に
> 該当したら中断して報告する。`plans/README.md` は変更せず、実行結果を reviewer に
> 報告する。ステータス更新は reviewer が `reconcile` で行う。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- src/features/dashboard/ src/services/apiBookings.ts src/utils/helpers.ts src/types/domain.ts`
> 続けて `git diff --stat -- src/features/dashboard/ src/services/apiBookings.ts src/utils/helpers.ts src/types/domain.ts`、
> `git diff --cached --stat -- src/features/dashboard/ src/services/apiBookings.ts src/utils/helpers.ts src/types/domain.ts`、
> `git ls-files --others --exclude-standard -- src/features/dashboard/ src/services/apiBookings.ts src/utils/helpers.ts src/types/domain.ts`
> で unstaged / staged / untracked を個別に確認する。作業ツリーに既存変更があれば STOP。
> in-scope ファイルに差分がある場合、「Current state」の抜粋と実コードを照合し、
> 不一致なら STOP。

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED（型の絞り込みが複数コンポーネントに波及しうる）
- **Depends on**: plans/004-service-layer-test-gaps.md
- **Category**: bug / perf
- **Planned at**: commit `d267f0c`, 2026-07-04

## Why this matters

ダッシュボードに関連する3つの問題を一括で扱う（同じファイル群に触るため）。(1) 売上チャートは予約を**ブラウザのローカル日付**でバケットするが、API は **UTC 日付境界**でフィルタするため、UTC 以外のユーザーでは深夜帯の予約がチャートの軸から外れて**売上が消えたりずれたりする**（Stats の合計とチャートが食い違う）。(2) 稼働率は「期間内に開始した滞在の**全泊数**」を分子にするため、期間外にはみ出す泊数も数えて **100% を超え得る**。(3) `getStaysAfterDate` / `getStaysTodayActivity` は `select("*")` で全カラムを取得するが、消費側は数フィールドしか使わず、staleTime=0（文書化済み制約）によりマウント毎に無駄なペイロードを再取得している。

## Current state

- `src/utils/helpers.ts:31-42` — `getToday` は **UTC** で日付境界を作る:

```ts
export const getToday = function (options: GetTodayOptions): string {
    const today = new Date();
    if (options?.end) {
        today.setUTCHours(23, 59, 59, 999);
    } else {
        today.setUTCHours(0, 0, 0, 0);
    }
    return today.toISOString();
};
```

- `src/features/dashboard/SalesChart.tsx:45-68` — 軸とバケットは**ローカル TZ** の `format`:

```ts
const allDates = eachDayOfInterval({
    start: subDays(new Date(), numDays - 1),
    end: new Date(),
});
const salesMap = bookings.reduce((acc, booking) => {
    const key = format(new Date(booking.created_at), "yyyy-MM-dd");
    // ...
const data = allDates.map((date) => {
    const key = format(date, "yyyy-MM-dd");
```

- `src/features/dashboard/Stats.tsx:34-36` — 稼働率の分子が期間外泊数を含む:

```ts
const occupation =
    confirmedStays.reduce((acc, cur) => acc + cur.numNights, 0) /
    (numDays * Math.max(cabinCount, 1));
```

- `src/services/apiBookings.ts:140` / `:162` — 過剰 select:

```ts
.select("*, guests(fullName)")                                  // getStaysAfterDate
.select("*, guests(fullName, nationality, countryFlag)")        // getStaysTodayActivity
```

対比: `getBookings`（同ファイル 41-44 行）は既に明示カラムに絞っている。この形を手本にする。

- 消費側が実際に使うフィールド（変更前に必ず自分で grep して確定させること）:
  - `getStaysAfterDate` → `useRecentStays.ts`（`status` で confirmed を絞る）、`DurationChart.tsx`（`numNights`）、`Stats.tsx`（`numNights`）
  - `getStaysTodayActivity` → `TodayItem.tsx` / `TodayActivity.tsx`（`id`, `status`, `numNights`, `guests(...)` 等）
- 型定義: `StayAfterDate` / `BookingWithGuestInfo` は `src/types/domain.ts`。select を絞ったら型も絞る（`Pick<>` ベース推奨）。
- 関連テスト: `src/features/dashboard/__tests__/`（SalesChart, Stats, DurationChart, useRecentStays）、`src/features/check-in-out/__tests__/`（TodayItem, TodayActivity, useTodayActivity）。

## Commands you will need

| 目的 | コマンド | 成功時の期待結果 |
|------|---------|-----------------|
| 対象テスト | `bunx vitest run src/features/dashboard src/features/check-in-out src/services src/utils` | 全パス |
| 全テスト | `bun run test` | 全パス |
| Lint / 型 | `bun run lint && bun run typecheck` | exit 0 |

## Scope

**In scope**:

- `src/features/dashboard/SalesChart.tsx`
- `src/features/dashboard/Stats.tsx`
- `src/services/apiBookings.ts`（`getStaysAfterDate` / `getStaysTodayActivity` の select 文字列のみ）
- `src/types/domain.ts`（`StayAfterDate` / `BookingWithGuestInfo` の絞り込み）
- `src/utils/helpers.ts`（UTC 日付キー用ヘルパー追加のみ。`getToday` 本体は変更しない）
- 上記に対応する `__tests__/` 配下

**Out of scope**（触らない）:

- `getBookingsAfterDate`（既に明示カラム）、`getBookings`、check-in/out の mutation 系
- staleTime 設定（文書化済み制約）
- チャートの見た目・recharts の構成

## Git workflow

- ブランチ: `advisor/007-dashboard-fixes`
- コミット分割: ① TZ バケット修正、② 稼働率修正、③ select/型絞り込み（各コミット green）
- 形式例: `fix(dashboard): 売上チャートの集計を API と同じ UTC 日付基準に統一`

## Steps

### Step 1: 売上チャートの日付キーを UTC に統一する

1. `src/utils/helpers.ts` に UTC 日付キー関数を追加:

```ts
// created_at(ISO文字列)を API のフィルタ境界(getToday)と同じ UTC 基準の日付キーに変換する
export const toUtcDateKey = (iso: string | Date): string =>
    new Date(iso).toISOString().slice(0, 10);
```

2. `SalesChart.tsx` の `salesMap` のキー生成を `toUtcDateKey(booking.created_at)` に変更。
3. 軸側 `allDates` のキーも UTC 基準に変更する。`eachDayOfInterval` はローカル日付を返すため、`allDates` の生成を「今日の UTC 日付から `numDays-1` 日分の UTC 日付文字列の配列」に置き換える（`Date.UTC` ベースでループ生成するか、date-fns の演算後に `toUtcDateKey` を通す。**キーとラベルの両方が同じ UTC 日付から導出される**ことが要件）。
4. x 軸ラベル `format(date, "MMM dd")` は表示専用なので、UTC 日付から生成し直す。

**Verify**: `bunx vitest run src/features/dashboard` → SalesChart テストがパス（既存テストがローカル TZ 前提で落ちる場合、テストの期待値を UTC 基準に更新し、その旨をコミットメッセージに明記）

### Step 2: TZ 回帰テストを追加する

`SalesChart.test.tsx` に「`created_at` が UTC 深夜帯（例: `2026-07-03T23:30:00.000Z`）の予約が、ローカル TZ に関係なく 7/3 のバケットに入る」ことを検証するケースを追加。`vi.stubEnv` で TZ を固定できない場合は、`process.env.TZ = "Asia/Tokyo"` を vitest 設定またはテスト先頭で設定して検証する。

**Verify**: `bunx vitest run src/features/dashboard` → 新ケース含め全パス

### Step 3: 稼働率を 100% 上限にクランプする

`Stats.tsx` の計算を最小修正でクランプする:

```ts
const occupation = Math.min(
    1,
    confirmedStays.reduce((acc, cur) => acc + cur.numNights, 0) /
        (numDays * Math.max(cabinCount, 1))
);
```

期間交差の厳密計算（滞在と期間の重なり泊数のみ数える）は工数対効果が低いため見送り、近似式であることをコメント（日本語）で明記する。`Stats.test.tsx` に「泊数が期間×客室数を超えても 100% と表示」のケースを追加。

**Verify**: `bunx vitest run src/features/dashboard` → 全パス

### Step 4: select と型を絞り込む

1. 消費側フィールドを grep で確定する（このプランの「Current state」の一覧を検証する）:
   `grep -rn "stay\.\|activity\.\|item\." src/features/dashboard src/features/check-in-out --include="*.tsx" --include="*.ts"` 等。
2. `getStaysAfterDate` の select を確定フィールド + `guests(fullName)` の明示列挙に変更（`getBookings` の書式を踏襲）。
3. `getStaysTodayActivity` も同様。
4. `src/types/domain.ts` の対応型を実選択カラムに合わせて絞る（`Pick<Booking, ...> & { guests: ... }` 形式）。
5. `bun run typecheck` を実行し、**омitted カラムを参照しているコンパイルエラーが出たら、そのカラムを select に戻す**（型を絞るからこそ漏れが機械検出できる）。

**Verify**: `bun run typecheck` → exit 0。`bun run test` → 全パス（サービステストの select 文字列期待値は Plan 004 で追加したものを更新）

## Test plan

- Step 2: TZ 回帰テスト1ケース（このプランの核心）
- Step 3: 稼働率クランプ1ケース
- Step 4: サービステストの select 文字列アサーション更新（Plan 004 のテストを新文字列に）
- 構造パターン: `SalesChart.test.tsx` / `Stats.test.tsx` の既存ケース

## Done criteria

- [ ] `grep -n 'select("\*' src/services/apiBookings.ts` のヒットが `getBooking`（詳細画面、正当な全カラム取得）のみ
- [ ] SalesChart の日付キー生成に `format(new Date(booking.created_at), "yyyy-MM-dd")`（ローカル TZ）が残っていない
- [ ] 稼働率が 100% を超えるテストデータで "100%" と表示される
- [ ] `bun run test` / `bun run lint` / `bun run typecheck` がすべて exit 0
- [ ] `git status` で in-scope 外の変更がない
- [ ] 実行結果を reviewer に報告し、`plans/README.md` は変更していない

## STOP conditions

- Step 4 の grep で、想定外のコンポーネントが `StayAfterDate` の広いフィールドに依存していると判明した場合（型絞り込みの波及が3ファイルを超える）— 絞り込み対象を報告して指示を仰ぐ
- Step 1 で既存の SalesChart テストが3件以上落ち、期待値更新の判断がつかない場合
- Plan 004 が未着地の場合（select 文字列の特性テストがない状態での変更は回帰検出が弱い）— 実行順の確認を報告

## Maintenance notes

- 将来ダッシュボードに「カスタム期間指定」（監査で Direction 提案済み）を追加する場合、Step 1 の UTC キー統一が前提になる。
- 稼働率の厳密計算（期間交差）は意図的に見送った。経営指標として厳密性が必要になったら再検討。
- レビュー観点: `toUtcDateKey` が `getToday` と同じ境界定義（UTC 日付）であること。select 絞り込み後の型が `as` キャストでごまかされていないこと。
