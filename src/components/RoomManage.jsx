import { Switch } from '@headlessui/react';
import dayjs from 'dayjs';
import { Clock } from 'lucide-react';
import React, { useState } from 'react';
import { ROOMS, TIME_CATEGORIES } from '../constants';
import { useBooking, useOpenSettings } from '../hooks';
import Calendar from './Calendar';

function RoomManage({ selectedRoomId = 'general-piano-room', onRoomChange }) {
  const [currentDate, setCurrentDate] = useState(dayjs());

  // 使用 useBooking hook 獲取預訂資訊
  const { selectedDate, setSelectedDate, getBookingsForDateAndRoom } =
    useBooking(selectedRoomId);

  // 使用 useOpenSettings hook 獲取開放設定
  const { timeSlots, isLoading, toggleTimeSlot } = useOpenSettings(
    selectedRoomId,
    selectedDate
  );

  const handleDateSelect = date => {
    setSelectedDate(date);
  };

  const handleMonthChange = newDate => {
    setCurrentDate(newDate);
  };

  const handleTimeSlotToggle = slot => {
    toggleTimeSlot(slot);
  };

  // 獲取指定時段的預訂資訊
  const getTimeSlotBookings = category => {
    if (!selectedDate) return [];

    const roomBookings = getBookingsForDateAndRoom(
      selectedDate,
      selectedRoomId
    );
    const { startHour, endHour } = TIME_CATEGORIES[category.toUpperCase()];

    return roomBookings
      .filter(booking => {
        const bookingHour = parseInt(booking.startTime.split(':')[0]);
        return bookingHour >= startHour && bookingHour < endHour;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // 獲取時段顯示名稱
  const getTimeSlotDisplayName = category => {
    const { startHour, endHour } = TIME_CATEGORIES[category.toUpperCase()];
    return `${startHour.toString().padStart(2, '0')}:00 - ${endHour.toString().padStart(2, '0')}:00`;
  };

  // 獲取時段背景顏色類別
  const getTimeSlotBgClass = category => {
    const bgClasses = {
      morning: 'bg-sky-50',
      afternoon: 'bg-emerald-50',
      evening: 'bg-amber-50',
    };
    return bgClasses[category] || 'bg-gray-50';
  };

  // 獲取時段圖標顏色類別
  const getTimeSlotIconClass = category => {
    const iconClasses = {
      morning: 'text-sky-600',
      afternoon: 'text-emerald-600',
      evening: 'text-amber-600',
    };
    return iconClasses[category] || 'text-gray-600';
  };

  return (
    <div className="space-y-6 relative">
      {/* 房間選擇器 */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h3 className="mb-4">選擇房間</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ROOMS.map(room => (
            <div
              key={room.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedRoomId === room.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                if (onRoomChange) {
                  onRoomChange(room.id);
                }
              }}
            >
              <h4>{room.name}</h4>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-5">
        {/* 左欄：日曆和時段開關設定 */}
        <div className="space-y-6">
          {/* 月曆 */}
          <div className="bg-white rounded-lg shadow-sm">
            <Calendar
              currentDate={currentDate}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
            />
          </div>

          {/* 時段開關設定 */}
          {selectedDate && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="mb-4">
                時段開關設定
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({selectedDate.format('YYYY年MM月DD日')})
                </span>
                {isLoading && (
                  <span className="text-sm font-normal text-blue-500 ml-2">
                    (載入中...)
                  </span>
                )}
              </h3>
              <div className="space-y-3">
                {Object.keys(TIME_CATEGORIES).map(category => {
                  const categoryKey = category.toLowerCase();
                  const displayName = getTimeSlotDisplayName(categoryKey);
                  const categoryName = TIME_CATEGORIES[category].name;

                  return (
                    <div
                      key={category}
                      className={`flex items-center justify-between p-3 ${getTimeSlotBgClass(categoryKey)} rounded-lg`}
                    >
                      <div className="flex items-center space-x-2">
                        <Clock
                          className={`w-4 h-4 ${getTimeSlotIconClass(categoryKey)}`}
                        />
                        <div>
                          <h4 className="text-sm font-medium text-gray-800">
                            {categoryName}
                          </h4>
                          <p className="text-xs text-gray-600">{displayName}</p>
                        </div>
                      </div>
                      <Switch
                        checked={timeSlots[categoryKey]}
                        onChange={() => handleTimeSlotToggle(categoryKey)}
                        disabled={isLoading}
                        className={`${
                          timeSlots[categoryKey] ? 'bg-blue-600' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <span
                          className={`${
                            timeSlots[categoryKey]
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform`}
                        />
                      </Switch>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 右欄：當前使用情況 */}
        {selectedDate && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              當前使用情況
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({selectedDate.format('YYYY年MM月DD日')})
              </span>
            </h3>
            <div className="space-y-4">
              {Object.keys(TIME_CATEGORIES)
                .sort(
                  (a, b) =>
                    TIME_CATEGORIES[a].startHour - TIME_CATEGORIES[b].startHour
                )
                .map(category => {
                  const categoryKey = category.toLowerCase();
                  const bookings = getTimeSlotBookings(categoryKey);
                  const displayName = getTimeSlotDisplayName(categoryKey);
                  const categoryName = TIME_CATEGORIES[category].name;

                  return (
                    <div key={category} className="space-y-2">
                      {/* 時段標題 */}
                      <div className="flex items-center space-x-2">
                        <Clock
                          className={`w-4 h-4 ${getTimeSlotIconClass(categoryKey)}`}
                        />
                        <h5 className="text-sm font-medium text-gray-800">
                          {categoryName}
                        </h5>
                        <span className="text-xs text-gray-500">
                          ({displayName})
                        </span>
                      </div>

                      {/* 預訂詳情 */}
                      <div className="ml-6 space-y-1">
                        {bookings.length > 0 ? (
                          bookings.map((booking, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                            >
                              <span className="text-gray-600">
                                {booking.startTime}
                              </span>
                              <span className="text-gray-800 font-medium">
                                {booking.displayName ||
                                  booking.booker ||
                                  '未知用戶'}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center p-3 bg-gray-50 rounded text-gray-400">
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                              />
                            </svg>
                            <span>無預訂</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomManage;
