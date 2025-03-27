const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { verifyAdmin } = require('./auth');
const { body, validationResult } = require('express-validator');

// ユーザー一覧取得
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM users ORDER BY kana ASC'
    );
    
    const users = result.rows.map(user => ({
      id: user.id,
      name: user.name,
      kana: user.kana,
      email: user.email,
      createdAt: user.created_at
    }));

    res.json({
      success: true,
      items: users.map(user => ({ objectData: user }))
    });
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    res.status(500).json({
      success: false, 
      message: 'ユーザー情報の取得に失敗しました'
    });
  }
});

// ユーザー登録
router.post('/', [
  body('name').notEmpty().withMessage('氏名は必須です'),
  body('kana').notEmpty().withMessage('ふりがなは必須です')
], async (req, res) => {
  // バリデーション確認
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const { id, name, kana, email, createdAt } = req.body;
    
    const result = await query(
      'INSERT INTO users (id, name, kana, email, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, name, kana, email || null, createdAt]
    );

    const newUser = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      kana: result.rows[0].kana,
      email: result.rows[0].email,
      createdAt: result.rows[0].created_at
    };

    res.status(201).json({
      success: true,
      objectData: newUser
    });
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    res.status(500).json({
      success: false,
      message: 'ユーザー登録に失敗しました'
    });
  }
});

// ユーザー削除
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // ユーザーに関連する予約も一緒に削除（カスケード削除が設定されている）
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }

    res.json({
      success: true,
      message: 'ユーザーを削除しました'
    });
  } catch (error) {
    console.error('ユーザー削除エラー:', error);
    res.status(500).json({
      success: false,
      message: 'ユーザー削除に失敗しました'
    });
  }
});

module.exports = router;
