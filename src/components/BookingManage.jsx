import { Listbox } from '@headlessui/react';
import dayjs from 'dayjs';
import { Calendar, ChevronDown, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ROOMS } from '../constants';
import { useHintDialog } from '../contexts/HintDialogContext';
import useGetUsers from '../hooks/useGetUsers';
import { userService } from '../services/firestore';
import MonthSelector from './MonthSelector';

function BookingManage() {
  const { toggleHintDialog } = useHintDialog();
  const { allUsers, loadingUsers, error: usersError } = useGetUsers();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM')); // 新增月份選擇狀態

  // 當使用者載入完成後，設定預設選中的使用者
  useEffect(() => {
    if (allUsers.length > 0 && !selectedUser) {
      setSelectedUser(allUsers[3]);
    }
  }, [allUsers, selectedUser]);

  // 載入選中使用者的預訂資料
  useEffect(() => {
    const loadUserBookings = async () => {
      if (!selectedUser) return;

      try {
        setLoading(true);
        const userBookings = await userService.getUserBookings(
          selectedUser.id,
          selectedMonth
        );
        setBookings(userBookings);
      } catch (err) {
        console.error('Error loading user bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadUserBookings();
  }, [selectedUser, selectedMonth]); // 添加 selectedMonth 依賴

  // 處理月份變更
  const handleMonthChange = monthValue => {
    setSelectedMonth(monthValue);
  };

  // 取消預訂
  const handleCancelBooking = async booking => {
    try {
      await userService.cancelBooking(selectedUser.id, booking);

      toggleHintDialog({
        title: '取消成功',
        desc: '預訂已成功取消',
        type: 'success',
      });

      // 重新載入預訂資料
      if (selectedUser) {
        const userBookings = await userService.getUserBookings(
          selectedUser.id,
          selectedMonth
        );
        setBookings(userBookings);
      }
    } catch (err) {
      console.error('Error canceling booking:', err);
      toggleHintDialog({
        title: '取消失敗',
        desc: '取消預訂時發生錯誤',
        type: 'error',
      });
    }
  };

  // 獲取房間名稱
  const getRoomName = roomId => {
    const room = ROOMS.find(r => r.id === roomId);
    return room ? room.name : roomId;
  };

  // 檢查是否可以取消預訂
  const canCancelBooking = booking => {
    const bookingTime = dayjs(`${booking.date} ${booking.startTime}`);
    const now = dayjs();
    const today = now.startOf('day');
    const bookingDate = bookingTime.startOf('day');

    // 只有當天和未來的預訂才能取消，前一天和更早的預訂都不能取消
    return bookingDate.isSame(today) || bookingDate.isAfter(today);
  };

  return (
    <div className="space-y-6">
      {/* 使用者選擇器 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              選擇使用者
            </label>
            {loadingUsers ? (
              <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
            ) : (
              <Listbox value={selectedUser} onChange={setSelectedUser}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <span className="block truncate">
                      {selectedUser
                        ? selectedUser.displayName ||
                          selectedUser.email ||
                          selectedUser.id
                        : '選擇使用者'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                      <ChevronDown
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {allUsers.map(user => (
                      <Listbox.Option
                        key={user.id}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-3 pr-9 ${
                            active ? 'bg-blue-600 text-white' : 'text-gray-900'
                          }`
                        }
                        value={user}
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={`block truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {user.displayName || user.email || user.id}
                            </span>
                            {selected ? (
                              <span
                                className={`absolute inset-y-0 right-0 flex items-center pr-4 ${
                                  active ? 'text-white' : 'text-blue-600'
                                }`}
                              >
                                <svg
                                  className="h-5 w-5"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                  aria-hidden="true"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            )}
          </div>

          {/* 月份選擇器 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              選擇月份
            </label>
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 預訂列表 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedUser
                ? `${selectedUser.displayName || selectedUser.email || selectedUser.id} 的預訂`
                : '選擇使用者'}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>共 {bookings.length} 筆預訂</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">載入中...</p>
          </div>
        ) : usersError ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">載入失敗</h3>
            <p className="text-gray-500 mb-4">{usersError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              重新載入
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-6 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              沒有預訂記錄
            </h3>
            <p className="text-gray-500">該使用者目前沒有任何預訂</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    教室
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    時段
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking, index) => (
                  <tr key={`${booking.id}-${index}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {dayjs(booking.date).format('YYYY-MM-DD')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getRoomName(booking.roomId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.startTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                        >
                          取消預訂
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingManage;
