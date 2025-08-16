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

// 房型資料
export const ROOMS = [
  {
    id: 'general-piano-room',
    name: '一般琴房',
    capacity: 2,
    color: '#3b82f6',
    price: 100,
    description: '琴房配備鋼琴和舒適環境，適合個人練習和教學',
  },
  {
    id: 'standard-recording-studio',
    name: '標準錄音室',
    capacity: 4,
    color: '#10b981',
    price: 350,
    description: '專業錄音設備和隔音環境，適合音樂錄製和製作',
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
