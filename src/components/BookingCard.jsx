import dayjs from 'dayjs';
import React from 'react';
import { formatTimeRange } from '../utils/dateUtils';

function BookingCard({ booking, isGrouped = false }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {booking.roomName}
            </h3>
          </div>
          <span className="px-4 py-2 rounded-full text-sm font-semibold border bg-green-100 text-green-800 border-green-200">
            已預訂
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="flex flex-col">
            <p className="text-sm text-gray-500">預訂日期</p>
            <p className="font-medium text-gray-900">
              {dayjs(booking.date).format('YYYY-MM-DD')}
            </p>
          </div>

          <div className="flex flex-col">
            <p className="text-sm text-gray-500">使用時數</p>
            <p className="font-medium text-gray-900">
              {isGrouped ? booking.totalDuration : booking.duration} 小時
            </p>
          </div>

          <div className="flex flex-col">
            <p className="text-sm text-gray-500">費用</p>
            <p className="font-medium text-gray-900">
              NT$ {isGrouped ? booking.totalCost : booking.cost}
            </p>
          </div>
        </div>
      </div>

      {/* 時段詳情 */}
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">預訂時段</h4>
        <div className="mb-4">
          {isGrouped && booking.timeSlots ? (
            <div className="flex flex-wrap gap-2">
              {booking.timeSlots.map((slot, index) => (
                <div
                  key={index}
                  className="text-center inline-block w-[128px] px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                >
                  {formatTimeRange(slot.startTime, slot.endTime)}
                </div>
              ))}
            </div>
          ) : (
            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
              {formatTimeRange(booking.startTime, booking.endTime)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-2">
            {booking.description && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">使用目的:</span>{' '}
                {booking.description}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <span className="font-medium">預訂人:</span> {booking.booker}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingCard;
