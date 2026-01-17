import dayjs from 'dayjs';

/**
 * 將各種格式的日期值轉換為時間戳
 * @param {any} value - 日期值（可能是 Firestore Timestamp、物件或字串）
 * @returns {number} - 時間戳（毫秒）
 */
export const getCreatedAtValue = value => {
  if (!value) {
    return 0;
  }
  if (typeof value === 'object') {
    if (typeof value.toDate === 'function') {
      const dateValue = dayjs(value.toDate());
      return dateValue.isValid() ? dateValue.valueOf() : 0;
    }
    if ('seconds' in value) {
      const dateValue = dayjs(value.seconds * 1000);
      return dateValue.isValid() ? dateValue.valueOf() : 0;
    }
  }
  const dateValue = dayjs(value);
  return dateValue.isValid() ? dateValue.valueOf() : 0;
};

/**
 * 過濾用戶：根據是否顯示管理員來決定是否包含管理員用戶
 * @param {Array} users - 用戶陣列
 * @param {boolean} includeAdmins - 是否包含管理員
 * @returns {Array} - 過濾後的用戶陣列
 */
export const filterUsersByRole = (users, includeAdmins) => {
  return users.filter(user => includeAdmins || user.role !== 'admin');
};

/**
 * 按加入時間排序（新到舊）
 * @param {Object} a - 第一個用戶物件
 * @param {Object} b - 第二個用戶物件
 * @returns {number} - 排序結果
 */
export const sortUsersByJoinTime = (a, b) => {
  return getCreatedAtValue(b.createdAt) - getCreatedAtValue(a.createdAt);
};

/**
 * 按預訂總數排序（多到少）
 * @param {Object} a - 第一個用戶物件
 * @param {Object} b - 第二個用戶物件
 * @returns {number} - 排序結果
 */
export const sortUsersByTotalBookings = (a, b) => {
  const totalA = Object.values(a.totalBookings || {}).reduce(
    (acc, curr) => acc + curr,
    0
  );
  const totalB = Object.values(b.totalBookings || {}).reduce(
    (acc, curr) => acc + curr,
    0
  );
  return totalB - totalA;
};
