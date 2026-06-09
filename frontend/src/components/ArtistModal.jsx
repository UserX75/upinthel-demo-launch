import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlay, faHeart, faUser, faMusic, faCalendarAlt, faHeadphones } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ArtistModal({ artist, onClose }) {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [followed, setFollowed] = useState(artist.is_followed || false);
  const { playSong } = useMusicPlayer();

  useEffect(() => {
    api.get(`/api/artists/${artist.id}/songs`).then(res => setSongs(res.data)).catch(console.error);
  }, [artist]);

  const handleFollow = async () => {
    if (!user) {
      toast.error('Login to follow');
      return;
    }
    const newFollowed = !followed;
    setFollowed(newFollowed);
    try {
      await api.post('/api/artists/follow', { artist_id: artist.id, user_id: user.id });
      toast.success(newFollowed ? 'Followed' : 'Unfollowed');
    } catch (err) {
      setFollowed(!newFollowed);
      toast.error('Action failed');
    }
  };

  return (
    <div className="modal-overlay artist-modal-overlay" onClick={onClose}>
      <div className="modal-container artist-modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
        
        {/* Hero Banner */}
        <div className="artist-modal-banner" style={{ backgroundImage: `url(${artist.cover_image || artist.image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'})` }}>
          <div className="banner-overlay"></div>
        </div>

        <div className="artist-modal-content">
          {/* Avatar & Header */}
          <div className="artist-modal-header">
            <img src={artist.image_url || '/artist-placeholder.png'} alt={artist.name} className="artist-avatar" />
            <div>
              <h1>{artist.name}</h1>
              <p className="artist-genre"><FontAwesomeIcon icon={faHeadphones} /> {artist.genre || 'Various'}</p>
              <button className={`follow-premium-btn ${followed ? 'active' : ''}`} onClick={handleFollow}>
                <FontAwesomeIcon icon={faHeart} /> {followed ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="artist-bio-section">
            <h3>About</h3>
            <p>{artist.bio || 'No bio available yet.'}</p>
          </div>

          {/* Songs */}
          <div className="artist-songs-section">
            <h3><FontAwesomeIcon icon={faMusic} /> Popular Songs</h3>
            <div className="songs-grid">
              {songs.map(song => (
                <div key={song.id} className="song-card" onClick={() => playSong(song)}>
                  <div className="song-cover">
                    <img src={song.cover_image || artist.image_url || '/album-placeholder.png'} alt={song.title} />
                    <div className="song-play-overlay">
                      <FontAwesomeIcon icon={faPlay} />
                    </div>
                  </div>
                  <div className="song-info">
                    <div className="song-title">{song.title}</div>
                    <div className="song-streams">{song.stream_count || 0} plays</div>
                  </div>
                </div>
              ))}
            </div>
            {songs.length === 0 && <p className="no-songs">No songs available for this artist yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}