import dayjs from 'dayjs';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { userService } from './firestore';

// 認證服務
export const authService = {
  // 註冊新使用者
  async register(email, password, displayName = '') {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 更新使用者顯示名稱
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // 在 Firestore 中創建使用者文檔
      await userService.addUser({
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName,
        role: 'user', // 預設角色
        isActive: true,
        createdAt: dayjs().toDate(), // 使用 dayjs 創建 Date 物件
      });

      return user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  // 尚未開放密碼登入
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

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
          balance: 100, // 初始儲值金 100 元
          totalBookings: {
            // 預訂房型統計時段數量
            'general-piano-room': 0,
            'standard-recording-studio': 0,
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

  // 重設密碼
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  },

  // 更新密碼
  async updatePassword(newPassword) {
    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, newPassword);
      } else {
        throw new Error('No user is currently signed in');
      }
    } catch (error) {
      console.error('Error updating password:', error);
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

  // 刪除使用者帳戶
  async deleteAccount() {
    try {
      const user = auth.currentUser;
      if (user) {
        // 先刪除 Firestore 中的使用者資料
        const firestoreUser = await userService.getUserByEmail(user.email);
        if (firestoreUser) {
          await userService.deleteUser(firestoreUser.id);
        }

        // 刪除 Firebase Auth 帳戶
        await deleteUser(user);
      } else {
        throw new Error('No user is currently signed in');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  // 獲取當前使用者
  getCurrentUser() {
    return auth.currentUser;
  },

  // 監聽認證狀態變化
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },
};

// 這邊只有的入的用戶訊息 主要會用 context 的 useAuth 才有他專案的中使用的資訊
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
