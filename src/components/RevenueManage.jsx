import MonthSelector from '@components/MonthSelector';
import DropSelector from '@components/shared/DropSelector';
import { ROOMS } from '@constants';
import { roomService } from '@services/firestore';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

// 設定 dayjs 使用繁體中文
dayjs.locale('zh-tw');

function RevenueManage() {
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedMonthYear, setSelectedMonthYear] = useState(
    dayjs().format('YYYY-MM')
  );
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedBookers, setExpandedBookers] = useState(new Set());

  // 房間選項
  const roomOptions = [
    { value: 'all', label: '所有房間' },
    ...ROOMS.map(room => ({
      value: room.id,
      label: room.name,
    })),
  ];

  const filteredBookings = bookings.filter(
    booking => booking.booker !== '姿姿Linda'
  );

  // 獲取預訂記錄
  const fetchBookings = async (year, month, roomId = 'all') => {
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

  // 按預訂人分組
  const groupBookingsByBooker = () => {
    const grouped = {};
    filteredBookings.forEach(booking => {
      const booker = booking.booker || '未知';
      if (!grouped[booker]) {
        grouped[booker] = {
          booker,
          bookings: [],
          totalCost: 0,
        };
      }
      grouped[booker].bookings.push(booking);
      grouped[booker].totalCost += booking.cost || 0;
    });
    return Object.values(grouped);
  };

  // 切換預訂人展開/收合狀態
  const toggleBookerExpansion = booker => {
    const newExpanded = new Set(expandedBookers);
    if (newExpanded.has(booker)) {
      newExpanded.delete(booker);
    } else {
      newExpanded.add(booker);
    }
    setExpandedBookers(newExpanded);
  };

  // 計算總收入
  const calculateTotalRevenue = () => {
    return filteredBookings.reduce(
      (sum, booking) => sum + (booking.cost || 0),
      0
    );
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
            <DropSelector
              value={selectedRoom}
              onChange={handleRoomChange}
              options={roomOptions}
              placeholder="選擇房間"
              label="選擇房間"
            />
          </div>

          {/* 月份選擇器 */}
          <div className="flex-1">
            <MonthSelector
              selectedMonth={selectedMonthYear}
              onMonthChange={handleMonthYearChange}
              className="w-full"
              label="選擇月份"
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

        {!loading && filteredBookings.length > 0 && (
          <div className="p-6 space-y-4">
            {groupBookingsByBooker().map((bookerGroup, index) => (
              <div
                key={bookerGroup.booker || index}
                className="bg-gray-50 rounded-lg border border-gray-200 p-4"
              >
                {/* 預訂人標題 */}
                <div
                  className={`flex justify-between items-center cursor-pointer hover:bg-gray-100 rounded-md p-2 -m-2 transition-colors ${
                    expandedBookers.has(bookerGroup.booker) ? 'mb-3' : ''
                  }`}
                  onClick={() => toggleBookerExpansion(bookerGroup.booker)}
                >
                  <div className="flex items-center space-x-2">
                    {expandedBookers.has(bookerGroup.booker) ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                    <h4 className="text-lg font-semibold text-gray-900">
                      {bookerGroup.booker}
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      共 {bookerGroup.bookings.length} 筆預訂
                    </div>
                    <div className="text-lg font-bold text-indigo-600">
                      ${bookerGroup.totalCost}
                    </div>
                  </div>
                </div>

                {/* 預訂詳情列表 */}
                {expandedBookers.has(bookerGroup.booker) && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                    {bookerGroup.bookings.map((booking, bookingIndex) => (
                      <div
                        key={booking.id || bookingIndex}
                        className="bg-white rounded-md p-3 border border-gray-100"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(booking.date)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {booking.roomName}
                            </span>
                            <span className="text-sm text-gray-600">
                              {booking.timeSlot}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            ${booking.cost || 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 統計資訊 */}
        {!loading && filteredBookings.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                共{' '}
                <span className="font-medium text-gray-900">
                  {groupBookingsByBooker().length}
                </span>{' '}
                位預訂人，{' '}
                <span className="font-medium text-gray-900">
                  {filteredBookings.length}
                </span>{' '}
                筆預訂記錄 (扣除姿姿Linda)
              </div>
              <div className="text-sm text-gray-600">
                總收入：
                <span className="font-medium text-gray-900">
                  {calculateTotalRevenue()} 點
                </span>{' '}
                (清潔費率 5% : {calculateTotalRevenue() * 0.05} 點)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RevenueManage;
