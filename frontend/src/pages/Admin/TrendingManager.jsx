import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function TrendingManager() {
  const { user } = useAuth();
  const [pinned, setPinned] = useState([]);
  const [searchType, setSearchType] = useState('art');
  const [searchId, setSearchId] = useState('');
  const [priority, setPriority] = useState(0);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPinned();
  }, []);

  const fetchPinned = async () => {
    try {
      const res = await api.get('/api/admin/pinned-items');
      setPinned(res.data);
    } catch (err) {
      toast.error('Failed to load pinned items');
    } finally {
      setLoading(false);
    }
  };

  const handlePin = async () => {
    if (!searchId) return toast.error('Enter item ID');
    try {
      await api.post('/api/admin/pin-item', {
        item_type: searchType,
        item_id: searchId,
        priority: priority,
        expires_at: expiresAt || null,
      });
      toast.success('Item pinned');
      fetchPinned();
      setSearchId('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Pin failed');
    }
  };

  const handleUnpin = async (type, id) => {
    try {
      await api.delete(`/api/admin/unpin-item?item_type=${type}&item_id=${id}`);
      toast.success('Unpinned');
      fetchPinned();
    } catch (err) {
      toast.error('Unpin failed');
    }
  };

  if (!user?.is_admin && !user?.is_super_admin) return <div className="text-center p-4">Admin access required.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Trending Manager</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-2">Pin New Item</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={searchType} onChange={e => setSearchType(e.target.value)} className="p-2 border rounded">
            <option value="art">Art</option>
            <option value="music">Music</option>
            <option value="fashion">Fashion</option>
            <option value="food">Food</option>
            <option value="accommodation">Accommodation</option>
          </select>
          <input
            type="text"
            placeholder="Item UUID"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Priority (higher = first)"
            value={priority}
            onChange={e => setPriority(parseInt(e.target.value))}
            className="p-2 border rounded"
          />
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            className="p-2 border rounded"
          />
        </div>
        <button onClick={handlePin} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Pin Item
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Currently Pinned Items</h2>
        {loading ? (
          <p>Loading...</p>
        ) : pinned.length === 0 ? (
          <p>No pinned items.</p>
        ) : (
          <ul className="divide-y">
            {pinned.map(item => (
              <li key={item.id} className="py-2 flex justify-between items-center">
                <div>
                  <strong>{item.item_type}</strong> – {item.item_id} (priority {item.priority})
                  {item.expires_at && <span className="text-sm text-gray-500 ml-2">expires: {new Date(item.expires_at).toLocaleString()}</span>}
                </div>
                <button onClick={() => handleUnpin(item.item_type, item.item_id)} className="bg-red-600 text-white px-3 py-1 rounded">
                  Unpin
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}