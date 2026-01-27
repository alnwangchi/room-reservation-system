import { calculateEndTime } from '../utils/dateUtils';

function TimeSlotButton({
  slot,
  isBooked,
  _booking,
  isSelected,
  onClick,
  disabled,
}) {
  // 計算完整的時段範圍顯示
  const timeRangeDisplay = `${slot.time} - ${calculateEndTime(slot.time, slot.interval)}`;

  return (
    <button
      onClick={onClick}
      className={`
        p-2 text-xs rounded-lg transition-colors text-center relative min-h-[3rem] flex items-center justify-center
        ${
          isBooked
            ? 'bg-red-50 text-red-700 cursor-not-allowed'
            : isSelected
              ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300'
              : 'bg-gray-50 hover:bg-blue-50 text-gray-900 cursor-pointer'
        }
      `}
      disabled={disabled}
    >
      <div className="font-medium leading-tight break-words">
        {timeRangeDisplay}
      </div>
      {isSelected && !isBooked && (
        <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </button>
  );
}

export default TimeSlotButton;
