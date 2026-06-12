import { useState, useEffect } from 'react';
import api from '../utils/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faHeart, faPalette, faImage } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Carousel from './Carousel';
import './VisualArtistModal.css';

export default function VisualArtistModal({ artist, onClose }) {
  const { user } = useAuth();
  const [followed, setFollowed] = useState(false);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtworks();
  }, []);

  const fetchArtworks = async () => {
    try {
      const res = await api.get(`/api/visual-artists/${artist.id}/artworks`);
      setArtworks(res.data);
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
    // Implement follow endpoint if needed (optional)
    toast.info('Follow artist – coming soon');
  };

  const renderArtworkCard = (art) => (
    <div className="artist-artwork-card">
      <img src={art.image_url} alt={art.title} />
      <p>{art.title}</p>
      <span>M{art.price}</span>
    </div>
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="artist-modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="artist-modal-content">
          <div className="artist-header">
            <img src={artist.image_url} alt={artist.name} className="artist-avatar" />
            <div>
              <h2>{artist.name}</h2>
              <p>{artist.bio}</p>
              <button className="follow-btn" onClick={handleFollow}>
                <FontAwesomeIcon icon={faHeart} /> Follow
              </button>
            </div>
          </div>
          {artworks.length > 0 && (
            <div className="artist-artworks">
              <h3><FontAwesomeIcon icon={faImage} /> Artworks</h3>
              <Carousel items={artworks} renderItem={renderArtworkCard} itemsPerView={3} autoSlideInterval={5000} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}