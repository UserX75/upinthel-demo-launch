import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';   // <-- added import
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

export default function ArtSection() {
  const { user } = useAuth();
  const { addToCart } = useCart();   // <-- use cart hook
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 6;

  useEffect(() => {
    fetchArtworks();
  }, [search, offset, user]);

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const params = { limit, offset, search, user_id: user?.id };
      const res = await api.get('/api/art', { params });
      setArtworks(res.data);
    } catch (err) {
      toast.error('Failed to load art');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (artId) => {
    if (!user) {
      toast.error('Please login to like');
      return;
    }
    // Optimistic update
    setArtworks(prev => prev.map(art =>
      art.id === artId ? { ...art, user_liked: true, likes_count: (art.likes_count || 0) + 1 } : art
    ));
    try {
      await api.post('/api/art/like', { art_id: artId, user_id: user.id });
      toast.success('Liked!');
    } catch (err) {
      // revert on error
      setArtworks(prev => prev.map(art =>
        art.id === artId ? { ...art, user_liked: false, likes_count: (art.likes_count || 1) - 1 } : art
      ));
      toast.error('Failed to like');
    }
  };

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      type: 'art',
      name: item.title,
      price: item.price,
      image: item.image_url,
      artist: item.visual_artists?.name,
    });
    toast.success(`Added ${item.title} to cart`);
  };

  if (loading) return <div className="loading">Loading art...</div>;

  return (
    <div>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search art by title or artist..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
        />
      </div>
      <div className="items-grid">
        {artworks.map(art => (
          <div key={art.id} className="culture-card">
            <img src={art.image_url || 'https://via.placeholder.com/300'} alt={art.title} />
            <h3>{art.title}</h3>
            <p className="artist">{art.visual_artists?.name || 'Unknown artist'}</p>
            <p className="description">{art.description?.slice(0, 80)}</p>
            <p className="price">M{art.price}</p>
            <div className="card-actions">
              {art.user_liked ? (
                <button className="like-btn liked" disabled>
                  <FontAwesomeIcon icon={faHeart} /> Liked ({art.likes_count || 0})
                </button>
              ) : (
                <button className="like-btn" onClick={() => handleLike(art.id)}>
                  <FontAwesomeIcon icon={faHeart} /> Like ({art.likes_count || 0})
                </button>
              )}
              <button onClick={() => handleAddToCart(art)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0}>← Previous</button>
        <button onClick={() => setOffset(offset + limit)} disabled={artworks.length < limit}>Next →</button>
      </div>
    </div>
  );
}