function App() {
    try {
        const [activeTab, setActiveTab] = React.useState('reservation');
        const [isAdmin, setIsAdmin] = React.useState(false);
        const [selectedDate, setSelectedDate] = React.useState(dayjs().format('YYYY-MM-DD'));
        const [isLoading, setIsLoading] = React.useState(true);
        const [users, setUsers] = React.useState([]);
        const [equipment, setEquipment] = React.useState([]);
        const [reservations, setReservations] = React.useState([]);

        // データ読み込み
        React.useEffect(() => {
            async function loadData() {
                try {
                    const [usersRes, equipmentRes, reservationsRes] = await Promise.all([
                        trickleListObjects('user'),
                        trickleListObjects('equipment'),
                        trickleListObjects('reservation')
                    ]);

                    // ふりがなの５０音順でソート
                    const sortedUsers = usersRes.items
                        .map(item => item.objectData)
                        .sort((a, b) => a.kana.localeCompare(b.kana, 'ja'));
                    
                    setUsers(sortedUsers);
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
