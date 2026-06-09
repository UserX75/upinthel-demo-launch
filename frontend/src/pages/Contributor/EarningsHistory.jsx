import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function EarningsHistory() {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/contributor/earnings')
      .then(res => setEarnings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Loading earnings...</div>;

  if (earnings.length === 0) {
    return <div className="text-center py-8 text-gray-500">No earnings yet. Sales will appear here.</div>;
  }

  // Group earnings by month
  const monthly = {};
  earnings.forEach(e => {
    const month = new Date(e.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
    monthly[month] = (monthly[month] || 0) + e.net_earning;
  });

  const chartData = {
    labels: Object.keys(monthly),
    datasets: [{
      label: 'Net Earnings (M)',
      data: Object.values(monthly),
      borderColor: '#d4af37',
      backgroundColor: 'rgba(212,175,55,0.1)',
      fill: true,
      tension: 0.3,
    }],
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Earnings History</h2>
      <div className="mb-6">
        <Line data={chartData} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Source</th>
              <th className="p-2 border">Gross (M)</th>
              <th className="p-2 border">Commission (M)</th>
              <th className="p-2 border">Net (M)</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map(e => (
              <tr key={e.id} className="border-b">
                <td className="p-2 border">{new Date(e.created_at).toLocaleDateString()}</td>
                <td className="p-2 border">{e.source_type}</td>
                <td className="p-2 border">M{e.amount.toFixed(2)}</td>
                <td className="p-2 border">M{e.platform_commission.toFixed(2)}</td>
                <td className="p-2 border">M{e.net_earning.toFixed(2)}</td>
                <td className="p-2 border">{e.is_available ? '✅ Available' : '⏳ 7‑day hold'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}