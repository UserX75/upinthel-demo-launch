import { useEffect, useState } from 'react';
import api from '../utils/api';   // <-- use api instead of axios
import Carousel from './Carousel';
import ArtItemModal from './ArtItemModal';
import VisualArtistModal from './VisualArtistModal';
import './ArtSection.css';

export default function ArtSection() {
  const [artworks, setArtworks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [selectedArt, setSelectedArt] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [artRes, artistRes] = await Promise.all([
        api.get('/api/art'),
        api.get('/api/visual-artists'),
      ]);
      setArtworks(artRes.data);
      setArtists(artistRes.data);
    } catch (err) {
      console.error('Error fetching art data:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderArtCard = (art) => (
    <div className="art-card">
      <img src={art.image_url} alt={art.title} />
      <h4>{art.title}</h4>
      <p>M{art.price}</p>
    </div>
  );

  const renderArtistCard = (artist) => (
    <div className="artist-card">
      <img src={artist.image_url} alt={artist.name} />
      <h4>{artist.name}</h4>
      {artist.bio && <p>{artist.bio.slice(0, 60)}</p>}
    </div>
  );

  if (loading) return <div className="loading">Loading art...</div>;

  return (
    <div>
      <h3 className="section-title">Featured Artworks</h3>
      <Carousel
        items={artworks}
        renderItem={renderArtCard}
        itemsPerView={3}
        autoSlideInterval={4000}
        onItemClick={(art) => setSelectedArt(art)}
      />

      <h3 className="section-title">Visual Artists</h3>
      <Carousel
        items={artists}
        renderItem={renderArtistCard}
        itemsPerView={3}
        autoSlideInterval={6000}
        onItemClick={(artist) => setSelectedArtist(artist)}
      />

      {selectedArt && <ArtItemModal item={selectedArt} onClose={() => setSelectedArt(null)} />}
      {selectedArtist && <VisualArtistModal artist={selectedArtist} onClose={() => setSelectedArtist(null)} />}
    </div>
  );
}