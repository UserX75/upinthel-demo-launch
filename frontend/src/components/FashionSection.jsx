import { useEffect, useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import BrandDiscoverModal from './BrandDiscoverModal';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import './CultureSection.css';
import api from '../utils/api';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function FashionSection() {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [followedBrands, setFollowedBrands] = useState([]);
  const [showDiscover, setShowDiscover] = useState(false);
  const limit = 6;

  useEffect(() => {
    fetchFashion();
    if (user) fetchFollowedBrands();
  }, [search, offset, user]);

  const fetchFashion = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/fashion`, { params: { limit, offset, search } });
      setItems(res.data);
    } catch (error) {
      console.error('Error fetching fashion:', error);
    }
  };

  const fetchFollowedBrands = async () => {
    const res = await axios.get(`/api/follows/brands/${user.id}`);
    setFollowedBrands(res.data);
  };

  const handleLike = async (itemId) => {
    if (!user) {
      toast.error('Please login to like');
      return;
    }
    // Optimistically update the item to mark as liked and disable button
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, user_liked: true, likes_count: (item.likes_count || 0) + 1 } : item
    ));
    try {
      await axios.post(`${API_BASE}/api/fashion/like`, { clothing_id: itemId, user_id: user.id });
      toast.success('Liked!');
    } catch (err) {
      // revert on error
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, user_liked: false, likes_count: (item.likes_count || 1) - 1 } : item
      ));
      toast.error('Failed to like');
    }
  };

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      type: 'fashion',
      name: item.name,
      price: item.price,
      image: item.image_url,
      designer: item.fashion_brands?.name || 'Unknown',
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const handleFollow = async (brandId) => {
    if (!user) { toast.error('Please log in'); return; }
    await api.post(`/api/follows/brands?user_id=${user.id}&brand_id=${brandId}`);
    fetchFollowedBrands();
    toast.success('Brand followed');
  };

  const handleUnfollow = async (brandId) => {
    await api.delete(`/api/follows/brands?user_id=${user.id}&brand_id=${brandId}`);
    fetchFollowedBrands();
    toast.success('Unfollowed');
  };

  const handlePrev = () => setOffset(Math.max(0, offset - limit));
  const handleNext = () => setOffset(offset + limit);

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search fashion by name or designer..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
        />
      </div>

      <div className="items-grid">
        {items.map(item => (
          <div key={item.id} className="culture-card">
            <img src={item.image_url || 'https://via.placeholder.com/300'} alt={item.name} />
            <h3>{item.name}</h3>
            <p className="designer">by {item.fashion_brands?.name || 'Unknown brand'}</p>
            <p className="description">{item.description?.slice(0, 80)}</p>
            <p className="price">M{item.price}</p>
            <div className="card-actions">
              {item.user_liked ? (
                <button className="like-btn liked" disabled>
                  <FontAwesomeIcon icon={faHeart} /> Liked ({item.likes_count || 0})
                </button>
              ) : (
                <button className="like-btn" onClick={() => handleLike(item.id)}>
                  <FontAwesomeIcon icon={faHeart} /> Like ({item.likes_count || 0})
                </button>
              )}
              <button onClick={() => handleAddToCart(item)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={handlePrev} disabled={offset === 0}>← Previous</button>
        <button onClick={handleNext} disabled={items.length < limit}>Next →</button>
      </div>

      {user && (
        <div className="followed-brands">
          <h3>Brands You Follow</h3>
          <div className="items-grid">
            {followedBrands.map(f => (
              <div key={f.brand_id} className="culture-card">
                <img src={f.fashion_brands?.logo_url || 'https://via.placeholder.com/150'} alt={f.fashion_brands?.name} />
                <h4>{f.fashion_brands?.name}</h4>
                <button onClick={() => handleUnfollow(f.brand_id)}>Unfollow</button>
              </div>
            ))}
            {followedBrands.length === 0 && <p>You aren't following any brands yet.</p>}
          </div>
          <button className="explore-button" onClick={() => setShowDiscover(true)}>Discover New Brands</button>
        </div>
      )}

      {showDiscover && <BrandDiscoverModal onClose={() => setShowDiscover(false)} />}
    </div>
  );
}