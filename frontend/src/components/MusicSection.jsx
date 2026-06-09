import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChartLine, faChevronUp, faChevronDown, faMapMarkerAlt, faHeart } from '@fortawesome/free-solid-svg-icons';
import ArtistCard from './ArtistCard';
import ArtistModal from './ArtistModal';
import ArtistDistrictExplorer from './ArtistDistrictExplorer';
import './CultureSection.css';

export default function MusicSection() {
  const { user } = useAuth();   // ✅ user defined
  const { playSong } = useMusicPlayer();
  const [topSongs, setTopSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChartCollapsed, setIsChartCollapsed] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showDistrictExplorer, setShowDistrictExplorer] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/api/music/top30'), api.get('/api/artists')])
      .then(([songsRes, artistsRes]) => {
        setTopSongs(songsRes.data);
        setArtists(artistsRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/api/follows')
        .then(res => {
          const followedMap = new Set(res.data.map(f => f.artist_id));
          setArtists(prev => prev.map(artist => ({
            ...artist,
            is_followed: followedMap.has(artist.id)
          })));
          setFollowedArtists(res.data);
        })
        .catch(console.error);
    }
  }, [user]);

  const handleFollowChange = (artistId, isFollowed) => {
    setArtists(prev => prev.map(a => a.id === artistId ? { ...a, is_followed: isFollowed } : a));
    if (isFollowed) {
      const followed = artists.find(a => a.id === artistId);
      setFollowedArtists(prev => [...prev, { artist_id: artistId, artists: followed }]);
    } else {
      setFollowedArtists(prev => prev.filter(f => f.artist_id !== artistId));
    }
  };

  const handlePlay = (song) => playSong(song);

  if (loading) return <div className="loading">Loading music...</div>;

  return (
    <div>
      {/* Top 30 Chart */}
      <div className="music-top30">
        <div className="chart-header" onClick={() => setIsChartCollapsed(!isChartCollapsed)} style={{ cursor: 'pointer' }}>
          <FontAwesomeIcon icon={faChartLine} /> Top 30 Most Played
          <span className="collapse-icon"><FontAwesomeIcon icon={isChartCollapsed ? faChevronDown : faChevronUp} /></span>
        </div>
        {!isChartCollapsed && (
          <div className="chart-list">
            {topSongs.map((song, idx) => (
              <div key={song.id} className="chart-item">
                <div className="chart-rank">#{idx + 1}</div>
                <div className="chart-info">
                  <div className="song-title">{song.title}</div>
                  <div className="artist-name">{song.artists?.name || 'Unknown'}</div>
                </div>
                <div className="chart-stats"><span className="stream-count">🎧 {song.stream_count || 0}</span></div>
                <div className="chart-actions">
                  <button className="play-btn" onClick={() => handlePlay(song)}><FontAwesomeIcon icon={faPlay} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Artists You Follow (only if user logged in) */}
      {user && (
        <div className="followed-artists-section">
          <h3 className="section-title"><FontAwesomeIcon icon={faHeart} /> Artists You Follow</h3>
          {followedArtists.length === 0 ? (
            <p className="text-gray-500">You aren't following any artists yet.</p>
          ) : (
            <div className="items-grid">
              {followedArtists.map(f => (
                <ArtistCard key={f.artist_id} artist={f.artists} onSelect={setSelectedArtist} onFollowChange={handleFollowChange} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Artists */}
      <div className="artists-header">
        <h3 className="section-title">🎤 All Artists</h3>
        <button className="explore-districts-btn" onClick={() => setShowDistrictExplorer(true)}>
          <FontAwesomeIcon icon={faMapMarkerAlt} /> Explore by District
        </button>
      </div>
      <div className="items-grid">
        {artists.map(artist => (
          <ArtistCard key={artist.id} artist={artist} onSelect={setSelectedArtist} onFollowChange={handleFollowChange} />
        ))}
      </div>

      {selectedArtist && <ArtistModal artist={selectedArtist} onClose={() => setSelectedArtist(null)} />}
      {showDistrictExplorer && <ArtistDistrictExplorer onClose={() => setShowDistrictExplorer(false)} />}
    </div>
  );
}