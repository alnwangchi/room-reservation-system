import { userService } from '@services/firestore';
import { useEffect, useState } from 'react';

function useGetUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setError(null);
        const users = await userService.getAllUsers();
        setAllUsers(users);
      } catch (err) {
        console.error('Error loading users:', err);
        setError('載入使用者資料時發生錯誤');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  return {
    allUsers,
    loadingUsers,
    error,
    refetch: () => {
      setLoadingUsers(true);
      setError(null);
      userService
        .getAllUsers()
        .then(users => {
          setAllUsers(users);
        })
        .catch(err => {
          console.error('Error loading users:', err);
          setError('載入使用者資料時發生錯誤');
        })
        .finally(() => {
          setLoadingUsers(false);
        });
    },
  };
}

export default useGetUsers;
