function App() {
    try {
        const [activeTab, setActiveTab] = React.useState('reservation');
        const [isAdmin, setIsAdmin] = React.useState(false);
        const [selectedDate, setSelectedDate] = React.useState(dayjs().format('YYYY-MM-DD'));
        const [isLoading, setIsLoading] = React.useState(true);
        const [users, setUsers] = React.useState([]);
        const [equipment, setEquipment] = React.useState([]);
        const [reservations, setReservations] = React.useState([]);

        // 初期ユーザーデータ - 16名の利用者情報
        // グローバル変数に設定してAPI接続エラー時にフォールバックできるようにする
        window.initialUsersData = [
            { name: '大西 英文', kana: 'おおにしひでふみ', department: '検査' },
            { name: '小川 敦之', kana: 'おがわあつゆき', department: '作業' },
            { name: '甲斐 絡元', kana: 'かいひろもと', department: '理学' },
            { name: '木村 智子', kana: 'きむらともこ', department: '理学' },
            { name: '小山 智恵', kana: 'こやまともえ', department: '看護' },
            { name: '齋藤 慶一郎', kana: 'さいとうけいいちろう', department: '作業' },
            { name: '薛摩 恵人', kana: 'さつまけいと', department: '理学' },
            { name: '所司 雄文', kana: 'しょうじかつふみ', department: '検査' },
            { name: '菅沼 一平', kana: 'すがぬまいっぺい', department: '作業' },
            { name: '高畔 進一', kana: 'たかはたしんいち', department: '作業' },
            { name: '平井 秀明', kana: 'ひらいひであき', department: '作業' },
            { name: '野島 敦祐', kana: 'のじまとしすけ', department: '看護' },
            { name: '原田 拓実', kana: 'はらだたくみ', department: '作業' },
            { name: '藤原 麻有', kana: 'ふじわらまゆ', department: '検査' },
            { name: '深山 つかさ', kana: 'みやまつかさ', department: '看護' },
            { name: '横山 高明', kana: 'よこやまたかあき', department: '理学' }
        ];
        
        const initialUsers = [
            { name: '大西 英文', kana: 'おおにしひでふみ', department: '検査' },
            { name: '小川 敦之', kana: 'おがわあつゆき', department: '作業' },
            { name: '甲斐 絋元', kana: 'かいひろもと', department: '理学' },
            { name: '木村 智子', kana: 'きむらともこ', department: '理学' },
            { name: '小山 智恵', kana: 'こやまともえ', department: '看護' },
            { name: '齋藤 慶一郎', kana: 'さいとうけいいちろう', department: '作業' },
            { name: '薩摩 恵人', kana: 'さつまけいと', department: '理学' },
            { name: '所司 雄文', kana: 'しょうじかつふみ', department: '検査' },
            { name: '菅沼 一平', kana: 'すがぬまいっぺい', department: '作業' },
            { name: '高畑 進一', kana: 'たかはたしんいち', department: '作業' },
            { name: '平井 秀明', kana: 'ひらいひであき', department: '作業' },
            { name: '野島 敏祐', kana: 'のじまとしすけ', department: '看護' },
            { name: '原田 拓実', kana: 'はらだたくみ', department: '作業' },
            { name: '藤原 麻有', kana: 'ふじわらまゆ', department: '検査' },
            { name: '深山 つかさ', kana: 'みやまつかさ', department: '看護' },
            { name: '横山 高明', kana: 'よこやまたかあき', department: '理学' }
        ];

        // データ読み込み
        React.useEffect(() => {
            async function loadData() {
                try {
                    // APIリクエスト結果を保存する変数
                    let usersRes, equipmentRes, reservationsRes;
                    
                    try {
                        // APIリクエストを試行
                        [usersRes, equipmentRes, reservationsRes] = await Promise.all([
                            trickleListObjects('user'),
                            trickleListObjects('equipment'),
                            trickleListObjects('reservation')
                        ]);
                    } catch (apiError) {
                        console.error('API接続エラー:', apiError);
                        // APIエラー時はフォールバックデータを使用
                        usersRes = { items: [] };
                        equipmentRes = { items: [] };
                        reservationsRes = { items: [] };
                    }

                    // ユーザーデータの処理
                    try {
                        // 既存ユーザーをマップとして取得
                        const existingUsers = new Map();
                        if (usersRes.items && usersRes.items.length > 0) {
                            usersRes.items.forEach(item => {
                                if (item && item.objectData && item.objectData.kana) {
                                    existingUsers.set(item.objectData.kana, item.objectData);
                                }
                            });
                        }
                        
                        // APIからのデータが空または不足している場合は初期データを使用
                        if (existingUsers.size === 0) {
                            // グローバル変数の初期ユーザーデータを使用
                            const fallbackUsers = window.initialUsersData.map(user => ({
                                id: 'fallback-' + Date.now() + Math.random().toString(36).substring(2, 5),
                                ...user,
                                isRemovable: true, // すべてのユーザーを削除可能に
                                createdAt: new Date().toISOString()
                            }));
                            
                            // ふりがなの５０音順でソート
                            const sortedUsers = fallbackUsers.sort((a, b) => 
                                a.kana.localeCompare(b.kana, 'ja')
                            );
                            setUsers(sortedUsers);
                            console.log('フォールバックユーザーデータを使用:', sortedUsers.length);
                        } else {
                            // APIからのデータを使用
                            const sortedUsers = usersRes.items
                                .filter(item => item && item.objectData) // nullチェック
                                .map(item => item.objectData)
                                .sort((a, b) => a.kana.localeCompare(b.kana, 'ja'));
                            setUsers(sortedUsers);
                        }
                    } catch (userError) {
                        console.error('ユーザーデータ処理エラー:', userError);
                        // エラー時は初期データを使用
                        const fallbackUsers = window.initialUsersData.map(user => ({
                            id: 'fallback-' + Date.now() + Math.random().toString(36).substring(2, 5),
                            ...user,
                            isRemovable: true,
                            createdAt: new Date().toISOString()
                        }));
                        setUsers(fallbackUsers);
                    }
                    
                    // 機器データの処理
                    try {
                        if (equipmentRes.items && equipmentRes.items.length > 0) {
                            const validEquipment = equipmentRes.items
                                .filter(item => item && item.objectData)
                                .map(item => item.objectData);
                            setEquipment(validEquipment);
                        } else {
                            // 機器データが空の場合のフォールバック
                            setEquipment([]);
                        }
                    } catch (equipmentError) {
                        console.error('機器データ処理エラー:', equipmentError);
                        setEquipment([]);
                    }
                    
                    // 予約データの処理
                    try {
                        if (reservationsRes.items && reservationsRes.items.length > 0) {
                            const validReservations = reservationsRes.items
                                .filter(item => item && item.objectData)
                                .map(item => item.objectData);
                            setReservations(validReservations);
                        } else {
                            // 予約データが空の場合のフォールバック
                            setReservations([]);
                        }
                    } catch (reservationError) {
                        console.error('予約データ処理エラー:', reservationError);
                        setReservations([]);
                    }
                    
                } catch (error) {
                    console.error('データ読み込み全体エラー:', error);
                    // アラートは一度だけ表示
                    alert('データ読み込みエラーが発生しましたが、アプリはオフラインモードで動作しています。\nオンライン接続時に再度お試しください。');
                    
                    // フォールバックデータを確実に設定
                    const fallbackUsers = window.initialUsersData.map(user => ({
                        id: 'fallback-' + Date.now() + Math.random().toString(36).substring(2, 5),
                        ...user,
                        isRemovable: true,
                        createdAt: new Date().toISOString()
                    }));
                    setUsers(fallbackUsers);
                    setEquipment([]);
                    setReservations([]);
                } finally {
                    setIsLoading(false);
                }
            }

            loadData();
        }, []);

        // 予約削除処理
        const handleDeleteReservation = async (reservationId) => {
            try {
                await trickleDeleteObject('reservation', reservationId);
                setReservations(prev => prev.filter(r => r.id !== reservationId));
                return true;
            } catch (error) {
                console.error('予約削除エラー:', error);
                alert('予約削除エラー: ' + error.message);
                return false;
            }
        };

        // ユーザー削除処理
        const handleDeleteUser = async (userId) => {
            try {
                const result = await deleteUserAndRelatedData(userId);
                
                if (result) {
                    // ユーザーと関連予約を更新
                    const [usersRes, reservationsRes] = await Promise.all([
                        trickleListObjects('user'),
                        trickleListObjects('reservation')
                    ]);

                    const sortedUsers = usersRes.items
                        .map(item => item.objectData)
                        .sort((a, b) => a.kana.localeCompare(b.kana, 'ja'));

                    setUsers(sortedUsers);
                    setReservations(reservationsRes.items.map(item => item.objectData));
                    
                    alert('ユーザーを削除しました');
                    return true;
                }
                return false;
            } catch (error) {
                console.error('ユーザー削除エラー:', error);
                alert('ユーザー削除エラー: ' + error.message);
                return false;
            }
        };

        // ユーザー追加
        const handleAddUser = async (newUser) => {
            try {
                const created = await trickleCreateObject('user', {
                    ...newUser,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString()
                });

                setUsers(prevUsers => {
                    const updatedUsers = [...prevUsers, created.objectData];
                    return updatedUsers.sort((a, b) => a.kana.localeCompare(b.kana, 'ja'));
                });
                
                return true;
            } catch (error) {
                console.error('ユーザー追加エラー:', error);
                alert('ユーザーの追加に失敗しました: ' + error.message);
                return false;
            }
        };

        // 予約追加
        const handleAddReservation = async (newReservation) => {
            try {
                const created = await trickleCreateObject('reservation', {
                    ...newReservation,
                    id: Date.now().toString(),
                    createdAt: new Date().toISOString()
                });
                setReservations(prev => [...prev, created.objectData]);
                return true;
            } catch (error) {
                console.error('予約追加エラー:', error);
                alert('予約の追加に失敗しました: ' + error.message);
                return false;
            }
        };

        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-screen">
                    <div className="text-center">
                        <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
                        <p className="mt-4">データを読み込んでいます...</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <Navbar 
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        isAdmin={isAdmin}
                        setIsAdmin={setIsAdmin}
                    />

                    {activeTab === 'reservation' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div className="md:col-span-1">
                                <Calendar
                                    currentDate={selectedDate}
                                    onDateSelect={setSelectedDate}
                                    reservations={reservations}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-6">
                                <ReservationForm
                                    selectedDate={selectedDate}
                                    users={users}
                                    equipment={equipment}
                                    onReservationSubmit={handleAddReservation}
                                    reservations={reservations}
                                />
                                <ReservationList
                                    selectedDate={selectedDate}
                                    reservations={reservations}
                                    users={users}
                                    equipment={equipment}
                                    onDeleteReservation={handleDeleteReservation}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'user' && (
                        <UserManagement
                            users={users}
                            onAddUser={handleAddUser}
                            onDeleteUser={handleDeleteUser}
                        />
                    )}

                    {isAdmin && activeTab === 'admin' && (
                        <AdminPanel
                            reservations={reservations}
                            users={users}
                            equipment={equipment}
                        />
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('App error:', error);
        alert('アプリケーションエラー: ' + error.message);
        return <div>エラーが発生しました</div>;
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
