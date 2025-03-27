const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { body, validationResult } = require('express-validator');

// 予約一覧取得
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT r.*, u.name as user_name, u.kana as user_kana, e.name as equipment_name ' +
      'FROM reservations r ' +
      'JOIN users u ON r.user_id = u.id ' +
      'JOIN equipment e ON r.equipment_id = e.id ' +
      'ORDER BY r.start_time ASC'
    );
    
    const reservations = result.rows.map(reservation => ({
      id: reservation.id,
      userId: reservation.user_id,
      equipmentId: reservation.equipment_id,
      startTime: reservation.start_time,
      endTime: reservation.end_time,
      purpose: reservation.purpose,
      createdAt: reservation.created_at,
      // 追加情報（フロントエンドでの表示用）
      userName: reservation.user_name,
      userKana: reservation.user_kana,
      equipmentName: reservation.equipment_name
    }));

    res.json({
      success: true,
      items: reservations.map(reservation => ({ objectData: reservation }))
    });
  } catch (error) {
    console.error('予約取得エラー:', error);
    res.status(500).json({
      success: false, 
      message: '予約情報の取得に失敗しました'
    });
  }
});

// 予約登録
router.post('/', [
  body('userId').notEmpty().withMessage('ユーザーIDは必須です'),
  body('equipmentId').notEmpty().withMessage('備品IDは必須です'),
  body('startTime').notEmpty().withMessage('開始時間は必須です'),
  body('endTime').notEmpty().withMessage('終了時間は必須です')
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
    const { id, userId, equipmentId, startTime, endTime, purpose, createdAt } = req.body;
    
    // 既存の予約と重複がないか確認
    const conflictCheck = await query(
      'SELECT * FROM reservations ' +
      'WHERE equipment_id = $1 AND ' +
      '((start_time <= $2 AND end_time > $2) OR ' +
      '(start_time < $3 AND end_time >= $3) OR ' +
      '(start_time >= $2 AND end_time <= $3))',
      [equipmentId, new Date(startTime), new Date(endTime)]
    );
    
    if (conflictCheck.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: '指定した時間帯は既に予約されています'
      });
    }
    
    // 予約登録
    const result = await query(
      'INSERT INTO reservations (id, user_id, equipment_id, start_time, end_time, purpose, created_at) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, userId, equipmentId, new Date(startTime), new Date(endTime), purpose || null, createdAt]
    );

    // ユーザーと設備の情報を取得
    const userResult = await query('SELECT name, kana FROM users WHERE id = $1', [userId]);
    const equipmentResult = await query('SELECT name FROM equipment WHERE id = $1', [equipmentId]);

    const newReservation = {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      equipmentId: result.rows[0].equipment_id,
      startTime: result.rows[0].start_time,
      endTime: result.rows[0].end_time,
      purpose: result.rows[0].purpose,
      createdAt: result.rows[0].created_at,
      // 追加情報
      userName: userResult.rows[0]?.name,
      userKana: userResult.rows[0]?.kana,
      equipmentName: equipmentResult.rows[0]?.name
    };

    res.status(201).json({
      success: true,
      objectData: newReservation
    });
  } catch (error) {
    console.error('予約登録エラー:', error);
    res.status(500).json({
      success: false,
      message: '予約登録に失敗しました'
    });
  }
});

// 予約削除
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM reservations WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: '予約が見つかりません'
      });
    }

    res.json({
      success: true,
      message: '予約を削除しました'
    });
  } catch (error) {
    console.error('予約削除エラー:', error);
    res.status(500).json({
      success: false,
      message: '予約削除に失敗しました'
    });
  }
});

// 過去の予約を自動削除するユーティリティエンドポイント
router.delete('/utility/clean-old', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const result = await query(
      'DELETE FROM reservations WHERE end_time < $1 RETURNING *',
      [cutoffDate]
    );

    res.json({
      success: true,
      message: `${result.rowCount}件の過去予約を削除しました`,
      deletedCount: result.rowCount
    });
  } catch (error) {
    console.error('予約削除エラー:', error);
    res.status(500).json({
      success: false,
      message: '過去予約の削除に失敗しました'
    });
  }
});

module.exports = router;
