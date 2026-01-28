import PageBar from '@components/PageBar';
import RevenueAnalysis from '@components/revenue/RevenueAnalysis';
import RevenueManage from '@components/revenue/RevenueManage';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { BarChart3, TrendingUp } from 'lucide-react';

function RevenueManagement() {
  const tabs = [
    {
      name: '實際營收',
      icon: TrendingUp,
      content: <RevenueManage />,
    },
    {
      name: '收益分析',
      icon: BarChart3,
      content: <RevenueAnalysis />,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* 頁面標題 */}
      <PageBar
        title="收益管理"
        description="收益分析與實際營收管理"
        icon={BarChart3}
        iconBgColor="bg-green-100"
        iconColor="text-green-600"
      />

      {/* 主要內容區域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <TabGroup defaultIndex={0}>
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

export default RevenueManagement;
