const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// ルーターのインポート
const userRoutes = require('./routes/users');
const equipmentRoutes = require('./routes/equipment');
const reservationRoutes = require('./routes/reservations');
const { router: authRoutes } = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルートの設定
app.use('/api/users', userRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/auth', authRoutes);

// 静的ファイルの提供（本番環境用）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
  });
}

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error('サーバーエラー:', err.stack);
  res.status(500).json({
    success: false,
    message: '内部サーバーエラーが発生しました',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});
