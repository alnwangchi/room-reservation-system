import { onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../config/firebase';
import { userService } from '../services/firestore';

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
  console.log('🚀 ~ AuthProvider ~ userProfile:', userProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const value = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === 'admin',
    isUser: userProfile?.role === 'user',
    updateUserProfile: setUserProfile, // 提供更新使用者資料的函數
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
