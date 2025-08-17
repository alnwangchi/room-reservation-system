import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppNavigate } from '../hooks/useNavigate';

function ProtectedRoute({
  children,
  requireAuth = false,
  requireAdmin = false,
}) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const { goToHome, goToLogin } = useAppNavigate();

  // 載入中狀態
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 需要認證但未登入
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">需要登入</h2>
          <p className="text-gray-600 mb-6">請先登入以訪問此頁面</p>
          <button
            onClick={goToLogin}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            前往登入頁
          </button>
        </div>
      </div>
    );
  }

  // 需要管理員權限但使用者不是管理員
  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">權限不足</h2>
          <p className="text-gray-600 mb-6">您沒有權限訪問此頁面</p>
          <button
            onClick={goToHome}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  // 通過所有驗證，渲染子組件
  return children;
}

export default ProtectedRoute;
