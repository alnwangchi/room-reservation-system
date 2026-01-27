import { useHintDialog } from '@contexts/HintDialogContext';
import { Calendar, Pen, User } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '@utils/date';
import BalanceCard from './BalanceCard';
import DepositModal from './DepositModal';
import UserBadge from './UserBadge';

const UserProfileCard = ({
  size,
  userProfile,
  isLoading = false,
  showBalance = true,
  depositButton = false,
  className = '',
  onDeposit,
  showRenameButton,
  setIsRenameModalOpen,
  showFullContentOnMobile = false,
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
          message: `已成功為 ${userProfile?.displayName || userProfile?.email?.split('@')[0]} 儲值 ${amount.toLocaleString()} 點`,
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
  if (isLoading || !userProfile) {
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

  const {
    displayName,
    email,
    photoURL,
    balance = 0,
    totalBookings,
    createdAt,
  } = userProfile;

  return (
    <div className={`bg-white rounded-lg shadow-md  p-2 md:p-6 ${className}`}>
      {/* 用戶基本信息 */}
      <div
        className={`flex items-center mb-3 relative ${
          size === 'small' ? 'flex-col text-center' : ''
        }`}
      >
        {showRenameButton && (
          <Pen
            className="w-4 h-4 text-gray-500 mr-2 absolute right-2 top-2 cursor-pointer"
            onClick={() => setIsRenameModalOpen(true)}
          />
        )}
        {size === 'small' && (
          <div className="absolute right-0 top-0 hidden sm:block">
            <UserBadge role={userProfile.role} />
          </div>
        )}
        <div
          className={`flex flex-col justify-center items-center ${
            size === 'small' ? 'mb-2' : 'mr-4'
          }`}
        >
          <div
            className={`${size === 'small' ? 'w-12 h-12 sm:w-16 sm:h-16' : 'w-16 h-16'} rounded-full overflow-hidden mb-1`}
          >
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName || email}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User
                  className={`${size === 'small' ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-8 h-8'} text-white`}
                />
              </div>
            )}
          </div>
          {size === 'small' && (
            <h3 className="text-center text-sm sm:text-base">
              {displayName || email.split('@')[0]}
            </h3>
          )}
        </div>
        <div className={`flex-1 ${size === 'small' ? 'w-full' : ''}`}>
          <div className="flex items-center gap-2">
            {size !== 'small' && <h3>{displayName || email.split('@')[0]}</h3>}
            {size !== 'small' && (
              <div className="hidden sm:block">
                <UserBadge role={userProfile.role} />
              </div>
            )}
          </div>
          <p
            className={`text-gray-600 text-sm mb-1 ${showFullContentOnMobile ? '' : 'hidden sm:block'}`}
          >
            {email}
          </p>
          <div
            className={`${showFullContentOnMobile ? 'flex' : 'hidden sm:flex'} justify-start space-x-2`}
          >
            <span className="text-xs text-gray-500">
              會員自 {formatDate(createdAt)}
            </span>
          </div>
        </div>
      </div>
      {/* 儲值餘額 */}
      {showBalance && (
        <BalanceCard
          balance={balance}
          showFullContentOnMobile={showFullContentOnMobile}
        />
      )}
      {/* 統計信息 */}
      <div className="grid grid-cols-1 gap-3 mt-2">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-blue-600 mr-2" />
            <span
              className={`text-xs font-medium text-gray-700 ${showFullContentOnMobile ? '' : 'hidden sm:inline'}`}
            >
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
        <div className="mt-2">
          <button
            className="w-full bg-green-500 text-white font-medium py-2 rounded-lg"
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
        userProfile={userProfile}
        currentBalance={userProfile?.balance}
      />
    </div>
  );
};

export default UserProfileCard;
