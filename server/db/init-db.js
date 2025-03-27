/**
 * データベーススキーマ初期化スクリプト
 * 実行方法: node db/init-db.js
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('データベーススキーマ初期化を開始します...');
    
    // スキーマファイルの読み込み
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // SQLの実行
    await client.query(schemaSQL);
    
    console.log('データベーススキーマの初期化が完了しました！');
    
    // テストデータの投入（オプション）
    const insertTestData = process.argv.includes('--with-test-data');
    
    if (insertTestData) {
      console.log('テストデータを投入しています...');
      
      // テスト用ユーザー
      await client.query(`
        INSERT INTO users (id, name, kana, email, created_at)
        VALUES 
          ('user1', '山田太郎', 'やまだたろう', 'yamada@example.com', CURRENT_TIMESTAMP),
          ('user2', '佐藤花子', 'さとうはなこ', 'sato@example.com', CURRENT_TIMESTAMP),
          ('user3', '鈴木一郎', 'すずきいちろう', 'suzuki@example.com', CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;
      `);
      
      // テスト用備品
      await client.query(`
        INSERT INTO equipment (id, name, description, created_at)
        VALUES 
          ('equip1', '会議室A', '10人用会議室', CURRENT_TIMESTAMP),
          ('equip2', 'プロジェクター', '4K対応プロジェクター', CURRENT_TIMESTAMP),
          ('equip3', 'ノートPC', 'Windows搭載ノートPC', CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;
      `);
      
      // テスト用予約データ (今日と明日の予約)
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      
      // 今日の10:00-12:00の予約
      const todayStart = new Date(today);
      todayStart.setHours(10, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setHours(12, 0, 0, 0);
      
      // 明日の14:00-16:00の予約
      const tomorrowStart = new Date(tomorrow);
      tomorrowStart.setHours(14, 0, 0, 0);
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(16, 0, 0, 0);
      
      await client.query(`
        INSERT INTO reservations (id, user_id, equipment_id, start_time, end_time, purpose, created_at)
        VALUES 
          ('res1', 'user1', 'equip1', $1, $2, '週次ミーティング', CURRENT_TIMESTAMP),
          ('res2', 'user2', 'equip2', $3, $4, 'プレゼン準備', CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING;
      `, [todayStart, todayEnd, tomorrowStart, tomorrowEnd]);
      
      console.log('テストデータの投入が完了しました！');
    }
    
  } catch (err) {
    console.error('データベース初期化中にエラーが発生しました:', err);
    throw err;
  } finally {
    client.release();
    // データベース接続プールを終了
    await pool.end();
  }
}

// スクリプト実行
initializeDatabase()
  .then(() => {
    console.log('初期化処理が完了しました。');
    process.exit(0);
  })
  .catch(err => {
    console.error('初期化処理中にエラーが発生しました:', err);
    process.exit(1);
  });
