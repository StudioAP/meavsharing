function AdminPanel({ 
    reservations, 
    users, 
    equipment, 
    onCheckoutChange,
    onDeleteAllReservations,
    onAddEquipment,
    onDeleteEquipment
}) {
    try {
        // Navbar.jsで既に認証されているので、ここでは自動的に認証済みとする
        const [isAuthenticated, setIsAuthenticated] = React.useState(true);
        
        const today = dayjs().tz('Asia/Tokyo').startOf('day');
        
        const futureReservations = reservations.filter(r => {
            const resDate = dayjs(r.date).tz('Asia/Tokyo');
            return resDate.isSame(today, 'day') || resDate.isAfter(today, 'day');
        }).sort((a, b) => {
            const dateA = dayjs(a.date).tz('Asia/Tokyo');
            const dateB = dayjs(b.date).tz('Asia/Tokyo');
            return dateA - dateB;
        });

        const formatTimeSlots = (slots) => {
            const slotNames = {
                '1': '1講時',
                '2': '2講時',
                'lunch': '昼休み',
                '3': '3講時',
                '4': '4講時',
                '5': '5講時',
                'overnight': '翌日まで'
            };
            return slots.map(slot => slotNames[slot]).join('、');
        };

        const handleDeleteAll = () => {
            if (window.confirm('本当に全ての予約を削除しますか？この操作は元に戻せません。')) {
                onDeleteAllReservations();
            }
        };

        // Navbarで既に認証済みなので、ログイン処理は不要

        return (
            <div className="space-y-6">
                <EquipmentManagement 
                    equipment={equipment}
                    onAddEquipment={onAddEquipment}
                    onDeleteEquipment={onDeleteEquipment}
                    isAdmin={true}
                />
                
                <div className="admin-panel">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">今後の予約一覧（管理者用）</h3>
                        <button
                            data-name="delete-all-reservations-button"
                            onClick={handleDeleteAll}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                        >
                            全ての予約を削除
                        </button>
                    </div>
                    {futureReservations.length === 0 ? (
                        <p className="text-gray-500">今後の予約はありません</p>
                    ) : (
                        <div className="space-y-2">
                            {futureReservations.map(reservation => {
                                const user = users.find(u => u.id === reservation.userId);
                                const item = equipment.find(e => e.id === reservation.equipmentId);
                                const resDate = dayjs(reservation.date).tz('Asia/Tokyo');
                                
                                return (
                                    <div 
                                        key={reservation.id}
                                        data-name={`admin-reservation-item-${reservation.id}`}
                                        className="reservation-item bg-white rounded shadow-sm p-4"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">
                                                    {resDate.format('YYYY/MM/DD(ddd)')}: {item?.name || '不明な備品'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {user ? `${user.name}（${user.department}）` : '不明な利用者'}
                                                </p>
                                                <p className="text-sm mt-1">
                                                    <span className="font-medium">講時: </span>
                                                    {formatTimeSlots(reservation.timeSlots)}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <label className="flex items-center space-x-1">
                                                    <input
                                                        data-name={`admin-checkout-checkbox-${reservation.id}`}
                                                        type="checkbox"
                                                        checked={reservation.isCheckedOut}
                                                        onChange={() => onCheckoutChange(reservation.id, !reservation.isCheckedOut)}
                                                        className="rounded"
                                                    />
                                                    <span className="text-sm">貸出済み</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('AdminPanel component error:', error);
        reportError(error);
    }
}
