import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import AdsCarousel from '../components/AdsCarousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faStar, faUser, faEnvelope, faCalendarAlt, faTag } from '@fortawesome/free-solid-svg-icons';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { user, userRole, openLoginModal } = useAuth();
  const [trending, setTrending] = useState([]);
  const [top35, setTop35] = useState([]);
  const [loading, setLoading] = useState(true);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [selectedTrending, setSelectedTrending] = useState(null);
  const [adsData, setAdsData] = useState([]);
  const [nominationSubmitting, setNominationSubmitting] = useState(false);
  const currentProfile = top35[spotlightIndex];
  
  const [nominationForm, setNominationForm] = useState({
    nominator_name: '',
    nominator_email: '',
    nominee_name: '',
    nominee_age: 18,
    nominee_field: '',
    reason: '',
  });

  useEffect(() => {
    api.get('/api/ads').then(res => setAdsData(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    Promise.all([api.get('/api/trending'), api.get('/api/top35')])
      .then(([trendingRes, top35Res]) => {
        setTrending(trendingRes.data);
        setTop35(top35Res.data);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (top35.length === 0) return;
    const interval = setInterval(() => {
      setSpotlightIndex(prev => (prev + 1) % top35.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [top35]);

  const handleGetInvolved = () => {
    if (!user) openLoginModal();
    else if (userRole !== 'premium') navigate('/upgrade');
    else navigate('/become-contributor');
  };

  const handleNominationChange = (e) => {
    setNominationForm({ ...nominationForm, [e.target.name]: e.target.value });
  };

  const handleNominationSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to nominate');
      openLoginModal();
      return;
    }
    if (!nominationForm.nominator_name || !nominationForm.nominee_name || !nominationForm.reason) {
      toast.error('Please fill all required fields');
      return;
    }
    setNominationSubmitting(true);
    try {
      await api.post('/api/nominations', nominationForm);
      toast.success('Nomination submitted! Thank you.');
      setNominationForm({
        nominator_name: '',
        nominator_email: '',
        nominee_name: '',
        nominee_age: 18,
        nominee_field: '',
        reason: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submission failed');
    } finally {
      setNominationSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="home">
      <div className="hero-banner">
        <h1>Welcome to UP IN THE L</h1>
        <p>Discover culture, creativity, and adventure – all in one place.</p>
        <button onClick={() => navigate('/explore')}>Start Exploring →</button>
      </div>

      <div className="home-layout">
        <div className="home-main">
          <section className="trending-section">
            <h2>Ls Hot Topics</h2>
            <div className="horizontal-scroll">
              {trending.map((item, idx) => (
                <div key={idx} className="trending-card" onClick={() => setSelectedTrending(item)}>
                  <div className="trending-category">{item.category}</div>
                  <div>{item.title}</div>
                </div>
              ))}
            </div>
          </section>

          {currentProfile && (
            <section className="spotlight-section">
              <div className="two-column-section">
                {/* Left column: Top 35 Under 35 (25%) */}
                <div className="top35-column">
                  {currentProfile && (
                    <div className="spotlight-card">
                      <div className="profile-img">{currentProfile.image_url || '👤'}</div>
                      <div className="spotlight-details">
                        <h3>{currentProfile.name}</h3>
                        <p className="field">{currentProfile.field} · Age {currentProfile.age}</p>
                        <p className="description">{currentProfile.description}</p>
                        <button>Connect</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right column: Ads Carousel (75%) */}
                <div className="ads-column">
                  <AdsCarousel ads={adsData} />
                </div>
              </div>

              {/* Dots (full width below both columns) */}
              <div className="carousel-dots full-width-dots">
                {top35.map((_, i) => (
                  <span key={i} className={i === spotlightIndex ? 'dot active' : 'dot'} onClick={() => setSpotlightIndex(i)} />
                ))}
              </div>
            </section>
          )}

          <section className="nomination-section">
            <div className="nomination-card">
              <div className="nomination-header">
                <FontAwesomeIcon icon={faStar} className="nomination-icon" />
                <h2>Nominate a Young Leader</h2>
                <p>Help us discover the next generation of Basotho entrepreneurs, artists, and changemakers.</p>
              </div>
              <form onSubmit={handleNominationSubmit} className="nomination-form">
                <div className="form-row">
                  <div className="form-group">
                    <label><FontAwesomeIcon icon={faUser} /> Your full name *</label>
                    <input type="text" name="nominator_name" value={nominationForm.nominator_name} onChange={handleNominationChange} required />
                  </div>
                  <div className="form-group">
                    <label><FontAwesomeIcon icon={faEnvelope} /> Your email</label>
                    <input type="email" name="nominator_email" value={nominationForm.nominator_email} onChange={handleNominationChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label><FontAwesomeIcon icon={faUser} /> Nominee's name *</label>
                    <input type="text" name="nominee_name" value={nominationForm.nominee_name} onChange={handleNominationChange} required />
                  </div>
                  <div className="form-group">
                    <label><FontAwesomeIcon icon={faCalendarAlt} /> Age</label>
                    <input type="number" name="nominee_age" min="18" max="35" value={nominationForm.nominee_age} onChange={handleNominationChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label><FontAwesomeIcon icon={faTag} /> Field / Industry *</label>
                  <select name="nominee_field" value={nominationForm.nominee_field} onChange={handleNominationChange} required>
                    <option value="">Select field</option>
                    <option value="Tech">Technology</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Music">Music</option>
                    <option value="Agribusiness">Agribusiness</option>
                    <option value="Retail">Retail</option>
                    <option value="Tourism">Tourism</option>
                    <option value="Media">Media</option>
                    <option value="Finance">Finance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Why should they be recognized? *</label>
                  <textarea name="reason" rows="4" value={nominationForm.reason} onChange={handleNominationChange} required></textarea>
                </div>
                <button type="submit" disabled={nominationSubmitting} className="nominate-btn">
                  <FontAwesomeIcon icon={faPaperPlane} /> {nominationSubmitting ? 'Submitting...' : 'Submit Nomination'}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>

      <section className="get-involved">
        <h2>Get Involved</h2>
        <div className="items-grid">
          <div className="get-involved-card">
            <h3>List your property</h3>
            <p>Reach travellers from around the world.</p>
            <button onClick={handleGetInvolved}>Get Started</button>
          </div>
          <div className="get-involved-card">
            <h3>Sell your music/art</h3>
            <p>Turn your passion into income.</p>
            <button onClick={handleGetInvolved}>Get Started</button>
          </div>
          <div className="get-involved-card">
            <h3>Create an event</h3>
            <p>Host workshops, concerts, or tours.</p>
            <button onClick={handleGetInvolved}>Get Started</button>
          </div>
        </div>
      </section>

      {selectedTrending && (
      <div className="modal-overlay" onClick={() => setSelectedTrending(null)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={() => setSelectedTrending(null)}>✖</button>
          <h3>{selectedTrending.category}</h3>
          <p>{selectedTrending.title}</p>
          <a href={selectedTrending.link} target="_blank" rel="noopener noreferrer">Read more</a>
        </div>
      </div>
    )}
    </div>
  );
}