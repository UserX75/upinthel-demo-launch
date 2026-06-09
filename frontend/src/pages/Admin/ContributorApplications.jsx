import { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ContributorApplications() {
  const [apps, setApps] = useState([]);

  useEffect(() => { fetchApps(); }, []);

  const fetchApps = async () => {
    const res = await api.get('/api/admin/contributor-applications');
    setApps(res.data);
  };

  const handleApprove = async (id) => {
    await api.post(`/api/admin/contributor-applications/${id}/approve`);
    toast.success('Approved');
    fetchApps();
  };

  const handleReject = async (id) => {
    await api.post(`/api/admin/contributor-applications/${id}/reject`);
    toast.success('Rejected');
    fetchApps();
  };

  return (
    <div>
      <h1>Contributor Applications</h1>
      <table className="w-full border">
        <thead><tr><th>User</th><th>Types</th><th>Primary</th><th>Actions</th></tr></thead>
        <tbody>
          {apps.map(app => (
            <tr key={app.id}>
              <td>{app.user_id}</td>
              <td>{app.contributor_types.join(', ')}</td>
              <td>{app.primary_type}</td>
              <td>
                <button onClick={() => handleApprove(app.id)} className="bg-green-500 text-white px-2 py-1 mr-2">Approve</button>
                <button onClick={() => handleReject(app.id)} className="bg-red-500 text-white px-2 py-1">Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}