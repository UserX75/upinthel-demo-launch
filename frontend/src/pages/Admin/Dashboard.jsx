import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import TrendingManager from './TrendingManager';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    if (user?.is_super_admin) fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId, isAdmin, isSuperAdmin = false) => {
    try {
      await api.post('/api/admin/set-admin', {
        user_id: userId,
        is_admin: isAdmin,
        is_super_admin: isSuperAdmin,
      });
      toast.success('Admin status updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed');
    }
  };

  const removeAdmin = async (userId) => {
    if (!confirm('Remove admin privileges?')) return;
    try {
      await api.delete(`/api/admin/remove-admin?user_id=${userId}`);
      toast.success('Admin removed');
      fetchUsers();
    } catch (err) {
      toast.error('Failed');
    }
  };

  if (!user?.is_super_admin) return <div className="text-center p-4">You do not have permission to access this page.</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex gap-2 border-b mb-4">
        <button className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-blue-600' : ''}`} onClick={() => setActiveTab('users')}>User Management</button>
        <button className={`px-4 py-2 ${activeTab === 'trending' ? 'border-b-2 border-blue-600' : ''}`} onClick={() => setActiveTab('trending')}>Trending Manager</button>
        {/* Add more tabs (Ads, etc.) */}
      </div>

      {activeTab === 'users' && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Manage Admins</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="w-full border">
              <thead className="bg-gray-100">
                <tr><th className="p-2 border">Email</th><th className="p-2 border">Name</th><th className="p-2 border">Admin</th><th className="p-2 border">Super Admin</th><th className="p-2 border">Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="p-2 border">{u.email}</td>
                    <td className="p-2 border">{u.full_name || '-'}</td>
                    <td className="p-2 border">{u.is_admin ? '✅' : '❌'}</td>
                    <td className="p-2 border">{u.is_super_admin ? '✅' : '❌'}</td>
                    <td className="p-2 border">
                      {!u.is_super_admin && (
                        <>
                          <button onClick={() => toggleAdmin(u.id, !u.is_admin)} className="bg-blue-500 text-white px-2 py-1 mr-2 rounded">
                            {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                          {u.is_admin && (
                            <button onClick={() => toggleAdmin(u.id, true, true)} className="bg-gold-500 text-black px-2 py-1 mr-2 rounded">
                              Make Super Admin
                            </button>
                          )}
                          {u.is_admin && (
                            <button onClick={() => removeAdmin(u.id)} className="bg-red-500 text-white px-2 py-1 rounded">Remove</button>
                          )}
                        </>
                      )}
                      {u.is_super_admin && <span className="text-gray-500">Super Admin (cannot modify)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'trending' && <TrendingManager />}
    </div>
  );
}