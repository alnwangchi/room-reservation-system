import { useCallback, useEffect, useState } from 'react';

export function useLineWebViewDetector() {
  const [isLineWebView, setIsLineWebView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const detectLineWebView = () => {
      const ua = navigator.userAgent || navigator.vendor || window?.opera;

      // 更精確的 LINE WebView 檢測
      const isLine = /Line/i.test(ua);
      const isWebView = /WebView/i.test(ua) || /wv/i.test(ua);
      const isLineWebView = isLine && isWebView;

      setIsLineWebView(isLineWebView);
    };

    detectLineWebView();
  }, []);

  const openExternal = useCallback(async () => {
    setIsLoading(true);

    try {
      const ua = navigator.userAgent;
      const currentUrl = window.location.href;

      // 檢測設備類型
      const isIOS = /iPhone|iPad|iPod/i.test(ua);
      const isAndroid = /Android/i.test(ua);

      if (isIOS) {
        // iOS 設備：嘗試打開 Safari
        const safariUrl = `googlechrome://${currentUrl.replace(/^https?:\/\//, '')}`;

        // 先嘗試打開 Chrome，如果失敗則打開 Safari
        window.location.href = safariUrl;

        // 如果 Chrome 沒有安裝，延遲後嘗試 Safari
        setTimeout(() => {
          window.location.href = currentUrl;
        }, 1000);
      } else if (isAndroid) {
        // Android 設備：使用 Intent 打開 Chrome
        const intentUrl = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`;
        window.location.href = intentUrl;
      } else {
        // 其他設備：直接跳轉
        window.location.href = currentUrl;
      }
    } catch (error) {
      console.error('跳轉外部瀏覽器失敗:', error);
      // 如果所有方法都失敗，嘗試重新載入當前頁面
      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openInSafari = useCallback(() => {
    const currentUrl = window.location.href;
    window.location.href = currentUrl;
  }, []);

  const openInChrome = useCallback(() => {
    const currentUrl = window.location.href;
    const chromeUrl = `googlechrome://${currentUrl.replace(/^https?:\/\//, '')}`;
    window.location.href = chromeUrl;
  }, []);

  return {
    isLineWebView,
    isLoading,
    openExternal,
    openInSafari,
    openInChrome,
  };
}
