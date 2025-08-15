import React from 'react';

function UserInfo({ user, onLogout, isMobile = false }) {
  const buttonClasses = isMobile
    ? 'block w-full text-left px-3 py-2 rounded-md text-base font-medium text-secondary-200 hover:bg-secondary-600 hover:text-white transition-colors duration-200'
    : 'px-3 py-2 rounded-md text-sm font-medium text-secondary-200 hover:bg-secondary-700 hover:text-white transition-colors duration-200';

  const welcomeClasses = isMobile
    ? 'px-3 py-2 text-secondary-200 text-sm border-t border-secondary-600 pt-3'
    : 'text-secondary-200 text-sm';

  return (
    <>
      <div className={welcomeClasses}>
        歡迎，{user?.displayName || user?.email?.split('@')[0]}
      </div>
      <button onClick={onLogout} className={buttonClasses}>
        登出
      </button>
    </>
  );
}

export default UserInfo;
