import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getNavRoutes } from '../config/routes';
import { useAuth } from '../contexts/AuthContext';
import { useHintDialog } from '../contexts/HintDialogContext';
import { authService } from '../services/auth';
import NavItem from './NavItem';
import UserInfo from './UserInfo';

function Navigation() {
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

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  const handleMobileLogout = () => {
    handleLogout();
    closeMobileMenu();
  };

  // 使用路由配置生成導航項目
  const navItems = getNavRoutes(isAuthenticated, isAdmin);

  return (
    <nav className="bg-secondary-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <NavItem to="/" isActive={isActive('/')}>
              <span className="text-white text-lg sm:text-xl md:text-2xl font-bold hover:text-primary-300 transition-colors duration-200">
                房間預訂系統
              </span>
            </NavItem>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-4 lg:space-x-8">
            {navItems.map(item => (
              <NavItem
                key={item.path}
                to={item.path}
                isActive={isActive(item.path)}
                show={true}
              >
                {item.label}
              </NavItem>
            ))}

            {isAuthenticated ? (
              <li className="flex items-center space-x-3">
                <UserInfo userProfile={userProfile} onLogout={handleLogout} />
              </li>
            ) : (
              <NavItem to="/login" isActive={isActive('/login')}>
                登入
              </NavItem>
            )}
          </ul>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-primary-300 focus:outline-none focus:text-primary-300 transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 sm:pb-8">
            <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3 bg-secondary-700 rounded-lg mt-2">
              {navItems.map(item => (
                <NavItem
                  key={item.path}
                  to={item.path}
                  isActive={isActive(item.path)}
                  isMobile
                  show
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </NavItem>
              ))}

              {isAuthenticated ? (
                <UserInfo
                  userProfile={userProfile}
                  onLogout={handleMobileLogout}
                  isMobile={true}
                />
              ) : (
                <NavItem
                  to="/login"
                  isActive={isActive('/login')}
                  isMobile={true}
                  onClick={closeMobileMenu}
                >
                  登入
                </NavItem>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
