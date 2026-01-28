import PageBar from '@components/PageBar';
import RoomCard from '@components/RoomCard';
import { ROOMS } from '@constants';
import { getIntervalLabel, getTimeSlotConfig } from '@utils/timeSlot';
import { Calendar } from 'lucide-react';

function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* 頁面標題 */}
      <PageBar
        title="空間預訂"
        description="專業的琴房和錄音室預訂服務，為您提供舒適的音樂練習和錄製環境"
        icon={Calendar}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
      />

      <div className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 mb-12">
            {ROOMS.map(room => {
              const intervalLabel = getIntervalLabel(
                getTimeSlotConfig(room.id).INTERVAL_MINUTES
              );

              return (
                <RoomCard
                  key={room.id}
                  room={room}
                  intervalLabel={intervalLabel}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
