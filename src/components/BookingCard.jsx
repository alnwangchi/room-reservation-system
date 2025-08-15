import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHintDialog } from '../contexts/HintDialogContext';
import { userService } from '../services/firestore';
import { formatTimeRange } from '../utils/dateUtils';

function BookingCard({ booking, onCancel, isGrouped = false }) {
  const { toggleHintDialog } = useHintDialog();
  const { user, isAdmin, userProfile, updateUserProfile } = useAuth();
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancelBooking = async () => {
    if (isCanceling) return;

    const now = dayjs();
    
    // 對於分組預訂，檢查是否有任何時段已經開始
    if (isGrouped && booking.timeSlots) {
      const hasStartedSlots = booking.timeSlots.some(slot => {
        const slotStartTime = dayjs(`${booking.date} ${slot.startTime}`);
        return now.isAfter(slotStartTime);
      });
      
      if (hasStartedSlots) {
        toggleHintDialog({
          title: '無法取消',
          desc: '部分時段已開始或結束，無法取消整個預訂。請聯絡管理員處理。',
          type: 'warning',
        });
        return;
      }
    } else {
      // 單一預訂的原有邏輯
      const bookingTime = dayjs(`${booking.date} ${booking.startTime}`);
      const endTime = dayjs(`${booking.date} ${booking.endTime}`);

      if (now.isAfter(bookingTime)) {
        if (now.isBefore(endTime)) {
          toggleHintDialog({
            title: '無法取消',
            desc: '預訂時段正在進行中，無法取消',
            type: 'warning',
          });
        } else {
          toggleHintDialog({
            title: '無法取消',
            desc: '預訂時段已結束，無法取消',
            type: 'warning',
          });
        }
        return;
      }
    }

    // 檢查權限：只有預訂本人或管理員可以取消
    const isOwner =
      userProfile?.id === user.email.split('@')[0] ||
      user.uid === booking.bookerId;

    if (!isAdmin && !isOwner) {
      toggleHintDialog({
        title: '權限不足',
        desc: '只有預訂本人或管理員可以取消預訂',
        type: 'warning',
      });
      return;
    }

    // 計算退費金額
    let refundAmount = isGrouped ? booking.totalCost : booking.cost;
    const cancelMessage = isGrouped 
      ? `確定要取消這個預訂嗎？\n共 ${booking.timeSlots.length} 個時段，將退還 NT$ ${refundAmount} 到您的餘額`
      : `確定要取消這筆預訂嗎？\n將退還 NT$ ${refundAmount} 到您的餘額`;

    // 使用 HintDialog 顯示確認對話框
    toggleHintDialog({
      title: '確認取消預訂',
      desc: cancelMessage,
      type: 'warning',
      showCancel: true,
      onOk: async () => {
        try {
          setIsCanceling(true);

          const userId = user.email.split('@')[0];
          
          if (isGrouped && booking.timeSlots) {
            // 分組預訂：需要取消所有時段
            const cancelPromises = booking.timeSlots.map(slot => 
              userService.cancelBooking(userId, {
                ...booking,
                id: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                cost: booking.cost / booking.timeSlots.length, // 平均分配費用
              }, booking.cost / booking.timeSlots.length)
            );
            
            await Promise.all(cancelPromises);
          } else {
            // 單一預訂：使用原有邏輯
            await userService.cancelBooking(userId, booking, refundAmount);
          }

          // 更新本地使用者資料的餘額
          if (userProfile && updateUserProfile && refundAmount > 0) {
            const updatedProfile = {
              ...userProfile,
              balance: userProfile.balance + refundAmount,
            };
            updateUserProfile(updatedProfile);
          }

          // 顯示成功訊息
          toggleHintDialog({
            title: '成功',
            desc: `預訂已成功取消，已退還 NT$ ${refundAmount} 到您的餘額`,
            type: 'success',
          });

          // 通知父組件更新列表
          if (onCancel) {
            onCancel(booking.id);
          }
        } catch (error) {
          console.error('Error canceling booking:', error);
          toggleHintDialog({
            title: '錯誤',
            desc: '取消預訂失敗，請稍後再試',
            type: 'error',
          });
        } finally {
          setIsCanceling(false);
        }
      },
      onCancel: () => {
        // 使用者取消操作，不做任何事
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* 預訂標題 */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {booking.roomName}
              </h3>
            </div>
          </div>
          <span className="px-4 py-2 rounded-full text-sm font-semibold border bg-green-100 text-green-800 border-green-200">
            已預訂
          </span>
        </div>

        {/* 預訂詳情 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-500">預訂日期</p>
            <p className="font-medium text-gray-900">
              {dayjs(booking.date).format('YYYY-MM-DD')}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-500">使用時數</p>
            <p className="font-medium text-gray-900">
              {isGrouped ? booking.totalDuration : booking.duration} 小時
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-500">費用</p>
            <p className="font-medium text-gray-900">
              NT$ {isGrouped ? booking.totalCost : booking.cost}
            </p>
          </div>
        </div>
      </div>

      {/* 時段詳情 */}
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          {isGrouped ? `預訂時段 (共 ${booking.timeSlots.length} 個)` : '預訂時段'}
        </h4>
        <div className="mb-4">
          {isGrouped && booking.timeSlots ? (
            <div className="flex flex-wrap gap-2">
              {booking.timeSlots.map((slot, index) => (
                <div 
                  key={index}
                  className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                >
                  {formatTimeRange(slot.startTime, slot.endTime)}
                </div>
              ))}
            </div>
          ) : (
            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
              {formatTimeRange(booking.startTime, booking.endTime)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-2">
            {booking.description && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">使用目的:</span>{' '}
                {booking.description}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <span className="font-medium">預訂人:</span> {booking.booker}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">房型單價:</span> NT$ {booking.roomPrice}/半小時(一個時段)
            </p>
          </div>

          <div className="flex space-x-2">
            {/* 允許預訂本人和管理員取消預訂 */}
            {(isAdmin ||
              userProfile?.id === user.email.split('@')[0] ||
              user.uid === booking.bookerId) && (
              <button
                onClick={handleCancelBooking}
                disabled={isCanceling}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCanceling ? '取消中...' : '取消預訂'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingCard;
