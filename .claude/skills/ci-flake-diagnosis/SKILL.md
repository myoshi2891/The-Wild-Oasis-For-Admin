---
name: ci-flake-diagnosis
description: >
  Diagnoses CI-only test flakes — tests that pass locally but fail intermittently
  on GitHub Actions. Triaged via gh CLI log inspection. Recommends minimal diagnostic
  instrumentation (Vitest --reporter=verbose) before any code change.
  Triggered by: "CI が落ちる", "CI でだけ失敗", "テストがフレーキー",
  "ローカルでは通る", "間欠的に失敗", "CI flake", "intermittent failure",
  "flaky test", "passes locally fails in CI".
invocation: automatic
allowed-tools: [Bash, Read, Grep, Edit]
---

# CI Flake Diagnosis スキル

## 目的

ローカルでは通るが CI でのみ間欠的に失敗するテスト（CI-only flake）の **原因切り分けと最小修正** を行う。投機的なテストコードの書き換えに進む前に、まず CI ログから真因を絞り込む。

---

## トリガー条件

ユーザーが以下のいずれかを言及した場合:

- 「CI が落ちる」「CI でだけ失敗する」
- 「ローカルでは通るのに CI で fail する」
- 「同じテストが間欠的に失敗する」
- GitHub Actions のテスト結果ログを貼り付けてきた

---

## 実行手順

### Step 1｜CI 失敗の事実関係を確定する

ローカル再現を試みる前に **CI ログから事実を集める**。最小限の `gh` コマンドで以下を確定する:

```bash
# 直近 8 件の workflow run を一覧（conclusion / event / SHA を確認）
gh run list --workflow=ci.yml --limit 8 \
  --json conclusion,headSha,event,createdAt

# 失敗した run の test job ログから対象テストの周辺を抽出
gh run view <FAILED_RUN_ID> --log 2>&1 \
  | grep -B 5 -A 50 "FAIL .*\.test\." | head -200
```

確定すべき事実:
- 失敗ログにエラー本文が出ているか
- `Tests: X failed` の数と「Summary of all failing tests」の列挙数の一致
- 失敗テストが直近のどのコミットで追加・変更されたか（`git log --oneline -- <test file>`）

---

### Step 2｜真因仮説を分類する

Step 1 の事実から、以下のパターンに分類する:

#### パターン A: 環境変動による flake
**仮説**: GitHub Actions runner（2-core Ubuntu）の個体差・隣接プロセス負荷で非同期処理のタイミング（setTimeout, requestAnimationFrame等）や React のレンダリングタイミングが乱れる。
**対応**: 診断 instrumentation を追加し、非同期の待機処理（`waitFor` や `findBy*`）のタイムアウトを調整する。

#### パターン B: エラー本文が空の不可視 failure
**仮説**: テスト本体の assertion 失敗ではなく **unhandled promise rejection** が複数発生しテストランナー（Vitest）が捕捉。
**対応**: テスト内で例外が適切にキャッチされているか、Promise のクリーンアップが漏れていないかを確認する。

#### パターン C: タイムアウト / handle leak
**サイン**: `Exceeded timeout` などのエラーメッセージ。
**仮説**: CI runner の処理遅延により、DOM要素の出現がローカル環境より著しく遅れる。
**対応**: `findBy*` や `waitFor` の timeout を拡大する。

---

### Step 3｜診断 instrumentation を入れる（コード修正の前に必ず実施）

**原則**: 真のエラーが見えるまでテストコードを無暗に書き換えない。
**最小侵襲な diagnostic**: `.github/workflows/ci.yml` の test job に `--reporter=verbose` オプションを追加する。

```yaml
      - name: Run Vitest
        run: bun run test -- --reporter=verbose
```

---

### Step 4｜CI で再現させて真のエラーを観察する

Step 3 を push した後、CI の完了を待ってログを確認する。

```bash
# 該当 PR の最新 run を watch
gh run watch

# 完了後、失敗したログを取得
gh run view <RUN_ID> --log
```

---

### Step 5｜真因に応じた最小修正

#### A: 非同期処理の timeout
`findBy*` や `waitFor` の timeout を明示的に拡大する。
```ts
expect(
  await screen.findByTestId("xxx", {}, { timeout: 5000 })
).toBeInTheDocument();
```

#### B: Floating Promise / Act Warning
非同期 State 更新を行う React コンポーネントのテストにおいて、更新処理がテストスコープ内で完全に終了（flush）していない場合、`act()` 警告やエラーになります。更新後の状態を `await screen.findBy*` 等で明示的に待つように修正します。

---

### Step 6｜診断 instrumentation のロールバック判断

修正後、CI が数回連続で正常終了することを確認した上で、不要になった `--reporter=verbose` を撤回します。

---

## 禁止事項

- `vi.setConfig({ retry: N })` などでフレーキーなテストを根本解決せずに隠蔽すること。
- ローカル環境での再現や CI ログの精査をせずに、推測だけでテストコードを大幅に書き換えること。
