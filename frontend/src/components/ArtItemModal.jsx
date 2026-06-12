import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHeart, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './ArtItemModal.css';

export default function ArtItemModal({ item, onClose }) {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      type: 'art',
      name: item.title,
      price: item.price,
      image: item.image_url,
      artist: item.visual_artists?.name || 'Unknown',
    });
    toast.success(`Added ${item.title} to cart`);
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Login to like');
      return;
    }
    try {
      await api.post('/api/art/like', { art_id: item.id, user_id: user.id });
      toast.success('Liked!');
    } catch (err) {
      toast.error('Failed to like');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="art-modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="art-modal-grid">
          <div className="art-modal-image">
            <img src={item.image_url} alt={item.title} />
          </div>
          <div className="art-modal-info">
            <h2>{item.title}</h2>
            <p className="artist">by {item.visual_artists?.name || 'Unknown'}</p>
            <p className="price">M{item.price}</p>
            <p className="description">{item.description || 'No description available.'}</p>
            <div className="art-modal-actions">
              <button className="like-btn" onClick={handleLike}>
                <FontAwesomeIcon icon={faHeart} /> Like
              </button>
              <button className="cart-btn" onClick={handleAddToCart}>
                <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}