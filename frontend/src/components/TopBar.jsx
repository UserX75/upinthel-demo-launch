import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TopBar() {
  const navigate = useNavigate();
  const { user, userRole, openLoginModal, logout } = useAuth();

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.trim();
      if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="top-bar">
      <div className="search-wrapper">
        <input type="text" placeholder="🔍 Search artists, art, music, fashion..." className="global-search" onKeyDown={handleSearch} />
      </div>
      <div className="profile-wrapper">
        {user ? (
          <div className="user-info">
            <span>{user.email}</span>
            {userRole === 'premium' && <span className="premium-badge">Premium</span>}
            <button onClick={() => { console.log("Logout button clicked"); logout(); }}>Logout</button>
          </div>
        ) : (
          <button className="profile-icon" onClick={openLoginModal}>👤</button>
        )}
      </div>
    </div>
  );
}