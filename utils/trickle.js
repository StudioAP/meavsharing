// trickle APIのバックエンド連携ラッパー
// バックエンドのAPIエンドポイントを呼び出す実装に置き換え

// APIのベースURL（環境に応じて自動判別）
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? `http://${window.location.hostname}:3001/api` 
  : '/api';

// 現在の実行環境をログ出力
console.log(`現在の実行環境: ${window.location.hostname}, API URL: ${API_BASE_URL}`);

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
    
    // リクエスト失敗時のリトライ処理を実装
    let retries = 5; // 最大5回に増やして信頼性を向上
    let response;
    
    // 現在アクセス中のAPI URLを記録
    console.log(`${type}データ取得: ${API_BASE_URL}/${endpoint}にアクセス中`);
    
    while (retries > 0) {
      try {
        // APIリクエスト実行 - ヘッダーを改善
        response = await fetch(`${API_BASE_URL}/${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          credentials: 'same-origin'
        });
        
        // レスポンス情報を詳細に記録
        console.log(`${type}データ取得結果:`, { 
          status: response.status, 
          statusText: response.statusText,
          url: response.url
        });
        
        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        // 取得成功時はデータ数をログ
        console.log(`${type}データ取得成功: ${data.items ? data.items.length : 0}件`);
        return data;
      } catch (error) {
        console.error(`${type}データ取得エラー (残り${retries}回):`, error);
        retries--;
        
        if (retries === 0) {
          // 全リトライ失敗時の処理
          console.error(`${type}データ取得失敗（リトライ回数上限）:`, error);
          
          // エラー詳細をコンソールに出力し、デバッグを容易に
          console.error('エラー詳細情報:', {
            エラータイプ: error.name,
            メッセージ: error.message,
            APIエンドポイント: `${API_BASE_URL}/${endpoint}`,
            環境: window.location.hostname
          });
          
          // アラートを表示
          alert(`${type}データの取得に失敗しました。\nブラウザを再読み込みして再試行してください。\n\nエラー: ${error.message}`);
          
          // API失敗時はエラーをスロー - すべてのユーザーが同じ情報を共有するために必要
          throw new Error(`${type}データの取得に失敗しました: ${error.message}`);
        }
        
        // 指数関数的バックオフ (待機時間を応答的に増加)
        const waitTime = 1000 * Math.pow(2, 5 - retries); // 1秒、2秒、4秒、8秒、16秒
        console.log(`${waitTime}ミリ秒後に再試行します`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
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
