import React from 'react';
import RevenueCalculator from './RevenueCalculator';

function RevenueAnalysis() {
  return (
    <div className="p-6">
      {/* 收益計算器 */}
      <RevenueCalculator />

      {/* 額外說明 */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">計算說明</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">基本假設</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 營業時間：每日 09:00 - 21:00</li>
              <li>• 時段間隔：依房間類型設定</li>
              <li>• 租用率：30%（可根據實際情況調整）</li>
              <li>• 清潔費：每次出租收取 5%</li>
              <li>• 計算週期：一個月（30天）</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-2">收益構成</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 基本租金：時段數量 × 房間單價（每時段）</li>
              <li>• 清潔費用：基本租金 × 5%</li>
              <li>• 總收益：基本租金 + 清潔費用</li>
              <li>• 月度收益：日收益 × 30天</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueAnalysis;
