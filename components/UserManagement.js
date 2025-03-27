function UserManagement({ users, onAddUser, onDeleteUser }) {
    try {
        const [newUser, setNewUser] = React.useState({
            name: '',
            kana: '',
            department: ''
        });
        
        const [isSubmitting, setIsSubmitting] = React.useState(false);
        const [isDeleting, setIsDeleting] = React.useState(false);
        
        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!newUser.name || !newUser.kana || !newUser.department) {
                alert('すべての項目を入力してください');
                return;
            }
            
            setIsSubmitting(true);
            try {
                const success = await onAddUser(newUser);
                if (success) {
                    setNewUser({ name: '', kana: '', department: '' });
                }
            } catch (error) {
                console.error('利用者追加エラー:', error);
                reportError(error);
            } finally {
                setIsSubmitting(false);
            }
        };
        
        const handleDelete = async (userId) => {
            if (!window.confirm('本当に削除しますか？')) {
                return;
            }

            setIsDeleting(true);
            try {
                const success = await onDeleteUser(userId);
                if (!success) {
                    alert('利用者の削除に失敗しました');
                }
            } catch (error) {
                console.error('利用者削除エラー:', error);
                reportError(error);
                alert('利用者の削除中にエラーが発生しました');
            } finally {
                setIsDeleting(false);
            }
        };
        
        return (
            <div className="admin-panel">
                <h3 className="text-lg font-semibold mb-4">利用者管理</h3>
                
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="form-label">氏名</label>
                            <input
                                type="text"
                                value={newUser.name}
                                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                                className="form-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">ふりがな</label>
                            <input
                                type="text"
                                value={newUser.kana}
                                onChange={(e) => setNewUser({...newUser, kana: e.target.value})}
                                className="form-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="form-label">所属</label>
                            <input
                                type="text"
                                value={newUser.department}
                                onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                                className="form-input"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="form-button bg-blue-500 hover:bg-blue-600 text-white"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center">
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                追加中...
                            </span>
                        ) : '利用者を追加'}
                    </button>
                </form>
                
                <div>
                    <h4 className="font-medium mb-2">利用者一覧</h4>
                    {!users || users.length === 0 ? (
                        <p className="text-gray-500">登録されている利用者はありません</p>
                    ) : (
                        <ul className="space-y-2">
                            {users.map(user => (
                                <li 
                                    key={user.id}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                                >
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {user.department} ({user.kana})
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="text-red-500 hover:text-red-700"
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <i className="fas fa-spinner fa-spin"></i>
                                        ) : (
                                            <i className="fas fa-trash"></i>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('UserManagement component error:', error);
        reportError(error);
        return <div>エラーが発生しました</div>;
    }
}
