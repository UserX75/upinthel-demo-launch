import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getCurrentUser } from '../utils/auth';

const API_BASE = import.meta.env.VITE_API_URL || '';

const BrandDiscoverModal = ({ onClose }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    axios.get(`${API_BASE}/api/brands/discover`)
      .then(res => setBrands(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = async (brandId) => {
    if (!user) {
      alert('Please log in to follow brands.');
      return;
    }
    try {
      await axios.post(`/api/follows/brands?user_id=${user.id}&brand_id=${brandId}`);
      alert('Followed!');
      // Optionally refresh follow list (if we had one)
    } catch (err) {
      console.error(err);
      alert('Failed to follow.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✖</button>
        <h3>Discover New Brands (Most Traction)</h3>
        {loading ? <div>Loading...</div> : (
          <div className="items-grid">
            {brands.map(brand => (
              <div key={brand.id} className="culture-card">
                <img src={brand.logo_url || 'https://via.placeholder.com/150'} alt={brand.name} />
                <h3>{brand.name}</h3>
                <p>{brand.description?.slice(0, 80)}</p>
                <button onClick={() => handleFollow(brand.id)}>Follow</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandDiscoverModal;