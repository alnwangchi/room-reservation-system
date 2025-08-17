import {
  ArrowRight,
  Calendar,
  Clock,
  Copy,
  CreditCard,
  Gift,
} from 'lucide-react';
import React from 'react';
import { useAppNavigate } from '../hooks';

function Home() {
  const { navigate } = useAppNavigate();

  const copyToClipboard = async text => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以在這裡添加提示訊息
    } catch (err) {
      console.error('複製失敗:', err);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 儲值說明 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-800">儲值說明</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">轉帳資訊</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">銀行：</span>808 玉山銀行
                    </p>
                    <div className="flex items-center">
                      <span className="font-medium">帳號：</span>
                      <div className="flex items-center space-x-2">
                        <span>1171979176757</span>
                        <button
                          onClick={() => copyToClipboard('1171979176757')}
                          className="p-1 hover:bg-blue-200 rounded transition-colors"
                          title="複製帳號"
                        >
                          <Copy className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-2">
                    預訂流程
                  </h3>
                  <p className="text-sm text-orange-700">
                    完成轉帳後提供轉帳資訊傳至官方 line
                    待人員確認，確認後會立即為您儲值
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Gift className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-green-800">儲值優惠</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">最低金額：</span>NT$ 200
                    </p>
                    <p>
                      <span className="font-medium">儲值優惠：</span>
                      儲值 2000 即贈 200元
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">營業時間</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>09:00-21:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 主要行動按鈕 */}
          <div className="text-center mb-12">
            <button
              onClick={() => navigate('/room-selection')}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center space-x-3 mx-auto shadow-lg hover:shadow-xl"
            >
              <Calendar className="w-6 h-6" />
              <span className="text-sm">開始預訂房間</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
