import Admin from '@pages/Admin';
import Booking from '@pages/Booking';
import Home from '@pages/Home';
import Login from '@pages/Login';
import MyBookings from '@pages/MyBookings';
import RevenueAnalysis from '@pages/RevenueAnalysis';
import RoomSelection from '@pages/RoomSelection';

// 路由配置
export const routes = [
  {
    path: '/',
    element: Home,
    label: '首頁',
    showInNav: true,
    requireAuth: false,
    requireAdmin: false,
  },
  {
    path: '/room-selection',
    element: RoomSelection,
    label: '選擇房間',
    showInNav: true,
    requireAuth: true,
    requireAdmin: false,
  },
  {
    path: '/booking/:roomId',
    element: Booking,
    label: '預訂房間',
    showInNav: false, // 動態路由，不顯示在導航中
    requireAuth: true,
    requireAdmin: false,
  },
  {
    path: '/my-bookings',
    element: MyBookings,
    label: '我的預訂',
    showInNav: true,
    requireAuth: true,
    requireAdmin: false,
  },
  {
    path: '/login',
    element: Login,
    label: '登入',
    showInNav: false, // 登入頁面不顯示在導航中
    requireAuth: false,
    requireAdmin: false,
  },
  {
    path: '/revenue-analysis',
    element: RevenueAnalysis,
    label: '收益分析',
    showInNav: true,
    requireAuth: true,
    requireAdmin: true,
  },
  {
    path: '/admin',
    element: Admin,
    label: '管理後台',
    showInNav: true,
    requireAuth: true,
    requireAdmin: true,
  },
];

// 獲取需要顯示在導航中的路由
export const getNavRoutes = (isAuthenticated, isAdmin) => {
  return routes.filter(route => {
    if (!route.showInNav) return false;
    if (route.requireAuth && !isAuthenticated) return false;
    if (route.requireAdmin && !isAdmin) return false;
    return true;
  });
};

// 獲取需要認證的路由
export const getProtectedRoutes = () => {
  return routes.filter(route => route.requireAuth);
};

// 獲取需要管理員權限的路由
export const getAdminRoutes = () => {
  return routes.filter(route => route.requireAdmin);
};
