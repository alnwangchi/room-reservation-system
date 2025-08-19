import React from 'react';
import { useLineWebViewDetector } from '../hooks/useLineWebViewDetector';

export function LineWebViewRedirect() {
  const { isLineWebView, isLoading, openExternal, openInSafari, openInChrome } =
    useLineWebViewDetector();

  if (!isLineWebView) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-red-500 mb-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            請用外部瀏覽器開啟
          </h2>
          <p className="text-gray-600 mb-4">
            LINE 內建瀏覽器無法進行 Google 登入，請使用外部瀏覽器繼續操作
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={openExternal}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                跳轉中...
              </div>
            ) : (
              '自動跳轉到外部瀏覽器'
            )}
          </button>

          <div className="flex space-x-2">
            <button
              onClick={openInSafari}
              disabled={isLoading}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm"
            >
              Safari
            </button>
            <button
              onClick={openInChrome}
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
            >
              Chrome
            </button>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href).then(() => {
                alert('網址已複製！請貼到外部瀏覽器中開啟');
              }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = window.location.href;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('網址已複製！請貼到外部瀏覽器中開啟');
              });
            }}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm"
          >
            📋 複製網址
          </button>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">
            <strong>為什麼需要跳轉？</strong>
          </p>
          <p className="text-xs text-gray-500">
            Google 安全政策不允許在 LINE 內建瀏覽器中進行登入驗證，需要使用外部瀏覽器才能正常登入。
          </p>
        </div>

        {/* 除錯資訊（僅在開發模式顯示） */}
        {import.meta.env.DEV && (
          <details className="mt-4">
            <summary className="text-xs text-gray-400 cursor-pointer">除錯資訊</summary>
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
              <div>User Agent: {navigator.userAgent}</div>
              <div className="mt-1">Location: {window.location.href}</div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
