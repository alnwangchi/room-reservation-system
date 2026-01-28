import GoogleLoginButton from '@components/GoogleLoginButton';
import { useAuth } from '@contexts/AuthContext';
import { useHintDialog } from '@contexts/HintDialogContext';
import { useAppNavigate } from '@hooks';
import { useLineWebViewDetector } from '@hooks/useLineWebViewDetector';
import { authService } from '@services/auth';
import { useEffect, useState } from 'react';

// Google 登入錯誤訊息映射
const GOOGLE_LOGIN_ERROR_MESSAGES = {
  'auth/popup-closed-by-user': '登入視窗被關閉，請重新嘗試',
  'auth/popup-blocked': '登入視窗被阻擋，請允許彈出視窗',
  'auth/network-request-failed': '網路連線失敗，請檢查網路設定',
  'auth/unauthorized-domain': '此網域未被授權進行 Google 登入',
  disallowed_useragent: '目前的瀏覽器環境不支援 Google 登入，請使用外部瀏覽器',
};

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { goToHome } = useAppNavigate();
  const { toggleHintDialog } = useHintDialog();
  const { isAuthenticated, loading } = useAuth();
  const { isLineWebView } = useLineWebViewDetector();

  // 監聽認證狀態變化，登入成功後自動跳轉
  useEffect(() => {
    if (isAuthenticated && !loading) {
      goToHome();
    }
  }, [isAuthenticated, loading, goToHome]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authService.loginWithGoogle();
      // 登入成功後，AuthContext 會自動更新狀態，useEffect 會處理跳轉
    } catch (error) {
      console.error('Google 登入失敗:', error);
      let errorMessage = 'Google 登入失敗，請稍後再試';

      // 使用 mapping 變數查找錯誤訊息
      if (error.code && GOOGLE_LOGIN_ERROR_MESSAGES[error.code]) {
        errorMessage = GOOGLE_LOGIN_ERROR_MESSAGES[error.code];
      } else if (
        error.message &&
        error.message.includes('disallowed_useragent')
      ) {
        errorMessage = GOOGLE_LOGIN_ERROR_MESSAGES['disallowed_useragent'];
      }

      toggleHintDialog({
        title: '登入失敗',
        desc: errorMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 如果正在載入或已經認證，顯示載入狀態
  if (loading || isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white py-8 px-6 shadow-xl rounded-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">處理中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <GoogleLoginButton
            onLogin={handleGoogleLogin}
            isLoading={isLoading}
          />

          {/* LINE WebView 跳轉提示 */}
          {isLineWebView && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-center">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  檢測到 LINE 內建瀏覽器
                </h3>
                <p className="text-xs text-yellow-700 mb-3">
                  為了正常進行 Google 登入，請使用外部瀏覽器開啟
                </p>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const currentUrl = window.location.href;
                        const ua = navigator.userAgent;
                        if (/iPhone|iPad|iPod/i.test(ua)) {
                          // iOS 設備：強制在新視窗開啟以跳轉到外部瀏覽器
                          try {
                            // 嘗試在新視窗開啟，這通常會強制使用外部瀏覽器
                            const newWindow = window.open(currentUrl, '_blank');

                            // 如果無法開啟新視窗，嘗試使用 Safari URL scheme
                            if (!newWindow) {
                              // 使用 Safari 的 URL scheme
                              const safariUrl = `x-web-search://?${encodeURIComponent(currentUrl)}`;
                              window.location.href = safariUrl;

                              // 延遲後如果還在當前頁面，嘗試直接跳轉
                              setTimeout(() => {
                                if (
                                  !document.hidden &&
                                  !document.webkitHidden
                                ) {
                                  window.location.href = currentUrl;
                                }
                              }, 2000);
                            }
                          } catch (error) {
                            // 如果出錯，直接跳轉
                            window.location.href = currentUrl;
                          }
                        } else if (/Android/i.test(ua)) {
                          // Android 設備嘗試跳轉到預設瀏覽器
                          window.open(currentUrl, '_blank') ||
                            (window.location.href = currentUrl);
                        } else {
                          // 其他設備直接跳轉
                          window.location.href = currentUrl;
                        }
                      }}
                      className="flex-1 bg-gray-600 text-white py-1.5 px-3 rounded text-xs hover:bg-gray-700 transition-colors"
                    >
                      Safari
                    </button>
                    <button
                      onClick={() => {
                        const currentUrl = window.location.href;
                        const ua = navigator.userAgent;
                        if (/iPhone|iPad|iPod/i.test(ua)) {
                          const chromeUrl = `googlechrome://${currentUrl.replace(/^https?:\/\//, '')}`;
                          window.location.href = chromeUrl;
                          setTimeout(() => {
                            window.location.href = currentUrl;
                          }, 1000);
                        } else if (/Android/i.test(ua)) {
                          const host = window.location.host;
                          const path =
                            window.location.pathname +
                            window.location.search +
                            window.location.hash;
                          const intentUrl = `intent://${host}${path}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`;
                          window.location.href = intentUrl;
                        } else {
                          window.open(currentUrl, '_blank') ||
                            (window.location.href = currentUrl);
                        }
                      }}
                      className="flex-1 bg-green-600 text-white py-1.5 px-3 rounded text-xs hover:bg-green-700 transition-colors"
                    >
                      Chrome
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">請使用 Google 帳戶登入</p>
            {!isLineWebView && (
              <p className="text-sm text-gray-600">
                Line 內建瀏覽器若無法登入，請使用 safari 登入
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
