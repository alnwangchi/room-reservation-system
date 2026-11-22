import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import BookingModal from '@components/BookingModal';
import Calendar from '@components/Calendar';
import PageBar from '@components/PageBar';
import TimeSlotButton from '@components/TimeSlotButton';
import { ROOMS, TIME_CATEGORIES } from '@constants';
import { useAuth } from '@contexts/AuthContext';
import { useHintDialog } from '@contexts/HintDialogContext';
import { useAppNavigate, useBooking, useOpenSettings } from '@hooks';
import { useRoomBookingBlock } from '@hooks/useRoomBookingBlock';
import { emailService } from '@services/email';
import { roomService, userService } from '@services/firestore';
import { isTimeInRange, isWeekend } from '@utils/date';
import {
  canBookOnWebsite,
  getIntervalLabel,
  getTimeSlotConfig,
  isWebsiteBookingRestrictedDate,
} from '@utils/timeSlot';
import dayjs from 'dayjs';
import { Sun } from 'lucide-react';

function Booking() {
  const { roomId } = useParams();
  const { goToRoomSelection } = useAppNavigate();
  const { toggleHintDialog } = useHintDialog();
  const { userProfile, updateUserProfile, isAdmin } = useAuth();

  const [currentDate, setCurrentDate] = useState(dayjs());
  const selectedRoom = roomId || 'general-piano-room';
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [bookingForm, setBookingForm] = useState({
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

  const timeSlotConfig = getTimeSlotConfig(selectedRoom);
  const intervalLabel = getIntervalLabel(timeSlotConfig.INTERVAL_MINUTES);
  const isMeetingRoom = selectedRoom.includes('multifunctional-meeting-space');
  const isGeneralPianoRoom = selectedRoom.includes('general-piano-room');
  const meetingRoomId = ROOMS.find(room =>
    room.id.includes('multifunctional-meeting-space')
  )?.id;
  const isHoliday =
    selectedDate && isMeetingRoom ? isWeekend(selectedDate) : false;
  const requiresMinimumTwoSlots = isMeetingRoom;
  const canOpenBookingForm =
    !requiresMinimumTwoSlots || selectedTimeSlots.length >= 2;

  const generateTimeSlots = () => {
    const config = timeSlotConfig;
    const slots = [];
    for (let hour = config.START_HOUR; hour <= config.END_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += config.INTERVAL_MINUTES) {
        // 排除最後一個半小時時段（若設定啟用）
        if (
          config.EXCLUDE_LAST_HALF_HOUR &&
          hour === config.END_HOUR &&
          minute === config.INTERVAL_MINUTES
        ) {
          continue;
        }

        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time,
          hour,
          minute,
          display: time,
          interval: config.INTERVAL_MINUTES,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDate, selectedRoom, loadBookingsForDate]
  );

  const { isCategoryBlocked: isMeetingRoomBlockingCategory } =
    useRoomBookingBlock({
      selectedDate,
      isTargetRoom: isGeneralPianoRoom,
      blockingRoomId: meetingRoomId,
      getBookingsForDateAndRoom,
      loadBookingsForDate,
      generateTimeSlots,
    });

  const handleTimeSlotClick = timeSlot => {
    if (isTimeSlotBooked(timeSlot, selectedDate, selectedRoom)) {
      return; // 已被預訂的時段不能點擊
    }
    if (!canBookOnWebsite(selectedDate, timeSlot.hour, timeSlot.minute)) {
      return;
    }
    // 檢查餘額是否足夠支付新增的時段（admin 無需檢查餘額）
    if (userProfile && userProfile.balance < 1 && !isAdmin) {
      const currentRoom = ROOMS.find(room => room.id === selectedRoom);
      if (currentRoom) {
        const slotPrice =
          isHoliday && currentRoom.holidayPrice
            ? currentRoom.holidayPrice
            : currentRoom.price;
        const newTotalCost = (selectedTimeSlots.length + 1) * slotPrice;
        if (userProfile.balance < newTotalCost) {
          toggleHintDialog({
            title: '餘額不足',
            desc: `您的餘額為 ${userProfile.balance} 點，不足以支付 ${selectedTimeSlots.length + 1} 個時段的費用 ${newTotalCost} 點。請先儲值後再進行預訂。`,
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

  const onSubmit = async () => {
    const hasOffWebsiteSlot = selectedTimeSlots.some(
      slot => !canBookOnWebsite(selectedDate, slot.hour, slot.minute)
    );
    if (hasOffWebsiteSlot) {
      toggleHintDialog({
        title: '此時段請改由官方 LINE 預約',
        desc: '12 月起，網站僅開放週一至週五 10:00-18:30。',
        type: 'warning',
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

    const slotPrice =
      isHoliday && currentRoom.holidayPrice
        ? currentRoom.holidayPrice
        : currentRoom.price;
    const totalCost = selectedTimeSlots.length * slotPrice; // 每個時段的價格

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
              uid: userProfile.uid,
              displayName: userProfile.displayName || bookingForm.booker,
              booker: bookingForm.booker,
              description: bookingForm.description,
              email: userProfile.email,
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
            description: '',
          });

          // 短暫延遲後顯示成功訊息，確保 modal 已關閉
          setTimeout(() => {
            toggleHintDialog({
              title: '預訂成功',
              type: 'success',
            });
          }, 200);

          // 發送預約通知 email
          try {
            const currentRoom = ROOMS.find(room => room.id === selectedRoom);
            const timeSlots = selectedTimeSlots
              .map(slot => slot.time)
              .join(', ');

            const bookingData = {
              booker: userProfile.displayName,
              roomName: currentRoom?.name,
              date: selectedDate.format('YYYY-MM-DD'),
              timeSlots: timeSlots,
              cost: totalCost,
              description: bookingForm.description || '',
            };

            await emailService.sendBookingConfirmationEmail(bookingData);
          } catch (emailError) {
            console.error('發送預約確認 email 時發生錯誤:', emailError);
          }

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
  const isRestrictedDate = isWebsiteBookingRestrictedDate(selectedDate);
  const isRestrictedWeekend =
    isRestrictedDate && selectedDate ? isWeekend(selectedDate) : false;

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
    const isBlockedByMeetingRoom = isMeetingRoomBlockingCategory(category);
    const isTimeSlotOpen = timeSlots[categoryKey] && !isBlockedByMeetingRoom;
    const isRestrictedDate = isWebsiteBookingRestrictedDate(selectedDate);
    const categorySlots = generateTimeSlots().filter(
      slot =>
        slot.hour >= category.startHour &&
        slot.hour < category.endHour &&
        canBookOnWebsite(selectedDate, slot.hour, slot.minute)
    );
    const closedByWebsitePolicy =
      isRestrictedDate && categorySlots.length === 0;

    if (closedByWebsitePolicy) {
      return null;
    }

    return (
      <div className={`col-span-full ${!isLastCategory ? 'mb-2 md:mb-4' : ''}`}>
        <h4 className="text-sm font-medium text-gray-700 mb-2 px-2">
          {category.name}
        </h4>
        {isTimeSlotOpen ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {categorySlots.map((slot, index) => {
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
              <div className="text-gray-400 text-xs">
                {isBlockedByMeetingRoom
                  ? '因多功能會議空間已預約，暫停開放'
                  : '此時段暫停預訂服務'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (currentRoom?.isDisabled) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <PageBar
          title="此空間已停止線上租借"
          onBack={goToRoomSelection}
          description="目前僅開放琴房租借"
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* 標題列 */}
      <PageBar
        title={roomId ? `${currentRoom?.name}預訂日曆` : '我要預訂'}
        onBack={roomId ? goToRoomSelection : undefined}
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
            maxDate={dayjs().add(2, 'month').endOf('month')}
            disabledDateRange={{
              end: dayjs(), // 禁用今天及以前的日期
            }}
          />

          {/* 時間槽區塊 */}
          {selectedDate && (
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div>
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      {selectedDate.format('M月D日')}
                      {isHoliday && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600">
                          <Sun className="w-3 h-3" />
                          (假日)
                        </span>
                      )}
                    </h3>
                    {requiresMinimumTwoSlots && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        最少預約兩個小時
                      </p>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: currentRoom?.color }}>
                    {currentRoom?.name} -{' '}
                    {isHoliday && currentRoom?.holidayPrice
                      ? currentRoom.holidayPrice
                      : currentRoom?.price}{' '}
                    點{intervalLabel}
                  </p>
                </div>

                {isRestrictedDate && (
                  <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
                    {isRestrictedWeekend
                      ? '週六、週日請透過官方 LINE 預約。'
                      : '網站僅開放 10:00-18:30，其餘時段請透過官方 LINE 預約。'}
                  </div>
                )}

                {!isRestrictedWeekend && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-3 md:mb-4 p-1 md:p-2">
                    {/* 上午時段 */}
                    {renderTimeCategory(TIME_CATEGORIES.MORNING)}

                    {/* 下午時段 */}
                    {renderTimeCategory(TIME_CATEGORIES.AFTERNOON)}

                    {/* 晚上時段 */}
                    {renderTimeCategory(TIME_CATEGORIES.EVENING)}
                  </div>
                )}
                {/* 開啟預訂按鈕 */}
                {selectedTimeSlots.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() => {
                        if (canOpenBookingForm) {
                          setShowBookingForm(true);
                        }
                      }}
                      disabled={isProcessing || !canOpenBookingForm}
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
        userProfile={userProfile}
        isProcessing={isProcessing}
      />
    </div>
  );
}

export default Booking;
