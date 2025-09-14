import React from 'react';
import { userService } from '../services/firestore';
import UserProfileCard from './UserProfileCard';

const UserList = ({ users = [], loading = false, error = null, onRefresh }) => {
  const displayUsers = users.filter(user => user.role !== 'admin');

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
      <h3 className="font-medium text-gray-900 mb-2">
        用戶列表({displayUsers.length}名用戶)
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-4">
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
