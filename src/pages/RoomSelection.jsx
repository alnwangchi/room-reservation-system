import { Calendar, Clock, MapPin } from 'lucide-react';
import React from 'react';
import generalPianoRoom01 from '../assets/general-piano-room01.jpg';
import standardRecordingStudio01 from '../assets/standard-recording-studio01.jpg';
import PageHeader from '../components/PageHeader';
import { ROOMS } from '../constants';
import { useAppNavigate } from '../hooks';

function Home() {
  const { goToBookingPage } = useAppNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* 頁面標題 */}
      <PageHeader
        title="琴房預訂系統"
        description="專業的琴房和錄音室預訂服務，為您提供舒適的音樂練習和錄製環境"
        icon={Calendar}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
      />

      <div className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 房間列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {ROOMS.map(room => (
              <div
                key={room.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* 房間圖片 */}
                <div className="h-64 overflow-hidden">
                  <img
                    src={
                      room.id === 'general-piano-room'
                        ? generalPianoRoom01
                        : standardRecordingStudio01
                    }
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
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
                      <p className="text-sm font-bold text-blue-600">/半小時</p>
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
                      onClick={() => goToBookingPage(room.id)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      立即預訂
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
