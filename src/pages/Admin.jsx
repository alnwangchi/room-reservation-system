import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { Calendar, Clock, Shield, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import BookingManage from '../components/BookingManage';
import PageHeader from '../components/PageHeader';
import RoomManage from '../components/RoomManage';
import UserList from '../components/UserList';
import { userService } from '../services/firestore';

function Admin() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState('general-piano-room');

  // 載入所有用戶資料
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setErrorUsers(null);
        const allUsers = await userService.getAllUsers();
        setUsers(allUsers);
      } catch (err) {
        console.error('Error loading users:', err);
        setErrorUsers('載入用戶資料時發生錯誤');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  // 重新載入用戶資料的函數
  const handleRefreshUsers = async () => {
    try {
      setLoadingUsers(true);
      setErrorUsers(null);
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error('Error refreshing users:', err);
      setErrorUsers('重新載入用戶資料時發生錯誤');
    } finally {
      setLoadingUsers(false);
    }
  };

  const tabs = [
    {
      name: '使用者管理',
      icon: Users,
      content: (
        <div className="p-6">
          <UserList
            users={users}
            loading={loadingUsers}
            error={errorUsers}
            onRefresh={handleRefreshUsers}
          />
        </div>
      ),
    },
    {
      name: '教室管理',
      icon: Calendar,
      content: (
        <div className="p-6">
          <RoomManage
            selectedRoomId={selectedRoomId}
            onRoomChange={setSelectedRoomId}
          />
        </div>
      ),
    },
    {
      name: '預約管理',
      icon: Clock,
      content: (
        <div className="p-6">
          <BookingManage />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* 頁面標題 */}
      <PageHeader title="管理後台" description="系統管理與配置" icon={Shield} />

      {/* 主要內容區域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <TabGroup>
            <TabList className="flex border-b border-gray-200">
              {tabs.map(tab => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    `relative flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium transition-colors ${
                      selected
                        ? 'text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {() => (
                    <>
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </>
                  )}
                </Tab>
              ))}
            </TabList>
            <TabPanels className="min-h-[400px]">
              {tabs.map(tab => (
                <TabPanel key={tab.name} className="focus:outline-none">
                  {tab.content}
                </TabPanel>
              ))}
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
}

export default Admin;
