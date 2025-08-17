import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import { MONTH_NAMES, WEEK_DAYS } from '../constants';

function Calendar({
  currentDate,
  selectedDate,
  onDateSelect,
  onMonthChange,
  disabledDateRange = {
    start: null, // 禁用開始日期 (包含)
    end: null, // 禁用結束日期 (包含)
  },
  customDisabledDates = [], // 自定義禁用日期陣列
  renderDateCell, // 自定義日期格子渲染函數
  className = '',
}) {
  // 日曆相關函數
  const getDaysInMonth = date => {
    const firstDay = date.startOf('month');
    const lastDay = date.endOf('month');
    const daysInMonth = lastDay.date();
    const startingDay = firstDay.day();

    const days = [];

    // 上個月的日期
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = firstDay.subtract(i + 1, 'day');
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // 當月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = firstDay.date(i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }

    // 下個月的日期
    const remainingDays = 42 - days.length; // 6 行 x 7 天 = 42
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = lastDay.add(i, 'day');
      days.push({ date: nextDate, isCurrentMonth: false });
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (onMonthChange) {
      onMonthChange(currentDate.subtract(1, 'month'));
    }
  };

  const handleNextMonth = () => {
    if (onMonthChange) {
      onMonthChange(currentDate.add(1, 'month'));
    }
  };

  const handleDateClick = date => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // 檢查日期是否被禁用
  const isDateDisabled = date => {
    // 檢查自定義禁用日期
    if (
      customDisabledDates.some(disabledDate =>
        dayjs(disabledDate).isSame(date, 'day')
      )
    ) {
      return true;
    }

    // 檢查日期範圍
    if (
      disabledDateRange.start &&
      date.isBefore(dayjs(disabledDateRange.start), 'day')
    ) {
      return true;
    }

    if (
      disabledDateRange.end &&
      (date.isSame(dayjs(disabledDateRange.end), 'day') ||
        date.isBefore(dayjs(disabledDateRange.end), 'day'))
    ) {
      return true;
    }

    return false;
  };

  // 預設的日期格子渲染函數
  const defaultRenderDateCell = (day, index) => {
    const isSelected = selectedDate && day.date.isSame(selectedDate, 'day');
    const isDisabled = !day.isCurrentMonth || isDateDisabled(day.date);

    return (
      <button
        key={index}
        onClick={() => !isDisabled && handleDateClick(day.date)}
        disabled={isDisabled}
        className={`
          p-2 md:p-3 text-sm relative transition-colors
          ${
            !isDisabled
              ? 'text-gray-900 hover:bg-blue-50 cursor-pointer'
              : 'text-gray-300 cursor-not-allowed'
          }
          ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
          rounded-lg
        `}
      >
        {day.date.date()}
      </button>
    );
  };

  const days = getDaysInMonth(currentDate);
  const renderCell = renderDateCell || defaultRenderDateCell;

  return (
    <div className={`bg-white rounded-xl shadow-sm ${className}`}>
      <div className="p-4 md:p-6">
        {/* 日曆標題 */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl font-semibold">
            {MONTH_NAMES[currentDate.month()]} {currentDate.year()}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 週標題 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEK_DAYS.map(day => (
            <div
              key={day}
              className="p-2 md:p-3 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日期格子 */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => renderCell(day, index))}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
