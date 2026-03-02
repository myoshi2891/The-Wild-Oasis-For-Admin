# 実装タスクリスト

各タスクは単独でテスト可能な粒度に分解。

## 🟢 Phase 1: 基盤構築（完了）

- [x] Task 1.1: Vite + React プロジェクトセットアップ
- [x] Task 1.2: Supabase クライアント初期化 (`src/services/supabase.js`)
- [x] Task 1.3: React Router ルーティング構成 (`src/App.jsx`)
- [x] Task 1.4: グローバルスタイル定義 (`src/styles/GlobalStyles.js`)
- [x] Task 1.5: React Query プロバイダー設定

## 🟢 Phase 2: 認証（完了）

- [x] Task 2.1: ログインフォーム + Supabase Auth 連携
- [x] Task 2.2: ProtectedRoute コンポーネント
- [x] Task 2.3: ログアウト処理
- [x] Task 2.4: ユーザーアカウント更新（パスワード / アバター）

## 🟢 Phase 3: コア機能（完了）

- [x] Task 3.1: 客室一覧表示（テーブル + フィルタ + ソート）
- [x] Task 3.2: 客室 CRUD（作成 / 編集 / 削除 / 複製）
- [x] Task 3.3: 客室画像アップロード
- [x] Task 3.4: 予約一覧（テーブル + フィルタ + ソート + ページネーション）
- [x] Task 3.5: 予約詳細ページ
- [x] Task 3.6: チェックイン処理（支払い確認 + 朝食オプション）
- [x] Task 3.7: チェックアウト処理

## 🟢 Phase 4: ダッシュボード（完了）

- [x] Task 4.1: 統計カード（売上 / 稼働率 / チェックイン数）
- [x] Task 4.2: 売上チャート（recharts）
- [x] Task 4.3: 滞在期間分布チャート
- [x] Task 4.4: 今日のアクティビティリスト

## 🟢 Phase 5: 設定 & UI（完了）

- [x] Task 5.1: アプリ設定フォーム
- [x] Task 5.2: ダークモード / ライトモード切替
- [x] Task 5.3: エラーバウンダリ
- [x] Task 5.4: トースト通知システム

## 🔵 Phase 6: 改善・拡張（未着手）

- [ ] Task 6.1: テストカバレッジの追加
- [ ] Task 6.2: パフォーマンス最適化（React.memo / useMemo）
- [ ] Task 6.3: アクセシビリティ改善
- [ ] Task 6.4: PWA 対応の検討
