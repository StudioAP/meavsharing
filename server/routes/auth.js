const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

// 管理者認証
router.post('/admin', (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!password || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: '管理者パスワードが正しくありません'
      });
    }

    // 管理者権限を持つJWTトークンを発行
    const token = jwt.sign(
      { isAdmin: true },
      process.env.JWT_SECRET || 'default_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      message: '管理者認証成功'
    });
  } catch (error) {
    console.error('認証エラー:', error);
    res.status(500).json({
      success: false,
      message: '認証処理中にエラーが発生しました'
    });
  }
});

// 管理者権限確認ミドルウェア
const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '認証トークンがありません'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
    
    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: '管理者権限がありません'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('トークン検証エラー:', error);
    res.status(401).json({
      success: false,
      message: '無効なトークンです'
    });
  }
};

// 両方をオブジェクトとしてエクスポート
module.exports = {
  router,
  verifyAdmin
};
