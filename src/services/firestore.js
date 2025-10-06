import dayjs from 'dayjs';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ROOMS } from '../constants';
import { isEmpty } from '../utils';
import { calculateEndTime } from '../utils/dateUtils';

// 通用 CRUD 操作
export const firestoreService = {
  // 獲取集合中的所有文檔
  async getAll(collectionName) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  },

  // 根據 ID 獲取單個文檔
  async getById(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  // 添加新文檔
  async add(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  },

  // 更新文檔
  async update(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // 刪除文檔
  async delete(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error removing document:', error);
      throw error;
    }
  },

  // 根據條件查詢文檔
  async query(
    collectionName,
    conditions = [],
    orderByField = null,
    limitCount = null
  ) {
    try {
      let q = collection(db, collectionName);

      // 添加查詢條件
      if (conditions.length > 0) {
        conditions.forEach(condition => {
          q = query(
            q,
            where(condition.field, condition.operator, condition.value)
          );
        });
      }

      // 添加排序
      if (orderByField) {
        q = query(
          q,
          orderBy(orderByField.field, orderByField.direction || 'asc')
        );
      }

      // 添加限制
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  },
};

// 特定集合的服務
export const roomService = {
  // 獲取所有教室
  async getAllRooms() {
    return await firestoreService.getAll('rooms');
  },

  // 根據 ID 獲取教室
  async getRoomById(id) {
    return await firestoreService.getById('rooms', id);
  },

  // 添加新教室
  async addRoom(roomData) {
    return await firestoreService.add('rooms', roomData);
  },

  // 更新教室資訊
  async updateRoom(id, roomData) {
    try {
      roomData.updatedAt = dayjs().toDate(); // 使用 dayjs 創建 Date 物件
      return await firestoreService.update('rooms', id, roomData);
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  },

  // 刪除教室
  async deleteRoom(id) {
    return await firestoreService.delete('rooms', id);
  },

  // 預訂房間時段
  async bookRoomTimeSlot(roomId, date, timeSlot, userInfo) {
    try {
      const dateStr = date.format('YYYY-MM-DD');
      const roomRef = doc(db, 'rooms', roomId.toString());
      const dateRef = doc(roomRef, dateStr, 'timeSlot');

      // 準備用戶預訂記錄相關的引用
      const customId = userInfo.email.split('@')[0];
      const userRef = doc(db, 'users', customId);
      const userBookingsRef = collection(userRef, 'bookings');
      const yearMonth = dayjs(dateStr).format('YYYY-MM');
      const monthDocRef = doc(userBookingsRef, yearMonth);

      // 使用 Firestore 事務進行原子性操作
      const result = await runTransaction(db, async transaction => {
        // 🔒 先進行所有讀取操作
        // 1. 檢查時段是否已被預訂
        const existingBooking = await transaction.get(dateRef);
        let existingTimeSlots = {};
        if (existingBooking.exists()) {
          existingTimeSlots = existingBooking.data();
        }

        // 檢查該時段是否已被預訂
        if (existingTimeSlots[timeSlot]) {
          throw new Error('該時段已被預訂');
        }

        // 2. 讀取現有的月份預訂資料
        let monthDocSnap = null;
        let monthBookings = {};
        if (customId) {
          monthDocSnap = await transaction.get(monthDocRef);
          monthBookings = monthDocSnap.exists()
            ? monthDocSnap.data()
            : {
                'general-piano-room': [],
                'standard-recording-studio': [],
              };
        }

        // Calculate end time, duration, and cost
        const endTime = calculateEndTime(timeSlot, 30);
        const startTime = dayjs(`2000-01-01T${timeSlot}:00`);
        const endTimeDate = dayjs(`2000-01-01T${endTime}:00`);
        const durationHours = endTimeDate.diff(startTime, 'hour', true);

        const room = ROOMS.find(r => r.id === roomId);
        // room.price 已經是半小時（一個時段）的價格
        const bookingCost = room ? room.price : 0;

        // 🔒 然後進行所有寫入操作
        // 1. 建立預訂記錄到 rooms 集合
        const bookingData = {
          bookerId: userInfo.uid || userInfo.id,
          booker: userInfo.displayName || userInfo.booker,
          description: userInfo.description || '',
          bookedAt: dayjs().toDate(),
          roomId: roomId.toString(),
          date: dateStr,
          timeSlot: timeSlot,
          cost: bookingCost,
          duration: durationHours,
        };

        // 將新的預訂添加到現有的 timeSlots 物件中
        existingTimeSlots[timeSlot] = bookingData;
        transaction.set(dateRef, existingTimeSlots);

        // 2. 同時更新用戶預訂記錄
        if (customId) {
          // 創建新的預訂記錄
          const newBooking = {
            roomId: roomId.toString(),
            roomName: ROOMS.find(r => r.id === roomId)?.name || '未知房型',
            date: dateStr,
            startTime: timeSlot,
            endTime: endTime,
            duration: durationHours,
            cost: bookingCost,
            description: userInfo.description || '',
            booker: userInfo.displayName || userInfo.booker,
            bookedAt: dayjs().toDate(),
            roomPrice: ROOMS.find(r => r.id === roomId)?.price || 0,
            bookingTime: dayjs().valueOf(),
          };

          // 將新預訂添加到對應房型的陣列中
          monthBookings[roomId].push(newBooking);

          // 在事務中更新月份文檔
          transaction.set(monthDocRef, monthBookings);
        }

        return { bookingData, cost: bookingCost, duration: durationHours };
      });

      // 更新使用者的房型統計（事務外進行，不影響核心預訂邏輯）
      try {
        if (customId) {
          await this.updateUserRoomBookingsStats(customId, roomId.toString(), {
            date: dateStr,
            startTime: timeSlot,
            endTime: calculateEndTime(timeSlot, 30),
            duration: result.duration,
            cost: result.cost,
            description: userInfo.description || '',
          });
        }
      } catch (statsError) {
        console.error('Error updating user booking stats:', statsError);
        // 不阻擋預訂流程，只記錄錯誤
      }

      return true;
    } catch (error) {
      console.error('Error booking room time slot:', error);
      throw error;
    }
  },

  // 獲取房間指定日期的所有預訂
  async getRoomBookingsForDate(roomId, date) {
    try {
      const dateStr = date.format('YYYY-MM-DD');
      const roomRef = doc(db, 'rooms', roomId.toString());
      const dateRef = doc(roomRef, dateStr, 'timeSlot');

      const docSnap = await getDoc(dateRef);
      const bookings = [];

      if (docSnap.exists()) {
        const timeSlots = docSnap.data();
        Object.keys(timeSlots).forEach(timeSlot => {
          bookings.push({
            id: timeSlot,
            ...timeSlots[timeSlot],
          });
        });
      }

      return bookings;
    } catch (error) {
      console.error('Error getting room bookings for date:', error);
      return [];
    }
  },

  // 獲取指定年份和月份的所有房間預訂記錄
  async getRoomBookingsForMonth(roomId, year, month) {
    try {
      const roomRef = doc(db, 'rooms', roomId.toString());

      // 生成該月份的所有日期
      const startDate = dayjs(
        `${year}-${month.toString().padStart(2, '0')}-01`
      );
      const endDate = startDate.endOf('month');
      const allBookings = [];

      // 生成該月份所有日期的陣列
      const dateStrings = [];
      let currentDate = startDate;
      while (
        currentDate.isBefore(endDate) ||
        currentDate.isSame(endDate, 'day')
      ) {
        dateStrings.push(currentDate.format('YYYY-MM-DD'));
        currentDate = currentDate.add(1, 'day');
      }

      // 使用 Promise.allSettled 並行查詢所有日期
      const bookingPromises = dateStrings.map(async dateStr => {
        try {
          const dateRef = doc(roomRef, dateStr, 'timeSlot');
          const docSnap = await getDoc(dateRef);

          if (docSnap.exists()) {
            const timeSlots = docSnap.data();
            return Object.keys(timeSlots).map(timeSlot => ({
              id: `${dateStr}_${timeSlot}`,
              date: dateStr,
              timeSlot: timeSlot,
              ...timeSlots[timeSlot],
            }));
          }
          return [];
        } catch (dateError) {
          console.warn(
            `Error getting bookings for date ${dateStr}:`,
            dateError
          );
          return [];
        }
      });

      // 等待所有查詢完成
      const results = await Promise.allSettled(bookingPromises);

      // 處理結果
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allBookings.push(...result.value);
        } else {
          console.warn(
            `Failed to get bookings for date ${dateStrings[index]}:`,
            result.reason
          );
        }
      });

      // 按日期和時間排序
      return allBookings.sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.timeSlot.localeCompare(b.timeSlot);
      });
    } catch (error) {
      console.error('Error getting room bookings for month:', error);
      return [];
    }
  },

  // 獲取所有房間在指定年份和月份的預訂記錄
  async getAllRoomsBookingsForMonth(year, month) {
    try {
      const allBookings = [];
      const rooms = ROOMS;

      for (const room of rooms) {
        const roomBookings = await this.getRoomBookingsForMonth(
          room.id,
          year,
          month
        );
        roomBookings.forEach(booking => {
          allBookings.push({
            ...booking,
            roomId: room.id,
            roomName: room.name,
          });
        });
      }

      // 按日期和時間排序
      return allBookings.sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.timeSlot.localeCompare(b.timeSlot);
      });
    } catch (error) {
      console.error('Error getting all rooms bookings for month:', error);
      return [];
    }
  },

  // 取消房間預訂
  async cancelRoomBooking(roomId, date, timeSlot) {
    try {
      const roomRef = doc(db, 'rooms', roomId.toString());
      const dateRef = doc(roomRef, date, 'timeSlot');

      await runTransaction(db, async transaction => {
        const docSnap = await transaction.get(dateRef);
        if (docSnap.exists()) {
          const timeSlots = docSnap.data();
          if (timeSlots[timeSlot]) {
            delete timeSlots[timeSlot];
            // 如果沒有其他預訂了，刪除整個文檔
            if (isEmpty(timeSlots)) {
              transaction.delete(dateRef);
            } else {
              transaction.set(dateRef, timeSlots);
            }
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Error canceling room booking:', error);
      throw error;
    }
  },

  // 取消使用者預訂記錄
  async cancelUserBooking(userId, bookingId, roomId, date, timeSlot) {
    try {
      // 1. 從 rooms 集合中刪除預訂
      const roomRef = doc(db, 'rooms', roomId);
      const dateRef = doc(roomRef, date, 'timeSlot');

      // 使用事務來原子性地移除特定的 timeSlot
      await runTransaction(db, async transaction => {
        const docSnap = await transaction.get(dateRef);
        if (docSnap.exists()) {
          const timeSlots = docSnap.data();
          if (timeSlots[timeSlot]) {
            delete timeSlots[timeSlot];
            // 如果沒有其他預訂了，刪除整個文檔
            if (isEmpty(timeSlots)) {
              transaction.delete(dateRef);
            } else {
              transaction.set(dateRef, timeSlots);
            }
          }
        }
      });

      // 2. 從 users 集合中刪除預訂記錄
      // 確保 userId 是正確的格式（email_username）
      const userRef = doc(db, 'users', userId);
      const userBookingsRef = collection(userRef, 'bookings');

      // 從月份文檔中移除該預訂
      const yearMonth = dayjs(date).format('YYYY-MM');
      const monthDocRef = doc(userBookingsRef, yearMonth);
      const monthDocSnap = await getDoc(monthDocRef);

      if (monthDocSnap.exists()) {
        const monthData = monthDocSnap.data();
        const roomBookings = monthData[roomId] || [];

        // 找到並移除對應的預訂記錄
        const updatedRoomBookings = roomBookings.filter(
          booking => !(booking.date === date && booking.startTime === timeSlot)
        );

        // 更新月份文檔
        const updatedMonthData = {
          ...monthData,
          [roomId]: updatedRoomBookings,
        };

        await setDoc(monthDocRef, updatedMonthData);
      } else {
        console.log('⚠️ 月份文檔不存在，跳過 users 更新');
      }

      // 3. 更新使用者的房型統計
      await this.updateUserRoomBookingsStatsAfterCancel(userId, roomId, 0.5); // 假設每次預訂是 0.5 小時

      return true;
    } catch (error) {
      console.error('❌ Error canceling user booking:', error);
      throw error;
    }
  },

  // 更新使用者的房型預訂統計（內部方法）
  async updateUserRoomBookingsStats(userId, roomId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.error('User document not found');
        return false;
      }

      const userData = userDoc.data();
      const totalBookings = userData.totalBookings || {};

      // 初始化房型統計
      if (!totalBookings[roomId]) {
        totalBookings[roomId] = 0;
      }

      // 更新統計
      totalBookings[roomId] += 1;

      // 更新使用者文檔
      await updateDoc(userRef, {
        totalBookings,
        updatedAt: dayjs().toDate(), // 使用 dayjs 創建 Date 物件
      });

      return true;
    } catch (error) {
      console.error('Error updating user room bookings stats:', error);
      return false;
    }
  },

  // 取消預訂後更新使用者的房型統計
  async updateUserRoomBookingsStatsAfterCancel(userId, roomId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        console.error('User document not found');
        return false;
      }

      const userData = userDoc.data();
      const totalBookings = userData.totalBookings || {};

      // 更新統計（減少）
      totalBookings[roomId] -= 1;

      // 更新使用者文檔
      await updateDoc(userRef, {
        totalBookings,
        updatedAt: dayjs().toDate(),
      });

      return true;
    } catch (error) {
      console.error(
        'Error updating user room bookings stats after cancel:',
        error
      );
      return false;
    }
  },

  // 控制房間開放設定
  async updateRoomOpenSetting(roomId, date, openSettings) {
    try {
      const dateStr = date.format('YYYY-MM-DD');
      const roomRef = doc(db, 'rooms', roomId.toString());
      const openSettingRef = doc(roomRef, dateStr, 'openSetting');

      // 驗證輸入的設定
      const { morning, afternoon, evening } = openSettings;
      if (
        typeof morning !== 'boolean' ||
        typeof afternoon !== 'boolean' ||
        typeof evening !== 'boolean'
      ) {
        throw new Error('開放設定必須是布林值');
      }

      // 更新開放設定
      await setDoc(openSettingRef, {
        morning,
        afternoon,
        evening,
        updatedAt: dayjs().toDate(),
      });

      return true;
    } catch (error) {
      console.error('Error updating room open setting:', error);
      throw error;
    }
  },

  // 獲取房間開放設定
  async getRoomOpenSetting(roomId, date) {
    try {
      const dateStr = date.format('YYYY-MM-DD');
      const roomRef = doc(db, 'rooms', roomId.toString());
      const openSettingRef = doc(roomRef, dateStr, 'openSetting');

      const docSnap = await getDoc(openSettingRef);

      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // 如果沒有設定，返回預設值（全部開放）
        return {
          morning: true,
          afternoon: true,
          evening: true,
        };
      }
    } catch (error) {
      console.error('Error getting room open setting:', error);
      // 發生錯誤時返回預設值
      return {
        morning: true,
        afternoon: true,
        evening: true,
      };
    }
  },
};

export const userService = {
  // 獲取所有使用者
  async getAllUsers() {
    return await firestoreService.getAll('users');
  },

  // 根據 ID 獲取使用者
  async getUserById(id) {
    return await firestoreService.getById('users', id);
  },

  // 根據 email 獲取使用者
  async getUserByEmail(email) {
    try {
      const users = await firestoreService.query('users', [
        { field: 'email', operator: '==', value: email },
      ]);
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('❌ Error in getUserByEmail:', error);
      return null;
    }
  },

  // 添加新使用者
  async addUser(userData) {
    try {
      const customId = userData.email.split('@')[0];
      const userRef = doc(db, 'users', customId);

      // 檢查使用者是否已存在
      const existingUser = await getDoc(userRef);
      if (existingUser.exists()) {
        // 如果使用者已存在，更新最後登入時間
        await updateDoc(userRef, {
          lastLoginAt: dayjs().toDate(), // 使用 dayjs 創建 Date 物件
        });
        return customId;
      }

      // 創建新使用者文檔
      const newUserData = {
        ...userData,
        id: customId,
      };

      await setDoc(userRef, newUserData);
      return customId;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  },

  // 更新使用者資料
  async updateUser(id, userData) {
    try {
      userData.updatedAt = dayjs().toDate(); // 使用 dayjs 創建 Date 物件
      return await firestoreService.update('users', id, userData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // 更新使用者最後登入時間
  async updateLastLogin(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastLoginAt: dayjs().toDate(), // 使用 dayjs 創建 Date 物件
      });
      return true;
    } catch (error) {
      console.error('Error updating last login time:', error);
      return false;
    }
  },

  // 更新使用者預訂統計
  async updateBookingStats(userId, increment = 1) {
    const user = await this.getUserById(userId);
    if (user) {
      const currentMonth = new Date().getMonth();
      const lastMonth = user.lastBookingMonth || -1;

      let monthlyBookings = user.monthlyBookings || 0;
      if (currentMonth !== lastMonth) {
        monthlyBookings = increment;
      } else {
        monthlyBookings += increment;
      }

      await this.updateUser(userId, {
        totalBookings: (user.totalBookings || 0) + increment,
        monthlyBookings,
        lastBookingMonth: currentMonth,
      });
    }
  },

  // 更新使用者餘額
  async updateBalance(userId, amount) {
    try {
      if (!userId || typeof amount !== 'number') {
        throw new Error('Invalid userId or amount');
      }

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const currentBalance = userData.balance || 0;
      const newBalance = currentBalance + amount;

      await updateDoc(userRef, {
        balance: newBalance,
        updatedAt: dayjs().toDate(),
      });

      return newBalance;
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  },

  // 取消預訂
  // operator 參數用於記錄由誰執行了取消動作（可能是管理員）
  async cancelBooking(userId, booking, operator = null) {
    try {
      // 調用 roomService 的取消預訂函數
      await roomService.cancelUserBooking(
        userId,
        booking.id,
        booking.roomId,
        booking.date,
        booking.startTime
      );

      // 獲取使用者資訊以檢查是否為管理員
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const isAdmin = userData?.role === 'admin';

      // 取消預訂後將金額儲回使用者餘額（只有一般使用者才退款）
      const amountToRefund = booking.cost;
      if (amountToRefund && amountToRefund > 0 && !isAdmin) {
        await this.updateBalance(userId, amountToRefund);
      }

      // 紀錄取消預約記錄（包含操作者與被取消者資訊與詳細內容）
      try {
        const recordPayload = {
          operatorId: operator?.id || operator?.uid || null,
          operatorEmail: operator?.email || null,
          operatorDisplayName: operator?.displayName || null,
          targetUserId: userId,
          canceledAt: dayjs().toDate(),
          bookingDetail: {
            id: booking.id,
            roomId: booking.roomId,
            roomName: booking.roomName || null,
            booker: booking.booker || null,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime || null,
            cost: booking.cost || 0,
            description: booking.description || '',
            bookingTime: booking.bookingTime || null,
          },
        };
        await recordService.addCancelBookingRecord(recordPayload);
      } catch (logError) {
        console.error('Error recording cancel booking record:', logError);
        // 不阻擋主要流程
      }

      return true;
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw error;
    }
  },

  // 刪除使用者
  async deleteUser(id) {
    return await firestoreService.delete('users', id);
  },

  // 獲取使用者的預訂記錄
  async getUserBookings(userId, targetMonth = null) {
    try {
      const userRef = doc(db, 'users', userId);
      const userBookingsRef = collection(userRef, 'bookings');

      // 如果沒有指定月份，預設獲取當月
      const monthToFetch = targetMonth || dayjs().format('YYYY-MM');

      // 只獲取指定月份的文檔
      const monthDocRef = doc(userBookingsRef, monthToFetch);
      const monthDocSnap = await getDoc(monthDocRef);

      const bookings = [];

      if (monthDocSnap.exists()) {
        const monthData = monthDocSnap.data();

        // 遍歷每個房型的預訂陣列
        Object.keys(monthData).forEach(roomId => {
          if (Array.isArray(monthData[roomId])) {
            monthData[roomId].forEach(booking => {
              // 為每個預訂添加月份資訊和唯一ID
              bookings.push({
                id: `${monthToFetch}_${roomId}_${booking.bookingTime}`,
                month: monthToFetch, // 月份 (YYYY-MM)
                ...booking,
              });
            });
          }
        });
      }

      // 按日期和時間排序（最新的在前）
      return bookings.sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        return a.startTime.localeCompare(b.startTime);
      });
    } catch (error) {
      console.error(`Error getting user bookings for ${userId}:`, error);
      return [];
    }
  },

  // 獲取使用者的所有預訂記錄（跨月份）
  async getAllUserBookings(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userBookingsRef = collection(userRef, 'bookings');

      const querySnapshot = await getDocs(userBookingsRef);
      const bookings = [];

      querySnapshot.forEach(doc => {
        const monthData = doc.data();

        // 遍歷每個房型的預訂陣列
        Object.keys(monthData).forEach(roomId => {
          if (Array.isArray(monthData[roomId])) {
            monthData[roomId].forEach(booking => {
              // 為每個預訂添加月份資訊和唯一ID
              bookings.push({
                id: `${doc.id}_${roomId}_${booking.bookingTime}`,
                month: doc.id, // 月份 (YYYY-MM)
                ...booking,
              });
            });
          }
        });
      });

      // 按日期和時間排序（最新的在前）
      return bookings.sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        return a.startTime.localeCompare(b.startTime);
      });
    } catch (error) {
      console.error(`Error getting all user bookings for ${userId}:`, error);
      return [];
    }
  },

  // 獲取使用者本月預訂次數
  async getMonthlyBookings(userId) {
    try {
      const currentMonth = dayjs().month(); // 使用 dayjs 獲取當前月份
      const currentYear = dayjs().year(); // 使用 dayjs 獲取當前年份

      const userBookings = await this.getUserBookings(userId);

      // 篩選本月預訂
      const monthlyBookings = userBookings.filter(booking => {
        const bookingDate = dayjs(booking.date);
        return (
          bookingDate.month() === currentMonth &&
          bookingDate.year() === currentYear
        );
      });

      return monthlyBookings.length;
    } catch (error) {
      console.error('Error getting monthly bookings:', error);
      return 0;
    }
  },
};

export const bookingService = {
  // 獲取所有預訂
  async getAllBookings() {
    return await firestoreService.getAll('bookings');
  },

  // 根據 ID 獲取預訂
  async getBookingById(id) {
    return await firestoreService.getById('bookings', id);
  },

  // 根據使用者 ID 獲取預訂
  async getBookingsByUserId(userId) {
    return await firestoreService.query(
      'bookings',
      [{ field: 'userId', operator: '==', value: userId }],
      { field: 'date', direction: 'desc' }
    );
  },

  // 根據教室 ID 獲取預訂
  async getBookingsByRoomId(roomId) {
    return await firestoreService.query(
      'bookings',
      [{ field: 'roomId', operator: '==', value: roomId }],
      { field: 'date', direction: 'asc' }
    );
  },

  // 添加新預訂
  async addBooking(bookingData) {
    return await firestoreService.add('bookings', bookingData);
  },

  // 更新預訂記錄
  async updateBooking(id, bookingData) {
    try {
      bookingData.updatedAt = dayjs().toDate(); // 使用 dayjs 創建 Date 物件
      return await firestoreService.update('bookings', id, bookingData);
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },

  // 刪除預訂
  async deleteBooking(id) {
    return await firestoreService.delete('bookings', id);
  },
};

export const recordService = {
  // 添加取消預約記錄
  async addCancelBookingRecord(recordData) {
    return await firestoreService.add('cancelBookingRecords', recordData);
  },
};
