function validateTimeSlots(timeSlots) {
    const validSequences = [
        ['1', '2'],
        ['2', 'lunch'],
        ['lunch', '3'],
        ['3', '4'],
        ['4', '5'],
        ['1', '2', 'lunch'],
        ['2', 'lunch', '3'],
        ['lunch', '3', '4'],
        ['3', '4', '5'],
        ['1', '2', 'lunch', '3'],
        ['2', 'lunch', '3', '4'],
        ['lunch', '3', '4', '5'],
        ['1', '2', 'lunch', '3', '4'],
        ['2', 'lunch', '3', '4', '5'],
        ['1', '2', 'lunch', '3', '4', '5']
    ];
    
    // Check if the selected slots match any valid sequence
    return validSequences.some(sequence => {
        if (sequence.length !== timeSlots.length) return false;
        return sequence.every((slot, index) => slot === timeSlots[index]);
    });
}

function isTimeSlotAvailable(reservations, date, timeSlots) {
    return !reservations.some(reservation => {
        if (reservation.date !== date) return false;
        return reservation.timeSlots.some(slot => timeSlots.includes(slot));
    });
}

function sortReservationsByDate(reservations) {
    return [...reservations].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
    });
}
