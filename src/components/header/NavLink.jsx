import { Link } from 'react-router-dom';

function NavLink({ to, children, isActive, isMobile = false, onClick }) {
  const baseClasses = isMobile
    ? 'block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 w-full'
    : 'px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200';

  const activeClasses = isMobile
    ? 'bg-secondary-600 text-white'
    : 'bg-secondary-700 text-white';

  const inactiveClasses = isMobile
    ? 'text-secondary-200 hover:bg-secondary-600 hover:text-white'
    : 'text-secondary-200 hover:bg-secondary-700 hover:text-white';

  const className = `${baseClasses} ${
    isActive ? activeClasses : inactiveClasses
  }`;

  return (
    <Link to={to} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export default NavLink;
