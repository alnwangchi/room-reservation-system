import { useCallback, useEffect, useState } from 'react';
import { roomService } from '../services/firestore';

export const useOpenSettings = (selectedRoomId, selectedDate) => {
  const [timeSlots, setTimeSlots] = useState({
    morning: true,
    afternoon: true,
    evening: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  // 載入指定日期的開放設定
  const loadOpenSettings = useCallback(async (roomId, date) => {
    if (!roomId || !date) return;

    try {
      setIsLoading(true);
      const settings = await roomService.getRoomOpenSetting(roomId, date);
      setTimeSlots({
        morning: settings.morning,
        afternoon: settings.afternoon,
        evening: settings.evening,
      });
    } catch (error) {
      console.error('Error loading open settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 當選擇的日期或房間改變時，載入對應的開放設定
  useEffect(() => {
    if (selectedDate && selectedRoomId) {
      loadOpenSettings(selectedRoomId, selectedDate);
    }
  }, [selectedDate, selectedRoomId, loadOpenSettings]);

  // 切換時段開放狀態
  const toggleTimeSlot = useCallback(
    async slot => {
      if (!selectedDate || !selectedRoomId) return;

      const newTimeSlots = {
        ...timeSlots,
        [slot]: !timeSlots[slot],
      };

      setTimeSlots(newTimeSlots);

      // 保存設定到 Firestore
      try {
        await roomService.updateRoomOpenSetting(
          selectedRoomId,
          selectedDate,
          newTimeSlots
        );
      } catch (error) {
        console.error('Error saving open settings:', error);
        // 如果保存失敗，恢復原來的狀態
        setTimeSlots(timeSlots);
      }
    },
    [timeSlots, selectedDate, selectedRoomId]
  );

  // 獲取指定時段的開放狀態
  const getTimeSlotStatus = useCallback(
    slot => {
      return timeSlots[slot] || false;
    },
    [timeSlots]
  );

  // 獲取所有時段的開放狀態
  const getAllTimeSlots = useCallback(() => {
    return timeSlots;
  }, [timeSlots]);

  return {
    timeSlots,
    isLoading,
    toggleTimeSlot,
    getTimeSlotStatus,
    getAllTimeSlots,
    loadOpenSettings,
  };
};
