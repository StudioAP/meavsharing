// Day.jsとプラグインを初期化
dayjs.extend(dayjs_plugin_utc);
dayjs.extend(dayjs_plugin_timezone);
dayjs.locale('ja');

function getDaysInMonth(year, month) {
    return dayjs().year(year).month(month).daysInMonth();
}

function getFirstDayOfMonth(year, month) {
    return dayjs().year(year).month(month).date(1).day();
}

function formatDateForDisplay(dateStr) {
    return dayjs(dateStr).tz('Asia/Tokyo').format('YYYY年M月D日(ddd)');
}

function isSameDay(date1, date2) {
    return dayjs(date1).tz('Asia/Tokyo').isSame(dayjs(date2).tz('Asia/Tokyo'), 'day');
}

function getTodayDateString() {
    return dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD');
}

function toJSTDate(date) {
    return dayjs(date).tz('Asia/Tokyo');
}

function getCurrentJSTDate() {
    return dayjs().tz('Asia/Tokyo');
}

function createDayObject(year, month, day) {
    return dayjs().tz('Asia/Tokyo').year(year).month(month).date(day);
}

function isPastNDays(dateStr, days = 7) {
    const today = dayjs().tz('Asia/Tokyo').startOf('day');
    const targetDate = dayjs(dateStr).tz('Asia/Tokyo').startOf('day');
    return targetDate.isBefore(today.subtract(days - 1, 'day'));
}
