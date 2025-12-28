import { auth } from '@config/firebase';
import { DEV_ACCOUNT } from '@constants';
import { userService } from '@services/firestore';
import { isDev } from '@utils';
import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 檢查是否啟用開發模式自動登入
    const enableDevAutoLogin =
      isDev() && import.meta.env.VITE_ENABLE_DEV_AUTO_LOGIN !== 'false';

    // 開發模式下自動登入
    if (enableDevAutoLogin) {
      console.log('🔧 開發模式：使用預設開發者帳號自動登入');
      setUser(DEV_ACCOUNT.user);
      setUserProfile(DEV_ACCOUNT.profile);
      setLoading(false);
      return;
    }

    // 正常模式：使用 Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);

      if (user) {
        // 從 Firestore 獲取使用者資料
        userService
          .getUserByEmail(user.email)
          .then(async profile => {
            setUserProfile(profile);

            // 更新最後登入時間
            if (profile) {
              try {
                await userService.updateLastLogin(profile.id);
              } catch (error) {
                console.error('Error updating last login time:', error);
              }
            }
          })
          .catch(error => {
            console.error('Error fetching user profile:', error);
            setUserProfile(null);
          });
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 計算 isAdmin 狀態
  const isAdmin = userProfile?.role === 'admin';
  const isUser = userProfile?.role === 'user';

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    isUser,
    updateUserProfile: setUserProfile, // 提供更新使用者資料的函數
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
