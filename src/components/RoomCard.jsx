import React from 'react';
import { useAppNavigate } from '../hooks';

function RoomCard({ room }) {
  const { goToBooking } = useAppNavigate();

  const handleBooking = () => {
    if (room.available) {
      goToBooking(room.id);
    }
  };

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg overflow-hidden">
      <div className="p-4 sm:p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 sm:mb-6">
          <h3 className="mb-2 sm:mb-0">{room.name}</h3>
          <span
            className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-semibold self-start sm:self-auto ${
              room.available
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {room.available ? '可預約' : '已預訂'}
          </span>
        </div>

        <div className="space-y-2 mb-4 sm:mb-6">
          <p className="text-sm sm:text-base text-secondary-600">
            費用: {room.price} 點/小時
          </p>
          <p className="text-sm sm:text-base text-secondary-600">
            容量: {room.capacity}人
          </p>
          <p className="text-sm sm:text-base text-secondary-600">
            {room.description}
          </p>
        </div>

        <button
          className={`w-full py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium text-sm sm:text-base ${
            room.available
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!room.available}
          onClick={handleBooking}
        >
          {room.available ? '立即預訂' : '已預訂'}
        </button>
      </div>
    </div>
  );
}

export default RoomCard;
