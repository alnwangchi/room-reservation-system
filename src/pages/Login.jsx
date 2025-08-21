import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHintDialog } from '../contexts/HintDialogContext';
import { useAppNavigate } from '../hooks';
import { useLineWebViewDetector } from '../hooks/useLineWebViewDetector';
import { authService } from '../services/auth';

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

      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = '登入視窗被關閉，請重新嘗試';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = '登入視窗被阻擋，請允許彈出視窗';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = '網路連線失敗，請檢查網路設定';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = '此網域未被授權進行 Google 登入';
      } else if (
        error.message &&
        error.message.includes('disallowed_useragent')
      ) {
        errorMessage = '目前的瀏覽器環境不支援 Google 登入，請使用外部瀏覽器';
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
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? '登入中...' : '使用 Google 帳戶登入'}
          </button>

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
