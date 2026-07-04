# Plan 005: 客室画像フローを修正する — アップロード成功後に DB 書き込み + アップロード検証を追加

> **Executor instructions**: このプランをステップ順に実行すること。各ステップの
> 検証コマンドを実行し、期待結果を確認してから次に進む。「STOP conditions」に
> 該当したら中断して報告する。完了したら `plans/README.md` のステータス行を更新する。
>
> **Drift check（最初に実行）**: `git diff --stat d267f0c..HEAD -- src/services/apiCabins.ts src/features/cabins/`
> in-scope ファイルに差分がある場合、「Current state」の抜粋と実コードを照合し、
> 不一致なら STOP。

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED（作成/編集の両フローに影響。Plan 004 の特性テストを先に着地させること）
- **Depends on**: plans/004-service-layer-test-gaps.md
- **Category**: bug / perf
- **Planned at**: commit `d267f0c`, 2026-07-04

## Why this matters

`createEditCabin` は現在「DB 行を書く → 画像をアップロードする」の順で処理する。**編集**時に新しい画像のアップロードが失敗すると、意図的にロールバックしない設計（既存客室を消さないため）により、客室行は**存在しない画像 URL** を永久に参照し、一覧に壊れた画像が表示され続ける。自己修復手段はない。処理順を「アップロード成功 → DB 書き込み」に反転すれば、ロールバック自体が不要になり作成/編集の両方が安全になる。あわせて、現在サイズ・MIME 検証ゼロの画像アップロードに上限を設ける。

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

- `imageName` / `imagePath` の生成は同関数の 48-59 行（`crypto.randomUUID()` + supabaseUrl ベースの公開 URL。この形式は**維持する**）。
- `src/features/cabins/CreateCabinForm.tsx:180-183` — フォーム側の画像入力は `accept="image/*"` のみでバイトサイズ検証なし:

```tsx
<FileInput
    accept="image/*"
    type="file"
```

- エラーハンドリング規約: 境界で `console.error` + ユーザー向けメッセージを throw（既存コードのパターンを踏襲）。
- Plan 004 が固定した特性テストのうち「更新+アップロード失敗で delete が呼ばれない」は、本プラン後は「**そもそも DB 書き込みが起きない**」に期待値が変わる。これは意図的な仕様変更としてテストを更新する。

## Commands you will need

| 目的 | コマンド | 成功時の期待結果 |
|------|---------|-----------------|
| 対象テスト | `bunx vitest run src/services src/features/cabins` | 全パス |
| 全テスト | `bun run test` | 全パス |
| Lint / 型 | `bun run lint && bun run typecheck` | exit 0 |
| E2E（任意・環境がある場合のみ） | `bun run test:e2e` | cabins 系 spec がパス |

## Scope

**In scope**:

- `src/services/apiCabins.ts`（`createEditCabin` のみ。`getCabins` / `deleteCabin` は変更しない）
- `src/features/cabins/CreateCabinForm.tsx`（画像バリデーション追加）
- `src/services/__tests__/services.test.ts`（期待値の更新）
- `src/features/cabins/__tests__/CreateCabinForm.test.tsx`（バリデーションのテスト追加）

**Out of scope**（触らない）:

- 画像 URL の形式（`{supabaseUrl}/storage/v1/object/public/cabin-images/{imageName}`）— 既存データとの互換のため変更禁止
- Supabase 側の Storage ポリシー・画像変換設定
- `src/features/cabins/useCreateCabin.ts` / `useEditCabin.ts`（呼び出しシグネチャは不変のはず）

## Git workflow

- ブランチ: `advisor/005-cabin-image-flow`
- コミット分割: ① 処理順の反転 + テスト更新、② フォームバリデーション + テスト
- 形式例: `fix(cabins): 画像アップロード成功後に DB を書き込み、編集時の孤児 URL を防止`

## Steps

### Step 1: アップロードを DB 書き込みの前に移動する

`createEditCabin` を次の順に再構成する:

1. `hasImagePath`（既存 URL 再利用）の場合は従来どおり即 DB 書き込みへ。
2. 新規 `File` の場合、**先に** `supabase.storage.from("cabin-images").upload(imageName, ...)` を実行。失敗したら `console.error` + `"Cabin image could not be uploaded"` を throw（DB は未変更なのでロールバック不要）。
3. アップロード成功後に insert/update を実行。DB 側が失敗した場合、アップロード済み画像が孤児になるが、行が壊れた URL を指すより無害（ストレージの孤児ファイル掃除は Maintenance notes 参照）。この判断をコード内コメント（日本語）で残す。
4. ロールバック用の `delete()` 呼び出しと `if (!id)` 分岐を削除する。

**Verify**: `bunx vitest run src/services` → Plan 004 の「更新+失敗で delete されない」「作成+失敗でロールバック」テストが**失敗する**（Red。仕様変更のため）

### Step 2: 特性テストを新仕様に更新する

`services.test.ts` の createEditCabin 系を更新:

- 作成/編集 × アップロード失敗 → `from("cabins")` の `insert`/`update` が**呼ばれない**こと、`delete` も呼ばれないこと
- 作成/編集 × アップロード成功 → upload の後に insert/update が呼ばれること
- 既存 URL 再利用（`hasImagePath`）→ upload が呼ばれないこと（既存テストを維持）

**Verify**: `bunx vitest run src/services` → 全パス（Green）

### Step 3: フォームに画像バリデーションを追加する

`CreateCabinForm.tsx` の image フィールドに react-hook-form の `validate` を追加する（既存フィールドの `register` パターンを踏襲）:

- 最大バイトサイズ: 5MB（`5 * 1024 * 1024`。定数は `src/utils/constants.ts` に `MAX_CABIN_IMAGE_BYTES` として追加）
- MIME allowlist: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- 編集時に画像未選択（既存 URL 維持）の場合は検証をスキップ（既存の required 制御に合わせる）

**Verify**: `bunx vitest run src/features/cabins` → 既存フォームテストがパス

### Step 4: バリデーションのテストを追加する

`CreateCabinForm.test.tsx` に追加（既存テストの userEvent + モックパターンを踏襲）:

- 6MB のモック File を選択して submit → エラーメッセージ表示、mutation が呼ばれない
- `text/plain` の File → 同上
- 4MB の `image/png` → mutation が呼ばれる

**Verify**: `bun run test && bun run lint && bun run typecheck` → すべて exit 0

## Test plan

- Step 2（サービス層の新仕様固定）と Step 4（フォームバリデーション3ケース）が本体。
- 構造パターン: サービスは `services.test.ts` の既存 createEditCabin describe、フォームは `CreateCabinForm.test.tsx` の既存ケース。
- 環境があれば `bun run test:e2e` で `e2e/cabins.spec.ts` の作成フローが通ることを確認。

## Done criteria

- [ ] `grep -n "delete().eq" src/services/apiCabins.ts` で `createEditCabin` 内のロールバック delete が存在しない（`deleteCabin` 関数内の delete は残る）
- [ ] upload 呼び出しが insert/update より**前**にある（コードレビューで確認）
- [ ] `bun run test` / `bun run lint` / `bun run typecheck` がすべて exit 0
- [ ] 新規バリデーションテスト3ケースがパス
- [ ] `git status` で in-scope 外の変更がない
- [ ] `plans/README.md` のステータス更新

## STOP conditions

- Plan 004 が未着地（特性テストが存在しない）場合 — 先に 004 を実行するよう報告
- `useCreateCabin` / `useEditCabin` のシグネチャ変更が必要になった場合（呼び出し側への波及はこのプランの想定外）
- E2E の cabins spec が画像アップロードのタイミングに依存して壊れる場合

## Maintenance notes

- 新仕様では「アップロード成功 → DB 失敗」時にストレージへ孤児ファイルが残る。頻度は低いが、Supabase 側で定期掃除（cabins.image に参照されないオブジェクトの削除）を将来検討する。
- 画像サイズ上限 5MB は暫定値。運用実態に合わせて `constants.ts` で調整する。
- Supabase の画像変換（リサイズ済み URL の配信）は別改善として見送った（Plan 007 の select 絞り込みと合わせて再検討可）。
