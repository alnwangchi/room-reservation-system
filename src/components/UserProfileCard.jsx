import { useHintDialog } from '@contexts/HintDialogContext';
import { Calendar, Pen, User } from 'lucide-react';
import React, { useState } from 'react';
import { formatDate } from '../utils/dateUtils';
import BalanceCard from './BalanceCard';
import DepositModal from './DepositModal';

const UserProfileCard = ({
  user,
  userProfile,
  isLoading = false,
  showBalance = true,
  depositButton = false,
  className = '',
  onDeposit,
  showRenameButton,
  setIsRenameModalOpen,
}) => {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const { toggleHintDialog } = useHintDialog();

  const handleDepositClick = () => {
    setIsDepositModalOpen(true);
  };

  const handleDepositConfirm = async amount => {
    if (onDeposit) {
      try {
        // 確保有有效的用戶 ID
        const userId = userProfile?.id;
        if (!userId) {
          throw new Error('無法識別用戶 ID');
        }

        await onDeposit(userId, amount);
        // 儲值成功後關閉 Modal 並顯示成功訊息
        setIsDepositModalOpen(false);
        toggleHintDialog({
          type: 'success',
          title: '儲值成功',
          message: `已成功為 ${user?.displayName || user?.email?.split('@')[0]} 儲值 NT$ ${amount.toLocaleString()}`,
        });
      } catch (error) {
        // 儲值失敗時顯示錯誤訊息
        console.error('Deposit error:', error);
        toggleHintDialog({
          type: 'error',
          title: '儲值失敗',
          message:
            error.message === '無法識別用戶 ID'
              ? '用戶資料不完整，無法進行儲值'
              : '儲值過程中發生錯誤，請稍後再試',
        });
      }
    }
  };

  const handleCloseModal = () => {
    setIsDepositModalOpen(false);
  };

  // 如果沒有傳入資料，顯示載入狀態
  if (isLoading || !user || !userProfile) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gray-300 rounded-full mr-4"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-20 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-300 rounded"></div>
            <div className="h-12 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const { displayName, email, photoURL } = user;
  const { balance = 0, totalBookings, createdAt } = userProfile;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* 用戶基本信息 */}
      <div className="flex items-center mb-6 relative">
        {showRenameButton && (
          <Pen
            className="w-4 h-4 text-gray-500 mr-2 absolute right-2 top-2 cursor-pointer"
            onClick={() => setIsRenameModalOpen(true)}
          />
        )}

        <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName || email}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {displayName || email.split('@')[0]}
          </h3>
          <p className="text-gray-600 text-sm mb-1">{email}</p>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              會員自 {formatDate(createdAt)}
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {userProfile.role === 'admin' ? '管理員' : '一般用戶'}
            </span>
          </div>
        </div>
      </div>
      {/* 儲值餘額 */}
      {showBalance && <BalanceCard balance={balance} />}
      {/* 統計信息 */}
      <div className="grid grid-cols-1 gap-3 mt-2">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-xs font-medium text-gray-700">
              預訂時段總數
            </span>
          </div>
          <span className="text-lg font-bold text-gray-900">
            {Object.values(totalBookings).reduce((acc, curr) => acc + curr, 0)}
          </span>
        </div>
      </div>
      {/* 儲值按鈕 */}
      {depositButton && (
        <div className="mt-4">
          <button
            className="w-full bg-green-500 text-white font-medium py-3 px-4 rounded-lg"
            onClick={handleDepositClick}
          >
            <div className="flex items-center justify-center">
              <span>儲值</span>
            </div>
          </button>
        </div>
      )}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleDepositConfirm}
        user={user}
        currentBalance={userProfile?.balance}
      />
    </div>
  );
};

export default UserProfileCard;
