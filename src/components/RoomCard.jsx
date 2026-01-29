import { useAppNavigate } from '@hooks';
import { Calendar, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

function RoomCard({ room, intervalLabel }) {
  const { goToBooking } = useAppNavigate();
  const isAvailable = !room.isDisabled;
  const safeImages = room.images || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [room.id, safeImages.length]);

  const handleBooking = () => {
    if (isAvailable) {
      goToBooking(room.id);
    }
  };

  const handlePrev = () => {
    if (safeImages.length <= 1) return;
    setCurrentIndex(prev => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (safeImages.length <= 1) return;
    setCurrentIndex(prev => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 flex flex-col md:flex-row h-auto md:h-[400px]">
      {/* 圖片區 */}
      <div className="relative w-full md:w-[45%] h-80 md:h-full overflow-hidden">
        {safeImages.length > 0 ? (
          <img
            src={safeImages[currentIndex]}
            alt={room.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200" />
        )}
        {!isAvailable && (
          <div className="absolute inset-0 bg-gray-900/40" aria-hidden="true" />
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[12px] font-bold text-blue-600 tracking-wide uppercase">
            {isAvailable ? '可預約' : '暫不開放'}
          </span>
        </div>

        {safeImages.length > 1 && (
          <>
            <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                type="button"
                onClick={handlePrev}
                className="size-10 flex items-center justify-center rounded-full bg-white/80 text-gray-900 backdrop-blur-sm hover:bg-white transition-all"
                aria-label="上一張"
              >
                <span className="text-xl">{'‹'}</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="size-10 flex items-center justify-center rounded-full bg-white/80 text-gray-900 backdrop-blur-sm hover:bg-white transition-all"
                aria-label="下一張"
              >
                <span className="text-xl">{'›'}</span>
              </button>
            </div>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 items-center">
              {safeImages.map((_, index) => (
                <span
                  key={`${room.id}-dot-${index}`}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-6 bg-blue-600'
                      : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 內容區 */}
      <div className="flex-1 p-6 md:p-10 flex flex-col justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-bold">
                  容量 {room.capacity} 人
                </span>
              </div>
              <h3 className="text-gray-900 text-2xl md:text-3xl font-bold leading-tight">
                {room.name}
              </h3>
            </div>
          </div>

          <p className="text-gray-600 text-base leading-relaxed line-clamp-3">
            {room.description}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">09:00-21:00</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-sm">計價單位 {intervalLabel}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
          <div className="flex flex-col">
            {room.holidayPrice ? (
              <>
                <p className="text-gray-900 text-xl font-bold leading-none">
                  平日 {room.price} 點
                  <span className="text-gray-500 text-sm font-normal">
                    {' '}
                    {intervalLabel}
                  </span>
                </p>
                <p className="text-gray-900 text-xl font-bold leading-none mt-2">
                  假日 {room.holidayPrice} 點
                  <span className="text-gray-500 text-sm font-normal">
                    {' '}
                    {intervalLabel}
                  </span>
                </p>
              </>
            ) : (
              <p className="text-gray-900 text-2xl font-bold leading-none">
                {room.price} 點
                <span className="text-gray-500 text-sm font-normal">
                  {' '}
                  {intervalLabel}
                </span>
              </p>
            )}
          </div>
          <button
            className={`group/btn flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 text-base font-bold transition-all shadow-md hover:shadow-lg active:scale-95 ${
              isAvailable
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleBooking}
            disabled={!isAvailable}
          >
            <span className="truncate">
              {isAvailable ? '立即預訂' : '暫不開放'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoomCard;
