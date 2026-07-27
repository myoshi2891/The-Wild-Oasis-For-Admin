# Plan 005: 客室画像フローを信頼境界へ移し、DB 失敗時の孤児画像を即時削除する

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進む。「STOP conditions」に
> 該当したら中断して報告する。`plans/README.md` は変更せず、実行結果を reviewer に
> 報告する。ステータス更新は reviewer が `reconcile` で行う。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- src/services/apiCabins.ts src/features/cabins/ supabase/ docs/design.md`
> 続けて `git diff --stat -- src/services/apiCabins.ts src/features/cabins/ supabase/ docs/design.md`、
> `git diff --cached --stat -- src/services/apiCabins.ts src/features/cabins/ supabase/ docs/design.md`、
> `git ls-files --others --exclude-standard -- src/services/apiCabins.ts src/features/cabins/ supabase/ docs/design.md`
> で unstaged / staged / untracked を個別に確認する。作業ツリーに既存変更があれば STOP。
> in-scope ファイルに差分がある場合、「Current state」の抜粋と実コードを照合し、
> 不一致なら STOP。

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: HIGH（作成/編集フロー、Storage RLS、Edge Function のデプロイに影響）
- **Depends on**: plans/002-verify-and-codify-rls-policies.md, plans/004-service-layer-test-gaps.md
- **Category**: bug / security
- **Planned at**: commit `d267f0c`, 2026-07-04

## Why this matters

`createEditCabin` は現在「DB 行を書く → 画像をアップロードする」の順で処理する。**編集**時にアップロードが失敗すると、客室行は存在しない画像 URL を参照し続ける。一方、単に順序を反転すると「upload 成功 → DB 失敗」で Storage に孤児画像が残る。また、この SPA のフォームや `src/services/` はブラウザ上で動くため、サイズ・MIME 検証の信頼境界にはならず、直接 Storage API を呼ぶクライアントや偽装 `File.type` を防げない。新規画像を扱う作成/編集を認証済み Supabase Edge Function に集約し、サーバー側の実バイト検証、upload、DB 書き込み、失敗時 cleanup を1リクエスト内で完結させる。

## Current state

- `src/services/apiCabins.ts:44-100` — `createEditCabin`。現在の処理順（執筆時点で確認済み）:

```ts
// 1) 先に DB 行を insert/update（image には未アップロードの URL を書く）
let builder;
if (id) {
    const payload = { ...newCabin, image: imagePath } as CabinUpdate;
    builder = query.update(payload).eq("id", id);
} else {
    const payload = { ...newCabin, image: imagePath } as CabinInsert;
    builder = query.insert([payload]);
}
const { data, error } = await builder.select().single();
// ...
// 2) 後からアップロード。失敗時、編集(id あり)ではロールバックしない
const { error: storageError } = await supabase.storage
    .from("cabin-images")
    .upload(imageName, newCabin.image as File);
if (storageError) {
    // Only rollback (delete) for create flow — don't delete existing cabins on update
    if (!id) {
        await supabase.from("cabins").delete().eq("id", (data as Cabin).id);
    }
```

- `imageName` / `imagePath` は現在同関数の 48-59 行でクライアント生成されている。公開 URL の既存形式は維持するが、object path の生成は Edge Function 内へ移し、クライアント入力を使用しない。
- `src/features/cabins/CreateCabinForm.tsx:180-183` — フォーム側の画像入力は `accept="image/*"` のみでバイトサイズ検証なし:

```tsx
<FileInput
    accept="image/*"
    type="file"
```

- エラーハンドリング規約: 境界で `console.error` + ユーザー向けメッセージを throw（既存コードのパターンを踏襲）。
- `src/services/supabase.ts` のクライアントから Edge Function は `supabase.functions.invoke(...)` で呼べる。Edge Function はユーザー JWT を検証し、DB 書き込みはユーザー権限、Storage upload/remove だけをサーバー秘密鍵のクライアントで行う。秘密鍵をクライアントやログへ出さない。
- Plan 002 で棚卸しした `cabin-images` の authenticated INSERT ポリシーは、Edge Function 経由を強制するため無効化が必要。ポリシー適用はオペレーター承認を得て行い、記録を `supabase/policies/` と同期する。

## Commands you will need

| 目的 | コマンド | 成功時の期待結果 |
|------|---------|-----------------|
| 対象テスト | `bunx vitest run src/services src/features/cabins` | 全パス |
| Edge Function テスト | `bunx supabase functions serve cabin-image` と関数テスト | 認証・検証・cleanup ケースが全パス |
| 全テスト | `bun run test` | 全パス |
| Lint / 型 | `bun run lint && bun run typecheck` | exit 0 |
| E2E（任意・環境がある場合のみ） | `bun run test:e2e` | cabins 系 spec がパス |

## Scope

**In scope**:

- `src/services/apiCabins.ts`（`createEditCabin` のみ。`getCabins` / `deleteCabin` は変更しない）
- `src/features/cabins/CreateCabinForm.tsx`（画像バリデーション追加）
- `src/services/__tests__/services.test.ts`（期待値の更新）
- `src/features/cabins/__tests__/CreateCabinForm.test.tsx`（バリデーションのテスト追加）
- `src/utils/constants.ts`（画像制約のクライアント表示用定数）
- `supabase/functions/cabin-image/`（認証、実バイト検証、upload、DB 書き込み、cleanup と関数テスト）
- `supabase/policies/` / `supabase/README.md`（Storage の期待設定と承認済み変更の記録）
- `docs/design.md`（画像書き込みの信頼境界とcleanup契約）

**Out of scope**（触らない）:

- 画像 URL の形式（`{supabaseUrl}/storage/v1/object/public/cabin-images/{imageName}`）— 既存データとの互換のため変更禁止
- Supabase の画像変換・リサイズ設定
- 既存画像 URL を再利用する編集フロー

## Git workflow

- ブランチ: `advisor/005-cabin-image-flow`
- コミット分割: ① Edge Function の検証とテスト、② upload/DB/cleanup とクライアント接続、③ bucket/RLS 設定記録、④ フォームUX検証
- 形式例: `fix(cabins): 画像書き込みを検証済み Edge Function に集約`

## Steps

### Step 1: Edge Function に実効的な画像検証を実装する

`supabase/functions/cabin-image/` に認証必須の関数を追加する:

1. Authorization header のユーザーを検証し、未認証は 401。クライアントから受け取る multipart/form-data は `id`（編集時のみ）、客室フィールド、`File` に限定し、`imageName`、object path、公開 URL は受け付けず使用しない。
2. `file.size` が `1..5 * 1024 * 1024` の範囲であることをサーバー側で確認する。
3. `File.type` だけを信用せず先頭バイトから JPEG（`ff d8 ff`）、PNG、WebP（RIFF + WEBP）、GIF87a/GIF89a を判定する。検出結果が許可リスト外、または申告 MIME と不一致なら upload 前に 400。
4. DB payload は既知フィールドだけを組み立て、クライアント入力の任意キーをそのまま spread しない。

検証関数を副作用から分離し、5MBちょうど、5MB+1、許可4形式、`text/plain`、PNGを `image/jpeg` と申告した偽装、未知シグネチャをテストする。

**Verify**: 関数テスト → upload/DB mock が不正入力では呼ばれず、全境界ケースがパス。

### Step 2: upload・DB 書き込み・即時cleanupを1リクエストにする

検証後の Edge Function を次の順で実装する:

1. Edge Function 内で `crypto.randomUUID()` 相当を使って衝突しない object 名を生成する。bucket は定数 `cabin-images` に固定し、完全な Storage object path が常に `cabin-images/<server-generated-name>` の配下になるようにする。クライアント由来のファイル名は拡張子を含め path 生成に使用しない。
2. 検出済み MIME を `contentType` に指定し、service-role の Storage client で生成済み path に upload。
3. 生成された既存互換 URL を使い、ユーザー JWT を引き継いだ client で cabin を insert/updateして RLS を維持。新規画像を伴う作成・編集の両方で同じサーバー生成 path だけを使う。
4. DB が失敗したら同じリクエスト内で、同じ service-role Storage client により直ちに生成済み path を `remove` してからエラーを返す。
5. cleanup も失敗した場合は成功扱いにせず、object path と両エラー種別を `console.error` に残し、`CABIN_WRITE_AND_CLEANUP_FAILED` を返す。秘密値やJWTは記録しない。Functions Logs でこのコードを監視対象にする。

コード内に「画像upload後のDB失敗は同一リクエストで即時削除し、cleanup失敗も成功扱いにしない」という日本語コメントを置く。定期GCへ先送りしない。

**Verify**: 作成・編集とも path が Edge Function 内でのみ生成され `cabin-images/` 配下に制約されること、クライアントが送った `imageName` / path 値が受理・使用されないこと、upload失敗ではDB未実行、DB失敗ではservice-role clientのremoveが同じ生成済みpathで1回、remove失敗では明示エラーとログ、成功時だけCabinを返すテストがパス。

### Step 3: クライアントを Edge Function 呼び出しへ切り替える

- `hasImagePath` の既存URL再利用は従来どおりDBだけ更新する。
- 新規 `File` の作成/編集は direct Storage uploadを廃止し、`cabin-image` 関数を呼ぶ。クライアントは `imageName` / path を生成・送信しない。戻り値と `createEditCabin` の公開シグネチャは維持する。
- `services.test.ts` で作成/編集の直接呼び出しも関数を通り、ブラウザ側の `storage.upload` が呼ばれないことを固定する。

**Verify**: `bunx vitest run src/services` → 全パス。

### Step 4: Storage 側の迂回経路を閉じる

オペレーター承認のもと、`cabin-images` bucket に `file_size_limit = 5242880` と
`allowed_mime_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']` を設定する。
authenticated client の direct INSERT ポリシーを削除し、Edge Function のサーバー側 client
だけが upload/remove できる構成にする。適用内容を Plan 002 の形式で記録する。

**Verify**: 認証済みブラウザclientからの直接uploadは拒否、Edge Function経由の有効画像は成功、5MB超過と許可外MIMEはStorage側でも拒否。承認・適用・live確認ができなければ STOP。

### Step 5: フォームにUX用画像バリデーションを追加する

`CreateCabinForm.tsx` の image フィールドに react-hook-form の `validate` を追加する（既存フィールドの `register` パターンを踏襲）:

- 最大バイトサイズ: 5MB（`5 * 1024 * 1024`。定数は `src/utils/constants.ts` に `MAX_CABIN_IMAGE_BYTES` として追加）
- MIME allowlist: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- 編集時に画像未選択（既存 URL 維持）の場合は検証をスキップ（既存の required 制御に合わせる）

この検証は早いフィードバックのための補助であり、セキュリティ境界は Step 1/4 とコメントする。

**Verify**: `CreateCabinForm.test.tsx` で6MBと `text/plain` はmutation不発、4MB PNGはmutation発火。`bun run test && bun run lint && bun run typecheck` → すべて exit 0。

## Test plan

- Edge Function: 未認証、5MB境界、4形式のmagic bytes、申告MIME偽装、未知形式、upload失敗、DB失敗+cleanup成功、DB失敗+cleanup失敗。
- サービス: 作成/編集の直接呼び出しが必ずEdge Functionを経由し、direct Storage uploadを使わない。既存URL再利用は関数を呼ばない。
- フォーム: 6MB、`text/plain`、4MB PNG。UX検証を迂回してもEdge Functionが拒否することを関数テストで証明する。

## Done criteria

- [ ] 新規Fileの作成/編集でブラウザから `storage.upload` を直接呼ばない
- [ ] 作成・編集のobject pathはEdge Function内でのみ生成され、常に`cabin-images/`配下であり、クライアント由来の`imageName` / pathをupload・removeに使用しない
- [ ] Edge Function が5MB上限、許可4形式のmagic bytes、申告MIME一致をupload前に強制する
- [ ] DB失敗時に同じobject pathを即時removeし、cleanup失敗も明示エラーとして記録・返却する
- [ ] bucketの5MB/MIME制限とdirect authenticated INSERT拒否がlive確認され、設定記録がリポジトリと一致する
- [ ] `bun run test` / `bun run lint` / `bun run typecheck` がすべて exit 0
- [ ] Edge Function、サービス、フォームの全境界テストがパス
- [ ] `git status` で in-scope 外の変更がない
- [ ] 実行結果を reviewer に報告し、`plans/README.md` は変更していない

## STOP conditions

- Plan 002/004 が未着地の場合 — Storage現状とサービス特性を先に固定する
- Storage RLS変更、bucket制限、Edge Functionデプロイのオペレーター承認が得られない場合
- ユーザーJWTを引き継いだDB書き込みで既存RLSを維持できない場合（service roleでDB認可を迂回しない）
- E2E の cabins spec が画像アップロードのタイミングに依存して壊れる場合

## Maintenance notes

- cleanup失敗ログは孤児画像が残ったことを示す運用アラートとして扱い、object pathから手動復旧できるようにする。
- 画像サイズ上限を変更するときはフォーム定数、Edge Function、bucket設定、テストを同じ変更で同期する。
- Supabase の画像変換（リサイズ済み URL の配信）は別改善として見送った（Plan 007 の select 絞り込みと合わせて再検討可）。
