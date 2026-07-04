# Plan 002: Supabase RLS ポリシーを検証し、リポジトリ内にコード化（マイグレーション化）する

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進む。「STOP conditions」に
> 該当したら中断して報告する。完了したら `plans/README.md` のステータス行を更新する。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- src/services/ src/ui/ProtectedRoute.tsx supabase/`
> in-scope ファイルに差分がある場合、「Current state」の抜粋と実コードを照合し、
> 不一致なら STOP。

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW（リポジトリへの追加は宣言のみ。ダッシュボード側の変更は人間の承認必須）
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `d267f0c`, 2026-07-04

## Why this matters

このアプリのデータ変更（予約削除・客室削除・設定更新など）の認可は**すべて Supabase の RLS（Row Level Security）に依存**している。クライアント側のアクセス制御は `src/ui/ProtectedRoute.tsx` のリダイレクトのみで、これはセキュリティ境界ではない。RLS ポリシーは Supabase ダッシュボード上で直接管理されており（プロジェクト方針）、**リポジトリからは存在も内容も検証できない**。ポリシーが欠落・過剰許可だった場合、anon キーを知る認証済みユーザーは全テナントデータを読み書き削除できる。本プランは (1) 現行ポリシーの棚卸しと検証、(2) その結果を SQL としてリポジトリに記録し、以後レビュー可能にすることが目的。

**重要**: プロジェクト制約「Supabase のテーブルスキーマを直接変更しない」（`CLAUDE.md`）があるため、本プランの成果物は**記録と検証レポート**であり、ポリシーの新規適用・変更は人間の承認を得てから別途行う。

## Current state

- 認可がRLS依存であることを示すコード:

`src/services/apiBookings.ts:207-219` 付近 — `deleteBooking` にはコード内コメントで RLS への依存が明記されている:

```ts
export async function deleteBooking(id: number): Promise<null> {
    // REMEMBER RLS POLICIES
    const { data, error } = await supabase.from("bookings").delete().eq("id", id);
```

`src/ui/ProtectedRoute.tsx` — クライアント側のみの認証ガード（未認証を `/login` へリダイレクト）。認可判定はない。

`src/features/authentication/useUser.ts:20` 付近 — `role === "authenticated"` であれば全員同権限。

- 対象テーブル: `cabins`, `bookings`, `guests`, `settings`（ER 図は `docs/design.md` の「データモデル」節）。
- ストレージバケット: `cabin-images`（`src/services/apiCabins.ts:83-85` がアップロード先として使用）。
- リポジトリに `supabase/` ディレクトリは存在しない（新規作成する）。

## Commands you will need

| 目的 | コマンド | 成功時の期待結果 |
|------|---------|-----------------|
| Lint | `bun run lint` | exit 0 |
| 型チェック | `bun run typecheck` | exit 0 |
| Supabase CLI（棚卸しに使う場合） | `bunx supabase --version` | バージョン表示 |

（Supabase CLI が未認証・未リンクの場合はダッシュボードでの手動棚卸しにフォールバックする。）

## Scope

**In scope**:

- `supabase/policies/`（新規ディレクトリ）— ポリシー SQL の記録
- `supabase/README.md`（新規）— 棚卸し結果レポートと運用手順
- `docs/design.md` — セキュリティ節への1段落追記

**Out of scope**（触らない）:

- Supabase ダッシュボード上のポリシーの**適用・変更**（人間の承認後に別作業）
- `src/` 配下の全ファイル
- スキーマ（テーブル定義）の変更 — プロジェクト制約で禁止

## Git workflow

- ブランチ: `advisor/002-codify-rls`
- コミット形式: `docs(supabase): RLS ポリシーの棚卸し結果を記録` など
- push / PR はオペレーターの指示があるまで行わない

## Steps

### Step 1: 現行ポリシーを棚卸しする

オペレーターに Supabase ダッシュボードへのアクセス（または `supabase` CLI のリンク済み環境）を依頼し、以下を取得する:

1. 各テーブル（`cabins`, `bookings`, `guests`, `settings`）の RLS 有効/無効
2. 各テーブルの全ポリシー（操作種別 SELECT/INSERT/UPDATE/DELETE、対象ロール、USING/WITH CHECK 式）
3. ストレージバケット `cabin-images` のポリシー（公開読み取り設定を含む）

CLI が使える場合は `bunx supabase db dump --schema public --data-only=false` 相当の出力、あるいは SQL エディタで
`select * from pg_policies where schemaname = 'public';` の結果を取得する。

**Verify**: 4テーブル + 1バケットぶんの棚卸し結果が揃っている（欠けがあれば STOP）。

### Step 2: 結果を `supabase/policies/` に SQL として記録する

- `supabase/policies/README.md` — 「これはダッシュボード管理ポリシーの**記録（写し）**であり、適用スクリプトではない。変更はダッシュボードで行い、変更したらこのファイルを更新する」と冒頭に明記。
- テーブルごとに `supabase/policies/<table>.sql` を作成し、`create policy ...` 形式で現行ポリシーを書き起こす。RLS が無効のテーブルがあれば、その事実を**セキュリティ所見**として README に太字で記録する。
- **秘密値（キー・トークン）は一切書かない**。ポリシー式とロール名のみ。

**Verify**: `ls supabase/policies/*.sql | wc -l` → 4（+ storage 用があれば5）

### Step 3: 期待ポリシーとのギャップ分析を書く

`supabase/README.md` に以下の表を書く: 各テーブル×各操作について「現行ポリシー」「アプリが必要とする最小権限（コード参照付き）」「判定（OK / 過剰許可 / 欠落）」。

アプリが必要とする操作の根拠（このプランの執筆時点で確認済み）:

- `bookings`: SELECT / UPDATE（`updateBooking`）/ DELETE（`deleteBooking`）— INSERT はアプリから行わない（`src/services/apiBookings.ts` に insert なし）
- `cabins`: SELECT / INSERT / UPDATE / DELETE（`src/services/apiCabins.ts`）
- `guests`: SELECT のみ（bookings 経由の join 読み取りのみ。`src/services/` に guests への直接操作なし）
- `settings`: SELECT / UPDATE（`src/services/apiSettings.ts`）
- storage `cabin-images`: authenticated の INSERT（upload）、公開 SELECT（画像 URL 直参照のため）

「guests への INSERT/UPDATE/DELETE を authenticated に許可しているならアプリ要件に対して過剰」のような判定を明記する。

**Verify**: 表に4テーブル×4操作 + storage の行がすべて埋まっている。

### Step 4: docs/design.md に運用ルールを追記する

「セキュリティとGit運用ポリシー」節に、「RLS ポリシーの写しは `supabase/policies/` に保管し、ダッシュボードでの変更時に同期する」旨を1段落追加する。

**Verify**: `bun run lint && bun run typecheck` → exit 0（コード変更がないので当然通る。ガードとして実行）

## Test plan

- コード変更がないため新規ユニットテストはなし。
- ギャップ分析（Step 3）が実質のテスト成果物。過剰許可・欠落が1件でも見つかった場合は README の所見欄に記録し、**修正はオペレーターの判断に委ねる**。

## Done criteria

- [ ] `supabase/policies/` に4テーブルぶんの SQL 記録が存在する
- [ ] `supabase/README.md` にギャップ分析表と判定が存在する
- [ ] RLS 無効のテーブルがあれば太字の所見として記録されている
- [ ] 秘密値がどのファイルにも含まれない（`grep -rE "eyJ|service_role" supabase/` がヒットしない）
- [ ] `git status` で in-scope 外の変更がない
- [ ] `plans/README.md` のステータス更新

## STOP conditions

- Supabase ダッシュボード/CLI へのアクセスが得られない（オペレーターに依頼して待つ。推測でポリシーを書かない）
- RLS が**無効**のテーブルが見つかった場合 — 記録した上で即座に報告する（これは重大所見であり、修正判断は人間が行う）
- ポリシー式に理解できない関数・参照が含まれる場合 — そのまま写し、README に「未解釈」と注記して報告する

## Maintenance notes

- 以後、ダッシュボードでポリシーを変更したら `supabase/policies/` の同期を PR チェック項目に含めること。
- 将来「アプリ内予約作成」（Plan 012 のスパイク）が実装されると `bookings` に INSERT、`guests` に INSERT/UPDATE が必要になり、この表の更新が必須になる。
- レビュー観点: 記録された SQL が「適用してよいもの」と誤解されない構成になっているか（README 冒頭の注意書き）。
