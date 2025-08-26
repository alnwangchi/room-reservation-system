import { X } from 'lucide-react';
import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { calculateEndTime } from '../utils/dateUtils';
import BalanceCard from './BalanceCard';

function BookingModal({
  isOpen,
  onClose,
  selectedTimeSlots,
  onSubmit,
  bookingForm,
  setBookingForm,
  roomInfo,
  userInfo,
  isProcessing = false,
}) {
  const { isAdmin } = useAuth();
  // 當 Modal 開啟且有使用者資訊時，自動填入預訂人姓名
  useEffect(() => {
    if (isOpen && userInfo?.displayName) {
      setBookingForm(prev => ({
        ...prev,
        booker: userInfo.displayName,
      }));
    }
  }, [isOpen, userInfo, setBookingForm]);

  if (!isOpen || selectedTimeSlots.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3>預訂 {selectedTimeSlots.length} 個時段</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-2">
          {/* 餘額顯示 */}
          {userInfo && !isAdmin && (
            <BalanceCard balance={userInfo.balance || 0} />
          )}

          {/* 選中時段顯示 */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-1">
              選中的時段：
            </p>
            <div className="text-xs text-blue-600">
              {selectedTimeSlots
                .map(slot => {
                  // 使用共用的計算結束時間函數
                  const startTime = slot.time;
                  const endTime = calculateEndTime(startTime, 30);

                  return `${startTime} - ${endTime}`;
                })
                .join(', ')}
            </div>
          </div>

          {/* 費用計算 */}
          {!isAdmin && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">
                  費用計算：
                </span>
                <span className="text-sm text-green-600">
                  {selectedTimeSlots.length} × ${roomInfo?.price}/時段
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-green-200">
                <span className="text-sm font-semibold text-green-800">
                  總費用：
                </span>
                <span className="text-lg font-bold text-green-800">
                  ${selectedTimeSlots.length * roomInfo?.price}
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              預訂人*
            </label>
            <input
              type="text"
              value={bookingForm.booker}
              onChange={e =>
                setBookingForm({ ...bookingForm, booker: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="輸入預訂人姓名"
            />
          </div>

          {!isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                使用說明
              </label>
              <input
                value={bookingForm.description}
                onChange={e =>
                  setBookingForm({
                    ...bookingForm,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder=""
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={onSubmit}
              disabled={
                isProcessing ||
                !bookingForm.booker.trim() ||
                (userInfo &&
                  !isAdmin &&
                  userInfo.balance < selectedTimeSlots.length * roomInfo?.price)
              }
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                !isProcessing &&
                bookingForm.booker.trim() &&
                (!userInfo ||
                  !isAdmin ||
                  userInfo.balance >=
                    selectedTimeSlots.length * roomInfo?.price)
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-1">
                  <div className="text-sm animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>處理中</span>
                </div>
              ) : (
                '確認預訂'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;
