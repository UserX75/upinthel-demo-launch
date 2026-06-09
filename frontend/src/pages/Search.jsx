import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPalette, faMusic, faUser, faShirt, faCalendar, faNewspaper, faBuilding, faMapMarkerAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './Search.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      fetchResults();
    } else {
      console.log('Search results:', res.data);
      setResults([]);
    }
  }, [searchQuery]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'art': return faPalette;
      case 'music': return faMusic;
      case 'artist': return faUser;
      case 'fashion': return faShirt;
      case 'event': return faCalendar;
      case 'news': return faNewspaper;
      case 'business': return faBuilding;
      default: return faMapMarkerAlt;
    }
  };

  const handleResultClick = (result) => {
    // Navigate to appropriate page based on type
    switch (result.type) {
      case 'art':
        navigate('/culture', { state: { tab: 'art', itemId: result.id } });
        break;
      case 'music':
        navigate('/culture', { state: { tab: 'music', itemId: result.id } });
        break;
      case 'artist':
        navigate('/culture', { state: { tab: 'music', artistId: result.id } });
        break;
      case 'fashion':
        navigate('/culture', { state: { tab: 'fashion', itemId: result.id } });
        break;
      case 'event':
        navigate('/events', { state: { eventId: result.id } });
        break;
      case 'news':
        navigate('/news', { state: { articleId: result.id } });
        break;
      case 'business':
        navigate('/business', { state: { businessId: result.id } });
        break;
      default:
        // fallback to explore or home
        navigate('/explore');
    }
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <h1>Search Results</h1>
        <p>Showing results for: <strong>“{searchQuery}”</strong></p>
      </div>

      {loading ? (
        <div className="loading">Searching...</div>
      ) : results.length === 0 ? (
        <div className="no-results">
          <FontAwesomeIcon icon={faSearch} />
          <h3>No results found</h3>
          <p>Try different keywords or browse our categories.</p>
        </div>
      ) : (
        <div className="results-grid">
          {results.map((item, idx) => (
            <div key={`${item.type}-${item.id}-${idx}`} className="result-card" onClick={() => handleResultClick(item)}>
              <div className="result-icon">
                <FontAwesomeIcon icon={getIcon(item.type)} />
              </div>
              <div className="result-info">
                <h3>{item.title}</h3>
                {item.subtitle && <p>{item.subtitle}</p>}
                <span className="result-type">{item.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}