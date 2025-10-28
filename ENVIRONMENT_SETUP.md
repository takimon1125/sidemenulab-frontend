# 環境変数の設定

## 概要

このアプリケーションは環境変数を使用して、ローカル開発環境と Vercel 本番環境を切り替えることができます。

## 📁 ファイル構成

```
sidemenulab-frontend/
├── src/
│   └── config/
│       └── environment.ts    # 環境設定の読み込みと管理
├── ENVIRONMENT_SETUP.md      # このドキュメント
└── vercel.json               # Vercelの設定
```

## 🏠 ローカル開発環境

### 1. `.env.local` ファイルを作成

プロジェクトのルートディレクトリに `.env.local` ファイルを作成してください：

```bash
# ローカル開発環境
# デバッグモードを有効にする
VITE_DEBUG_MODE=true

# ローカルのAPIエンドポイント
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

これで `http://localhost:3000` でアプリケーションが起動します。

## 🚀 本番環境（Vercel）へのデプロイ

### 方法 1: Vercel ダッシュボードで設定

1. Vercel にログインし、プロジェクトを開く
2. **Settings** → **Environment Variables** に移動
3. 以下の環境変数を追加：

| Name                | Value                                                         | Environment |
| ------------------- | ------------------------------------------------------------- | ----------- |
| `VITE_API_BASE_URL` | 本番環境の API URL（例: `https://api.yourdomain.com/api/v1`） | Production  |
| `VITE_DEBUG_MODE`   | `false`（デバッグログを無効化）                               | Production  |

4. **Save** をクリック
5. 新しいデプロイをトリガー（または再デプロイ）

### 方法 2: Vercel CLI で設定

```bash
# Vercel CLIでログイン
vercel login

# プロジェクトディレクトリに移動
cd /path/to/sidemenulab-frontend

# 環境変数を設定
vercel env add VITE_API_BASE_URL production
# プロンプトでAPI URLを入力（例: https://api.yourdomain.com/api/v1）

vercel env add VITE_DEBUG_MODE production
# プロンプトで false を入力

# 本番環境にデプロイ
vercel --prod
```

## 🔍 環境の判定

アプリケーション内で環境を判定するには、`src/config/environment.ts` をインポートします：

```typescript
import { config, debugLog } from "@/config/environment";

// 環境情報
console.log("API URL:", config.apiBaseUrl);
console.log("デバッグモード:", config.debugMode);
console.log("本番環境:", config.isProduction);
console.log("開発環境:", config.isDevelopment);

// デバッグログ（デバッグモード時のみ出力）
debugLog("これはデバッグ情報です");
```

## 📊 利用可能な環境変数

| 変数名              | 説明                         | デフォルト値                   | 必須   |
| ------------------- | ---------------------------- | ------------------------------ | ------ |
| `VITE_API_BASE_URL` | API のベース URL             | `http://localhost:8080/api/v1` | いいえ |
| `VITE_DEBUG_MODE`   | デバッグモードの有効化       | `false` (本番) / `true` (開発) | いいえ |
| `VITE_APP_VERSION`  | アプリケーションのバージョン | `1.0.0`                        | いいえ |

## ⚠️ 注意事項

1. `.env.local` は `.gitignore` に含まれているため、**Git にはコミットされません**
2. **本番環境の API URL は必ず HTTPS を使用してください**
3. 環境変数の変更後は、**アプリケーションの再起動が必要**です
4. Vercel で環境変数を変更した場合は、**新しいデプロイが必要**です
5. `VITE_` プレフィックスの付いた環境変数のみ、クライアント側でアクセス可能です

## 🐛 トラブルシューティング

### 環境変数が反映されない

1. サーバーを再起動してください：

   ```bash
   npm run dev
   ```

2. ブラウザのキャッシュをクリアしてください

3. Vercel の場合、新しいデプロイを実行してください

### 本番環境で API エラーが発生する

1. `VITE_API_BASE_URL` が正しく設定されているか確認
2. API の CORS 設定を確認
3. ブラウザのコンソールでネットワークエラーを確認
