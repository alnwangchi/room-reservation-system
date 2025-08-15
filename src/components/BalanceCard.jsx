import { CreditCard } from 'lucide-react';
import React from 'react';

function BalanceCard({ balance }) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 mb-6 text-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">儲值餘額</span>
        <CreditCard className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold">NT$ {balance.toLocaleString()}</div>
    </div>
  );
}

export default BalanceCard;
