import {
  MTS_TIME_SLOT_CONFIG,
  TIME_SLOT_CONFIG,
  WEBSITE_BOOKING_POLICY,
} from '@constants';
import dayjs from 'dayjs';

import { isWeekend } from './date';

export const isWebsiteBookingRestrictedDate = dateInput => {
  const date = dayjs(dateInput);
  if (!date.isValid()) return false;
  return !date.isBefore(WEBSITE_BOOKING_POLICY.START_DATE, 'day');
};

export const canBookOnWebsite = (dateInput, hour, minute = 0) => {
  if (!isWebsiteBookingRestrictedDate(dateInput)) return true;
  if (isWeekend(dateInput)) return false;

  const totalMinutes = hour * 60 + minute;
  const startMinutes = WEBSITE_BOOKING_POLICY.START_HOUR * 60;
  const endMinutes =
    WEBSITE_BOOKING_POLICY.END_HOUR * 60 + WEBSITE_BOOKING_POLICY.END_MINUTE;
  return totalMinutes >= startMinutes && totalMinutes < endMinutes;
};

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
