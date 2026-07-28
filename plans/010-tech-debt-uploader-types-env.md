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
| 型生成（Step 3） | `bunx supabase@2.109.1 gen types typescript --project-id <ref> --schema public` | 型定義が標準出力される |

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

1. オペレーターに Supabase プロジェクト ref を依頼する。方法 A/B のどちらでも project ref は必須であり、`supabase login` 済みの CLI 環境は認証に利用できるが、project ref の代替にはならない。方法 A/B を始める前に、`SUPABASE_PROJECT_REF` が `VITE_SUPABASE_URL`（`https://<ref>.supabase.co`）の `<ref>` と完全に一致することを確認する。一致を確認できない場合や異なる場合は、型生成を実行せず、既に生成した結果も採用しない。**ref やトークンをファイルに書き残さないこと。**
2. Supabase 型の生成と置換は **次のいずれか一方** で行う:
   - **方法 A（初回移行推奨）**: 一致確認済みの値を使い、同じシェルで `export VITE_SUPABASE_URL=<url> SUPABASE_PROJECT_REF=<ref>` を実行してから `bun run gen:types` に委譲する。手順 4 で追加されるスクリプト自身も両値の存在と完全一致を検証してから `SUPABASE_PROJECT_REF` を `--project-id` に渡し、`src/types/` 内に一時ファイルを生成して、成功時だけ atomic rename で `src/types/supabase.ts` へ書き込む。レビューが必要な場合は `git diff src/types/supabase.ts` で確認する。
   - **方法 B（手動確認が必要な場合）**: B-1 の `<ref>` を一致確認済みの `SUPABASE_PROJECT_REF` に置き換え、下記の **3 ステップ** を **同一のシェルセッション（同一ターミナルウィンドウ／タブ）で連続実行** する。B-1 で設定した `tmp_file`、`generation_succeeded`、`trap` は、シェルを閉じるか B-3 で解除されるまで有効であるため、B-2・B-3 でも同じ生成成功状態と一時ファイルを参照できる。各ステップは独立しており、自動では次のステップに進まない:

     > ⚠️ **必須**: B-1〜B-3 は **同一シェルセッション** で実行すること。シェルを再起動すると `tmp_file` と `generation_succeeded` が失われ、一時ファイルの生成成功を検証できない。

     **ステップ B-1: 一時ファイルへ型定義を生成する**
     ```bash
     tmp_file=$(mktemp src/types/.supabase.ts.XXXXXX) || exit $?
     generation_succeeded=0
     trap 'rm -f "$tmp_file"' EXIT INT TERM
     if bunx supabase@2.109.1 gen types typescript \
          --project-id <ref> --schema public > "$tmp_file"; then
       generation_succeeded=1
       echo "生成成功: $tmp_file"
     else
       generation_status=$?
       rm -f "$tmp_file"
       trap - EXIT INT TERM
       unset tmp_file generation_succeeded
       echo "型生成失敗 (exit $generation_status); aborting" >&2
       exit "$generation_status"
     fi
     ```
     - CLI が失敗した場合は一時ファイルを削除し、`trap` と変数を解除してシェルを終了するため、B-2・B-3 には進めない。
     - `echo "生成成功: ..."` が出力されたことを目視で確認してから **同一シェルで** 次のステップへ進む。
     - 成功時だけ `generation_succeeded=1` となる。`tmp_file`、`generation_succeeded`、`trap` は、このシェルセッションが続く限り有効。

     **ステップ B-2: diff で差分を確認する（同一シェルで実行）**
     ```bash
     if [ "${generation_succeeded:-0}" -ne 1 ]; then
       echo "型生成の成功を確認できないため aborting" >&2
       exit 1
     fi
     diff_status=0
     diff src/types/supabase.ts "$tmp_file" || diff_status=$?
     if [ "$diff_status" -ge 2 ]; then
       rm -f "$tmp_file"
       trap - EXIT INT TERM
       unset tmp_file generation_succeeded
       echo "diff failed (exit $diff_status); aborting" >&2
       exit "$diff_status"
     elif [ "$diff_status" -eq 0 ]; then
       echo "差分なし（レビュー完了後、置換の要否を判断）"
     else
       echo "差分あり（レビュー完了後、置換の要否を判断）"
     fi
     ```
     - B-1 と同一シェルで `generation_succeeded=1` を確認してから、`$tmp_file` が指す生成成功済みの一時ファイルだけを比較する。
     - `diff` の終了コード 0（差分なし）と 1（差分あり）はどちらも **確認のみ** の正常結果であり、自動では B-3 に進まない。内容をレビューし、置換の要否を判断する。
     - 終了コード 2 以上では一時ファイルを削除し、`trap` と両変数を解除してシェルを終了する。生成ファイルを検証できていないため、B-3 は実行しない。

     **ステップ B-3: 問題なければ手動で mv する（同一シェルで実行）**
     ```bash
     if [ "${generation_succeeded:-0}" -ne 1 ]; then
       echo "型生成の成功を確認できないため置換しない" >&2
       exit 1
     fi
     mv "$tmp_file" src/types/supabase.ts \
       && trap - EXIT INT TERM \
       && unset tmp_file generation_succeeded
     ```
     - B-1 と同一シェルで `generation_succeeded=1` を再確認してから、生成成功済みの `$tmp_file` だけを置換に使う。
     - `trap - EXIT INT TERM` で `trap` を解除して両変数を破棄し、`mv` 後に二重削除や一時ファイルの再利用が起きないようにする。
     - 置換が不要と判断した場合は `mv` を実行せず、`rm -f "$tmp_file" && trap - EXIT INT TERM && unset tmp_file generation_succeeded` で一時ファイル、`trap`、両変数を破棄する。
     - シェルを閉じた場合や中断した場合でも（`trap -` 前であれば）`trap` が一時ファイルを削除する。
   > **重要**: 生成ファイルを `/tmp` に書き出した後で `cp` や `mv` でターゲットに移動する手順は **禁止**。生成先は必ず `src/types/` 配下にすること。
3. 差分を分類する:
   - nullability やカラムの過不足 → 生成側が正。`src/types/supabase.ts` を生成結果で**置換**する
   - 生成結果に手書きにない補助型がある → そのまま採用
4. `package.json` に再生成スクリプトを追加:
   `"gen:types": "if [ -z \"${SUPABASE_PROJECT_REF:-}\" ]; then echo \"Error: SUPABASE_PROJECT_REF must be set and non-empty\" >&2; exit 1; fi; if [ -z \"${VITE_SUPABASE_URL:-}\" ]; then echo \"Error: VITE_SUPABASE_URL must be set and non-empty\" >&2; exit 1; fi; url_host=${VITE_SUPABASE_URL#https://}; url_host=${url_host%%/*}; url_project_ref=${url_host%.supabase.co}; if [ \"$url_host\" = \"$VITE_SUPABASE_URL\" ] || [ -z \"$url_project_ref\" ] || [ \"$url_host\" != \"${url_project_ref}.supabase.co\" ]; then echo \"Error: VITE_SUPABASE_URL must be a valid Supabase project URL\" >&2; exit 1; fi; if [ \"$SUPABASE_PROJECT_REF\" != \"$url_project_ref\" ]; then echo \"Error: SUPABASE_PROJECT_REF must match VITE_SUPABASE_URL\" >&2; exit 1; fi; tmp_file=$(mktemp src/types/.supabase.ts.XXXXXX) && trap 'rm -f \"$tmp_file\"' EXIT && bunx supabase@2.109.1 gen types typescript --project-id \"$SUPABASE_PROJECT_REF\" --schema public > \"$tmp_file\" && mv \"$tmp_file\" src/types/supabase.ts && trap - EXIT"`。
   Supabase CLI は `bunx supabase@2.109.1`（バージョン 2.109.1 固定）を使用する。CLI を更新する際はこのバージョン番号をスクリプトと本プランの検証手順の両方で同時に変更すること。
   ref は `SUPABASE_PROJECT_REF` 環境変数で渡し、ハードコードしない。`SUPABASE_PROJECT_REF`
   または `VITE_SUPABASE_URL` が未設定・空文字、URL が想定形式でない、または URL から
   抽出した ref と `SUPABASE_PROJECT_REF` が完全一致しない場合は、一時ファイルの作成前に
   明確なエラーで終了し、Supabase CLI と `mv` を実行しない。検証成功後の生成先は
   `src/types/supabase.ts` と同じディレクトリの一時ファイルにし、Supabase CLI が成功した
   後だけ同一ファイルシステム上の atomic rename となる `mv` を実行する。生成失敗時は
   既存の `src/types/supabase.ts` を変更せず、一時ファイルだけを `trap` で削除する。
   `.env.example` に、対象プロジェクトのメタデータとして実値を含まない
   `SUPABASE_PROJECT_REF=` プレースホルダーを `VITE_SUPABASE_URL` の近くに追加する。併せて、
   この値は URL（`https://<ref>.supabase.co`）の `<ref>` と一致させること、実行前に
   `export VITE_SUPABASE_URL=<url> SUPABASE_PROJECT_REF=<ref>` で両値を設定すること、
   `.env.example` は自動ロードされないことをコメントで案内する。
5. `bun run typecheck` を実行し、生成型の差分がサービス層・feature 層に出したエラーを修正する（`as` キャストで封じず、型に従って直す。10ファイルを超えたら STOP）。
6. `CLAUDE.md` の Build & Test Commands に `gen:types` を、`docs/design.md` に「スキーマ変更時は `bun run gen:types` で型を再生成する」を追記。

**Verify**: `bun run typecheck && bun run test && bun run lint` → すべて exit 0。`head -5 src/types/supabase.ts` に自動生成ヘッダーがあり「手動定義」コメントが消えている。型生成に使用した Supabase CLI バージョンが `bunx supabase@2.109.1` であることを確認し、バージョンを変更した場合は `package.json` の `gen:types` スクリプトおよびこの検証手順の両方を同時に更新する。

## Test plan

- `supabase.test.ts`: URL欠落、KEY欠落、両方設定済みの3ケース。型宣言では防げない起動時失敗を固定する。
- 既存 70+ テストファイルの全パスがUploader削除・生成型置換の回帰ゲート。
- Step 3 で `src/types/__tests__/domain.test.ts`（型テスト）が生成型との整合を検証してくれる — これが落ちたら型の食い違いの具体的証拠として扱う。

## Done criteria

- [ ] `src/data/` が存在しない（`ls src/data` がエラー）
- [ ] `vite-env.d.ts` に URL/KEY 両方の型がある
- [ ] URL/KEYいずれか欠落時はclient生成前に明確なエラーとなり、両方設定時だけ `createClient` が呼ばれるテストがパス
- [ ] `src/types/supabase.ts` が生成物であるヘッダーを持ち、`package.json` の `gen:types` が空でない `SUPABASE_PROJECT_REF` と `VITE_SUPABASE_URL` を検証してURLから抽出したrefとの完全一致をCLI起動前に要求し、検証成功後だけ `bunx supabase` の出力を `src/types/` 内の一時ファイルへ生成して、成功時だけ同一ファイルシステム上の atomic rename で `mv` する（検証・生成失敗時は既存ファイルが不変）
- [ ] `.env.example` の `VITE_SUPABASE_URL` の近くに、対象プロジェクトのメタデータとして秘密値を含まない `SUPABASE_PROJECT_REF` プレースホルダーがあり、URL の `<ref>` と一致させること、実行前に `export VITE_SUPABASE_URL=<url> SUPABASE_PROJECT_REF=<ref>` で両値を設定すること、`.env.example` は自動ロードされないことの案内がある
- [ ] 方法 A/B の実行前に `SUPABASE_PROJECT_REF` と `VITE_SUPABASE_URL` の `<ref>` が一致すると確認済みであり、不一致または確認不能なprojectから生成した型を採用していない
- [ ] 方法 B は B-1 の生成成功時だけ `generation_succeeded=1` を設定し、B-2/B-3 がその値を必須検証する。生成失敗時は一時ファイルを削除して終了し、B-3 の `mv` は実行されない
- [ ] 承認済みsecret scannerで **access token / service-role token / 秘密鍵 / パスワード等の非公開資格情報のみ**を検出対象とし、① 全コミット履歴、② staged差分、③ 未stagedの追跡対象ファイル変更（`git diff` 対象）、④ 未追跡ファイル の4カテゴリをすべて個別に検査してすべて検出0件である。作業ツリーだけの `git diff` 確認や一部カテゴリのみの確認では完了扱いにしない
- [ ] `SUPABASE_PROJECT_REF` は公開メタデータとして別途確認: `.env.example` に正しくプレースホルダー記載があり、実際の project ref 値が ① 全コミット履歴、② staged差分、③ 未stagedの追跡対象ファイル変更（`git diff` 対象）、④ 未追跡ファイル の4カテゴリすべてに含まれないことを確認する（secret scannerの資格情報検出要件とは分離して管理し、検査範囲のみを同一の4カテゴリに揃える）
- [ ] `bun run typecheck` / `bun run lint` / `bun run test` / `bun run build` がすべて exit 0
- [ ] 実行結果を reviewer に報告し、`plans/README.md` は変更していない

## STOP conditions

- Step 1 の grep で Uploader への参照が**見つかった**場合（このプラン執筆後に誰かが使い始めた — 削除せず報告）
- Supabase CLI へのアクセス・プロジェクト ref が得られない場合（Step 3 をスキップし、Step 1-2 のみ完了として部分報告する）
- `SUPABASE_PROJECT_REF` と `VITE_SUPABASE_URL` の `<ref>` が一致しない、または一致を確認できない場合（型生成・生成結果の採用を行わず報告する）
- 生成型と手書き型の diff が想定外に大きい（テーブルが増えている等）場合 — スキーマが ER 図から乖離している証拠なので、置換前に diff を報告
- Step 3-5 の型エラー修正が10ファイルを超える場合

## Maintenance notes

- 以後、Supabase ダッシュボードでスキーマを変えたら `bun run gen:types` → typecheck → コミットの手順を踏むこと（Plan 002 の RLS 記録同期と同じ運用リズム）。
- `docs/design.md` の ER 図は手書きのまま残る。生成型と ER 図の二重管理になるため、ER 図には「概念図であり、型の正は生成ファイル」と注記するとよい。
- レビュー観点: 生成型置換で `as unknown as` キャストが増えていないか（増えていたら型の食い違いを隠している）。
