const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { verifyAdmin } = require('./auth');
const { body, validationResult } = require('express-validator');

// 備品一覧取得
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM equipment ORDER BY name ASC'
    );
    
    const equipmentList = result.rows.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      createdAt: item.created_at
    }));

    res.json({
      success: true,
      items: equipmentList.map(item => ({ objectData: item }))
    });
  } catch (error) {
    console.error('備品取得エラー:', error);
    res.status(500).json({
      success: false, 
      message: '備品情報の取得に失敗しました'
    });
  }
});

// 備品登録
router.post('/', [
  body('name').notEmpty().withMessage('備品名は必須です')
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
    const { id, name, description, createdAt } = req.body;
    
    const result = await query(
      'INSERT INTO equipment (id, name, description, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, description || null, createdAt]
    );

    const newEquipment = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      createdAt: result.rows[0].created_at
    };

    res.status(201).json({
      success: true,
      objectData: newEquipment
    });
  } catch (error) {
    console.error('備品登録エラー:', error);
    res.status(500).json({
      success: false,
      message: '備品登録に失敗しました'
    });
  }
});

// 備品削除
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // 備品に関連する予約も一緒に削除（カスケード削除が設定されている）
    const result = await query(
      'DELETE FROM equipment WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: '備品が見つかりません'
      });
    }

    res.json({
      success: true,
      message: '備品を削除しました'
    });
  } catch (error) {
    console.error('備品削除エラー:', error);
    res.status(500).json({
      success: false,
      message: '備品削除に失敗しました'
    });
  }
});

module.exports = router;
