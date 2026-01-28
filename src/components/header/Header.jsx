import logo from '@/assets/logo.jpg';
import NavItem from '@components/header/NavItem';
import UserInfo from '@components/header/UserInfo';
import { getNavRoutes } from '@config/routes';
import { useAuth } from '@contexts/AuthContext';
import { useHintDialog } from '@contexts/HintDialogContext';
import { authService } from '@services/auth';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userProfile, isAuthenticated, isAdmin } = useAuth();
  const { toggleHintDialog } = useHintDialog();

  const isActive = path => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      toggleHintDialog({
        title: '登出成功',
        desc: '您已成功登出',
        type: 'success',
      });
    } catch (error) {
      console.error('登出失敗:', error);
      toggleHintDialog({
        title: '登出失敗',
        desc: '登出時發生錯誤，請稍後再試',
        type: 'error',
      });
    }
  };

  return (
    <header className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img src={logo} alt="Logo" className="h-12 w-auto" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <nav className="flex space-x-2">
              {getNavRoutes().map(route => (
                <NavItem
                  key={route.path}
                  to={route.path}
                  isActive={isActive(route.path)}
                  show={route.showNav && (!route.adminOnly || isAdmin)}
                >
                  {route.label}
                </NavItem>
              ))}
            </nav>

            {/* User Info and Logout */}
            {isAuthenticated && (
              <div className="flex items-center space-x-4">
                <UserInfo userProfile={userProfile} />
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  登出
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-4 py-3 space-y-1">
            {getNavRoutes().map(route => (
              <NavItem
                key={route.path}
                to={route.path}
                isActive={isActive(route.path)}
                isMobile
                onClick={() => setIsMenuOpen(false)}
                show={route.showNav && (!route.adminOnly || isAdmin)}
              >
                {route.label}
              </NavItem>
            ))}
          </div>

          {isAuthenticated && (
            <div className="px-4 py-3 border-t border-gray-100">
              <UserInfo userProfile={userProfile} isMobile />
              <button
                onClick={handleLogout}
                className="mt-3 w-full text-left text-sm text-gray-600 hover:text-gray-900"
              >
                登出
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
