import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { BookMinus, Calendar, Clock, Shield, Users } from 'lucide-react';
import { useState } from 'react';
import BookingManage from '../components/BookingManage';
import CancelBookingRecord from '../components/CancelBookingRecord';
import PageHeader from '../components/PageHeader';
import RoomManage from '../components/RoomManage';
import UserList from '../components/UserList';
import useGetUsers from '../hooks/useGetUsers';

function Admin() {
  const {
    allUsers: users,
    loadingUsers,
    error: errorUsers,
    refetch: handleRefreshUsers,
  } = useGetUsers();
  const [selectedRoomId, setSelectedRoomId] = useState('general-piano-room');

  const tabs = [
    {
      name: '使用者管理',
      icon: Users,
      content: (
        <UserList
          users={users}
          loading={loadingUsers}
          error={errorUsers}
          onRefresh={handleRefreshUsers}
        />
      ),
    },
    {
      name: '教室管理',
      icon: Calendar,
      content: (
        <RoomManage
          selectedRoomId={selectedRoomId}
          onRoomChange={setSelectedRoomId}
        />
      ),
    },
    {
      name: '預約管理',
      icon: Clock,
      content: <BookingManage />,
    },
    {
      name: '取消記錄',
      icon: BookMinus,
      content: <CancelBookingRecord />,
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
                    `relative flex-1 flex items-center justify-center sm:space-x-2 py-3 text-sm font-medium transition-colors ${
                      selected
                        ? 'text-indigo-600'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {() => (
                    <>
                      <tab.icon className="w-5 h-5" />
                      <span className="hidden sm:inline">{tab.name}</span>
                    </>
                  )}
                </Tab>
              ))}
            </TabList>
            <TabPanels className="min-h-[400px]">
              {tabs.map(tab => (
                <TabPanel key={tab.name} className="focus:outline-none p-6">
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
