import { CreditCard } from 'lucide-react';

function BalanceCard({ balance, showFullContentOnMobile = false }) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg px-4 py-2 text-white flex gap-2 justify-between md:block">
      <div className="flex items-center justify-between">
        <span
          className={`${showFullContentOnMobile ? '' : 'hidden sm:block'} text-sm font-medium mr-2`}
        >
          儲值餘額
        </span>
        <CreditCard className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold">{balance.toLocaleString()}</div>
    </div>
  );
}

export default BalanceCard;
