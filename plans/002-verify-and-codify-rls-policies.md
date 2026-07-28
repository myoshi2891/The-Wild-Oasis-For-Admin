# Plan 002: Supabase RLS ポリシーを検証し、リポジトリ内にコード化（マイグレーション化）する

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進む。「STOP conditions」に
> 該当したら中断して報告する。`plans/README.md` は変更せず、実行結果を reviewer に
> 報告する。ステータス更新は reviewer が `reconcile` で行う。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- src/services/ src/ui/ProtectedRoute.tsx supabase/`
> 続けて `git diff --stat -- src/services/ src/ui/ProtectedRoute.tsx supabase/`、
> `git diff --cached --stat -- src/services/ src/ui/ProtectedRoute.tsx supabase/`、
> `git ls-files --others --exclude-standard -- src/services/ src/ui/ProtectedRoute.tsx supabase/`
> で unstaged / staged / untracked を個別に確認する。作業ツリーに既存変更があれば STOP。
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
3. ストレージバケット `cabin-images` の公開読み取り・サイズ・MIME 設定
4. `storage.objects` に対する `cabin-images` 用ポリシー（操作種別、対象ロール、USING/WITH CHECK 式）

CLI が使える場合は `bunx supabase db dump --schema public --data-only=false` 相当の出力、あるいは SQL エディタで
public テーブルの RLS 状態とポリシーをそれぞれ取得する:

```sql
select
  n.nspname as schemaname,
  c.relname as tablename,
  c.relrowsecurity,
  c.relforcerowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r', 'p')
  and c.relname in ('cabins', 'bookings', 'guests', 'settings')
order by c.relname;

select *
from pg_policies
where schemaname = 'public'
  and tablename in ('cabins', 'bookings', 'guests', 'settings')
order by tablename, policyname;
```

`pg_class.relrowsecurity` を RLS の有効状態、`relforcerowsecurity` をテーブル所有者にも
RLS を強制するかの補足情報として記録する。`pg_policies` が0件でも、
`relrowsecurity = false`（RLS 無効）と `relrowsecurity = true`（RLS 有効・ポリシーなし）
を区別する。

Storage は public スキーマと混ぜず、次の2クエリで個別に取得する:

```sql
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'cabin-images';

select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
order by policyname;
```

`storage.objects` のポリシーは文字列 `cabin-images` を含むものだけに事前絞り込みせず、
取得した全件について `cabin-images` への適用可否を後から評価する。`qual` /
`with_check` の直接比較だけでなく、全 bucket に適用される共有ポリシー、呼び出し先関数、
JWT claim やパス条件などの間接条件も追跡し、各ポリシーを「適用」「非適用」「未解釈」
のいずれかとして根拠付きで記録する。

`supabase/README.md` には「public 4テーブル」と「Storage bucket / storage.objects」を別表で記録する。

**Verify**: 4テーブルの RLS、`cabin-images` の公開読み取り設定、`storage.objects` ポリシーの3区分が個別に揃っている。bucket 行または Storage ポリシーのクエリ結果自体を取得できない場合は STOP。クエリ成功かつ0件は「ポリシーなし」として Step 2 で記録する。

### Step 2: 結果を `supabase/policies/` に SQL として記録する

- `supabase/policies/README.md` — 「これはダッシュボード管理ポリシーの**記録（写し）**であり、適用スクリプトではない。変更はダッシュボードで行い、変更したらこのファイルを更新する」と冒頭に明記。
- テーブルごとに `supabase/policies/<table>.sql` を作成し、`create policy ...` 形式で現行ポリシーを書き起こす。RLS が無効のテーブルがあれば、その事実を**セキュリティ所見**として README に太字で記録する。
- `supabase/policies/storage.objects.sql` を必ず作成し、`cabin-images` 用の現行ポリシーを `create policy ... on storage.objects` 形式で記録する。該当ポリシーが0件の場合もファイルを省略せず、「棚卸し時点で該当ポリシーなし」と明記する。
- **秘密値（キー・トークン）は一切書かない**。ポリシー式とロール名のみ。

**Verify**: `test -f supabase/policies/cabins.sql && test -f supabase/policies/bookings.sql && test -f supabase/policies/guests.sql && test -f supabase/policies/settings.sql && test -f supabase/policies/storage.objects.sql` → exit 0。`storage.objects.sql` には取得した全ポリシー、または該当ポリシーが0件だった事実のどちらかが記録されている。SQL ファイル数の確認は補助情報にとどめ、上記5ファイルの個別確認を置き換えない。

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
- [ ] `supabase/policies/storage.objects.sql` が常に存在し、`cabin-images` 用ポリシーまたは該当ポリシーが0件だった事実が記録されている
- [ ] `supabase/README.md` にギャップ分析表と判定が存在する
- [ ] `cabin-images` の `public` / `file_size_limit` / `allowed_mime_types` が public 4テーブルとは別表に記録されている
- [ ] `storage.objects` の `cabin-images` 用ポリシーが操作・ロール・USING/WITH CHECK 式付きで別表に記録されているか、0件の場合はその事実が同じ別表に明記されている
- [ ] RLS 無効のテーブルがあれば太字の所見として記録されている
- [ ] リポジトリで承認済みの secret scanner を使い、`supabase/` に限定せず、(1) リポジトリ全体の現行ファイル、(2) 全 ref から到達可能な全 Git 履歴、(3) staged 差分、(4) untracked ファイルを個別に検査する。Supabase project ref および公開用の anon / publishable key は除外し、service-role token、非公開 access token、秘密鍵、パスワードなどの機密資格情報の検出がすべて0件で、各検査のコマンド・対象範囲・結果を reviewer に報告する。scanner がいずれかの範囲を検査できない場合は「どのファイルにも含まれない」を完了条件にせず、実際に検査できた ref・コミット・パス・差分種別だけを明記し、未検査範囲が残る限りこの項目は未完了として扱う
- [ ] `git status` で in-scope 外の変更がない
- [ ] 実行結果を reviewer に報告し、`plans/README.md` は変更していない

## STOP conditions

- Supabase ダッシュボード/CLI へのアクセスが得られない（オペレーターに依頼して待つ。推測でポリシーを書かない）
- `cabin-images` の bucket 設定または `storage.objects` ポリシーのどちらかを取得できない
- RLS が**無効**のテーブルが見つかった場合 — 記録した上で即座に報告する（これは重大所見であり、修正判断は人間が行う）
- ポリシー式に理解できない関数・参照が含まれる場合 — そのまま写し、README に「未解釈」と注記して報告する

## Maintenance notes

- 以後、ダッシュボードでポリシーを変更したら `supabase/policies/` の同期を PR チェック項目に含めること。
- 将来「アプリ内予約作成」（Plan 012 のスパイク）が実装されると `bookings` に INSERT、`guests` に INSERT/UPDATE が必要になり、この表の更新が必須になる。
- レビュー観点: 記録された SQL が「適用してよいもの」と誤解されない構成になっているか（README 冒頭の注意書き）。
