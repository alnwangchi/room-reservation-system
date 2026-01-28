import DropSelector from '@components/shared/DropSelector';
import dayjs from 'dayjs';

function MonthSelector({
  selectedMonth,
  onMonthChange,
  className = 'w-48',
  placeholder = '選擇月份',
  label,
}) {
  // 月份選項：從 2025 年 8 月開始到目前月份 +2
  const startDate = dayjs('2025-08');
  const currentDate = dayjs().startOf('month').add(2, 'month');
  const monthOptions = [];

  let date = startDate;
  // 使用 isBefore 和 isSame 的組合來替代 isSameOrBefore
  while (
    date.isBefore(currentDate, 'month') ||
    date.isSame(currentDate, 'month')
  ) {
    monthOptions.push({
      value: date.format('YYYY-MM'),
      label: date.format('YYYYMM'),
    });
    date = date.add(1, 'month');
  }

  return (
    <DropSelector
      value={selectedMonth}
      onChange={onMonthChange}
      options={monthOptions}
      placeholder={placeholder}
      className={className}
      label={label}
      checkmarkPosition="left"
      buttonClassName="rounded-lg shadow-md focus-visible:border-indigo-500 focus-visible:ring-indigo-500"
      optionsClassName="z-10"
    />
  );
}

export default MonthSelector;
