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
                    const [usersRes, equipmentRes, reservationsRes] = await Promise.all([
                        trickleListObjects('user'),
                        trickleListObjects('equipment'),
                        trickleListObjects('reservation')
                    ]);

                    // 既存ユーザーをマップとして取得
                    const existingUsers = new Map();
                    usersRes.items.forEach(item => {
                        const user = item.objectData;
                        existingUsers.set(user.kana, user);
                    });
                    
                    // 初期ユーザーデータを登録（存在しない場合のみ）
                    // 全てのユーザーは後で削除可能
                    const userCreationPromises = [];
                    for (const user of initialUsers) {
                        if (!existingUsers.has(user.kana)) {
                            userCreationPromises.push(
                                trickleCreateObject('user', {
                                    ...user,
                                    id: Date.now() + Math.random().toString(36).substring(2, 9),
                                    createdAt: new Date().toISOString(),
                                    isRemovable: true // 削除可能フラグを追加
                                })
                            );
                        }
                    }
                    
                    if (userCreationPromises.length > 0) {
                        await Promise.all(userCreationPromises);
                        // ユーザーリストを再取得
                        const updatedUsersRes = await trickleListObjects('user');
                        // ふりがなの５０音順でソート
                        const sortedUsers = updatedUsersRes.items
                            .map(item => item.objectData)
                            .sort((a, b) => a.kana.localeCompare(b.kana, 'ja'));
                        setUsers(sortedUsers);
                    } else {
                        // ふりがなの５０音順でソート
                        const sortedUsers = usersRes.items
                            .map(item => item.objectData)
                            .sort((a, b) => a.kana.localeCompare(b.kana, 'ja'));
                        setUsers(sortedUsers);
                    }
                    
                    setEquipment(equipmentRes.items.map(item => item.objectData));
                    setReservations(reservationsRes.items.map(item => item.objectData));

                    // 過去予約の自動削除
                    await removeOldReservations();
                    const updatedReservations = await trickleListObjects('reservation');
                    setReservations(updatedReservations.items.map(item => item.objectData));
                } catch (error) {
                    console.error('データ読み込みエラー:', error);
                    alert('データ読み込みエラー: ' + error.message);
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
