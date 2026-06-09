import { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/admin/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    await api.post(`/api/admin/notifications/${id}/read`);
    fetchNotifications();
  };

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map(notif => (
            <li key={notif.id} className={`p-3 border rounded ${notif.is_read ? 'bg-gray-50' : 'bg-white'}`}>
              <p>{notif.message}</p>
              {notif.link && <a href={notif.link} className="text-blue-600 text-sm">View →</a>}
              {!notif.is_read && (
                <button onClick={() => markAsRead(notif.id)} className="ml-4 text-sm text-gray-500">Mark as read</button>
              )}
              <span className="text-xs text-gray-400 block mt-1">{new Date(notif.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}