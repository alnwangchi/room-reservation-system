import { Switch } from '@headlessui/react';
import dayjs from 'dayjs';
import { useState } from 'react';
import { userService } from '../services/firestore';
import UserProfileCard from './UserProfileCard';

const UserList = ({ users = [], loading = false, error = null, onRefresh }) => {
  const [switchEnabled, setSwitchEnabled] = useState(false);
  const [sortByJoinTime, setSortByJoinTime] = useState(false);

  const getCreatedAtValue = value => {
    if (!value) {
      return 0;
    }
    if (typeof value === 'object') {
      if (typeof value.toDate === 'function') {
        const dateValue = dayjs(value.toDate());
        return dateValue.isValid() ? dateValue.valueOf() : 0;
      }
      if ('seconds' in value) {
        const dateValue = dayjs(value.seconds * 1000);
        return dateValue.isValid() ? dateValue.valueOf() : 0;
      }
    }
    const dateValue = dayjs(value);
    return dateValue.isValid() ? dateValue.valueOf() : 0;
  };

  const displayUsers = users
    .filter(user => switchEnabled || user.role !== 'admin')
    .sort((a, b) => {
      if (sortByJoinTime) {
        return getCreatedAtValue(b.createdAt) - getCreatedAtValue(a.createdAt);
      }
      return (
        Object.values(b.totalBookings).reduce((acc, curr) => acc + curr, 0) -
        Object.values(a.totalBookings).reduce((acc, curr) => acc + curr, 0)
      );
    });

  const handleDeposit = async (userId, amount) => {
    try {
      // 更新用戶的儲值餘額
      const newBalance = await userService.updateBalance(userId, amount);

      // 儲值成功後觸發資料重新載入
      if (onRefresh) {
        onRefresh();
      }

      // 返回成功結果
      return { success: true, newBalance };
    } catch (error) {
      console.error('Error depositing:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <div className="flex items-center mb-4 lg:mb-6">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gray-300 rounded-full mr-3 lg:mr-4"></div>
                <div className="flex-1">
                  <div className="h-3 lg:h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-2 lg:h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-16 lg:h-20 bg-gray-300 rounded mb-4 lg:mb-6"></div>
              <div className="space-y-2 lg:space-y-3">
                <div className="h-8 lg:h-12 bg-gray-300 rounded"></div>
                <div className="h-8 lg:h-12 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="mb-2">載入失敗</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          重新載入
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="flex flex-row items-center gap-3 sm:gap-4 flex-nowrap">
          <div className="flex items-center gap-2">
            <Switch
              checked={switchEnabled}
              onChange={setSwitchEnabled}
              className={`${
                switchEnabled ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0`}
            >
              <span
                className={`${
                  switchEnabled ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform`}
              />
            </Switch>
            <span className="text-sm text-gray-700 whitespace-nowrap">
              顯示管理員
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={sortByJoinTime}
              onChange={setSortByJoinTime}
              className={`${
                sortByJoinTime ? 'bg-blue-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0`}
            >
              <span
                className={`${
                  sortByJoinTime ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform`}
              />
            </Switch>
            <span className="text-sm text-gray-700 whitespace-nowrap">
              加入時間
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-4">
        {displayUsers.map(user => (
          <UserProfileCard
            size="small"
            key={user.id}
            user={null}
            userProfile={{
              id: user.id,
              displayName:
                user.displayName || user.email?.split('@')[0] || '未知用戶',
              email: user.email || '無電子郵件',
              photoURL: user.photoURL || null,
              balance: user.balance || 0,
              totalBookings: user.totalBookings || 0,
              monthlyBookings: user.monthlyBookings || 0,
              createdAt: user.createdAt || null,
              role: user.role || 'user',
            }}
            showBalance={true}
            showStats={true}
            depositButton={true}
            onDeposit={handleDeposit}
            className=""
          />
        ))}
      </div>
    </>
  );
};

export default UserList;
