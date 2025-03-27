/**
 * Neonデータベース接続モジュール
 * 
 * このモジュールは以下の機能を提供します：
 * 1. @neondatabase/serverless を使ったNeon接続
 * 2. データベース接続プールの効率的な再利用
 * 3. Vercelのサーバーレス環境に最適化された接続設定
 * 
 * なぜ必要か？
 * - Vercelのサーバーレス環境ではコールドスタートがあり、毎回新しい接続を作ると遅延が発生
 * - Neonデータベースは非アクティブになるとスリープするため、定期的なpingが必要
 */

import { neon } from '@neondatabase/serverless';
import { Pool } from '@neondatabase/serverless';

// 環境変数からデータベースURLを取得
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL環境変数が設定されていません');
}

// neonインスタンスの作成 (SQLクエリ実行用)
export const sql = neon(DATABASE_URL);

// コネクションプールの設定 (複数のクエリや複雑なトランザクション用)
let pool;

if (!pool) {
  pool = new Pool({ connectionString: DATABASE_URL });
}

/**
 * 接続テスト用の関数
 * Neonデータベースが応答するか確認します
 */
export async function pingDatabase() {
  try {
    const result = await sql`SELECT 1 as ping`;
    return result[0].ping === 1;
  } catch (error) {
    console.error('データベース接続エラー:', error);
    throw error;
  }
}

/**
 * トランザクションやより複雑なクエリのためのクライアント取得
 */
export async function getClient() {
  const client = await pool.connect();
  return client;
}

export { pool };
