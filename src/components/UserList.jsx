import React from 'react';
import { userService } from '../services/firestore';
import UserProfileCard from './UserProfileCard';

const UserList = ({ users = [], loading = false, error = null, onRefresh }) => {
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

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        </div>
        <h3 className="mb-2">沒有用戶資料</h3>
        <p className="text-gray-500">目前系統中還沒有任何用戶</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
      {users.map(user => (
        <UserProfileCard
          key={user.id || user.uid}
          user={{
            displayName:
              user.displayName || user.email?.split('@')[0] || '未知用戶',
            email: user.email || '無電子郵件',
            photoURL: user.photoURL || null,
          }}
          userProfile={{
            id: user.id || user.uid, // 確保有 ID
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
  );
};

export default UserList;
