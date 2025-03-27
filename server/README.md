# 予約管理システム バックエンド

## 環境設定

1. 必要なパッケージのインストール
```
npm install
```

2. 環境変数の設定
`.env`ファイルを編集し、以下の変数を設定してください：
- `DATABASE_URL`: Neonデータベースの接続URL
- `JWT_SECRET`: JWT認証用のシークレットキー
- `ADMIN_PASSWORD`: 管理者モードへのアクセスパスワード（デフォルトは「kangoiryo」）
- `PORT`: サーバーのポート番号（デフォルトは3001）

## データベースの初期化

データベーススキーマを作成します：
```
node db/init-db.js
```

テストデータも一緒に投入する場合：
```
node db/init-db.js --with-test-data
```

## サーバーの起動

開発モード（変更を監視して自動再起動）：
```
npm run dev
```

本番モード：
```
npm start
```

## APIエンドポイント

### 認証
- `POST /api/auth/admin`: 管理者認証（パスワード認証）

### ユーザー管理
- `GET /api/users`: ユーザー一覧取得
- `POST /api/users`: ユーザー登録
- `DELETE /api/users/:id`: ユーザー削除

### 備品管理
- `GET /api/equipment`: 備品一覧取得
- `POST /api/equipment`: 備品登録
- `DELETE /api/equipment/:id`: 備品削除

### 予約管理
- `GET /api/reservations`: 予約一覧取得
- `POST /api/reservations`: 予約登録
- `DELETE /api/reservations/:id`: 予約削除
- `DELETE /api/reservations/utility/clean-old`: 過去の予約を自動削除

## フロントエンドとの連携

フロントエンドは、`utils/trickle.js`を介してバックエンドと通信します。このファイルは、既存のフロントエンドコードからシームレスに接続できるように設計されています。
