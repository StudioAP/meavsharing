// trickle APIのバックエンド連携ラッパー
// バックエンドのAPIエンドポイントを呼び出す実装に置き換え

// APIのベースURL（環境に応じて自動判別）
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';

// 管理者認証トークンの保存
let adminToken = null;

/**
 * オブジェクト一覧を取得
 * @param {string} type - 取得するオブジェクトタイプ（user/equipment/reservation）
 * @returns {Promise<{items: Array}>} 取得結果
 */
async function trickleListObjects(type) {
  try {
    // オブジェクトタイプに基づいてエンドポイントを決定
    const endpoint = getEndpointForType(type);
    
    // リクエスト失敗時のフォールバック処理を実装
    let retries = 3;
    let response;
    
    while (retries > 0) {
      try {
        // APIリクエスト実行
        response = await fetch(`${API_BASE_URL}/${endpoint}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`${type}一覧取得エラー、リトライ中 (${retries}):`, error);
        retries--;
        
        if (retries === 0) {
          // リトライが尽きた場合はフォールバックデータを返す
          if (type === 'user' && window.initialUsersData) {
            return { items: [...window.initialUsersData] };
          } else if (type === 'equipment') {
            return { items: [] };
          } else if (type === 'reservation') {
            return { items: [] };
          }
        }
        
        // 次のリトライの前に少し待機
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  } catch (error) {
    console.error(`${type}一覧取得エラー:`, error);
    throw error;
  }
}

/**
 * 新しいオブジェクトを作成
 * @param {string} type - 作成するオブジェクトタイプ（user/equipment/reservation）
 * @param {Object} data - 作成するオブジェクトデータ
 * @returns {Promise<{objectData: Object}>} 作成結果
 */
async function trickleCreateObject(type, data) {
  try {
    // オブジェクトタイプに基づいてエンドポイントを決定
    const endpoint = getEndpointForType(type);
    
    // APIリクエスト実行
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken && { 'Authorization': `Bearer ${adminToken}` })
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `APIエラー: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`${type}作成エラー:`, error);
    throw error;
  }
}

/**
 * オブジェクトを削除
 * @param {string} type - 削除するオブジェクトタイプ（user/equipment/reservation）
 * @param {string} id - 削除するオブジェクトID
 * @returns {Promise<void>}
 */
async function trickleDeleteObject(type, id) {
  try {
    // オブジェクトタイプに基づいてエンドポイントを決定
    const endpoint = getEndpointForType(type);
    
    // APIリクエスト実行
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: 'DELETE',
      headers: {
        ...(adminToken && { 'Authorization': `Bearer ${adminToken}` })
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `APIエラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`${type}削除エラー:`, error);
    throw error;
  }
}

/**
 * オブジェクトを更新
 * @param {string} type - 更新するオブジェクトタイプ（user/equipment/reservation）
 * @param {string} id - 更新するオブジェクトID
 * @param {Object} data - 更新データ
 * @returns {Promise<void>}
 */
async function trickleUpdateObject(type, id, data) {
  try {
    // オブジェクトタイプに基づいてエンドポイントを決定
    const endpoint = getEndpointForType(type);
    
    // APIリクエスト実行
    const response = await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(adminToken && { 'Authorization': `Bearer ${adminToken}` })
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `APIエラー: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`${type}更新エラー:`, error);
    throw error;
  }
}

/**
 * 管理者認証を行う
 * @param {string} password - 管理者パスワード
 * @returns {Promise<boolean>} 認証結果
 */
async function trickleAdminAuth(password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    if (data.success && data.token) {
      adminToken = data.token;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('管理者認証エラー:', error);
    return false;
  }
}

/**
 * オブジェクトタイプに基づいてAPIエンドポイントを取得
 * @param {string} type - オブジェクトタイプ
 * @returns {string} エンドポイント
 */
function getEndpointForType(type) {
  switch (type) {
    case 'user':
      return 'users';
    case 'equipment':
      return 'equipment';
    case 'reservation':
      return 'reservations';
    default:
      throw new Error(`不明なオブジェクトタイプ: ${type}`);
  }
}

// 過去の予約を削除するユーティリティ関数
async function removeOldReservations(days = 7) {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations/utility/clean-old?days=${days}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error(`APIエラー: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('過去予約削除エラー:', error);
    throw error;
  }
}

// グローバルにエクスポート
window.trickleListObjects = trickleListObjects;
window.trickleCreateObject = trickleCreateObject;
window.trickleDeleteObject = trickleDeleteObject;
window.trickleUpdateObject = trickleUpdateObject;
window.trickleAdminAuth = trickleAdminAuth;
window.removeOldReservations = removeOldReservations;
