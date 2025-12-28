import { useLocation, useNavigate } from 'react-router-dom';

export const useAppNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 房間預訂頁面
  const goToBooking = roomId => {
    navigate(`/booking/${roomId}`);
  };

  // 收益分析頁面
  const goToRevenueAnalysis = () => {
    navigate('/revenue-analysis');
  };

  // 登入頁面
  const goToLogin = () => {
    navigate('/login');
  };

  // 返回首頁
  const goToHome = () => {
    navigate('/');
  };

  // 導航到選擇房間頁面
  const goToRoomSelection = () => {
    navigate('/room-selection');
  };

  // 預訂成功後導航到我的預訂頁面
  const goToMyBookings = () => {
    navigate('/my-bookings');
  };

  // 頁面檢查工具函數
  const isInLoginPage = () => {
    return location.pathname === '/login';
  };

  const isInHomePage = () => {
    return location.pathname === '/';
  };

  const isInRoomSelectionPage = () => {
    return location.pathname === '/room-selection';
  };

  const isInBookingPage = () => {
    return location.pathname.startsWith('/booking/');
  };

  const isInMyBookingsPage = () => {
    return location.pathname === '/my-bookings';
  };

  const isInRevenueAnalysisPage = () => {
    return location.pathname === '/revenue-analysis';
  };

  const isInAdminPage = () => {
    return location.pathname === '/admin';
  };

  // 檢查是否在任何需要認證的頁面
  const isInProtectedPage = () => {
    const protectedPaths = [
      '/room-selection',
      '/my-bookings',
      '/revenue-analysis',
      '/admin',
    ];
    return protectedPaths.some(
      path =>
        location.pathname === path ||
        (path === '/booking/' && location.pathname.startsWith('/booking/'))
    );
  };

  // 檢查是否在任何需要管理員權限的頁面
  const isInAdminOnlyPage = () => {
    const adminPaths = ['/revenue-analysis', '/admin'];
    return adminPaths.some(path => location.pathname === path);
  };

  return {
    // 基本導航
    goToHome,
    goToRoomSelection,
    goToBooking,
    goToMyBookings,
    goToRevenueAnalysis,
    goToLogin,
    navigate,

    // 頁面檢查工具
    isInLoginPage,
    isInHomePage,
    isInRoomSelectionPage,
    isInBookingPage,
    isInMyBookingsPage,
    isInRevenueAnalysisPage,
    isInAdminPage,
    isInProtectedPage,
    isInAdminOnlyPage,

    // 當前位置信息
    currentPath: location.pathname,
  };
};
