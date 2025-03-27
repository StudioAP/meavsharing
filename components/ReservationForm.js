function ReservationForm({ selectedDate, users, equipment, onReservationSubmit, reservations }) {
    try {
        const [selectedUser, setSelectedUser] = React.useState('');
        const [selectedEquipment, setSelectedEquipment] = React.useState('');
        const [selectedTimeSlots, setSelectedTimeSlots] = React.useState([]);
        const [isSubmitting, setIsSubmitting] = React.useState(false);

        const timeSlots = [
            { id: '1', label: '1講時' },
            { id: '2', label: '2講時' },
            { id: 'lunch', label: '昼休み' },
            { id: '3', label: '3講時' },
            { id: '4', label: '4講時' },
            { id: '5', label: '5講時' },
            { id: 'overnight', label: '翌日まで' }
        ];
        
        // 時間枠の順序を管理する配列
        const timeSlotOrder = ['1', '2', 'lunch', '3', '4', '5', 'overnight'];

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!selectedUser || !selectedEquipment || selectedTimeSlots.length === 0) {
                alert('利用者、備品、講時をすべて選択してください');
                return;
            }
            
            // 連続していない講時が選択されていないか確認
            if (!areTimeSlotsConsecutive(selectedTimeSlots)) {
                alert('連続する講時のみ選択できます');
                return;
            }
            
            // 同じ備品が既に予約されていないか確認
            if (isReservationConflict(selectedEquipment, selectedTimeSlots, selectedDate)) {
                alert('選択した時間帯に同じ備品が既に予約されています');
                return;
            }

            setIsSubmitting(true);
            try {
                // タイムスロットを順序通りにソート
                const sortedTimeSlots = [...selectedTimeSlots].sort((a, b) => {
                    return timeSlotOrder.indexOf(a) - timeSlotOrder.indexOf(b);
                });
                
                const success = await onReservationSubmit({
                    date: selectedDate,
                    userId: selectedUser,
                    equipmentId: selectedEquipment,
                    timeSlots: sortedTimeSlots
                });

                if (success) {
                    setSelectedUser('');
                    setSelectedEquipment('');
                    setSelectedTimeSlots([]);
                }
            } catch (error) {
                console.error('予約登録エラー:', error);
                reportError(error);
            } finally {
                setIsSubmitting(false);
            }
        };

        // 連続講時のみ選択可能にする判定関数
        const areTimeSlotsConsecutive = (slots) => {
            if (slots.length <= 1) return true;
            
            // 選択された時間枠を指定された順序に基づいてソート
            const sortedSlots = [...slots].sort((a, b) => {
                return timeSlotOrder.indexOf(a) - timeSlotOrder.indexOf(b);
            });
            
            // 連続しているか確認
            for (let i = 1; i < sortedSlots.length; i++) {
                const prevIndex = timeSlotOrder.indexOf(sortedSlots[i-1]);
                const currIndex = timeSlotOrder.indexOf(sortedSlots[i]);
                
                if (currIndex - prevIndex !== 1) {
                    return false;
                }
            }
            return true;
        };
        
        // 予約重複をチェックする関数
        const isReservationConflict = (equipmentId, timeSlots, date) => {
            if (!reservations || !equipmentId || !timeSlots.length) return false;
            
            return reservations.some(reservation => {
                if (reservation.equipmentId !== equipmentId) return false;
                if (reservation.date !== date) return false;
                
                // 同じ日、同じ備品で、時間枠が重複しているか確認
                return reservation.timeSlots.some(slot => timeSlots.includes(slot));
            });
        };
        
        const handleTimeSlotToggle = (slotId) => {
            setSelectedTimeSlots(prev => {
                let newSlots;
                if (prev.includes(slotId)) {
                    // スロットを削除
                    newSlots = prev.filter(id => id !== slotId);
                } else {
                    // 新しいスロットを追加
                    newSlots = [...prev, slotId];
                    
                    // 連続していない場合は警告を表示
                    if (!areTimeSlotsConsecutive(newSlots)) {
                        alert('連続する講時のみ選択できます');
                        return prev; // 元の選択状態を維持
                    }
                }
                
                return newSlots;
            });
        };

        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">予約登録</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">利用者</label>
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="form-input"
                                required
                            >
                                <option value="">選択してください</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.department})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="form-label">備品</label>
                            <select
                                value={selectedEquipment}
                                onChange={(e) => setSelectedEquipment(e.target.value)}
                                className="form-input"
                                required
                            >
                                <option value="">選択してください</option>
                                {equipment.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="form-label">講時</label>
                            <div className="grid grid-cols-3 gap-2">
                                {timeSlots.map(slot => (
                                    <button
                                        key={slot.id}
                                        type="button"
                                        onClick={() => handleTimeSlotToggle(slot.id)}
                                        className={`p-2 rounded border ${
                                            selectedTimeSlots.includes(slot.id)
                                                ? 'bg-blue-500 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {slot.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        処理中...
                                    </span>
                                ) : '予約を登録'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    } catch (error) {
        console.error('ReservationForm component error:', error);
        reportError(error);
        return <div>エラーが発生しました</div>;
    }
}
