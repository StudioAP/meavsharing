function EquipmentManagement({ equipment, onAddEquipment, onDeleteEquipment, isAdmin }) {
    try {
        const [newEquipment, setNewEquipment] = React.useState('');
        
        const handleSubmit = (e) => {
            e.preventDefault();
            if (!newEquipment.trim()) return;
            
            onAddEquipment(newEquipment);
            setNewEquipment('');
        };
        
        const handleDelete = (equipmentId) => {
            if (window.confirm('本当に削除しますか？')) {
                onDeleteEquipment(equipmentId);
            }
        };
        
        if (!isAdmin) return null;
        
        return (
            <div className="admin-panel">
                <h3 className="text-lg font-semibold mb-4">備品管理</h3>
                
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="flex space-x-2">
                        <input
                            data-name="equipment-name-input"
                            type="text"
                            value={newEquipment}
                            onChange={(e) => setNewEquipment(e.target.value)}
                            className="form-input flex-grow"
                            placeholder="備品名を入力"
                            required
                        />
                        <button
                            data-name="add-equipment-button"
                            type="submit"
                            className="form-button"
                        >
                            追加
                        </button>
                    </div>
                </form>
                
                <div>
                    <h4 className="font-medium mb-2">備品一覧</h4>
                    {equipment.length === 0 ? (
                        <p className="text-gray-500">登録されている備品はありません</p>
                    ) : (
                        <ul className="space-y-2">
                            {equipment.map(item => (
                                <li 
                                    key={item.id}
                                    data-name={`equipment-item-${item.id}`}
                                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                >
                                    <span>{item.name}</span>
                                    <button
                                        data-name={`delete-equipment-button-${item.id}`}
                                        onClick={() => handleDelete(item.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('EquipmentManagement component error:', error);
        reportError(error);
    }
}
