import { useEffect, useState } from 'react';

export function useLineWebViewDetector() {
  const [isLineWebView, setIsLineWebView] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window?.opera;
    setIsLineWebView(/Line/i.test(ua));
  }, []);

  const openExternal = () => {
    const ua = navigator.userAgent;
    const url = window.location.href;

    if (/iPhone|iPad|iPod/i.test(ua)) {
      window.location.href = url;
    } else if (/Android/i.test(ua)) {
      window.location.href = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
    }
  };

  if (isLineWebView) {
    return (
      <div style={{ padding: 20 }}>
        <h2>請用外部瀏覽器開啟</h2>
        <p>LINE 內建瀏覽器無法進行 Google 登入</p>
        <button onClick={openExternal}>用瀏覽器開啟</button>
      </div>
    );
  }
  return isLineWebView;
}
