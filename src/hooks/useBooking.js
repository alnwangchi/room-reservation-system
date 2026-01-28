import { roomService } from '@services/firestore';
import { calculateEndTime } from '@utils/date';
import { getTimeSlotConfig } from '@utils/timeSlot';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';

export const useBooking = selectedRoom => {
  const [selectedDate, setSelectedDate] = useState();
  const [bookings, setBookings] = useState([]);

  // 載入指定日期的 Firestore 預訂資料
  const loadBookingsForDate = useCallback(async (date, roomId) => {
    if (!date || !roomId) return;

    try {
      const firestoreBookings = await roomService.getRoomBookingsForDate(
        roomId,
        date
      );
      const intervalMinutes = getTimeSlotConfig(roomId).INTERVAL_MINUTES;

      // 轉換 Firestore 資料格式為本地格式
      const localBookings = firestoreBookings.map(booking => ({
        ...booking,
        startTime: booking.timeSlot,
        endTime: calculateEndTime(booking.timeSlot, intervalMinutes),
      }));

      // 更新本地預訂狀態
      setBookings(prev => {
        // 移除該日期的舊預訂
        const filtered = prev.filter(
          booking =>
            !(
              booking.roomId === roomId &&
              booking.date === date.format('YYYY-MM-DD')
            )
        );
        // 添加新的預訂
        return [...filtered, ...localBookings];
      });
    } catch (error) {
      console.error('載入預訂資料失敗:', error);
    }
  }, []);

  // 頁面載入時初始化預訂資料
  useEffect(() => {
    if (selectedDate) {
      loadBookingsForDate(selectedDate, selectedRoom);
    }
  }, [selectedDate, selectedRoom, loadBookingsForDate]);

  // 初始化 selectedDate
  useEffect(() => {
    setSelectedDate(dayjs().add(1, 'day'));
  }, []);

  // 獲取指定日期和琴房的預訂
  const getBookingsForDateAndRoom = useCallback(
    (date, roomId) => {
      if (!date) return [];
      const dateStr = date.format('YYYY-MM-DD');
      return bookings.filter(
        booking => booking.roomId === roomId && booking.date === dateStr
      );
    },
    [bookings]
  );

  return {
    selectedDate,
    setSelectedDate,
    bookings,
    setBookings,
    loadBookingsForDate,
    getBookingsForDateAndRoom,
  };
};
