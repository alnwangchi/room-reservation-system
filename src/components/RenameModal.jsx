import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '@contexts/AuthContext';
import { useHintDialog } from '@contexts/HintDialogContext';
import { userService } from '@services/firestore';

function RenameModal({ isOpen, onClose }) {
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, userProfile, updateUserProfile } = useAuth();
  const { toggleHintDialog } = useHintDialog();

  const isDisabled =
    !value.trim() ||
    isLoading ||
    value === (userProfile?.displayName || user?.displayName);

  const onSubmit = async () => {
    try {
      setIsLoading(true);

      // 1. 更新 Firebase Authentication 的 displayName
      await updateProfile(user, { displayName: value });

      // 2. 更新 Firestore 中的 userProfile
      if (userProfile?.id) {
        await userService.updateUser(userProfile.id, { displayName: value });

        // 3. 更新本地狀態
        const updatedProfile = { ...userProfile, displayName: value };
        updateUserProfile(updatedProfile);
      }

      toggleHintDialog({
        type: 'success',
        title: '更新成功',
        message: '名稱更新成功',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toggleHintDialog({
        type: 'error',
        title: '更新失敗',
        message: '更新名稱時發生錯誤，請稍後再試',
      });
    } finally {
      onClose();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 優先使用 userProfile 中的 displayName，如果沒有則使用 Firebase Auth 的 displayName
    setValue(userProfile?.displayName || user?.displayName || '');
  }, [user, userProfile]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        {/* 標題 + 關閉按鈕 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">更改名稱</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 輸入框 */}
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="輸入新名稱"
        />

        {/* 按鈕區 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={onSubmit}
            disabled={isDisabled}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              !isDisabled
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? '更新中...' : '確認'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RenameModal;
