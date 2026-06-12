import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function AdStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/ad-stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading ad stats...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ad Campaign Performance</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Advertiser</th>
              <th className="p-2 border">CPM (M)</th>
              <th className="p-2 border">Impressions</th>
              <th className="p-2 border">Est. Revenue (M)</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(ad => (
              <tr key={ad.id}>
                <td className="p-2 border">{ad.advertiser}</td>
                <td className="p-2 border">{ad.cpm}</td>
                <td className="p-2 border">{ad.impressions}</td>
                <td className="p-2 border">{ad.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}