import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHeart, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ClothingItemModal.css';

export default function ClothingItemModal({ item, onClose }) {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      type: 'fashion',
      name: item.name,
      price: item.price,
      image: item.image_url,
      designer: item.fashion_brands?.name || 'Unknown Brand',
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Login to like');
      return;
    }
    // Optimistic update + API call (similar to art)
    try {
      await api.post('/api/fashion/like', { clothing_id: item.id, user_id: user.id });
      toast.success('Liked!');
    } catch (err) {
      toast.error('Failed to like');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="clothing-modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="clothing-modal-grid">
          <div className="clothing-modal-image">
            <img src={item.image_url} alt={item.name} />
          </div>
          <div className="clothing-modal-info">
            <h2>{item.name}</h2>
            <p className="brand">by {item.fashion_brands?.name}</p>
            <p className="price">M{item.price}</p>
            <p className="description">{item.description || 'No description available.'}</p>
            <div className="clothing-modal-actions">
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