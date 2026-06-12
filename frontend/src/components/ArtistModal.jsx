import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlay, faHeart, faUser, faMusic } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import './ArtistModal.css';

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
      if (newFollowed) {
        await api.post('/api/follows', { artist_id: artist.id });
      } else {
        await api.delete('/api/follows', { params: { artist_id: artist.id } });
      }
      toast.success(newFollowed ? 'Followed' : 'Unfollowed');
    } catch (err) {
      setFollowed(!newFollowed);
      toast.error('Action failed');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="artist-modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <div className="artist-modal-content">
          <div className="artist-modal-header">
            <img
              src={artist.image_url || '/artist-placeholder.png'}
              alt={artist.name}
              className="artist-avatar-large"
            />
            <div className="artist-header-info">
              <h2>{artist.name}</h2>
              <p className="artist-bio">{artist.bio || 'No bio available.'}</p>
              <button
                className={`modal-follow-btn ${followed ? 'active' : ''}`}
                onClick={handleFollow}
              >
                <FontAwesomeIcon icon={faHeart} /> {followed ? 'Followed' : 'Follow Artist'}
              </button>
            </div>
          </div>
          {songs.length > 0 && (
            <div className="artist-songs">
              <h3><FontAwesomeIcon icon={faMusic} /> Songs</h3>
              <div className="songs-list">
                {songs.map(song => (
                  <div key={song.id} className="song-item">
                    <div className="song-info">
                      {song.cover_image && (
                        <img src={song.cover_image} alt={song.title} className="song-cover" />
                      )}
                      <div>
                        <div className="song-title">{song.title}</div>
                        <div className="song-streams">🎧 {song.stream_count || 0} streams</div>
                      </div>
                    </div>
                    <button className="song-play-btn" onClick={() => playSong(song)}>
                      <FontAwesomeIcon icon={faPlay} /> Play
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}