import { User } from 'lucide-react';
import React from 'react';

function UserInfo({ userProfile, onLogout, isMobile = false }) {
  const buttonClasses = isMobile
    ? 'block w-full text-left px-3 py-2 rounded-md text-base font-medium text-secondary-200 hover:bg-secondary-600 hover:text-white transition-colors duration-200'
    : 'px-3 py-2 rounded-md text-sm font-medium text-secondary-200 hover:bg-secondary-700 hover:text-white transition-colors duration-200';

  const welcomeClasses = isMobile
    ? 'px-3 py-2 text-secondary-200 text-sm pt-3 flex items-center gap-2'
    : 'text-secondary-200 text-sm flex items-center gap-2';

  const displayName =
    userProfile?.displayName || userProfile?.email?.split('@')[0];
  const photoURL = userProfile?.photoURL;

  return (
    <>
      <div className={welcomeClasses}>
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0">
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          )}
        </div>
        <span>{displayName}</span>
      </div>
      <button onClick={onLogout} className={buttonClasses}>
        登出
      </button>
    </>
  );
}

export default UserInfo;
