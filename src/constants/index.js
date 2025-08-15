// 月份名稱
export const MONTH_NAMES = [
  '一月',
  '二月',
  '三月',
  '四月',
  '五月',
  '六月',
  '七月',
  '八月',
  '九月',
  '十月',
  '十一月',
  '十二月',
];

// 星期名稱
export const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

// 琴房資料
export const ROOMS = [
  {
    id: 'general-piano-room',
    name: '一般琴房',
    capacity: 2,
    color: '#3b82f6',
    price: 200,
    description: '琴房配備鋼琴和舒適環境，適合個人練習和教學',
  },
  {
    id: 'standard-recording-studio',
    name: '標準錄音室',
    capacity: 4,
    color: '#10b981',
    price: 700,
    description: '專業錄音設備和隔音環境，適合音樂錄製和製作',
  },
];

// 預設預訂資料
export const DEFAULT_BOOKINGS = [
  {
    id: 1,
    roomId: 'general-piano-room',
    booker: '張同學',
    date: '2025-01-13',
    startTime: '09:00',
    endTime: '09:30',
    description: '鋼琴練習',
  },
  {
    id: 2,
    roomId: 'general-piano-room',
    booker: '李老師',
    date: '2025-01-13',
    startTime: '14:00',
    endTime: '14:30',
    description: '音樂教學',
  },
  {
    id: 3,
    roomId: 'general-piano-room',
    booker: '王同學',
    date: '2025-01-14',
    startTime: '10:00',
    endTime: '10:30',
    description: '個人練習',
  },
];

// 時段配置
export const TIME_SLOT_CONFIG = {
  START_HOUR: 9,
  END_HOUR: 21,
  INTERVAL_MINUTES: 30,
  EXCLUDE_LAST_HALF_HOUR: false, // 包含 20:30
};

// 時段分類
export const TIME_CATEGORIES = {
  MORNING: { name: '上午時段', startHour: 9, endHour: 12 },
  AFTERNOON: { name: '下午時段', startHour: 12, endHour: 18 },
  EVENING: { name: '晚上時段', startHour: 18, endHour: 21 },
};

// 我的預訂頁面資料
export const MY_BOOKINGS_DATA = [
  {
    id: 1,
    roomId: 'general-piano-room',
    roomName: '一般琴房',
    date: '2025-01-15',
    timeSlots: ['09:00', '09:30', '10:00', '10:30'],
    startTime: '09:00',
    endTime: '10:30',
    purpose: '鋼琴練習',
    totalHours: 1.5,
    totalPrice: 300,
  },
  {
    id: 2,
    roomId: 'standard-recording-studio',
    roomName: '標準錄音室',
    date: '2025-01-16',
    timeSlots: ['14:00', '14:30', '15:00', '15:30', '16:00'],
    startTime: '14:00',
    endTime: '16:00',
    purpose: '音樂錄製',
    totalHours: 2,
    totalPrice: 1400,
  },
  {
    id: 3,
    roomId: 'general-piano-room',
    roomName: '一般琴房',
    date: '2025-01-17',
    timeSlots: ['10:00', '10:30', '11:00', '11:30', '12:00'],
    startTime: '10:00',
    endTime: '12:00',
    purpose: '個人練習',
    totalHours: 2,
    totalPrice: 400,
  },
];

// 用戶信息
export const USER_INFO = {
  name: '張小明',
  email: 'xiaoming@example.com',
  avatar:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  balance: 2500,
  totalBookings: 12,
  memberSince: '2024-01-15',
};

// 首頁功能特色
export const HOME_FEATURES = [
  {
    id: 1,
    title: '快速預訂',
    description: '簡單幾步即可完成琴房預訂，支持多種時間選擇',
    icon: 'lightning',
    iconColor: 'primary',
    bgColor: 'primary-100',
  },
  {
    id: 3,
    title: '便捷管理',
    description: '輕鬆管理您的預訂記錄，支持修改、取消和查看歷史記錄',
    icon: 'settings',
    iconColor: 'purple',
    bgColor: 'purple-100',
  },
];
