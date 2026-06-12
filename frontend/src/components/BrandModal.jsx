import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHeart, faImages, faTag, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Carousel from './Carousel';
import './BrandModal.css';

export default function BrandModal({ brand, onClose }) {
  const { user } = useAuth();
  const [followed, setFollowed] = useState(brand.is_followed || false);
  const [items, setItems] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrandData();
  }, []);

  const fetchBrandData = async () => {
    try {
      const [itemsRes, galleryRes] = await Promise.all([
        api.get(`/api/fashion/brands/${brand.id}/items`),
        api.get(`/api/fashion/brands/${brand.id}/gallery`),
      ]);
      setItems(itemsRes.data);
      setGallery(galleryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error('Login to follow');
      return;
    }
    const newFollowed = !followed;
    setFollowed(newFollowed);
    try {
      if (newFollowed) {
        await api.post('/api/follows/brands', { brand_id: brand.id });
      } else {
        await api.delete('/api/follows/brands', { params: { brand_id: brand.id } });
      }
      toast.success(newFollowed ? 'Following' : 'Unfollowed');
    } catch (err) {
      setFollowed(!newFollowed);
      toast.error('Action failed');
    }
  };

  const renderGalleryItem = (img) => (
    <img src={img.image_url} alt={img.caption} className="brand-gallery-img" />
  );

  const renderItemCard = (item) => (
    <div className="brand-item-card">
      <img src={item.image_url} alt={item.name} />
      <p>{item.name}</p>
      <span>M{item.price}</span>
    </div>
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="brand-modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="brand-modal-content">
          <div className="brand-header">
            <img src={brand.logo_url} alt={brand.name} className="brand-logo" />
            <div>
              <h2>
                {brand.name}
                {brand.is_verified && (
                  <span className="verified-badge">
                    <FontAwesomeIcon icon={faCheckCircle} /> Verified
                  </span>
                )}
              </h2>
              <p>{brand.description}</p>
              <button className={`follow-btn ${followed ? 'active' : ''}`} onClick={handleFollow}>
                <FontAwesomeIcon icon={faHeart} /> {followed ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>

          {gallery.length > 0 && (
            <div className="brand-gallery">
              <h3><FontAwesomeIcon icon={faImages} /> Gallery</h3>
              <Carousel items={gallery} renderItem={renderGalleryItem} itemsPerView={3} autoSlideInterval={5000} />
            </div>
          )}

          {items.length > 0 && (
            <div className="brand-items">
              <h3><FontAwesomeIcon icon={faTag} /> Collection</h3>
              <Carousel items={items} renderItem={renderItemCard} itemsPerView={3} autoSlideInterval={6000} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}