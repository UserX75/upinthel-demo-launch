import { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

export default function ArtistCard({ artist, onSelect, onFollowChange }) {
  const { user } = useAuth();
  const [followed, setFollowed] = useState(artist.is_followed || false);

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Login to follow');
      return;
    }
    const newFollowed = !followed;
    setFollowed(newFollowed);
    try {
      if (newFollowed) {
        await api.post('/api/follows', { artist_id: artist.id });
      } else {
        await api.delete('/api/follows', { params: { artist_id: artist.id } });
      }
      if (onFollowChange) onFollowChange(artist.id, newFollowed);
      toast.success(newFollowed ? 'Followed' : 'Unfollowed');
    } catch (err) {
      setFollowed(!newFollowed);
      toast.error('Action failed');
    }
  };

  return (
    <div className="artist-card" onClick={() => onSelect(artist)}>
      <div className="artist-image">
        <img src={artist.image_url || '/artist-placeholder.png'} alt={artist.name} />
      </div>
      <div className="artist-info">
        <h4>{artist.name}</h4>
        <p>{artist.genre || 'Various'}</p>
        <button className={`follow-btn ${followed ? 'active' : ''}`} onClick={handleFollow}>
          <FontAwesomeIcon icon={faHeart} /> {followed ? 'Followed' : 'Follow'}
        </button>
      </div>
    </div>
  );
}