# Plan 010: tech-debt 小掃除 — Uploader の撤去、Supabase 型の自動生成化、env 型の補完

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進む。「STOP conditions」に
> 該当したら中断して報告する。`plans/README.md` は変更せず、実行結果を reviewer に
> 報告する。ステータス更新は reviewer が `reconcile` で行う。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- src/data/ src/types/supabase.ts vite-env.d.ts src/services/supabase.ts src/services/__tests__/supabase.test.ts .env.example package.json CLAUDE.md docs/design.md`
> 続けて `git diff --stat -- src/data/ src/types/supabase.ts vite-env.d.ts src/services/supabase.ts src/services/__tests__/supabase.test.ts .env.example package.json CLAUDE.md docs/design.md`、
> `git diff --cached --stat -- src/data/ src/types/supabase.ts vite-env.d.ts src/services/supabase.ts src/services/__tests__/supabase.test.ts .env.example package.json CLAUDE.md docs/design.md`、
> `git ls-files --others --exclude-standard -- src/data/ src/types/supabase.ts vite-env.d.ts src/services/supabase.ts src/services/__tests__/supabase.test.ts .env.example package.json CLAUDE.md docs/design.md`
> で unstaged / staged / untracked を個別に確認する。作業ツリーに既存変更があれば STOP。
> in-scope ファイルに差分がある場合、「Current state」の抜粋と実コードを照合し、
> 不一致なら STOP。

## Status

- **Priority**: P3
- **Effort**: M（Step 3 の型生成が M。Step 1-2 は S）
- **Risk**: MED（生成型が手書き型と食い違うと型エラーが広範囲に出る）
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `d267f0c`, 2026-07-04

## Why this matters

3つの独立した負債を一括処理する。(1) `src/data/Uploader.tsx` は **guests/cabins/bookings を全削除して再投入する開発用ツール**で、現在どこからも import されていないデッドコード（執筆時点で grep 確認済み）だが、`src/` に居る限り import 1行で本番バンドルに「データ全消しボタン」が混入しうる。`eslint-disable no-explicit-any` 付きでプロジェクトの any 禁止規約にも違反している。(2) `src/types/supabase.ts` は「ER 図に基づく手動定義」であり、実際の Supabase スキーマとの整合を保証する仕組みがない — ダッシュボード側でスキーマが変わると全サービス層の型が静かに嘘になる。(3) `vite-env.d.ts` は `VITE_SUPABASE_KEY` しか型定義しておらず、`VITE_SUPABASE_URL` は `as string` キャストで誤魔化されている。

## Current state

- `src/data/` の内容: `Uploader.tsx`（全テーブル削除+再投入 UI、`insert(... as any)` キャスト、`console.log` エラー処理）、`data-bookings.ts` / `data-cabins.ts` / `data-guests.ts`（シード用フィクスチャ）。
  未参照の確認コマンド（執筆時に exit 1 = ノーヒットを確認済み）:

```bash
rg -n "data/Uploader|data-cabins|data-guests|data-bookings|import\\([[:space:]]*['\"]\\./data/" . \
  -g "*.{ts,tsx,js,jsx,mjs,cjs}" -g "!src/data/**"
```

- `src/types/supabase.ts:1-4` — 手動定義の宣言:

```ts
// design.md の ER 図に基づく手動定義
```

`src/types/domain.ts` がここから全ドメイン型を導出し、`src/services/supabase.ts` が `createClient<Database>` でクライアントに適用している。

- `vite-env.d.ts`（全9行、執筆時点で確認済み）:

```ts
interface ImportMetaEnv {
    readonly VITE_SUPABASE_KEY: string;
}
```

- `src/services/supabase.ts:4-17` — URL/KEYの `as string` キャストはあるが、両値の欠落ガードは既に `createClient` より前に存在する。このガードは削除・緩和せずテストで固定する。
- E2E シードは `e2e/seed.ts` が担っており（Plan 001 参照）、Uploader の機能はそちらで代替済み。

## Commands you will need

| 目的 | コマンド | 成功時の期待結果 |
|------|---------|-----------------|
| 型 / Lint / テスト | `bun run typecheck && bun run lint && bun run test` | exit 0 / 全パス |
| ビルド | `bun run build` | exit 0 |
| 型生成（Step 3） | `bunx supabase gen types typescript --project-id <ref> --schema public` | 型定義が標準出力される |

## Scope

**In scope**:

- `src/data/`（ディレクトリごと削除）
- `src/types/supabase.ts`（生成型への置換）
- `vite-env.d.ts`
- `src/services/supabase.ts`（キャスト除去）
- `src/services/__tests__/supabase.test.ts`（env欠落ガードの回帰テスト、新規）
- `.env.example`（`SUPABASE_PROJECT_REF` のプレースホルダー）
- `package.json`（`gen:types` スクリプト追加）
- `CLAUDE.md` / `docs/design.md`（型再生成手順の1行追記）

**Out of scope**（触らない）:

- `e2e/seed.ts`（シードの正はこちら。変更しない）
- `src/types/domain.ts` / `common.ts` — 生成型への置換で**コンパイルエラーが出た場合の最小修正のみ**許可
- Supabase スキーマ自体の変更（プロジェクト制約で禁止）

## Git workflow

- ブランチ: `advisor/010-tech-debt`
- コミット分割: ① Uploader 削除、② env 型補完、③ 型自動生成化（それぞれ独立して green）
- 形式例: `chore(data): 未参照の Uploader と seed フィクスチャを削除`

## Steps

### Step 1: Uploader とフィクスチャを削除する

1. 「Current state」の `rg` をリポジトリルートで再実行し、`src/data/` 自体を除くリポジトリ全体のコードから、静的参照と動的 import `import("./data/` のどちらもノーヒット（exit 1）で、未参照が**現在も**真であることを確認する。
2. `src/data/` ディレクトリを削除する。

**Verify**: `bun run typecheck && bun run lint && bun run test && bun run build` → すべて exit 0

### Step 2: env 型を補完しキャストを除去する

1. `vite-env.d.ts` に `readonly VITE_SUPABASE_URL: string;` を追加。
2. `src/services/supabase.ts` の `as string` キャストを除去。
3. 既存の `VITE_SUPABASE_URL` と `VITE_SUPABASE_KEY` の欠落ガードを、必ず
   `createClient<Database>(...)` より前に維持する。片方だけの検証へ弱めたり、型宣言だけで
   実行時検証を置き換えたりしない。
4. `src/services/__tests__/supabase.test.ts` を追加する。`vi.stubEnv` / `vi.resetModules` と
   `createClient` mockを使い、URL欠落、KEY欠落では明確な既存エラーをthrowして
   `createClient` が呼ばれないこと、両方がある場合だけ正しい2値で1回呼ばれることを検証する。

**Verify**: `grep -n "as string" src/services/supabase.ts` → ノーヒット。
`bunx vitest run src/services/__tests__/supabase.test.ts && bun run typecheck` → 全パス / exit 0。

### Step 3: Supabase 型を自動生成に切り替える

1. オペレーターに Supabase プロジェクト ref（または `supabase login` 済み CLI 環境）を依頼する。**ref やトークンをファイルに書き残さないこと。**
2. `bunx supabase gen types typescript --project-id <ref> --schema public > /tmp/supabase-generated.ts` で生成し、手書きの `src/types/supabase.ts` と diff を取る。
3. 差分を分類する:
   - nullability やカラムの過不足 → 生成側が正。`src/types/supabase.ts` を生成結果で**置換**する
   - 生成結果に手書きにない補助型がある → そのまま採用
4. `package.json` に再生成スクリプトを追加:
   `"gen:types": "if [ -z \"${SUPABASE_PROJECT_REF:-}\" ]; then echo \"Error: SUPABASE_PROJECT_REF must be set and non-empty\" >&2; exit 1; fi; tmp_file=$(mktemp src/types/.supabase.ts.XXXXXX) && trap 'rm -f \"$tmp_file\"' EXIT && bunx supabase gen types typescript --project-id \"$SUPABASE_PROJECT_REF\" --schema public > \"$tmp_file\" && mv \"$tmp_file\" src/types/supabase.ts && trap - EXIT"`。
   ref は `SUPABASE_PROJECT_REF` 環境変数で渡し、ハードコードしない。未設定または空文字なら
   Supabase CLI の起動前に明確なエラーで終了する。生成先は `src/types/supabase.ts` と同じ
   ディレクトリの一時ファイルにし、Supabase CLI が成功した後だけ同一ファイルシステム上の
   atomic rename となる `mv` を実行する。生成失敗時は既存の `src/types/supabase.ts` を
   変更せず、一時ファイルだけを `trap` で削除する。
   `.env.example` に `SUPABASE_PROJECT_REF=` と、実行前に値を export するか非追跡の環境ファイルから
   安全にロードする必要があり、`.env.example` は自動ロードされない旨のコメントを追記する。
5. `bun run typecheck` を実行し、生成型の差分がサービス層・feature 層に出したエラーを修正する（`as` キャストで封じず、型に従って直す。10ファイルを超えたら STOP）。
6. `CLAUDE.md` の Build & Test Commands に `gen:types` を、`docs/design.md` に「スキーマ変更時は `bun run gen:types` で型を再生成する」を追記。

**Verify**: `bun run typecheck && bun run test && bun run lint` → すべて exit 0。`head -5 src/types/supabase.ts` に自動生成ヘッダーがあり「手動定義」コメントが消えている

## Test plan

- `supabase.test.ts`: URL欠落、KEY欠落、両方設定済みの3ケース。型宣言では防げない起動時失敗を固定する。
- 既存 70+ テストファイルの全パスがUploader削除・生成型置換の回帰ゲート。
- Step 3 で `src/types/__tests__/domain.test.ts`（型テスト）が生成型との整合を検証してくれる — これが落ちたら型の食い違いの具体的証拠として扱う。

## Done criteria

- [ ] `src/data/` が存在しない（`ls src/data` がエラー）
- [ ] `vite-env.d.ts` に URL/KEY 両方の型がある
- [ ] URL/KEYいずれか欠落時はclient生成前に明確なエラーとなり、両方設定時だけ `createClient` が呼ばれるテストがパス
- [ ] `src/types/supabase.ts` が生成物であるヘッダーを持ち、`package.json` の `gen:types` が空でない `SUPABASE_PROJECT_REF` を CLI 起動前に検証し、`bunx supabase` の出力を `src/types/` 内の一時ファイルへ生成して、成功時だけ同一ファイルシステム上の atomic rename で `mv` する（失敗時は既存ファイルが不変）
- [ ] `.env.example` に秘密値を含まない `SUPABASE_PROJECT_REF` プレースホルダーと、値の export または非追跡の環境ファイルからの安全なロードが必要であり、`.env.example` は自動ロードされない旨の案内がある
- [ ] 承認済みsecret scannerで **access token / service-role token / 秘密鍵 / パスワード等の非公開資格情報のみ**を検出対象とし、① 全コミット履歴、② staged差分、③ 未stagedの追跡対象ファイル変更（`git diff` 対象）、④ 未追跡ファイル の4カテゴリをすべて個別に検査してすべて検出0件である。作業ツリーだけの `git diff` 確認や一部カテゴリのみの確認では完了扱いにしない
- [ ] `SUPABASE_PROJECT_REF` は公開メタデータとして別途確認: `.env.example` に正しくプレースホルダー記載があり、実際の project ref 値が ① 全コミット履歴、② staged差分、③ 未stagedの追跡対象ファイル変更（`git diff` 対象）、④ 未追跡ファイル の4カテゴリすべてに含まれないことを確認する（secret scannerの資格情報検出要件とは分離して管理し、検査範囲のみを同一の4カテゴリに揃える）
- [ ] `bun run typecheck` / `bun run lint` / `bun run test` / `bun run build` がすべて exit 0
- [ ] 実行結果を reviewer に報告し、`plans/README.md` は変更していない

## STOP conditions

- Step 1 の grep で Uploader への参照が**見つかった**場合（このプラン執筆後に誰かが使い始めた — 削除せず報告）
- Supabase CLI へのアクセス・プロジェクト ref が得られない場合（Step 3 をスキップし、Step 1-2 のみ完了として部分報告する）
- 生成型と手書き型の diff が想定外に大きい（テーブルが増えている等）場合 — スキーマが ER 図から乖離している証拠なので、置換前に diff を報告
- Step 3-5 の型エラー修正が10ファイルを超える場合

## Maintenance notes

- 以後、Supabase ダッシュボードでスキーマを変えたら `bun run gen:types` → typecheck → コミットの手順を踏むこと（Plan 002 の RLS 記録同期と同じ運用リズム）。
- `docs/design.md` の ER 図は手書きのまま残る。生成型と ER 図の二重管理になるため、ER 図には「概念図であり、型の正は生成ファイル」と注記するとよい。
- レビュー観点: 生成型置換で `as unknown as` キャストが増えていないか（増えていたら型の食い違いを隠している）。
