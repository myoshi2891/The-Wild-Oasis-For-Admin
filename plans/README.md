# Implementation Plans

improve スキルによる監査（standard 深度・全9カテゴリ）に基づき 2026-07-04 に生成。
基準コミット: `d267f0c`。特記なき限り下表の順に実行すること。各実行者（executor）は
プランを最後まで読んでから着手し、STOP conditions を厳守して実行結果を reviewer に
報告する。executor はこの index とステータス行を変更しない。完了・BLOCKED 等の
ステータス更新は reviewer が `reconcile` で行う。

実行環境の前提: パッケージマネージャーは **bun のみ**（npm/yarn/pnpm 禁止）。
全コミットは `bun run lint` / `bun run typecheck` / `bun run test` が green であること
（`.claude/rules/02-tdd-step-commit.md`）。

## Execution order & status

| Plan | Title | Priority | Effort | Depends on | Status |
|------|-------|----------|--------|------------|--------|
| [001](001-harden-e2e-seed-target-guard.md) | E2E シードの接続先ガード強化 | P1 | S | — | TODO |
| [002](002-verify-and-codify-rls-policies.md) | RLS ポリシーの検証とコード化 | P1 | M | — | TODO |
| [003](003-ci-supply-chain-and-local-gates.md) | CI の SHA ピン留め・キャッシュ・pre-commit | P1 | S | — | TODO |
| [004](004-service-layer-test-gaps.md) | サービス層の未テスト分岐の補完 | P1 | M | — | TODO |
| [005](005-fix-cabin-image-update-flow.md) | 客室画像フロー修正（アップロード先行 + 検証） | P2 | M | 004 | TODO |
| [006](006-fix-settings-update-and-validation.md) | 設定更新の3欠陥修正（id/queryKey/検証） | P2 | S | 004（推奨） | TODO |
| [007](007-dashboard-correctness-and-efficiency.md) | ダッシュボードの TZ・稼働率・select 修正 | P2 | M | 004 | TODO |
| [008](008-route-level-code-splitting.md) | ルート単位 code-splitting | P2 | S | — | TODO |
| [009](009-eslint9-flat-config-migration.md) | ESLint 9 + flat config 移行 | P2 | M | —（単独実施） | TODO |
| [010](010-tech-debt-uploader-types-env.md) | Uploader 撤去・Supabase 型生成・env 型 | P3 | M | — | TODO |
| [011](011-docs-sync.md) | ドキュメントと実装の同期 | P3 | S | 001（推奨） | TODO |
| [012](012-spike-booking-authoring.md) | 設計スパイク: アプリ内予約作成 | P3 | L | 002, 006 | TODO |

Status values: TODO | IN PROGRESS | DONE | BLOCKED（理由1行） | REJECTED（理由1行）

## Dependency notes

- **004 → 005/006/007**: サービス層を変更するプランの前に、現行挙動を固定する特性テスト
  （004）を着地させる。005 と 007 は 004 のテスト期待値を意図的に更新する（仕様変更として
  コミットメッセージに明記）。
- **009 は単独ブランチで実施**: lint 移行は広範囲のファイルに軽微な修正を発生させるため、
  他プランと並行させると conflict 源になる。005-008 の後が無難。
- **002 → 012**: 予約作成スパイクは RLS の現状把握（002 のギャップ分析表）を前提にする。
- **006 → 012**: 設定バリデーションは予約フォーム検証の防波堤になる。
- **001 → 011**: docs 同期はシード新ガード（`E2E_SUPABASE_URL_ALLOWLIST`）を記載するため、
  001 着地後が望ましい（未着地でも実施可、該当記述をスキップ）。
- 005 と 007 は同じ `services.test.ts` に触るため、並行実施は避け直列にする。

## Findings considered and rejected

（再監査防止のための記録。以下は監査済みで「対応不要」と判定した）

- **React Query Devtools が本番バンドルに混入**: 偽陽性。`@tanstack/react-query-devtools`
  v5 は `NODE_ENV !== 'development'` のビルドで自動的に no-op に置換される。ガード追加は不要。
- **React Query `staleTime: 0` デフォルト**: `CLAUDE.md` に文書化された意図的制約。変更には
  測定結果とオーナー明記が必要（制約の手続きに従う）。
- **undici override の `<8` 上限ピン**: jsdom@28 互換のための意図的決定（記録済み）。
  ただしピン範囲内での `>=7.28.0` への更新は許容（dev-only 脆弱性の解消。既知 advisories は
  すべて test/build ツール系で本番ランタイム露出なし）。
- **react-icons のバンドル肥大**: 全 import が named subpath import（`react-icons/hi2`）で
  tree-shaking が効いており問題なし。
- **フォーム実装の重複（CreateCabinForm 等）**: 各フォームは共有の `FormRow` 抽象を既に
  使用しており、残る差分は本質的に異なるフィールド/ミューテーション。統合は不要。
- **check-in/out の blind update（ステータス前提条件なし）**: UI がステータスでアクションを
  ゲートしており、stale タブからの二重送信の実害は小さい。単独の対応は見送り。
- **稼働率の期間交差の厳密計算**: 近似式のクランプ（Plan 007）で十分。厳密化は工数対効果が
  低いため見送り。

## Audit coverage note

standard 深度で全9カテゴリ（correctness / security / performance / tests / tech-debt /
dependencies / dx / docs / direction）を監査した。未監査領域: `e2e/*.spec.ts` の個々の
テスト品質、styled-components のテーマ実装の細部、`src/ui/` 配下の個別コンポーネントの
アクセシビリティ。Supabase 側の実 RLS ポリシー・スキーマはリポジトリから検証不能
（Plan 002 が対応）。
