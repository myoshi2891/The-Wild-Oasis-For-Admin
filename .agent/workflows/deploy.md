---
description: デプロイを実施する。`/deploy` でトリガー。Vercel へのデプロイ手順。
---

# Deploy Workflow

## 引数

- `$ENV`: ターゲット環境 (preview | production)

## 手順

1. `git status` でコミット漏れがないことを確認する
2. Lint を実行: `bun run lint`
3. Lint が失敗した場合は即座に停止してユーザーに報告する
4. テストを実行: `bun run test` または CI のテスト成功を確認する
5. テストが失敗した場合は即座に停止してユーザーに報告する
6. 型チェックを実行: `bun run typecheck`
7. 型チェックが失敗した場合は即座に停止してユーザーに報告する
8. ビルドを実行: `bun run build`
9. ビルドが失敗した場合は即座に停止してユーザーに報告する
10. $ENV 環境にデプロイ:
   - preview: `vercel` (プレビューデプロイ)
   - production: 上記テストの成功を確認した上で、ユーザーに確認を求めてから `vercel --prod` を実行
11. デプロイ URL を確認してユーザーに報告する
12. デプロイサマリーを Artifact として生成する
