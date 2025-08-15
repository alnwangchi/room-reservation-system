import { BarChart3 } from 'lucide-react';
import React from 'react';
import PageHeader from '../components/PageHeader';
import RevenueCalculator from '../components/RevenueCalculator';

function RevenueAnalysis() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* 頁面標題 */}
      <PageHeader
        title="收益分析"
        description="基於當前房間配置和時段設定的收益預估分析"
        icon={BarChart3}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
      />

      <div className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 收益計算器 */}
          <RevenueCalculator />

          {/* 額外說明 */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              計算說明
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">基本假設</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 營業時間：每日 09:00 - 21:00</li>
                  <li>• 時段間隔：每 30 分鐘一個時段</li>
                  <li>• 租用率：30%（可根據實際情況調整）</li>
                  <li>• 清潔費：每次出租收取 5%</li>
                  <li>• 計算週期：一個月（30天）</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">收益構成</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 基本租金：時段數量 × 房間單價 ÷ 2</li>
                  <li>• 清潔費用：基本租金 × 5%</li>
                  <li>• 總收益：基本租金 + 清潔費用</li>
                  <li>• 月度收益：日收益 × 30天</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RevenueAnalysis;
