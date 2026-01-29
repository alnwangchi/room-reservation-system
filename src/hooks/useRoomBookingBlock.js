import { isTimeInRange } from '@utils/date';
import { useCallback, useEffect } from 'react';

export const useRoomBookingBlock = ({
  selectedDate,
  isTargetRoom,
  blockingRoomId,
  getBookingsForDateAndRoom,
  loadBookingsForDate,
  generateTimeSlots,
}) => {
  useEffect(() => {
    if (selectedDate && isTargetRoom && blockingRoomId) {
      loadBookingsForDate(selectedDate, blockingRoomId);
    }
  }, [selectedDate, isTargetRoom, blockingRoomId, loadBookingsForDate]);

  const isCategoryBlocked = useCallback(
    category => {
      if (!isTargetRoom || !selectedDate || !blockingRoomId) return false;
      const blockingBookings = getBookingsForDateAndRoom(
        selectedDate,
        blockingRoomId
      );
      if (blockingBookings.length === 0) return false;

      const categorySlots = generateTimeSlots().filter(
        slot => slot.hour >= category.startHour && slot.hour < category.endHour
      );

      return blockingBookings.some(booking =>
        categorySlots.some(slot =>
          isTimeInRange(slot.time, booking.startTime, booking.endTime)
        )
      );
    },
    [
      isTargetRoom,
      selectedDate,
      blockingRoomId,
      getBookingsForDateAndRoom,
      generateTimeSlots,
    ]
  );

  return { isCategoryBlocked };
};
