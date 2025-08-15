import React from 'react';
import NavLink from './NavLink';

function NavItem({
  to,
  children,
  isActive,
  isMobile = false,
  onClick,
  show = true,
}) {
  if (!show) return null;

  return (
    <li className="flex items-center">
      <NavLink
        to={to}
        isActive={isActive}
        isMobile={isMobile}
        onClick={onClick}
      >
        {children}
      </NavLink>
    </li>
  );
}

export default NavItem;
