---
description: デプロイを実施する。`/deploy` でトリガー。Vercel へのデプロイ手順。
---

# Deploy Workflow

## 引数
- `$ENV`: ターゲット環境 (preview | production)

## 手順

1. `git status` でコミット漏れがないことを確認する
2. Lint を実行: `npm run lint`
3. Lint が失敗した場合は即座に停止してユーザーに報告する
4. テストを実行: `npm test` または CI のテスト成功を確認する
5. テストが失敗した場合は即座に停止してユーザーに報告する
6. ビルドを実行: `npm run build`
7. ビルドが失敗した場合は即座に停止してユーザーに報告する
8. $ENV 環境にデプロイ:
   - preview: `vercel` (プレビューデプロイ)
   - production: 上記テストの成功を確認した上で、ユーザーに確認を求めてから `vercel --prod` を実行
9. デプロイ URL を確認してユーザーに報告する
10. デプロイサマリーを Artifact として生成する
