import dayjs from 'dayjs';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { userService } from './firestore';

// 認證服務
export const authService = {
  // Google 登入
  async loginWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 檢查使用者是否已經在 Firestore 中存在
      const existingUser = await userService.getUserByEmail(user.email);

      if (!existingUser) {
        // 如果是新使用者，在 Firestore 中創建使用者文檔
        await userService.addUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          role: 'user', // 預設角色
          isActive: true,
          createdAt: dayjs().toDate(),
          photoURL: user.photoURL,
          provider: 'google',
          // 基本資料
          balance: 0,
          // 預訂房型統計時段數量
          totalBookings: {
            'general-piano-room': 0,
            'standard-recording-studio': 0,
            'multifunctional-meeting-space': 0,
          },
          lastLoginAt: dayjs().toDate(),
        });
      } else {
        // 如果使用者已存在，更新最後登入時間和頭像
        await userService.updateUser(existingUser.id, {
          lastLoginAt: dayjs().toDate(),
          photoURL: user.photoURL,
        });
      }

      return user;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      throw error;
    }
  },

  // 登出
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },

  // 更新使用者資料
  async updateProfile(updates) {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateProfile(user, updates);

        // 同時更新 Firestore 中的使用者資料
        const firestoreUser = await userService.getUserByEmail(user.email);
        if (firestoreUser) {
          await userService.updateUser(firestoreUser.id, updates);
        }
      } else {
        throw new Error('No user is currently signed in');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // 監聽認證狀態變化
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },
};

// 這邊只有登入的用戶訊息 主要會用 context 的 useAuth 才有他專案的中使用的資訊
export const useAuthFromGoogle = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(user => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
};
