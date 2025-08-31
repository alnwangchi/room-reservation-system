import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { ROOMS } from '../constants';
import { roomService } from '../services/firestore';
import MonthSelector from './MonthSelector';

// 設定 dayjs 使用繁體中文
dayjs.locale('zh-tw');

function RevenueManage() {
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedMonthYear, setSelectedMonthYear] = useState(
    dayjs().format('YYYY-MM')
  ); // 新增 YYYY-MM 格式狀態
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // 房間選項
  const roomOptions = [
    { value: 'all', label: '所有房間' },
    ...ROOMS.map(room => ({
      value: room.id,
      label: room.name,
    })),
  ];

  // 獲取預訂記錄
  const fetchBookings = async (year, month, roomId = 'all') => {
    console.log('🚀 ~ year, month, roomId:', year, month, roomId);
    try {
      setLoading(true);

      let bookingsData = [];

      if (roomId === 'all') {
        // 獲取所有房間的預訂記錄
        bookingsData = await roomService.getAllRoomsBookingsForMonth(
          year,
          month
        );
      } else {
        // 獲取特定房間的預訂記錄
        const roomBookings = await roomService.getRoomBookingsForMonth(
          roomId,
          year,
          month
        );
        bookingsData = roomBookings.map(booking => ({
          ...booking,
          roomId: roomId,
          roomName: ROOMS.find(r => r.id === roomId)?.name || '未知房型',
        }));
      }

      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  // 處理月份年份變更（YYYY-MM 格式）
  const handleMonthYearChange = monthYear => {
    setSelectedMonthYear(monthYear);
    const [year, month] = monthYear.split('-');
    setSelectedYear(parseInt(year));
    setSelectedMonth(parseInt(month));
    fetchBookings(parseInt(year), parseInt(month), selectedRoom);
  };

  const handleRoomChange = roomId => {
    setSelectedRoom(roomId);
    fetchBookings(selectedYear, selectedMonth, roomId);
  };

  // 初始化時獲取當前月份的預訂記錄
  useEffect(() => {
    fetchBookings(selectedYear, selectedMonth, selectedRoom);
  }, [selectedYear, selectedMonth, selectedRoom]);

  // 使用 dayjs 格式化日期顯示
  const formatDate = dateStr => {
    const date = dayjs(dateStr);
    return date.format('M/D');
  };

  // 計算總收入
  const calculateTotalRevenue = () => {
    return bookings.reduce((sum, booking) => sum + (booking.cost || 0), 0);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          實際營收查詢
        </h3>

        {/* 選擇器區域 */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 房間選擇器 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              選擇房間
            </label>
            <div className="relative">
              <select
                value={selectedRoom}
                onChange={e => handleRoomChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
              >
                {roomOptions.map(room => (
                  <option key={room.value} value={room.value}>
                    {room.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 月份選擇器 */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              選擇月份
            </label>
            <MonthSelector
              selectedMonth={selectedMonthYear}
              onMonthChange={handleMonthYearChange}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 預訂記錄顯示區域 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">預訂記錄</h3>
        </div>

        {loading && (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">載入中...</p>
          </div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    房間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    時段
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    預訂人
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    費用
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking, index) => (
                  <tr key={booking.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(booking.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.roomName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.timeSlot}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.booker || '未知'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${booking.cost || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 統計資訊 */}
        {!loading && bookings.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                共{' '}
                <span className="font-medium text-gray-900">
                  {bookings.length}
                </span>{' '}
                筆預訂記錄
              </div>
              <div className="text-sm text-gray-600">
                總收入：
                <span className="font-medium text-gray-900">
                  ${calculateTotalRevenue()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RevenueManage;
