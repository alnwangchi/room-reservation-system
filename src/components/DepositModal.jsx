import { X } from 'lucide-react';
import React, { useState } from 'react';

const DepositModal = ({
  isOpen,
  onClose,
  onConfirm,
  userProfile,
  currentBalance,
}) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!amount || parseFloat(amount) === 0) return;

    setLoading(true);
    try {
      await onConfirm(parseFloat(amount));
      // 不再在這裡關閉 modal，由父元件控制
    } catch (error) {
      console.error('Error depositing:', error);
      // 錯誤時重置 loading 狀態
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* 標題和關閉按鈕 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3>為用戶儲值</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 用戶資訊 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName || userProfile.email}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {userProfile?.displayName?.charAt(0) ||
                      userProfile?.email?.charAt(0) ||
                      'U'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {userProfile?.displayName ||
                  userProfile?.email?.split('@')[0] ||
                  '未知用戶'}
              </p>
              <p className="text-sm text-gray-500">{userProfile?.email}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">目前餘額</p>
            <p className="text-lg font-bold text-gray-900">
              {currentBalance?.toLocaleString() || 0} 點
            </p>
          </div>
        </div>

        {/* 儲值表單 */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              儲值/扣款金額
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                點
              </span>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="正數為儲值，負數為扣款"
                step="100"
                className="w-full pl-12 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
          </div>

          {/* 按鈕組 */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!amount || parseFloat(amount) === 0 || loading}
              className={`flex-1 font-medium py-3 px-4 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${
                parseFloat(amount) > 0
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : parseFloat(amount) < 0
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-300 text-gray-500'
              }`}
            >
              {loading
                ? '處理中...'
                : parseFloat(amount) > 0
                  ? '確認儲值'
                  : parseFloat(amount) < 0
                    ? '確認扣款'
                    : '確認操作'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepositModal;
