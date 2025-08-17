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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '跳轉中...' : '自動跳轉到外部瀏覽器'}
          </button>

          <div className="flex space-x-2">
            <button
              onClick={openInSafari}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
            >
              Safari
            </button>
            <button
              onClick={openInChrome}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Chrome
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          如果自動跳轉失敗，請手動複製網址到外部瀏覽器開啟
        </p>
      </div>
    </div>
  );
}
