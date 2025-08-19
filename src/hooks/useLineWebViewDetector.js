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
      const isInApp = /FBAN|FBAV|Instagram|LINE|WeChat|MicroMessenger/i.test(
        ua
      );

      // 檢測是否為 LINE 內建瀏覽器
      const isLineApp =
        /Line/i.test(ua) && (/Mobile/i.test(ua) || /App/i.test(ua));

      // 任何一種情況都被視為需要跳轉的環境
      const isRestrictedWebView = isLine || (isWebView && isInApp) || isLineApp;

      console.log('User Agent:', ua);
      console.log('LINE WebView Detection:', {
        isLine,
        isWebView,
        isInApp,
        isLineApp,
        isRestrictedWebView,
      });

      setIsLineWebView(isRestrictedWebView);
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
        // iOS 設備：多種方式嘗試跳轉
        // 方法1: 嘗試 Universal Link
        window.open(currentUrl, '_blank');

        // 方法2: 延遲後嘗試 Safari scheme
        setTimeout(() => {
          try {
            window.location.href = `x-web-search://?${encodeURIComponent(currentUrl)}`;
          } catch (e) {
            // 方法3: 直接重定向
            window.location.href = currentUrl;
          }
        }, 1500);
      } else if (isAndroid) {
        // Android 設備：改良的 Intent 處理
        const host = window.location.host;
        const path =
          window.location.pathname +
          window.location.search +
          window.location.hash;

        // 多種 Intent 方式
        const intents = [
          // Chrome Intent
          `intent://${host}${path}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`,
          // Firefox Intent
          `intent://${host}${path}#Intent;scheme=https;package=org.mozilla.firefox;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`,
          // Generic browser Intent
          `intent://${host}${path}#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`,
        ];

        // 嘗試第一個 Intent
        window.location.href = intents[0];

        // 備用方案
        setTimeout(() => {
          window.open(currentUrl, '_blank') ||
            (window.location.href = currentUrl);
        }, 2000);
      } else {
        // 其他設備：使用 window.open 或直接跳轉
        if (!window.open(currentUrl, '_blank')) {
          window.location.href = currentUrl;
        }
      }
    } catch (error) {
      console.error('跳轉外部瀏覽器失敗:', error);
      // 最後的備用方案：複製 URL 到剪貼板
      try {
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('網址已複製到剪貼板，請手動貼到外部瀏覽器中開啟');
        });
      } catch (clipboardError) {
        // 如果剪貼板 API 也失敗，提示使用者手動複製
        alert(`請手動複製此網址到外部瀏覽器：\n${window.location.href}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openInSafari = useCallback(() => {
    const currentUrl = window.location.href;
    const ua = navigator.userAgent;

    if (/iPhone|iPad|iPod/i.test(ua)) {
      // iOS: 嘗試多種方式打開 Safari
      try {
        // 方法1: 使用 window.open
        if (!window.open(currentUrl, '_blank')) {
          // 方法2: 直接跳轉
          window.location.href = currentUrl;
        }
      } catch (error) {
        window.location.href = currentUrl;
      }
    } else {
      // 非 iOS 設備直接跳轉
      window.location.href = currentUrl;
    }
  }, []);

  const openInChrome = useCallback(() => {
    const currentUrl = window.location.href;
    const ua = navigator.userAgent;

    if (/iPhone|iPad|iPod/i.test(ua)) {
      // iOS: Chrome URL scheme
      const chromeUrl = `googlechrome://${currentUrl.replace(/^https?:\/\//, '')}`;
      window.location.href = chromeUrl;

      // 備用方案：如果 Chrome 未安裝，跳轉到 Safari
      setTimeout(() => {
        window.location.href = currentUrl;
      }, 1000);
    } else if (/Android/i.test(ua)) {
      // Android: Chrome Intent
      const host = window.location.host;
      const path =
        window.location.pathname +
        window.location.search +
        window.location.hash;
      const intentUrl = `intent://${host}${path}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(currentUrl)};end`;
      window.location.href = intentUrl;
    } else {
      // 其他設備：嘗試開啟新視窗或直接跳轉
      if (!window.open(currentUrl, '_blank')) {
        window.location.href = currentUrl;
      }
    }
  }, []);

  return {
    isLineWebView,
    isLoading,
    openExternal,
    openInSafari,
    openInChrome,
  };
}
