import dayjs from 'dayjs';

/**
 * 將 Firestore Timestamp 轉換為 JavaScript Date 物件
 * @param {Object|Date|string} timestamp - Firestore Timestamp 或 Date 物件或日期字串
 * @returns {Date|null} 轉換後的 Date 物件，如果轉換失敗則返回 null
 */
export const convertFirestoreTimestamp = timestamp => {
  if (!timestamp) return null;

  // 如果是 Firestore Timestamp 物件
  if (timestamp.seconds) {
    return dayjs(timestamp.seconds * 1000).toDate(); // 使用 dayjs 創建 Date 物件
  }

  // 如果已經是 Date 物件
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // 如果是字串，嘗試解析
  if (typeof timestamp === 'string') {
    const parsedDate = dayjs(timestamp); // 使用 dayjs 解析
    return parsedDate.isValid() ? parsedDate.toDate() : null; // 檢查有效性並轉換為 Date
  }

  return null;
};

/**
 * 格式化日期為可讀字串
 * @param {Object|Date|string} timestamp - Firestore Timestamp 或 Date 物件或日期字串
 * @param {string} format - dayjs 格式字串，預設為 'YYYY/MM/DD'
 * @returns {string} 格式化後的日期字串，如果轉換失敗則返回 '未知'
 */
export const formatDate = (timestamp, format = 'YYYY/MM/DD') => {
  const date = convertFirestoreTimestamp(timestamp);
  return date ? dayjs(date).format(format) : '未知';
};

/**
 * 格式化日期為相對時間（例如：3天前）
 * @param {Object|Date|string} timestamp - Firestore Timestamp 或 Date 物件或日期字串
 * @returns {string} 相對時間字串
 */
export const formatRelativeTime = timestamp => {
  const date = convertFirestoreTimestamp(timestamp);
  if (!date) return '未知';

  const now = dayjs(); // 使用 dayjs 獲取當前時間
  const diffDays = now.diff(dayjs(date), 'day'); // 使用 dayjs 計算天數差

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}個月前`;
  return `${Math.floor(diffDays / 365)}年前`;
};

/**
 * 檢查日期是否為今天
 * @param {Object|Date|string} timestamp - Firestore Timestamp 或 Date 物件或日期字串
 * @returns {boolean} 是否為今天
 */
export const isToday = timestamp => {
  const date = convertFirestoreTimestamp(timestamp);
  if (!date) return false;

  return dayjs(date).isSame(dayjs(), 'day'); // 使用 dayjs 比較
};

/**
 * 檢查日期是否為昨天
 * @param {Object|Date|string} timestamp - Firestore Timestamp 或 Date 物件或日期字串
 * @returns {boolean} 是否為昨天
 */
export const isYesterday = timestamp => {
  const date = convertFirestoreTimestamp(timestamp);
  if (!date) return false;

  const yesterday = dayjs().subtract(1, 'day'); // 使用 dayjs 計算昨天
  return dayjs(date).isSame(yesterday, 'day'); // 使用 dayjs 比較
};

/**
 * 獲取兩個日期之間的天數差
 * @param {Object|Date|string} startTimestamp - 開始時間
 * @param {Object|Date|string} endTimestamp - 結束時間
 * @returns {number} 天數差
 */
export const getDaysDifference = (startTimestamp, endTimestamp) => {
  const startDate = convertFirestoreTimestamp(startTimestamp);
  const endDate = convertFirestoreTimestamp(endTimestamp);

  if (!startDate || !endDate) return 0;

  return dayjs(endDate).diff(dayjs(startDate), 'day'); // 使用 dayjs 計算天數差
};

/**
 * 格式化時段範圍為 "HH:MM - HH:MM" 格式
 * @param {string} startTime - 開始時間，格式為 "HH:MM"
 * @param {string} endTime - 結束時間，格式為 "HH:MM"
 * @returns {string} 格式化後的時段範圍字串
 */
export const formatTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) return '';

  // 確保時間格式為 HH:MM
  const formatTime = time => {
    if (typeof time === 'string' && time.includes(':')) {
      return time;
    }
    return '';
  };

  const formattedStart = formatTime(startTime);
  const formattedEnd = formatTime(endTime);

  if (!formattedStart || !formattedEnd) return '';

  return `${formattedStart} - ${formattedEnd}`;
};

/**
 * 計算結束時間（基於開始時間和時長）
 * @param {string} startTime - 開始時間，格式為 "HH:MM"
 * @param {number} durationMinutes - 時長（分鐘）
 * @returns {string} 結束時間，格式為 "HH:MM"
 */
export const calculateEndTime = (startTime, durationMinutes) => {
  if (!startTime || typeof startTime !== 'string') return '';
  if (typeof durationMinutes !== 'number' || durationMinutes <= 0) return '';

  const [hour, minute] = startTime.split(':').map(Number);
  if (isNaN(hour) || isNaN(minute)) return '';

  let endHour = hour;
  let endMinute = minute + durationMinutes;

  if (endMinute >= 60) {
    endHour += Math.floor(endMinute / 60);
    endMinute = endMinute % 60;
  }

  return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
};

/**
 * 檢查時間是否在指定範圍內
 * @param {string} time - 要檢查的時間，格式為 "HH:MM"
 * @param {string} startTime - 範圍開始時間，格式為 "HH:MM"
 * @param {string} endTime - 範圍結束時間，格式為 "HH:MM"
 * @returns {boolean} 時間是否在範圍內
 */
export const isTimeInRange = (time, startTime, endTime) => {
  if (!time || !startTime || !endTime) return false;

  const timeToMinutes = timeStr => {
    const [hour, minute] = timeStr.split(':').map(Number);
    return hour * 60 + minute;
  };

  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  if (isNaN(timeMinutes) || isNaN(startMinutes) || isNaN(endMinutes))
    return false;

  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
};
