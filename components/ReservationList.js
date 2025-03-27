function ReservationList({ selectedDate, reservations, users, equipment, onDeleteReservation }) {
    try {
        const today = dayjs().tz('Asia/Tokyo').startOf('day');
        
        // 講時の順序定義
        const timeSlotOrder = {
            '1': 1,
            '2': 2,
            'lunch': 3,
            '3': 4,
            '4': 5,
            '5': 6,
            'overnight': 7
        };
        
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
            
            // 定義した順序でソート
            return slots
                .sort((a, b) => timeSlotOrder[a] - timeSlotOrder[b])
                .map(slot => slotNames[slot])
                .join('、');
        };
        
        const futureReservations = reservations
            .filter(r => {
                const resDate = dayjs(r.date).tz('Asia/Tokyo');
                return resDate.isSame(today, 'day') || resDate.isAfter(today, 'day');
            })
            .sort((a, b) => {
                const dateA = dayjs(a.date).tz('Asia/Tokyo');
                const dateB = dayjs(b.date).tz('Asia/Tokyo');
                return dateA - dateB;
            });
        
        const handleDelete = async (reservationId) => {
            if (!window.confirm('この予約を削除しますか？')) {
                return;
            }
            
            try {
                await onDeleteReservation(reservationId);
            } catch (error) {
                console.error('予約削除エラー:', error);
                reportError(error);
                alert('予約の削除に失敗しました');
            }
        };
        
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-3">今後の予約一覧</h3>
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
                                        data-name={`reservation-item-${reservation.id}`}
                                        className="reservation-item bg-white rounded shadow-sm"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">
                                                    {resDate.format('YYYY/MM/DD(ddd)')}: {item?.name || '不明な備品'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {user ? `${user.name}（${user.department}）` : '不明な利用者'}
                                                </p>
                                                <p className="text-sm">
                                                    {formatTimeSlots(reservation.timeSlots)}
                                                </p>
                                            </div>
                                            <button
                                                data-name={`delete-reservation-button-${reservation.id}`}
                                                onClick={() => handleDelete(reservation.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
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
        console.error('ReservationList component error:', error);
        reportError(error);
    }
}
