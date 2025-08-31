import BookingCard from '@components/BookingCard';
import MonthSelector from '@components/MonthSelector';
import PageHeader from '@components/PageHeader';
import RenameModal from '@components/RenameModal';
import UserProfileCard from '@components/UserProfileCard';
import { useAuth } from '@contexts/AuthContext';

import { ROOMS } from '@constants';
import { useAppNavigate } from '@hooks/useNavigate';
import { userService } from '@services/firestore';
import dayjs from 'dayjs';
import { Calendar } from 'lucide-react';
import React, { useEffect, useState } from 'react';

function MyBookings() {
  const { userProfile, loading } = useAuth();
  const { goToHome } = useAppNavigate();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM')); // 新增月份選擇狀態

  // 處理月份變更
  const handleMonthChange = async monthValue => {
    setSelectedMonth(monthValue);
    if (!userProfile?.id) return;

    try {
      setLoadingBookings(true);
      setError(null);

      const userBookings = await userService.getUserBookings(
        userProfile.id,
        monthValue
      );
      setBookings(userBookings);
    } catch (err) {
      console.error('Error loading bookings for month:', err);
      setError('載入該月份預訂資料時發生錯誤');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    const loadBookings = async () => {
      if (!userProfile) return;

      try {
        setLoadingBookings(true);
        setError(null);

        const targetUserId = userProfile.id;
        console.log('🚀 ~ targetUserId:', targetUserId);

        // 如果沒有有效的用戶ID，則不載入預訂
        if (!targetUserId) return;

        const userBookings = await userService.getUserBookings(targetUserId);
        console.log('🚀 ~ userBookings:', userBookings);
        setBookings(userBookings);
      } catch (err) {
        console.error('Error loading bookings:', err);
        setError('載入預訂資料時發生錯誤');
      } finally {
        setLoadingBookings(false);
      }
    };

    loadBookings();
  }, [userProfile]);

  // 處理取消預訂
  const handleCancelBooking = bookingId => {
    setBookings(prevBookings => {
      // 如果是分組預訂，需要移除所有相關的原始預訂
      if (bookingId.includes('_')) {
        // 分組預訂的 ID 格式是 "id1_id2_id3"，我們需要移除所有這些原始預訂
        const originalIds = bookingId.split('_');
        return prevBookings.filter(booking => {
          // 檢查這個預訂是否屬於被取消的分組
          return !originalIds.some(id => booking.id === id);
        });
      } else {
        // 單一預訂，直接移除
        return prevBookings.filter(booking => booking.id !== bookingId);
      }
    });
  };

  // 根據用戶角色處理預訂數據
  const processBookingsForDisplay = () => {
    // 一般用戶: 同一房型同一天的時段合併顯示
    const groupedBookings = new Map();

    // 先按房型和日期分組
    bookings.forEach(booking => {
      const groupKey = `${booking.roomId}-${booking.date}`;

      if (groupedBookings.has(groupKey)) {
        // 如果已有相同房型和日期的預訂，合併時段
        const existingGroup = groupedBookings.get(groupKey);
        existingGroup.timeSlots.push({
          startTime: booking.startTime,
          endTime: booking.endTime,
          id: booking.id,
        });
        // 累加費用和時長
        existingGroup.totalCost =
          (existingGroup.totalCost || 0) + (booking.cost || 0);
        existingGroup.totalDuration =
          (existingGroup.totalDuration || 0) + (booking.duration || 0);
        // 更新合併ID以包含所有時段
        existingGroup.id = `${existingGroup.id}_${booking.id}`;
      } else {
        // 創建新的分組
        groupedBookings.set(groupKey, {
          ...booking,
          timeSlots: [
            {
              startTime: booking.startTime,
              endTime: booking.endTime,
              id: booking.id,
            },
          ],
          totalCost: booking.cost || 0,
          totalDuration: booking.duration || 0,
          isGrouped: true,
        });
      }
    });

    // 對每個分組的時段按時間排序，並檢查是否可以合併連接的時段
    Array.from(groupedBookings.values()).forEach(group => {
      // 先按開始時間排序
      group.timeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

      // 檢查並合併連接的時段
      const mergedTimeSlots = [];
      let currentSlot = null;

      group.timeSlots.forEach(slot => {
        if (!currentSlot) {
          currentSlot = { ...slot };
        } else {
          // 檢查是否連接（當前時段的結束時間等於下一個時段的開始時間）
          // 注意：這裡需要確保時段是連續的
          const currentEndTime = currentSlot.endTime;
          const nextStartTime = slot.startTime;

          // 添加調試資訊
          console.log(
            `檢查連接: ${currentEndTime} === ${nextStartTime}`,
            currentEndTime === nextStartTime
          );

          if (currentEndTime === nextStartTime) {
            // 合併時段
            currentSlot.endTime = slot.endTime;
            currentSlot.id = `${currentSlot.id}_${slot.id}`;
            console.log('合併時段:', currentSlot);
          } else {
            // 不連接，保存當前時段並開始新的時段
            mergedTimeSlots.push(currentSlot);
            currentSlot = { ...slot };
          }
        }
      });

      // 添加最後一個時段
      if (currentSlot) {
        mergedTimeSlots.push(currentSlot);
      }

      // 更新分組的時段
      group.timeSlots = mergedTimeSlots;

      // 重新計算總費用和時長（基於合併後的時段）
      group.totalCost = mergedTimeSlots.reduce((sum, slot) => {
        // 計算時段時長（以小時為單位）
        const startTime = dayjs(`2000-01-01T${slot.startTime}:00`);
        const endTime = dayjs(`2000-01-01T${slot.endTime}:00`);
        const slotDuration = endTime.diff(startTime, 'hour', true);

        const room = ROOMS.find(r => r.id === group.roomId);
        // 每個時段是 30 分鐘，價格是每 30 分鐘的價格
        const slotCost = room ? slotDuration * 2 * room.price : 0;
        return sum + slotCost;
      }, 0);

      group.totalDuration = mergedTimeSlots.reduce((sum, slot) => {
        // 計算時段時長（以小時為單位）
        const startTime = dayjs(`2000-01-01T${slot.startTime}:00`);
        const endTime = dayjs(`2000-01-01T${slot.endTime}:00`);
        const slotDuration = endTime.diff(startTime, 'hour', true);
        return sum + slotDuration;
      }, 0);
    });

    // 轉換為陣列並按日期排序
    return Array.from(groupedBookings.values()).sort((a, b) => {
      const dateComparison = b.date.localeCompare(a.date);
      if (dateComparison !== 0) return dateComparison;
      return a.timeSlots[0].startTime.localeCompare(b.timeSlots[0].startTime);
    });
  };

  // 渲染預訂列表
  const renderBookingsList = () => {
    const processedBookings = processBookingsForDisplay();

    return (
      <div className="space-y-4">
        {processedBookings.map(booking => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onCancel={handleCancelBooking}
            isGrouped={booking.isGrouped}
          />
        ))}
      </div>
    );
  };

  // 渲染空狀態
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">還沒有預訂記錄</h3>
      <p className="text-gray-500 mb-6">開始預訂你的第一個房間吧！</p>
      <button
        onClick={goToHome}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        立即預訂
      </button>
    </div>
  );

  // 渲染錯誤狀態
  const renderErrorState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <Calendar className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">載入失敗</h3>
      <p className="text-gray-500 mb-6">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        重新載入
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="h-96 bg-gray-300 rounded"></div>
              <div className="lg:col-span-2 h-96 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
      />
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        {/* 頁面標題 */}
        <PageHeader
          title="我的預訂"
          description="查看和管理你的房間預訂"
          icon={Calendar}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />

        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 左側用戶資訊卡片 */}
              <div className="lg:col-span-1">
                <UserProfileCard
                  user={null}
                  userProfile={userProfile}
                  isLoading={loading}
                  className="sticky top-6"
                  showRenameButton
                  setIsRenameModalOpen={setIsRenameModalOpen}
                />
              </div>

              {/* 右側預訂列表 */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      預訂記錄
                    </h2>
                    <div className="flex items-center space-x-4">
                      {/* Headless UI 月份選擇器 */}
                      <div className="w-48">
                        <MonthSelector
                          selectedMonth={selectedMonth}
                          onMonthChange={handleMonthChange}
                        />
                      </div>
                    </div>
                  </div>

                  {loadingBookings ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-gray-600">載入預訂中...</p>
                    </div>
                  ) : error ? (
                    renderErrorState()
                  ) : bookings.length > 0 ? (
                    renderBookingsList()
                  ) : (
                    renderEmptyState()
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyBookings;
