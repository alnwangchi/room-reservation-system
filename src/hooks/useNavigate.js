import { useNavigate } from 'react-router-dom';

export const useAppNavigate = () => {
  const navigate = useNavigate();

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

  // 預訂成功後導航到我的預訂頁面
  const goToMyBookings = () => {
    navigate('/my-bookings');
  };

  return {
    // 基本導航
    goToHome,
    goToBookingPage: goToBooking,
    goToMyBookings: goToMyBookings,
    goToRevenueAnalysis,
    goToLogin,
    goToMyBookingsAfterBooking: goToMyBookings,
    navigate,
  };
};
