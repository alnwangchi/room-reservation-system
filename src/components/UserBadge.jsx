import React from 'react';

const UserBadge = ({ role }) => {
  const isAdmin = role === 'admin';

  const badgeClasses = isAdmin
    ? 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800'
    : 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800';

  const badgeText = isAdmin ? '管理員' : '一般用戶';

  return <span className={badgeClasses}>{badgeText}</span>;
};

export default UserBadge;
