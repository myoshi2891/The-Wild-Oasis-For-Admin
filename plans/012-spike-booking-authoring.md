# Plan 012: 設計スパイク — アプリ内予約作成・編集（ゲスト管理・日程重複防止を含む）

> **Executor instructions**: これは**設計スパイク**であり、実装プランではない。
> 成果物は調査レポートと設計ドキュメントであって、プロダクションコードの変更は
> **行わない**（使い捨ての検証コードは `plans/spike-artifacts/` 配下のみ許可）。
> 「STOP conditions」に該当したら中断して報告する。`plans/README.md` は変更せず、
> 実行結果を reviewer に報告する。ステータス更新は reviewer が `reconcile` で行う。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- src/features/bookings/ src/services/apiBookings.ts docs/spec.md`
> 続けて `git diff --stat -- src/features/bookings/ src/services/apiBookings.ts docs/spec.md`、
> `git diff --cached --stat -- src/features/bookings/ src/services/apiBookings.ts docs/spec.md`、
> `git ls-files --others --exclude-standard -- src/features/bookings/ src/services/apiBookings.ts docs/spec.md`
> で unstaged / staged / untracked を個別に確認する。作業ツリーに既存変更があれば STOP。
> bookings 機能に作成/編集フックが追加されていたら、このスパイクの前提が
> 変わっている — 現状を確認して報告する。

## Status

- **Priority**: P3
- **Effort**: L（スパイク自体は M、実装はスパイクの結論次第）
- **Risk**: LOW（読み取り + 設計文書のみ）
- **Depends on**: plans/002-verify-and-codify-rls-policies.md（RLS の現状把握が前提）、plans/006-fix-settings-update-and-validation.md（設定値が予約検証の入力になる）
- **Category**: direction
- **Planned at**: commit `d267f0c`, 2026-07-04

## Why this matters

このアプリはホテルのフロント業務ツールなのに、**予約を作成・編集できない**（閲覧・チェックイン/アウト・削除のみ）。電話や walk-in の予約はスタッフが Supabase を直接操作するしかなく、日常業務の中核が欠けている。監査では次の3つが相互依存する機能ギャップとして特定された: ① 予約の作成/編集フォーム、② ゲスト管理（予約作成にはゲスト選択/登録が必要）、③ 日程重複防止（作成できるようになった瞬間にダブルブッキングが可能になる）。3つを別々に作ると整合しないため、**先に1本のスパイクで全体設計と未知数を潰す**。

## Current state

- `src/features/bookings/` のフック: `useBooking.ts` / `useBookings.ts` / `useDeleteBooking.ts` のみ（作成・編集なし。執筆時点で確認済み）。
- `src/services/apiBookings.ts` に insert 系関数なし。`updateBooking` はチェックイン/アウト用の汎用 update。
- ゲストは読み取り専用: `src/services/` に `apiGuests.ts` はなく、guests は bookings の join（`guests(fullName, email)` 等）でのみ取得。
- 日程重複を防ぐ制約はクライアント・DB のどちらにもない（`docs/design.md` の ER 図に uniqueness/exclusion 制約の記載なし）。
- 参考になる既存パターン:
  - フォーム: `src/features/cabins/CreateCabinForm.tsx`（react-hook-form + `FormRow` + mutation フック）
  - CRUD フック: `src/features/cabins/useCreateCabin.ts` / `useEditCabin.ts`
  - 設定値の業務ルール: `settings` テーブルの `minBookingLength` / `maxBookingLength` / `maxGuestsPerBooking` / `breakfastPrice`（予約検証の入力になる）
- 制約: Supabase スキーマの直接変更は禁止（`CLAUDE.md`）。スキーマ変更が必要な結論になった場合は提案として文書化し、適用はオペレーター判断。

## Commands you will need

| 目的 | コマンド | 成功時の期待結果 |
|------|---------|-----------------|
| ゲート（成果物がコードを触っていない確認） | `git status` | `plans/` 配下のみ変更 |
| Lint / 型 / テスト（変更なしの確認） | `bun run lint && bun run typecheck && bun run test` | exit 0 / 全パス |

## Scope

**In scope**（作成してよいもの）:

- `plans/spike-artifacts/booking-authoring-design.md`（設計ドキュメント本体）
- `plans/spike-artifacts/`（SQL 案・検証スニペット等の使い捨て成果物）

**Out of scope**:

- `src/`, `e2e/`, `docs/` への一切の変更
- Supabase への書き込み（検証クエリは読み取りのみ）

## Git workflow

- ブランチ: `advisor/012-spike-booking-authoring`
- コミット形式例: `docs(plans): 予約作成機能の設計スパイク成果物を追加`

## Steps

### Step 1: 予約作成のデータフローを設計する

`booking-authoring-design.md` に以下を記述する:

1. フォームの入力項目と導出項目の一覧（`startDate`/`endDate`/`numGuests`/`cabinId`/`guestId`/`hasBreakfast`/`observations` が入力、`numNights`/`cabinPrice`/`extrasPrice`/`totalPrice`/`status` が導出。導出式は `docs/design.md` の bookings テーブル定義と `CheckinBooking.tsx` の朝食価格計算を参照して確定する）
2. 検証ルールと settings の対応（min/maxBookingLength → 日数、maxGuestsPerBooking → 人数、breakfastPrice → extras 計算）
3. 既存の `CreateCabinForm` パターンをどこまで踏襲できるか、差分は何か（日付入力・参照選択（cabin/guest）・料金プレビューが新規要素）

### Step 2: ゲスト選択/登録の方式を決める

選択肢を比較して推奨を1つ決める:

- A: 予約フォーム内にゲスト検索（email/氏名）+ 見つからなければインライン新規登録
- B: 独立した `features/guests` モジュール（一覧/作成/編集）を先に作り、予約フォームからは選択のみ
- 比較軸: 実装量、フロント業務の実フロー（電話予約中に登録できるか）、`nationalID` 等の PII を扱う画面の増加

必要な新規 API（`apiGuests.ts`: `searchGuests` / `createGuest`）と RLS 追加要件（Plan 002 の表に guests INSERT が増える）を列挙する。

### Step 3: 日程重複防止の実装方式を検証する

これがスパイクの核心（未知数が最も大きい）。以下を調査して結論を出す:

1. **DB レベル**: PostgreSQL の exclusion constraint
   （`EXCLUDE USING gist (cabinId WITH =, daterange(startDate, endDate, '[)') WITH &&) WHERE (status IN ('unconfirmed', 'checked-in'))` 相当）
   が Supabase で使えるか（`btree_gist` 拡張とpartial exclusion constraintの可否）。
   現行statusは `unconfirmed` / `checked-in` / `checked-out` のため、active集合を前2つと定義する。
   将来 `cancelled` を追加してもactive集合に含めない。スキーマ変更になるためSQL案の文書化まで（適用しない）。
2. **API レベル**: 挿入前の重複チェッククエリ
   （`.in("status", ["unconfirmed", "checked-in"]).lt("startDate", end).gt("endDate", start)`）
   と、check-then-insert の競合窓の許容可否。
3. active予約だけが重複をブロックし、`checked-out` または将来の `cancelled` へ遷移すると
   constraint対象から外れて同期間の新規予約が可能になることを検証項目にする。
4. 同日checkout/checkin、部分重複、完全包含、別cabin、active→checked-out、
   active→cancelled（将来status案）のSQL/APIテストケースを成果物へ記録する。
5. 推奨: DB 制約 + API 事前チェックの二段構え（制約が最後の砦、事前チェックが UX）を検証し、Supabase 側の制約が不可能な場合のフォールバックを明記する。

### Step 4: 実装プランの分割案と見積もりを書く

スパイクの結論を「次に書くべき実装プラン」の一覧に落とす。想定:

- `guests` サービス + 管理 UI（M）
- 予約作成フォーム + 検証（M〜L）
- 重複防止（DB 制約の適用はオペレーター作業 + API チェック実装で S〜M）
- 予約編集（作成の後続で S）

各プランの依存順序と、`docs/spec.md` の主要機能一覧・「完了の定義」への追記案も含める。

**Verify**: `git status` → 変更が `plans/` 配下のみ。`bun run lint && bun run typecheck && bun run test` → exit 0 / 全パス

## Test plan

- スパイクのためテストコードなし。Step 3 の重複判定ロジック検証に使った SQL/クエリ案は `plans/spike-artifacts/` に残し、実装プランのテストケース（境界: 同日チェックアウト/チェックイン、完全包含、部分重複）の種にする。

## Done criteria

- [ ] `booking-authoring-design.md` に Step 1〜4 の全セクションが存在する
- [ ] ゲスト選択方式の推奨が理由付きで1つに決まっている
- [ ] 重複防止の方式が「Supabase で exclusion constraint が使えるか」の検証結果付きで結論されている
- [ ] active status限定のDB/API条件と、activeからchecked-out／将来のcancelledへ遷移した際の制約解放が検証されている
- [ ] 後続実装プランの分割案（3〜4本）と依存順序が書かれている
- [ ] `bun run lint` / `bun run typecheck` / `bun run test` がすべて成功
- [ ] Supabase実機検証済みの場合だけDONE候補とし、文献調査だけの場合は成果物先頭に「暫定設計・未検証」と表示してSTOPPED/BLOCKED候補として報告する
- [ ] `git status` で `plans/` 以外に変更がない
- [ ] 実行結果を reviewer に報告し、`plans/README.md` は変更していない

## STOP conditions

- Supabase の管理画面・SQL エディタへのアクセスが得られず Step 3-1 を実証できない場合 —
  文献調査結果は成果物として残すが、先頭に「暫定設計・未検証」と表示し、executorは
  `STOPPED` として報告する。DONE扱いにせず、reviewerが `reconcile` で理由付きBLOCKEDへ更新する。
- スパイク中に bookings のスキーマが ER 図と食い違っていることを発見した場合（Plan 010 の型生成と関連 — 報告して先に型の正を確定させる）

## Maintenance notes

- このスパイクが実装に進んだら: Plan 011 で README に入れた「予約はアプリ外で作成」の注記を撤回し、`docs/spec.md` の主要機能・完了の定義を更新すること。
- Plan 002 の RLS ギャップ分析表は guests INSERT / bookings INSERT の行が増える。
- ダッシュボードの稼働率・売上は予約作成が増えるとデータ量が変わる — Plan 007 の select 絞り込みが効いてくる。
