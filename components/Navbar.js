function Navbar({ activeTab, setActiveTab, isAdmin, setIsAdmin }) {
    const [showAdminDialog, setShowAdminDialog] = React.useState(false);
    const [adminPassword, setAdminPassword] = React.useState('');
    const [authError, setAuthError] = React.useState('');
    const [isAuthenticating, setIsAuthenticating] = React.useState(false);
    
    // 管理者認証処理
    const handleAdminAuth = async (e) => {
        e.preventDefault();
        setIsAuthenticating(true);
        setAuthError('');
        
        try {
            // trickleAdminAuth関数を使用して認証
            const success = await window.trickleAdminAuth(adminPassword);
            
            if (success) {
                setIsAdmin(true);
                setShowAdminDialog(false);
                setAdminPassword('');
                setActiveTab('admin'); // 管理者タブに切り替え
            } else {
                setAuthError('パスワードが正しくありません');
            }
        } catch (error) {
            console.error('管理者認証エラー:', error);
            setAuthError('認証処理中にエラーが発生しました');
        } finally {
            setIsAuthenticating(false);
        }
    };
    
    // 管理者モード切り替え
    const toggleAdminMode = () => {
        if (isAdmin) {
            // 管理者モードをオフにする場合は確認なしで切り替え
            setIsAdmin(false);
            if (activeTab === 'admin') {
                setActiveTab('reservation');
            }
        } else {
            // 管理者モードをオンにする場合はダイアログを表示
            setShowAdminDialog(true);
        }
    };
    
    try {
        return (
            <>
                <nav className="bg-white shadow-sm mb-6">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="flex justify-between h-16">
                            <div className="flex space-x-8">
                                <button
                                    data-name="reservation-tab-button"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'reservation' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                    onClick={() => setActiveTab('reservation')}
                                >
                                    予約管理
                                </button>
                                <button
                                    data-name="user-tab-button"
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'user' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                    onClick={() => setActiveTab('user')}
                                >
                                    利用者管理
                                </button>
                                {isAdmin && (
                                    <button
                                        data-name="admin-tab-button"
                                        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'admin' ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                        onClick={() => setActiveTab('admin')}
                                    >
                                        管理者機能
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center">
                                <button
                                    onClick={toggleAdminMode}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded ${isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'} hover:bg-opacity-80 transition-colors`}
                                >
                                    <i className={`fas fa-${isAdmin ? 'lock-open' : 'lock'} mr-2`}></i>
                                    <span className="text-sm">{isAdmin ? '管理者モード中' : '管理者モード'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
                
                {/* 管理者認証ダイアログ */}
                {showAdminDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">管理者認証</h3>
                            <form onSubmit={handleAdminAuth}>
                                <div className="mb-4">
                                    <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        管理者パスワード
                                    </label>
                                    <input
                                        type="password"
                                        id="adminPassword"
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        autoFocus
                                    />
                                    {authError && (
                                        <p className="mt-2 text-sm text-red-600">{authError}</p>
                                    )}
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAdminDialog(false);
                                            setAdminPassword('');
                                            setAuthError('');
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        キャンセル
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isAuthenticating}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isAuthenticating ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                                認証中...
                                            </>
                                        ) : '認証'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </>
        );
    } catch (error) {
        console.error('Navbar component error:', error);
        console.error(error);
        return <div>ナビゲーションエラー</div>;
    }
}
