import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { firestoreService } from '../services/firestore';
import { isEmpty } from '../utils';

function CancelBookingRecord() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);
        setError('');
        // 只獲取最近 12 筆取消記錄，依 canceledAt 倒序排序
        const data = await firestoreService.query(
          'cancelBookingRecords',
          [],
          { field: 'canceledAt', direction: 'desc' },
          12
        );
        setRecords(data);
      } catch (e) {
        setError('載入取消紀錄失敗');
        console.error('Failed to load cancel booking records:', e);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, []);

  const formatTs = value => {
    try {
      const d = value?.toDate ? value.toDate() : value;
      if (!d) return '-';
      return dayjs(d).format('YYYY-MM-DD HH:mm');
    } catch {
      return '-';
    }
  };

  if (isEmpty(records)) {
    return (
      <div className="p-6 text-center text-gray-600">目前沒有任何取消紀錄</div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-medium text-gray-900">取消預約紀錄</h3>
          <span className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md">
            最近 12 筆
          </span>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-600">載入中...</div>
      ) : error ? (
        <div className="p-6 text-center text-red-600">{error}</div>
      ) : records.length === 0 ? (
        <div className="p-6 text-center text-gray-600">
          目前沒有任何取消紀錄
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  編號
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  取消時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  預訂日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  時段
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  教室
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  預訂者
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record, index) => {
                const bd = record.bookingDetail || {};
                return (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTs(record.canceledAt || record.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span>{record.operatorDisplayName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bd.date || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bd.startTime || '-'}
                      {bd.endTime ? ` - ${bd.endTime}` : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bd.roomName || bd.roomId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bd.booker || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CancelBookingRecord;
