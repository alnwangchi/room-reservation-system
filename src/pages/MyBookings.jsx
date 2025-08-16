import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { Calendar, Check, ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import BookingCard from '@components/BookingCard';
import PageHeader from '@components/PageHeader';
import UserProfileCard from '@components/UserProfileCard';
import { useAuth } from '@contexts/AuthContext';
import { useAppNavigate } from '@hooks/useNavigate';
import { userService } from '@services/firestore';
import RenameModal from '@components/RenameModal';

function MyBookings() {
  const { user, userProfile, loading, isAdmin } = useAuth();
  const { goToHome } = useAppNavigate();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  // 載入所有用戶資料（僅 admin 需要）
  useEffect(() => {
    const loadAllUsers = async () => {
      if (!isAdmin) return;

      try {
        setLoadingUsers(true);
        const users = await userService.getAllUsers();
        setAllUsers(users);
        // 預設選擇當前用戶
        const currentUser = users.find(u => u.id === userProfile.id);
        setSelectedUser(currentUser || users[0]);
      } catch (err) {
        console.error('Error loading users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadAllUsers();
  }, [userProfile]);

  // 從 Firestore 載入使用者的預訂資料
  useEffect(() => {
    const loadBookings = async () => {
      if (!user || !userProfile) return;

      try {
        setLoadingBookings(true);
        setError(null);

        // 如果是 admin，載入選中用戶的預訂資料，否則載入當前用戶的預訂資料
        const targetUserId =
          isAdmin && selectedUser ? selectedUser.id : userProfile.id;

        // 如果沒有有效的用戶ID，則不載入預訂
        if (!targetUserId) return;

        const userBookings = await userService.getUserBookings(targetUserId);
        setBookings(userBookings);
      } catch (err) {
        console.error('Error loading bookings:', err);
        setError('載入預訂資料時發生錯誤');
      } finally {
        setLoadingBookings(false);
      }
    };

    loadBookings();
  }, [user, userProfile, selectedUser, isAdmin]);

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

  // 重新載入預訂資料
  const refreshBookings = async () => {
    if (!user || !userProfile) return;

    try {
      setLoadingBookings(true);
      const targetUserId =
        isAdmin && selectedUser ? selectedUser.id : userProfile.id;

      // 如果沒有有效的用戶ID，則不載入預訂
      if (!targetUserId) return;

      const userBookings = await userService.getUserBookings(targetUserId);
      setBookings(userBookings);
    } catch (err) {
      console.error('Error refreshing bookings:', err);
      setError('重新載入預訂資料時發生錯誤');
    } finally {
      setLoadingBookings(false);
    }
  };

  // 渲染用戶選擇器（僅 admin 可見）
  const renderUserSelector = () => {
    if (!isAdmin) return null;

    return (
      <div className="mb-6 z-0">
        <p className="block text-sm font-medium text-gray-700 mb-2">選擇用戶</p>
        <Listbox value={selectedUser} onChange={setSelectedUser}>
          <div className="relative">
            <ListboxButton className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
              <span className="block truncate">
                {selectedUser
                  ? selectedUser.displayName ||
                    selectedUser.email?.split('@')[0]
                  : '選擇用戶...'}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronDown
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </ListboxButton>
            <ListboxOptions className="absolute z-0 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {loadingUsers ? (
                <div className="relative cursor-default select-none py-2 px-3 text-gray-500">
                  載入用戶中...
                </div>
              ) : allUsers.length === 0 ? (
                <div className="relative cursor-default select-none py-2 px-3 text-gray-500">
                  沒有用戶資料
                </div>
              ) : (
                allUsers.map(user => (
                  <ListboxOption
                    key={user.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                      }`
                    }
                    value={user}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                        >
                          {user.displayName || user.email?.split('@')[0]}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ListboxOption>
                ))
              )}
            </ListboxOptions>
          </div>
        </Listbox>
      </div>
    );
  };

  // 根據用戶角色處理預訂數據
  const processBookingsForDisplay = () => {
    if (isAdmin) {
      // Admin: 維持原有的多筆顯示
      return bookings;
    } else {
      // 一般用戶: 同一房型同一天的時段合併顯示
      const groupedBookings = new Map();

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
          existingGroup.totalCost += booking.cost;
          existingGroup.totalDuration += booking.duration;
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
            totalCost: booking.cost,
            totalDuration: booking.duration,
            isGrouped: true,
          });
        }
      });

      // 對每個分組的時段按時間排序
      Array.from(groupedBookings.values()).forEach(group => {
        group.timeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
      });

      // 轉換為陣列並按日期排序
      return Array.from(groupedBookings.values()).sort((a, b) => {
        const dateComparison = b.date.localeCompare(a.date);
        if (dateComparison !== 0) return dateComparison;
        return a.timeSlots[0].startTime.localeCompare(b.timeSlots[0].startTime);
      });
    }
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
            onRefresh={refreshBookings}
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

  // 如果沒有登入，顯示登入提示
  if (!user || !userProfile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">請先登入</h3>
            <p className="text-gray-500 mb-6">登入後才能查看你的預訂記錄</p>
            <button
              onClick={goToHome}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              前往首頁
            </button>
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
        value={user?.displayName || user?.email?.split('@')[0]}
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
                  user={user}
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
                  {renderUserSelector()}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      本月預訂記錄
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>共 {bookings.length} 筆預訂</span>
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
