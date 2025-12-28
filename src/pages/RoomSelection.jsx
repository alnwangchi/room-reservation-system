import { Calendar, Clock, MapPin } from 'lucide-react';
import generalPianoRoom01 from '../assets/general-piano-room01.jpg';
import multifunctionalMeetingSpace from '../assets/multifunctional-meeting-space.jpg';
import standardRecordingStudio01 from '../assets/standard-recording-studio01.jpg';
import PageHeader from '../components/PageHeader';
import { ROOMS } from '../constants';
import { useAppNavigate } from '../hooks';

// 房型圖片映射
const roomImages = {
  'general-piano-room': generalPianoRoom01,
  'general-piano-room-dev': generalPianoRoom01,
  'standard-recording-studio': standardRecordingStudio01,
  'standard-recording-studio-dev': standardRecordingStudio01,
  'multifunctional-meeting-space': multifunctionalMeetingSpace,
  'multifunctional-meeting-space-dev': multifunctionalMeetingSpace,
};

function Home() {
  const { goToBooking } = useAppNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* 頁面標題 */}
      <PageHeader
        title="空間預訂"
        description="專業的琴房和錄音室預訂服務，為您提供舒適的音樂練習和錄製環境"
        icon={Calendar}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
      />

      <div className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {ROOMS.map(room => {
              const isDisabled =
                room.id === 'multifunctional-meeting-space' ||
                room.id === 'multifunctional-meeting-space-dev';

              return (
                <div
                  key={room.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="h-80 overflow-hidden relative">
                    <img
                      src={roomImages[room.id] || generalPianoRoom01}
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                    {isDisabled && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-50"></div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {room.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            容量：{room.capacity} 人
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          NT$ {room.price}
                        </div>
                        <p className="text-sm font-bold text-blue-600">
                          /半小時
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{room.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-start space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>09:00-21:00</span>
                        </div>
                      </div>

                      <button
                        onClick={() => goToBooking(room.id)}
                        disabled={isDisabled}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          isDisabled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        立即預訂
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
