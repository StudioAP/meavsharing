function Calendar({ currentDate, onDateSelect, reservations }) {
    try {
        const [currentMonth, setCurrentMonth] = React.useState(dayjs().tz('Asia/Tokyo').startOf('month'));
        
        const isPastDate = (date) => {
            const today = dayjs().tz('Asia/Tokyo');
            return date.isBefore(today, 'day');
        };
        
        const isReserved = (date) => {
            return reservations.some(r => dayjs(r.date).tz('Asia/Tokyo').isSame(date, 'day'));
        };
        
        const renderMonth = (monthDate) => {
            const daysInMonth = monthDate.daysInMonth();
            const firstDay = monthDate.startOf('month').day();
            
            const days = [];
            // 空のセルで最初の曜日まで埋める
            for (let i = 0; i < firstDay; i++) {
                days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
            }
            
            // 実際の日付を追加
            for (let day = 1; day <= daysInMonth; day++) {
                const date = monthDate.date(day);
                const dateStr = date.format('YYYY-MM-DD');
                
                const dayClass = [
                    'calendar-day',
                    isPastDate(date) ? 'past' : '',
                    dayjs(currentDate).tz('Asia/Tokyo').isSame(date, 'day') ? 'selected' : ''
                ].join(' ');
                
                days.push(
                    <div 
                        key={`day-${day}`}
                        data-name={`calendar-day-${day}`}
                        className={dayClass}
                        onClick={() => !isPastDate(date) && onDateSelect(dateStr)}
                    >
                        {day}
                    </div>
                );
            }
            
            return days;
        };
        
        const prevMonth = () => {
            setCurrentMonth(prev => prev.subtract(1, 'month').startOf('month'));
        };
        
        const nextMonth = () => {
            setCurrentMonth(prev => prev.add(1, 'month').startOf('month'));
        };
        
        const nextMonthDate = currentMonth.add(1, 'month');
        
        return (
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <button 
                        data-name="prev-month-button"
                        className="p-2 rounded hover:bg-gray-100"
                        onClick={prevMonth}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <h3 className="text-lg font-semibold">
                        {currentMonth.format('YYYY年M月')}
                    </h3>
                    <button 
                        data-name="next-month-button"
                        className="p-2 rounded hover:bg-gray-100"
                        onClick={nextMonth}
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                {/* 現在の月のカレンダー */}
                <div className="grid grid-cols-7 gap-1 mb-6">
                    {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                        <div key={day} className="text-center font-medium py-2">
                            {day}
                        </div>
                    ))}
                    {renderMonth(currentMonth)}
                </div>
                
                {/* 次の月のカレンダー */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                        {nextMonthDate.format('YYYY年M月')}
                    </h3>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                        <div key={`next-${day}`} className="text-center font-medium py-2">
                            {day}
                        </div>
                    ))}
                    {renderMonth(nextMonthDate)}
                </div>
            </div>
        );
    } catch (error) {
        console.error('Calendar component error:', error);
        reportError(error);
    }
}
