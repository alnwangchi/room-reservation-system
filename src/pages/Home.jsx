import { useAppNavigate } from '@hooks';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Clock,
  Copy,
  CreditCard,
  Gift,
} from 'lucide-react';

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
          {/* 上課地點 */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">上課地點</h2>
            </div>
            <div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d903.6051801679506!2d121.53031706959824!3d25.053725598612747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a9673144c98b%3A0xca09d4b13d61e9b5!2zMTA0OTHlj7DljJfluILkuK3lsbHljYDlm5vlubPooZcxN-iZnw!5e0!3m2!1szh-TW!2stw!4v1759746296114!5m2!1szh-TW!2stw"
                width="100%"
                height="360"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="上課地點地圖"
              ></iframe>
            </div>
          </div>

          {/* 儲值說明 + 注意事項 兩欄布局 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* 儲值說明 */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:mb-0">
              <div className="flex items-center mb-6">
                <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-800">儲值說明</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    轉帳資訊
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">銀行：</span>808 玉山銀行
                    </p>
                    <div className="flex items-center">
                      <span className="font-medium">帳號：</span>
                      <div className="flex items-center space-x-2">
                        <span>1171979176757</span>
                        <button
                          onClick={() => copyToClipboard('1171979176757')}
                          className="p-1 hover:bg-blue-100 rounded transition-colors"
                          title="複製帳號"
                        >
                          <Copy className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    預訂流程
                  </h3>
                  <p className="text-sm text-gray-700">
                    完成轉帳後提供轉帳資訊傳至官方 line
                    待人員確認，確認後會立即為您儲值
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <Gift className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-gray-800 text-lg">
                      儲值優惠
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">最低金額：</span>200 點
                    </p>
                    <p>
                      <span className="font-medium">儲值優惠：</span>
                      儲值 2000 即贈 200 點
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    營業時間
                  </h3>
                  <div className="flex items-center text-sm text-gray-700">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>09:00-21:00</span>
                  </div>
                </div>
              </div>
            </div>
            {/* 空間預約注意事項 */}
            <div className="bg-white rounded-xl shadow-lg p-6 md:mb-0">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-800">
                  空間預約注意事項
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    1. 預約方式
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700 ml-4">
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      請於本網站完成預約及付款，方視為成功預訂。
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      建議提前天預約，避免臨時無法排定。
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    2. 取消與更改
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700 ml-4">
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      如需取消或更改，請務必透過官方LINE帳號聯繫處理，恕不接受口頭或私訊通知。
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      更改預約請先取消，再重新預約。
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    3. 使用規範
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700 ml-4">
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      請依預約時段準時進出，提前或延後將另計費用。
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      請保持場地整潔，禁止吸菸或進行危險行為，如有損壞需照價賠償。
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    4. 設備使用
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700 ml-4">
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      使用後請歸還原位並確認電源關閉。
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      提供飲水機。
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    5. 其他事項
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700 ml-4">
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      本空間保留接受或拒絕預約之權利。
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      如遇天災或不可抗力因素，將協助改期或全額退費。
                    </li>
                  </ul>
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
