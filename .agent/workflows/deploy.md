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
4. ビルドを実行: `npm run build`
5. ビルドが失敗した場合は即座に停止してユーザーに報告する
6. $ENV 環境にデプロイ:
   - preview: `vercel` (プレビューデプロイ)
   - production: ユーザーに確認を求めてから `vercel --prod` を実行
7. デプロイ URL を確認してユーザーに報告する
8. デプロイサマリーを Artifact として生成する
