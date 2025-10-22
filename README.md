# Sidemenulab Frontend

React + TypeScript + Vite + TailwindCSS + Shadcn/ui を使用した認証機能付きフロントエンドアプリケーション

## 機能

- ユーザー認証（ログイン・サインアップ）
- JWT トークンベースの認証
- レスポンシブデザイン
- バックエンド API との連携

## 技術スタック

- **React 19** - UI ライブラリ
- **TypeScript** - 型安全性
- **Vite** - ビルドツール
- **TailwindCSS** - CSS フレームワーク
- **Shadcn/ui** - UI コンポーネント
- **Lucide React** - アイコンライブラリ

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
# API Base URL
VITE_API_BASE_URL=http://localhost:8080/api/v1

# その他の設定
VITE_APP_NAME=Sidemenulab Frontend
VITE_APP_VERSION=1.0.0
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスしてください。

## 環境変数

| 変数名              | 説明                          | デフォルト値                   |
| ------------------- | ----------------------------- | ------------------------------ |
| `VITE_API_BASE_URL` | バックエンド API のベース URL | `http://localhost:8080/api/v1` |
| `VITE_APP_NAME`     | アプリケーション名            | `Sidemenulab Frontend`         |
| `VITE_APP_VERSION`  | アプリケーションのバージョン  | `1.0.0`                        |

## プロダクション環境での設定

本番環境では、以下の環境変数を適切に設定してください：

```bash
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

## バックエンドとの連携

このフロントエンドは以下のバックエンド API エンドポイントと連携します：

- `POST /api/v1/auth/signup` - ユーザー登録
- `POST /api/v1/auth/signin` - ユーザーログイン

バックエンドサーバーが起動していることを確認してください。

## ビルド

```bash
npm run build
```

## プレビュー

```bash
npm run preview
```

## ライセンス

MIT
