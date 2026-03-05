# 技術設計書

## アーキテクチャ概要

React SPA + Supabase BaaS 構成。フロントエンドで完結する Client-Side Rendering アーキテクチャ。

```mermaid
graph TB
    User[ユーザー<br/>ホテルスタッフ]

    subgraph Frontend["フロントエンド層"]
        Router[React Router<br/>ルーティング]
        UI[UIコンポーネント<br/>styled-components]
        Features[機能モジュール<br/>ビジネスロジック]
    end

    subgraph State["状態管理層"]
        RQ[React Query<br/>サーバー状態]
        Forms[React Hook Form<br/>フォーム状態]
        Context[Context API<br/>UIテーマ状態]
    end

    subgraph Backend["バックエンド層 (Supabase)"]
        SupaAuth[Authentication<br/>JWT + RLS]
        SupaDB[Database<br/>PostgreSQL]
        SupaStorage[Storage<br/>画像ファイル]
    end

    User --> Router
    Router --> UI
    UI --> Features
    Features --> RQ
    Features --> Forms
    Features --> Context
    RQ --> SupaAuth
    RQ --> SupaDB
    RQ --> SupaStorage
```

## ディレクトリ構造

```text
src/
├── main.tsx                  # エントリーポイント
├── App.tsx                   # ルート定義 + プロバイダー
├── context/
│   ├── DarkModeContext.tsx   # ダークモードテーマ管理
│   └── __tests__/            # コンテキストテスト
├── features/
│   ├── authentication/       # ログイン / ログアウト / アカウント管理
│   ├── bookings/             # 予約一覧 / 詳細 / 操作
│   ├── cabins/               # 客室 CRUD
│   ├── check-in-out/         # チェックイン / チェックアウト処理
│   ├── dashboard/            # 統計 / チャート / 今日のアクティビティ
│   └── settings/             # アプリ設定管理
├── hooks/
│   ├── useOutsideClick.ts    # 汎用フック
│   └── __tests__/            # フックテスト
├── pages/                    # ルートに対応するページコンポーネント
├── services/
│   ├── supabase.ts           # Supabase クライアント初期化
│   ├── apiAuth.ts            # 認証 API
│   ├── apiBookings.ts        # 予約 API
│   ├── apiCabins.ts          # 客室 API
│   ├── apiSettings.ts        # 設定 API
│   └── __tests__/            # サービステスト
├── styles/
│   └── GlobalStyles.ts       # グローバルスタイル定義
├── test/
│   └── setup.ts              # Vitest セットアップ
├── types/
│   ├── domain.ts             # ドメイン型定義（Cabin, Booking 等）
│   ├── supabase.ts           # Supabase 型定義
│   └── common.ts             # 共通ユーティリティ型
├── ui/                       # 再利用可能 UI コンポーネント（.tsx）
└── utils/
    ├── helpers.ts            # ユーティリティ関数
    ├── constants.ts          # 定数定義
    └── __tests__/            # ユーティリティテスト
```

## データモデル（Supabase テーブル）

```mermaid
erDiagram
    cabins {
        int id PK
        string name
        int maxCapacity
        int regularPrice
        int discount
        string description
        string image
    }

    bookings {
        int id PK
        date startDate
        date endDate
        int numNights
        int numGuests
        int cabinPrice
        int extrasPrice
        int totalPrice
        string status
        boolean hasBreakfast
        boolean isPaid
        string observations
        int cabinId FK
        int guestId FK
    }

    guests {
        int id PK
        string fullName
        string email
        string nationality
        string nationalID
        string countryFlag
    }

    settings {
        int id PK
        int minBookingLength
        int maxBookingLength
        int maxGuestsPerBooking
        int breakfastPrice
    }

    cabins ||--o{ bookings : "has"
    guests ||--o{ bookings : "makes"
```

## データフローパターン

```mermaid
sequenceDiagram
    participant UI as UIコンポーネント
    participant Hook as カスタムフック
    participant RQ as React Query
    participant API as services/api*.ts
    participant SB as Supabase

    UI->>Hook: フック呼び出し
    Hook->>RQ: useQuery / useMutation
    RQ->>API: API関数呼び出し
    API->>SB: Supabase SDK
    SB-->>API: データ返却
    API-->>RQ: レスポンス
    RQ-->>Hook: キャッシュ済みデータ
    Hook-->>UI: データ + 状態
```

## 技術スタック

| レイヤー | 技術 | 選定理由 |
| ------- | ------ | --------- |
| Language | TypeScript 5.9 (strict) | 型安全性、リファクタリング支援 |
| UI | React 18 | コンポーネント指向、Hooks対応 |
| Routing | React Router v6 | 宣言的ルーティング、ネストルート |
| State | React Query v4 | サーバー状態同期、楽観的更新 |
| Styling | styled-components v6 | CSS-in-JS、テーマ対応 |
| Forms | react-hook-form v7 | 高パフォーマンスフォーム管理 |
| BaaS | Supabase | PostgreSQL + Auth + Storage 統合 |
| Build | Vite 7 | 高速 HMR、ES Modules ネイティブ |
| Testing | Vitest 4 + Testing Library | ユニット・コンポーネントテスト |
| E2E Testing | Playwright | エンドツーエンドのUI・挙動自動検証 |
| Deploy | Vercel | Vite 最適化、自動プレビュー |

## セキュリティとGit運用ポリシー (Security & Git Policy)

1. **ローカル絶対パス・機密情報のコミット禁止:**
   `.eslintcache` やローカルのIDE設定ファイルなど、ユーザーの実行環境の絶対パス（macOSのユーザー名等を含む）や機密情報（PII）を保持するファイルは一切コミットしてはならない。万が一生成された場合は速やかに `.gitignore` に追加してリポジトリから除外すること。
2. **Git 履歴（History）の改変・書き換え制限:**
   開発やレビューの過程で機密情報の混入が発覚した場合であっても、**ユーザーの明確な事前合意なしに** `git filter-branch` や `git filter-repo` などの履歴改変・全書き換えツールを単独で実行してはならない。必ずユーザーへ状況を報告し、対処方針（単一コミットのRevert、最新HEADからの削除、あるいは履歴のパージ）について事前確認を取ること。

## テスト戦略

### テスト構成

各モジュールの `__tests__/` ディレクトリにテストファイルを配置。

| 対象 | テストファイル | カバレッジ |
| ---- | ------------- | --------- |
| 型定義 | `types/__tests__/domain.test.ts` | ドメイン型の型テスト |
| ユーティリティ | `utils/__tests__/helpers.test.ts`, `constants.test.ts` | 関数・定数の単体テスト |
| カスタムフック | `hooks/__tests__/useLocalStorageState.test.ts`, `useOutsideClick.test.ts` | フック動作テスト |
| コンテキスト | `context/__tests__/DarkModeContext.test.tsx` | コンテキスト + プロバイダーテスト |
| サービス | `services/__tests__/services.test.ts` | API 関数テスト |

### テスト実行

```bash
bun run test           # 全テスト実行
bun run test:watch     # ウォッチモード
bun run test:coverage  # カバレッジレポート付き実行
```

### E2E テストとシードデータ管理 (Playwright)

E2Eテストでは実際ブラウザを介したフローを担保するため、`e2e/` ディレクトリにテストスクリプト（`.spec.ts`）ならびに、テスト用DBへ安全にデータを注入・初期化するシードスクリプト（`seed.ts`）を配置。

#### シードデータの保護と仕様

本番・開発DBの破壊を防ぐため、以下の強固な安全プロセス（Guard）を導入しています。

1. **暗黙的テスト推論制限**: `.env.test` ファイルのパース成功、または `NODE_ENV=test` がない限り実行をブロック。非テスト環境（`.env.local` 等）で実行を強制する場合は `ALLOW_NON_TEST_SEED=true` などの個別 Opt-in が必須。
2. **実行フラグ制限**: `bun run e2e/seed.ts` の単独直叩きではデータベースは初期化されず強制終了。実行には明示的に `--force-seed` 引数または `ALLOW_DESTRUCTIVE_SEED=1` の手動指定が必須。
3. **E2E 自動パイプライン**: `bun run test:e2e` コマンドは、実行毎に常に自動で `bun run seed:e2e`（`--force-seed` 付与済み）をチェーン起動した後 Playwright を走らせるため、手操作によるシードのし忘れや依存のエラー（テストのハングアップ）を防止。

```bash
bun run seed:e2e       # E2E用DBのデータを再生成（--force-seed 自動付加）
bun run test:e2e       # シードデータ注入後、E2Eテストスイートを完全自動実行
bun run test:e2e:ui    # Playwright UI モードでE2Eテスト実行（シード含む）
```
