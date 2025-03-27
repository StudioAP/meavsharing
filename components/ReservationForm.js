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
            { id: '5', label: '5講時' }
        ];

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!selectedUser || !selectedEquipment || selectedTimeSlots.length === 0) {
                alert('利用者、備品、講時をすべて選択してください');
                return;
            }

            setIsSubmitting(true);
            try {
                const success = await onReservationSubmit({
                    date: selectedDate,
                    userId: selectedUser,
                    equipmentId: selectedEquipment,
                    timeSlots: selectedTimeSlots.sort()
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

        const handleTimeSlotToggle = (slotId) => {
            setSelectedTimeSlots(prev => {
                if (prev.includes(slotId)) {
                    return prev.filter(id => id !== slotId);
                } else {
                    return [...prev, slotId];
                }
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
