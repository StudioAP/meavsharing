const { Pool } = require('pg');
require('dotenv').config();

// Neonデータベース接続設定
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // 開発環境では必要かもしれません
  }
});

// 接続テスト
pool.connect((err, client, release) => {
  if (err) {
    console.error('データベース接続エラー:', err.stack);
  } else {
    console.log('Neonデータベースに接続しました');
    release();
  }
});

// クエリ実行ヘルパー関数
const query = async (text, params) => {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('実行されたクエリ:', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('クエリエラー:', err);
    throw err;
  }
};

module.exports = {
  query,
  pool
};
