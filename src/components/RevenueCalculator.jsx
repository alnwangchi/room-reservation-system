import { Calculator, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { ROOMS, TIME_SLOT_CONFIG } from '../constants';

function RevenueCalculator() {
  // 可編輯的參數狀態
  const [settings, setSettings] = useState({
    startHour: TIME_SLOT_CONFIG.START_HOUR,
    endHour: TIME_SLOT_CONFIG.END_HOUR,
    intervalMinutes: TIME_SLOT_CONFIG.INTERVAL_MINUTES,
    occupancyRate: 0.2, // 租用率
    cleaningFeeRate: 0.05, // 清潔費
  });

  // 更新設定
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // 計算每日可用時段數量
  const calculateDailyTimeSlots = () => {
    const startHour = settings.startHour;
    const endHour = settings.endHour;
    const intervalMinutes = settings.intervalMinutes;

    // 計算總小時數
    const totalHours = endHour - startHour;

    // 每小時2個時段（00分和30分）
    let slots = totalHours * 2;

    // 如果開始時間不是整點，需要減去第一個不完整的時段
    if (startHour % 1 !== 0) {
      slots -= 1;
    }

    // 如果結束時間不是整點，需要減去最後一個不完整的時段
    if (endHour % 1 !== 0) {
      slots -= 1;
    }

    return slots;
  };

  // 計算每日出租時段數量（共用函數）
  const calculateDailyOccupiedSlots = occupancyRate => {
    const dailySlots = calculateDailyTimeSlots();
    return Math.floor(dailySlots * occupancyRate);
  };

  // 計算一個月的收益
  const calculateMonthlyRevenue = () => {
    const dailySlots = calculateDailyTimeSlots();
    const monthlyDays = 30; // 假設一個月30天
    const occupancyRate = settings.occupancyRate;
    const cleaningFeeRate = settings.cleaningFeeRate;

    const results = ROOMS.map(room => {
      // 每日可用時段
      const dailyAvailableSlots = dailySlots;

      // 每日實際出租時段（考慮租用率）
      const dailyOccupiedSlots = calculateDailyOccupiedSlots(occupancyRate);

      // 每日基本收入
      const dailyBaseRevenue = dailyOccupiedSlots * (room.price / 2); // 每個時段是每小時價格的一半

      // 每日清潔費支出
      const dailyCleaningFee = dailyBaseRevenue * cleaningFeeRate;

      // 每日淨收入
      const dailyNetRevenue = dailyBaseRevenue - dailyCleaningFee;

      // 一個月淨收入
      const monthlyNetRevenue = dailyNetRevenue * monthlyDays;

      return {
        roomName: room.name,
        dailyAvailableSlots,
        dailyOccupiedSlots,
        dailyBaseRevenue,
        dailyCleaningFee,
        dailyNetRevenue,
        monthlyNetRevenue,
        price: room.price,
      };
    });

    return results;
  };

  const revenueData = calculateMonthlyRevenue();
  const totalMonthlyRevenue = revenueData.reduce(
    (sum, room) => sum + room.monthlyNetRevenue,
    0
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Calculator className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">收益分析計算器</h2>
          <p className="text-sm text-gray-600">
            基於租用率和清潔費支出的淨收益計算
          </p>
        </div>
      </div>

      {/* 基本參數 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              每日可用時段
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-800">
            {calculateDailyTimeSlots()}
          </p>
          <p className="text-xs text-blue-600">
            {settings.startHour.toString().padStart(2, '0')}:00 -{' '}
            {settings.endHour.toString().padStart(2, '0')}:00，每
            {settings.intervalMinutes}分鐘
          </p>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">租用率</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={Math.round(settings.occupancyRate * 100)}
                onChange={e =>
                  handleSettingChange(
                    'occupancyRate',
                    parseInt(e.target.value) / 100
                  )
                }
                className="w-20 px-2 py-1 text-sm border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
              <span className="text-sm text-yellow-600">%</span>
              <span className="text-sm text-yellow-500">
                ({calculateDailyOccupiedSlots(settings.occupancyRate)} 時段)
              </span>
            </div>
            <p className="text-2xl font-bold text-yellow-800">
              {Math.round(settings.occupancyRate * 100)}%
            </p>
            <p className="text-xs text-yellow-600">每日實際出租率</p>
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              清潔費率
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={Math.round(settings.cleaningFeeRate * 1000) / 10}
                onChange={e =>
                  handleSettingChange(
                    'cleaningFeeRate',
                    parseFloat(e.target.value) / 100
                  )
                }
                className="w-20 px-2 py-1 text-sm border border-purple-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <span className="text-sm text-purple-600">%</span>
            </div>
            <p className="text-2xl font-bold text-purple-800">
              {Math.round(settings.cleaningFeeRate * 1000) / 10}%
            </p>
            <p className="text-xs text-purple-600">每次出租的支出比例</p>
          </div>
        </div>
      </div>

      {/* 房間收益詳情 */}
      <div className="space-y-4 mb-6">
        {revenueData.map((room, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {room.roomName}
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">每日租出幾個時段</p>
                <p className="font-medium text-gray-900">
                  {room.dailyOccupiedSlots}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">每日基本收入</p>
                <p className="font-medium text-gray-900">
                  NT$ {room.dailyBaseRevenue.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">每日清潔費支出</p>
                <p className="font-medium text-gray-900">
                  NT$ {room.dailyCleaningFee.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">每日淨收入</p>
                <p className="font-medium text-gray-900">
                  NT$ {room.dailyNetRevenue.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  一個月淨收入：
                </span>
                <span className="text-xl font-bold text-green-600">
                  NT$ {room.monthlyNetRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 總收益 */}
      <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-100">一個月總收益</p>
            <p className="text-xs text-green-200">所有房間合計（扣除清潔費）</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">
              NT$ {totalMonthlyRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-green-100">
              平均每日 NT$ {(totalMonthlyRevenue / 30).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 總清潔費支出 */}
        <div className="mt-3 pt-3 border-t border-green-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">
                一個月總清潔費支出
              </p>
              <p className="text-xs text-green-200">所有房間清潔費合計</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-100">
                NT${' '}
                {revenueData
                  .reduce((sum, room) => sum + room.dailyCleaningFee * 30, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-green-200">
                平均每日 NT${' '}
                {revenueData
                  .reduce((sum, room) => sum + room.dailyCleaningFee, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* 總基本收入（不含清潔費） */}
        <div className="mt-3 pt-3 border-t border-green-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">
                一個月總基本收入
              </p>
              <p className="text-xs text-green-200">
                所有房間基本收入合計（不含清潔費）
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-100">
                NT${' '}
                {revenueData
                  .reduce((sum, room) => sum + room.dailyBaseRevenue * 30, 0)
                  .toLocaleString()}
              </p>
              <p className="text-sm text-green-200">
                平均每日 NT${' '}
                {revenueData
                  .reduce((sum, room) => sum + room.dailyBaseRevenue, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueCalculator;
