# 備品貸出予約管理システム

備品の貸出予約を管理するためのWebアプリケーションです。Neonデータベースを使用してデータを永続化しています。

## 特徴

- 備品の予約登録・管理
- ユーザー管理機能
- カレンダー表示
- 管理者モード（パスワード認証）

## 開発環境のセットアップ

### 前提条件

- Node.js (v14以上)
- npm (v6以上)

### 環境変数の設定

1. `server/.env`ファイルに以下の環境変数を設定します:

```
# データベース接続情報
DATABASE_URL=postgresql://[ユーザー名]:[パスワード]@[ホスト]/[データベース名]?sslmode=require

# JWT設定
JWT_SECRET=your-jwt-secret-key

# 管理者パスワード
ADMIN_PASSWORD=kangoiryo

# サーバー設定
PORT=3001
NODE_ENV=development
```

### インストールと起動

1. サーバー側の依存関係をインストール:

```bash
cd server
npm install
```

2. データベースの初期化:

```bash
# 基本スキーマのみ
npm run init-db

# テストデータを含める場合
npm run init-db:test
```

3. 開発サーバーの起動:

```bash
# APIサーバーとクライアントサーバーを同時に起動
npm run dev:all

# または別々に起動する場合
# APIサーバー
npm run api

# クライアントサーバー（別ターミナルで）
npm run client
```

4. ブラウザで以下のURLにアクセス:
   - フロントエンド: http://localhost:8080
   - APIサーバー: http://localhost:3001

## 使用技術

- フロントエンド: React, Tailwind CSS
- バックエンド: Express, Node.js
- データベース: Neon (PostgreSQL)
- 認証: JWT

## 管理者機能へのアクセス

1. 右上の「管理者モード」をクリック
2. パスワード「kangoiryo」を入力
3. 「管理者機能」タブが表示され、システム全体の管理が可能に

## Vercelへのデプロイ（オプション）

Vercelにデプロイする場合は、以下の環境変数を設定してください:

- `DATABASE_URL` - Neonデータベース接続情報
- `JWT_SECRET` - JWTトークンのシークレットキー
- `ADMIN_PASSWORD` - 管理者パスワード
