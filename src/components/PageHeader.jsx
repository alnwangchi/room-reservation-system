import { ChevronLeft } from 'lucide-react';
import React from 'react';

function PageHeader({
  title,
  description,
  icon: Icon,
  iconBgColor = 'bg-indigo-100',
  iconColor = 'text-indigo-600',
  onBack,
  className = '',
}) {
  return (
    <div className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div
                className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-sm text-gray-500">{description}</p>
              )}
            </div>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              返回首頁
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
