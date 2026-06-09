import { useEffect, useState } from 'react';
import api from '../utils/api';
import DistrictCard from './DistrictCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export default function ArtistDistrictExplorer({ onClose }) {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/api/explore/districts').then(res => setDistricts(res.data)).catch(console.error);
  }, []);

  const fetchArtists = async (district) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/artists/by-district/${district.name}`);
      setArtists(res.data);
      setSelectedDistrict(district);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><FontAwesomeIcon icon={faTimes} /></button>
        <h2 className="text-2xl font-bold mb-4">Explore Artists by District</h2>
        {!selectedDistrict ? (
          <div className="districts-grid">
            {districts.map(d => (
              <DistrictCard key={d.id} district={d} onClick={() => fetchArtists(d)} />
            ))}
          </div>
        ) : (
          <div>
            <button className="back-button" onClick={() => setSelectedDistrict(null)}>← Back to districts</button>
            <h3 className="text-xl font-semibold mt-4">Artists in {selectedDistrict.name}</h3>
            {loading ? <div className="loading">Loading...</div> : (
              <div className="items-grid">
                {artists.map(artist => (
                  <div key={artist.id} className="artist-mini-card">
                    <img src={artist.image_url || '/artist-placeholder.png'} alt={artist.name} />
                    <div>
                      <h4>{artist.name}</h4>
                      <p>{artist.genre}</p>
                      <button>Follow</button>
                    </div>
                  </div>
                ))}
                {artists.length === 0 && <p>No artists in this district yet.</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}