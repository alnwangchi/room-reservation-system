import { MTS_TIME_SLOT_CONFIG, TIME_SLOT_CONFIG } from '../constants';

export const getTimeSlotConfig = roomId => {
  if (!roomId) return TIME_SLOT_CONFIG;
  return roomId.includes('multifunctional-meeting-space')
    ? MTS_TIME_SLOT_CONFIG
    : TIME_SLOT_CONFIG;
};

export const getIntervalLabel = intervalMinutes => {
  if (intervalMinutes === 60) return '/小時';
  if (intervalMinutes === 30) return '/半小時';
  return `/${intervalMinutes}分鐘`;
};
