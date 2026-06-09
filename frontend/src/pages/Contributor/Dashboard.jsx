import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import api from '../../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faPalette, faShirt, faMusic, faBuilding, faCalendar, faDollarSign, faCog } from '@fortawesome/free-solid-svg-icons';

export default function ContributorDashboard() {
  const [balance, setBalance] = useState(0);
  const { user, userRole, verificationStatus } = useAuth();

  useEffect(() => {
    api.get('/api/contributor/stats').then(res => setBalance(res.data.available_balance)).catch(console.error);
  }, []);

  const menu = [
    { path: '/contributor', label: 'Overview', icon: faTachometerAlt, exact: true },
    { path: '/contributor/art', label: 'Art', icon: faPalette },
    { path: '/contributor/fashion', label: 'Fashion', icon: faShirt },
    { path: '/contributor/music', label: 'Music', icon: faMusic },
    { path: '/contributor/architecture', label: 'Architecture', icon: faBuilding },
    { path: '/contributor/events', label: 'Events', icon: faCalendar },
    { path: '/contributor/earnings', label: 'Earnings', icon: faDollarSign },
    { path: '/contributor/settings', label: 'Settings', icon: faCog },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 font-bold text-lg">Contributor Portal</div>
        <nav>
          {menu.map(item => (
            <Link key={item.path} to={item.path} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100">
              <FontAwesomeIcon icon={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      {userRole === 'premium' && verificationStatus !== 'verified' && (
        <div className="warning-banner">
          ⚠️ You are not yet verified for payouts. Please complete your verification.
        </div>
      )}
      <div className="flex-1 p-6">
        <div className="bg-white p-4 rounded shadow mb-6">
          <h3>Available Balance</h3>
          <p className="text-2xl font-bold">M{balance.toFixed(2)}</p>
          <Link to="/contributor/request-payout" className="text-sm text-blue-600">Request Payout →</Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}