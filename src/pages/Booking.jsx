import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import dayjs from 'dayjs';
import BookingModal from '../components/BookingModal';
import Calendar from '../components/Calendar';
import PageHeader from '../components/PageHeader';
import TimeSlotButton from '../components/TimeSlotButton';
import { ROOMS, TIME_CATEGORIES, TIME_SLOT_CONFIG } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useHintDialog } from '../contexts/HintDialogContext';
import { useAppNavigate, useBooking, useOpenSettings } from '../hooks';
import { roomService, userService } from '../services/firestore';
import { isTimeInRange } from '../utils/dateUtils';

function Booking() {
  const { roomId } = useParams();
  const { goToHome } = useAppNavigate();
  const { toggleHintDialog } = useHintDialog();
  const { user, userProfile, updateUserProfile, isAdmin } = useAuth();

  const [currentDate, setCurrentDate] = useState(dayjs());
  const selectedRoom = roomId || 'general-piano-room';
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    booker: '',
    description: '',
  });

  // 使用新的 custom hook
  const {
    selectedDate,
    setSelectedDate,
    bookings: _bookings,
    setBookings: _setBookings,
    loadBookingsForDate,
    getBookingsForDateAndRoom,
  } = useBooking(selectedRoom);

  // 使用 useOpenSettings hook 獲取開放設定
  const { timeSlots } = useOpenSettings(selectedRoom, selectedDate);

  const generateTimeSlots = () => {
    const slots = [];
    for (
      let hour = TIME_SLOT_CONFIG.START_HOUR;
      hour <= TIME_SLOT_CONFIG.END_HOUR;
      hour++
    ) {
      for (
        let minute = 0;
        minute < 60;
        minute += TIME_SLOT_CONFIG.INTERVAL_MINUTES
      ) {
        // 排除 21:30 時段
        if (
          TIME_SLOT_CONFIG.EXCLUDE_LAST_HALF_HOUR &&
          hour === TIME_SLOT_CONFIG.END_HOUR &&
          minute === 30
        ) {
          continue;
        }

        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time,
          hour,
          minute,
          display: time,
        });
      }
    }

    return slots;
  };

  // 檢查時間槽是否被預訂
  const isTimeSlotBooked = (timeSlot, date, roomId) => {
    const roomBookings = getBookingsForDateAndRoom(date, roomId);
    return roomBookings.some(booking => {
      return isTimeInRange(timeSlot.time, booking.startTime, booking.endTime);
    });
  };

  // 獲取時間槽的預訂資訊
  const getTimeSlotBooking = (timeSlot, date, roomId) => {
    const roomBookings = getBookingsForDateAndRoom(date, roomId);
    return roomBookings.find(booking => {
      return isTimeInRange(timeSlot.time, booking.startTime, booking.endTime);
    });
  };

  const handleDateSelect = useCallback(
    date => {
      // 如果選擇的是同一個日期，不做任何改變
      if (selectedDate && selectedDate.isSame(date, 'day')) {
        return;
      }

      // 選擇新日期時，重置所有相關狀態
      setSelectedDate(date);
      setSelectedTimeSlots([]); // 重置選中的時段

      // 載入該日期的 Firestore 預訂資料
      loadBookingsForDate(date, selectedRoom);
    },
    [selectedDate, selectedRoom, loadBookingsForDate]
  );

  const handleTimeSlotClick = timeSlot => {
    if (isTimeSlotBooked(timeSlot, selectedDate, selectedRoom)) {
      return; // 已被預訂的時段不能點擊
    }

    // 檢查餘額是否足夠支付新增的時段（admin 無需檢查餘額）
    if (userProfile && userProfile.balance !== undefined && isAdmin) {
      const currentRoom = ROOMS.find(room => room.id === selectedRoom);
      if (currentRoom) {
        const newTotalCost = (selectedTimeSlots.length + 1) * currentRoom.price;
        if (userProfile.balance < newTotalCost) {
          toggleHintDialog({
            title: '餘額不足',
            desc: `您的餘額為 NT$ ${userProfile.balance}，不足以支付 ${selectedTimeSlots.length + 1} 個時段的費用 NT$ ${newTotalCost}。請先儲值後再進行預訂。`,
            type: 'warning',
          });
          return;
        }
      }
    }

    // 多選邏輯
    setSelectedTimeSlots(prev => {
      const isSelected = prev.some(slot => slot.time === timeSlot.time);
      if (isSelected) {
        // 如果已選中，則移除
        return prev.filter(slot => slot.time !== timeSlot.time);
      } else {
        // 如果未選中，則添加
        return [...prev, timeSlot];
      }
    });
  };

  const handleOpenBookingForm = () => {
    // 檢查餘額是否足夠（admin 無需檢查餘額）
    if (isAdmin) {
      setShowBookingForm(true);
      return;
    } else {
      const currentRoom = ROOMS.find(room => room.id === selectedRoom);
      if (currentRoom) {
        const totalCost = selectedTimeSlots.length * currentRoom.price;
        if (userProfile.balance < totalCost) {
          toggleHintDialog({
            title: '餘額不足',
            desc: `您的餘額為 NT$ ${userProfile.balance}，不足以支付 ${selectedTimeSlots.length} 個時段的費用 NT$ ${totalCost}。請先儲值後再進行預訂。`,
            type: 'error',
          });
          return;
        }
      }

      setShowBookingForm(true);
    }
  };

  const onSubmit = async () => {
    // 檢查使用者餘額（admin 無需檢查餘額）
    if (!isAdmin && (!userProfile || userProfile.balance === undefined)) {
      toggleHintDialog({
        title: '錯誤',
        desc: '無法獲取使用者餘額資訊，請稍後再試',
        type: 'error',
      });
      return;
    }

    // 計算總預訂費用
    const currentRoom = ROOMS.find(room => room.id === selectedRoom);
    if (!currentRoom) {
      toggleHintDialog({
        title: '錯誤',
        desc: '無法獲取房型資訊',
        type: 'error',
      });
      return;
    }

    const totalCost = selectedTimeSlots.length * currentRoom.price; // 每個時段的價格

    // 🔒 預訂前的最終衝突檢查
    try {
      // 重新載入最新的預訂資料，確保檢查的是最新狀態
      const latestBookings = await roomService.getRoomBookingsForDate(
        selectedRoom,
        selectedDate
      );

      // 檢查選中的時段是否仍然可用
      const conflictingSlots = [];
      for (const timeSlot of selectedTimeSlots) {
        const isBooked = latestBookings.some(
          booking => booking.timeSlot === timeSlot.time
        );
        if (isBooked) {
          conflictingSlots.push(timeSlot.time);
        }
      }

      if (conflictingSlots.length > 0) {
        toggleHintDialog({
          title: '時段已被預訂',
          desc: `以下時段已被其他使用者預訂：${conflictingSlots.join(', ')}\n\n請重新選擇可用時段。`,
          type: 'error',
        });

        // 重新載入預訂資料並重置選擇
        await loadBookingsForDate(selectedDate, selectedRoom);
        setSelectedTimeSlots([]);
        return;
      }
    } catch (error) {
      console.error('衝突檢查失敗:', error);
      toggleHintDialog({
        title: '檢查失敗',
        desc: '無法檢查時段可用性，請稍後再試',
        type: 'error',
      });
      return;
    }

    // 顯示確認對話框
    toggleHintDialog({
      title: '確認預訂',
      desc: `確定要預訂 ${selectedTimeSlots.length} 個時段嗎？`,
      showCancel: true,
      onOk: async () => {
        try {
          setIsProcessing(true);

          // 為每個選中的時段建立 Firestore 預訂記錄
          const bookingPromises = selectedTimeSlots.map(async timeSlot => {
            const userInfo = {
              uid: user.uid,
              displayName: user.displayName || bookingForm.booker,
              booker: bookingForm.booker,
              description: bookingForm.description,
              email: user.email,
            };

            return await roomService.bookRoomTimeSlot(
              selectedRoom,
              selectedDate,
              timeSlot.time,
              userInfo
            );
          });

          // 等待所有預訂完成
          await Promise.all(bookingPromises);

          // 預訂成功後扣除使用者餘額（admin 無需扣除餘額）
          if (!isAdmin) {
            const userId = userProfile.id;
            await userService.updateBalance(userId, -totalCost);

            // 更新本地使用者資料的餘額
            if (userProfile) {
              const updatedProfile = {
                ...userProfile,
                balance: userProfile.balance - totalCost,
              };
              updateUserProfile(updatedProfile);
            }
          }

          // 預訂成功後先關閉 modal
          setShowBookingForm(false);
          setSelectedTimeSlots([]);
          setBookingForm({
            booker: '',
            description: '',
          });

          // 短暫延遲後顯示成功訊息，確保 modal 已關閉
          setTimeout(() => {
            toggleHintDialog({
              title: '預訂成功',
              type: 'success',
            });
          }, 200);

          // 重新載入該日期的預訂資料
          await loadBookingsForDate(selectedDate, selectedRoom);
        } catch (error) {
          console.error('預訂失敗:', error);

          // 根據錯誤類型顯示不同的錯誤訊息
          let errorMessage = '預訂過程中發生錯誤，請稍後再試';
          let shouldRefresh = false;
          let shouldResetSelection = false;

          if (error.message === '該時段已被預訂') {
            errorMessage = '該時段已被其他使用者預訂，請選擇其他時段';
            shouldRefresh = true;
            shouldResetSelection = true;
          } else if (
            error.message.includes('network') ||
            error.message.includes('Network')
          ) {
            errorMessage = '網路連線失敗，請檢查網路設定後重試';
          } else if (
            error.message.includes('permission') ||
            error.message.includes('Permission')
          ) {
            errorMessage = '權限不足，無法進行預訂';
          } else if (
            error.message.includes('quota') ||
            error.message.includes('Quota')
          ) {
            errorMessage = '系統配額已滿，請稍後再試';
          }

          // 先關閉 modal
          setShowBookingForm(false);

          // 短暫延遲後顯示錯誤訊息，確保 modal 已關閉
          setTimeout(() => {
            toggleHintDialog({
              title: '預訂失敗',
              desc: errorMessage,
              type: 'error',
              onOk: async () => {
                // 根據錯誤類型執行相應的恢復操作
                if (shouldRefresh) {
                  await loadBookingsForDate(selectedDate, selectedRoom);
                }
                if (shouldResetSelection) {
                  setSelectedTimeSlots([]);
                }
              },
            });
          }, 200);
        } finally {
          setIsProcessing(false);
        }
      },
      onCancel: () => {
        // 使用者取消預訂，不做任何操作
      },
    });
  };

  const currentRoom = ROOMS.find(room => room.id === selectedRoom);

  // 渲染房間選擇器
  // 渲染時間類別區塊的共用函數
  const renderTimeCategory = category => {
    const isLastCategory = category === TIME_CATEGORIES.EVENING;

    // 獲取時段對應的開放狀態
    const getCategoryKey = category => {
      if (category === TIME_CATEGORIES.MORNING) return 'morning';
      if (category === TIME_CATEGORIES.AFTERNOON) return 'afternoon';
      if (category === TIME_CATEGORIES.EVENING) return 'evening';
      return 'morning';
    };

    const categoryKey = getCategoryKey(category);
    const isTimeSlotOpen = timeSlots[categoryKey];

    return (
      <div className={`col-span-full ${!isLastCategory ? 'mb-2 md:mb-4' : ''}`}>
        <h4 className="text-sm font-medium text-gray-700 mb-2 px-2">
          {category.name}
        </h4>
        {isTimeSlotOpen ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {generateTimeSlots()
              .filter(
                slot =>
                  slot.hour >= category.startHour &&
                  slot.hour < category.endHour
              )
              .map((slot, index) => {
                const isBooked = isTimeSlotBooked(
                  slot,
                  selectedDate,
                  selectedRoom
                );
                const booking = getTimeSlotBooking(
                  slot,
                  selectedDate,
                  selectedRoom
                );
                const isSelected = selectedTimeSlots.some(
                  selectedSlot => selectedSlot.time === slot.time
                );

                return (
                  <TimeSlotButton
                    key={index}
                    slot={slot}
                    isBooked={isBooked}
                    booking={booking}
                    isSelected={isSelected}
                    onClick={() => !isBooked && handleTimeSlotClick(slot)}
                    disabled={isBooked}
                  />
                );
              })}
          </div>
        ) : (
          <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="text-gray-500 text-sm font-medium mb-1">
                本時段不開放
              </div>
              <div className="text-gray-400 text-xs">此時段暫停預訂服務</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* 標題列 */}
      <PageHeader
        title={roomId ? `${currentRoom?.name}預訂日曆` : '我要預訂'}
        onBack={roomId ? goToHome : undefined}
        description={roomId ? '無法預訂今天以前的日期' : '選擇琴房並預訂時段'}
      />

      <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
        <div className="space-y-4 md:space-y-6">
          {/* 日曆區塊 */}
          <Calendar
            currentDate={currentDate}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onMonthChange={setCurrentDate}
            disabledDateRange={{
              end: dayjs(), // 禁用今天及以前的日期
            }}
          />

          {/* 時間槽區塊 */}
          {selectedDate && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-xl font-semibold">
                    {selectedDate.format('M月D日')}
                  </h3>
                  <p className="text-sm" style={{ color: currentRoom?.color }}>
                    {currentRoom?.name} - NT$ {currentRoom?.price}
                    /半小時
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-3 md:mb-4 p-1 md:p-2">
                  {/* 上午時段 */}
                  {renderTimeCategory(TIME_CATEGORIES.MORNING)}

                  {/* 下午時段 */}
                  {renderTimeCategory(TIME_CATEGORIES.AFTERNOON)}

                  {/* 晚上時段 */}
                  {renderTimeCategory(TIME_CATEGORIES.EVENING)}
                </div>
                {/* 開啟預訂按鈕 */}
                {selectedTimeSlots.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={handleOpenBookingForm}
                      disabled={isProcessing}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isProcessing
                        ? '處理中...'
                        : `開啟預訂表單 (${selectedTimeSlots.length} 個時段)`}
                    </button>

                    {/* 處理狀態指示器 */}
                    {isProcessing && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm text-blue-700">處理中</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 預訂表單 Modal */}
      <BookingModal
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        selectedTimeSlots={selectedTimeSlots}
        onSubmit={onSubmit}
        bookingForm={bookingForm}
        setBookingForm={setBookingForm}
        roomInfo={ROOMS.find(room => room.id === selectedRoom)}
        userInfo={userProfile}
        isProcessing={isProcessing}
      />
    </div>
  );
}

export default Booking;
