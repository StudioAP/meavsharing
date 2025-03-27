// データベース操作ユーティリティ

async function loadUsers() {
    try {
        const response = await trickleListObjects('user');
        return response.items.map(item => item.objectData);
    } catch (error) {
        console.error('利用者データ読み込みエラー:', error);
        throw error;
    }
}

async function loadEquipment() {
    try {
        const response = await trickleListObjects('equipment');
        return response.items.map(item => item.objectData);
    } catch (error) {
        console.error('備品データ読み込みエラー:', error);
        throw error;
    }
}

async function loadReservations() {
    try {
        const response = await trickleListObjects('reservation');
        return response.items.map(item => item.objectData);
    } catch (error) {
        console.error('予約データ読み込みエラー:', error);
        throw error;
    }
}

async function saveUser(userData) {
    try {
        return await trickleCreateObject('user', userData);
    } catch (error) {
        console.error('利用者データ保存エラー:', error);
        throw error;
    }
}

async function saveEquipment(equipmentData) {
    try {
        return await trickleCreateObject('equipment', equipmentData);
    } catch (error) {
        console.error('備品データ保存エラー:', error);
        throw error;
    }
}

async function saveReservation(reservationData) {
    try {
        return await trickleCreateObject('reservation', reservationData);
    } catch (error) {
        console.error('予約データ保存エラー:', error);
        throw error;
    }
}

async function deleteUser(userId) {
    try {
        await trickleDeleteObject('user', userId);
    } catch (error) {
        console.error('利用者データ削除エラー:', error);
        throw error;
    }
}

async function deleteEquipment(equipmentId) {
    try {
        await trickleDeleteObject('equipment', equipmentId);
    } catch (error) {
        console.error('備品データ削除エラー:', error);
        throw error;
    }
}

async function deleteReservation(reservationId) {
    try {
        await trickleDeleteObject('reservation', reservationId);
    } catch (error) {
        console.error('予約データ削除エラー:', error);
        throw error;
    }
}

async function updateReservation(reservationId, updatedData) {
    try {
        await trickleUpdateObject('reservation', reservationId, updatedData);
    } catch (error) {
        console.error('予約データ更新エラー:', error);
        throw error;
    }
}

async function deleteUserAndRelatedData(userId) {
    try {
        // ユーザーに関連する予約を取得
        const reservations = await trickleListObjects('reservation');
        const userReservations = reservations.items.filter(
            item => item.objectData.userId === userId
        );

        // ユーザーと関連予約を削除
        await Promise.all([
            trickleDeleteObject('user', userId),
            ...userReservations.map(reservation => 
                trickleDeleteObject('reservation', reservation.objectData.id)
            )
        ]);
        return true;
    } catch (error) {
        console.error('ユーザーと関連データ削除エラー:', error);
        throw error;
    }
}

async function removeOldReservations(days = 7) {
    try {
        const today = dayjs().tz('Asia/Tokyo').startOf('day');
        const cutoffDate = today.subtract(days, 'day').format('YYYY-MM-DD');

        const reservations = await trickleListObjects('reservation');
        const oldReservations = reservations.items.filter(
            item => dayjs(item.objectData.date).tz('Asia/Tokyo').isBefore(cutoffDate, 'day')
        );

        // 古い予約を削除
        await Promise.all(
            oldReservations.map(reservation => 
                trickleDeleteObject('reservation', reservation.objectData.id)
            )
        );
    } catch (error) {
        console.error('古い予約削除エラー:', error);
        throw error;
    }
}

// グローバルに公開
window.deleteUserAndRelatedData = deleteUserAndRelatedData;
window.removeOldReservations = removeOldReservations;
